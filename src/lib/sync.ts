import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    serverTimestamp,
    setDoc,
    writeBatch,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { useStore } from '../store/useStore';
import { onAuthStateChanged } from 'firebase/auth';
import { UserDocSchema, CURRENT_SCHEMA_VERSION, type UserDoc } from './schemas';
import { useToastStore } from '../components/ui/toast';
import { reconcileLegacyAndSubcollections, type PersistedDataSlice } from './dataMerge';

let unsubscribeSnapshot: (() => void) | null = null;
let isHydrating = false;
let consecutiveWriteFailures = 0;
let syncPaused = false;
let unsubscribeAuth: (() => void) | null = null;
let unsubscribeStore: (() => void) | null = null;

export function setSyncPaused(paused: boolean) {
    syncPaused = paused;
}

function buildPayload() {
    const s = useStore.getState();
    return {
        user: s.user || null,
        templates: s.templates,
        logs: s.logs,
        exercises: s.exercises,
        nutritionLogs: s.nutritionLogs,
        dailyInsights: s.dailyInsights,
        seeded: s.seeded,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        updatedAt: serverTimestamp(),
    };
}

function hydrateStore(data: UserDoc) {
    isHydrating = true;
    useStore.setState({
        user: data.user ?? null,
        templates: data.templates ?? [],
        logs: data.logs ?? [],
        exercises: data.exercises ?? [],
        nutritionLogs: data.nutritionLogs ?? [],
        dailyInsights: data.dailyInsights ?? [],
        seeded: data.seeded ?? false,
    });
    setTimeout(() => { isHydrating = false; }, 100);
}

async function readSubcollections(uid: string): Promise<UserDoc | null> {
    const [profileSnap, templatesSnap, logsSnap, exercisesSnap, nutritionSnap, insightsSnap] = await Promise.all([
        getDoc(doc(db, 'users', uid, 'meta', 'profile')),
        getDocs(collection(db, 'users', uid, 'templates')),
        getDocs(collection(db, 'users', uid, 'workoutLogs')),
        getDocs(collection(db, 'users', uid, 'exercises')),
        getDocs(collection(db, 'users', uid, 'nutritionLogs')),
        getDocs(collection(db, 'users', uid, 'dailyInsights')),
    ]);

    const candidate = {
        user: profileSnap.exists() ? profileSnap.data().user ?? null : null,
        templates: templatesSnap.docs.map((item) => item.data()),
        logs: logsSnap.docs.map((item) => item.data()),
        exercises: exercisesSnap.docs.map((item) => item.data()),
        nutritionLogs: nutritionSnap.docs.map((item) => item.data()),
        dailyInsights: insightsSnap.docs.map((item) => item.data()),
        seeded: profileSnap.exists() ? profileSnap.data().seeded ?? false : false,
        schemaVersion: profileSnap.exists() ? profileSnap.data().schemaVersion : CURRENT_SCHEMA_VERSION,
    };

    const parsed = UserDocSchema.safeParse(candidate);
    if (!parsed.success) {
        console.error('Subcollection data failed schema validation:', parsed.error);
        return null;
    }

    const hasAnyData =
        parsed.data.user ||
        parsed.data.templates?.length ||
        parsed.data.logs?.length ||
        parsed.data.exercises?.length ||
        parsed.data.nutritionLogs?.length ||
        parsed.data.dailyInsights?.length;

    return hasAnyData ? parsed.data : null;
}

async function writeSubcollections(
    uid: string,
    payload: PersistedDataSlice & { schemaVersion?: number; updatedAt?: any } = buildPayload()
) {
    const batch = writeBatch(db);

    batch.set(doc(db, 'users', uid, 'meta', 'profile'), {
        user: payload.user,
        seeded: payload.seeded,
        schemaVersion: payload.schemaVersion,
        updatedAt: serverTimestamp(),
    }, { merge: true });

    payload.templates.forEach((template) => {
        batch.set(doc(db, 'users', uid, 'templates', template.id), {
            ...template,
            updatedAt: serverTimestamp(),
        }, { merge: true });
    });
    payload.logs.forEach((log) => {
        batch.set(doc(db, 'users', uid, 'workoutLogs', log.id), {
            ...log,
            updatedAt: serverTimestamp(),
        }, { merge: true });
    });
    payload.exercises.forEach((exercise) => {
        batch.set(doc(db, 'users', uid, 'exercises', exercise.id), {
            ...exercise,
            updatedAt: serverTimestamp(),
        }, { merge: true });
    });
    payload.nutritionLogs.forEach((log) => {
        batch.set(doc(db, 'users', uid, 'nutritionLogs', log.date), {
            ...log,
            updatedAt: serverTimestamp(),
        }, { merge: true });
    });
    payload.dailyInsights.forEach((insight) => {
        batch.set(doc(db, 'users', uid, 'dailyInsights', insight.date), {
            ...insight,
            updatedAt: serverTimestamp(),
        }, { merge: true });
    });

    await batch.commit();
}

function toPersistedDataSlice(data: UserDoc | null): PersistedDataSlice | null {
    if (!data) return null;
    return {
        user: data.user ?? null,
        templates: data.templates ?? [],
        logs: data.logs ?? [],
        exercises: data.exercises ?? [],
        nutritionLogs: data.nutritionLogs ?? [],
        dailyInsights: data.dailyInsights ?? [],
        seeded: data.seeded ?? false,
    };
}

export function initSync() {
    if (unsubscribeAuth || unsubscribeStore) {
        return cleanupSync;
    }

    unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (syncPaused) return;
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);

            try {
                // 1. Read both subcollections and legacy document in parallel
                const [subcollectionData, legacyDocSnap] = await Promise.all([
                    readSubcollections(user.uid),
                    getDoc(userDocRef),
                ]);

                const legacyData = legacyDocSnap.exists()
                    ? (legacyDocSnap.data() as UserDoc)
                    : null;

                const reconciled = reconcileLegacyAndSubcollections(
                    toPersistedDataSlice(subcollectionData),
                    toPersistedDataSlice(legacyData)
                );

                if (reconciled) {
                    hydrateStore({
                        ...reconciled,
                        schemaVersion: Math.max(
                            subcollectionData?.schemaVersion ?? 0,
                            legacyData?.schemaVersion ?? 0,
                            CURRENT_SCHEMA_VERSION
                        ),
                    });

                    // Ensure both sources are perfectly synchronized with the reconciled converged state
                    const payload = {
                        ...reconciled,
                        schemaVersion: CURRENT_SCHEMA_VERSION,
                    };
                    await Promise.all([
                        setDoc(userDocRef, { ...payload, updatedAt: serverTimestamp() }, { merge: true }),
                        writeSubcollections(user.uid, payload),
                    ]);
                } else {
                    // Brand new user (both null). Seed Firestore from current local state.
                    const initialPayload = buildPayload();
                    await Promise.all([
                        setDoc(userDocRef, initialPayload),
                        writeSubcollections(user.uid, initialPayload),
                    ]);
                }
            } catch (err) {
                console.error('Firestore initial seed/reconciliation error:', err);
            }

            // 2. Subscribe to remote changes (with validation).
            if (unsubscribeSnapshot) unsubscribeSnapshot();
            unsubscribeSnapshot = onSnapshot(
                userDocRef,
                (docSnap) => {
                    if (!docSnap.exists()) return;
                    const raw = docSnap.data();

                    const parsed = UserDocSchema.safeParse(raw);
                    if (!parsed.success) {
                        // Don't overwrite local state with garbage. Surface it so the user knows.
                        console.error('Firestore doc failed schema validation:', parsed.error);
                        useToastStore.getState().addToast(
                            'Cloud data shape mismatch — using local copy',
                            'error'
                        );
                        return;
                    }

                    const data = parsed.data;
                    hydrateStore(data);
                },
                (error) => {
                    console.error('Firestore subscription error:', error);
                }
            );
        } else if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
            unsubscribeSnapshot = null;
        }
    });

    // 3. Listen to local Zustand changes and push to Firestore (debounced).
    let debounceTimer: ReturnType<typeof setTimeout>;
    unsubscribeStore = useStore.subscribe((state, prevState) => {
        if (syncPaused) return;
        if (isHydrating) return;

        const user = auth.currentUser;
        if (!user) return;

        const hasDataChanged =
            state.user !== prevState.user ||
            state.templates !== prevState.templates ||
            state.logs !== prevState.logs ||
            state.exercises !== prevState.exercises ||
            state.nutritionLogs !== prevState.nutritionLogs ||
            state.dailyInsights !== prevState.dailyInsights;

        if (!hasDataChanged) return;

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const userDocRef = doc(db, 'users', user.uid);
            const payload = buildPayload();

            // Detect deleted templates to perform active tombstones deletion in subcollections
            const deletedTemplates = prevState.templates.filter(
                (prev) => !state.templates.some((curr) => curr.id === prev.id)
            );

            const syncTasks: Promise<any>[] = [
                setDoc(userDocRef, payload, { merge: true }),
                writeSubcollections(user.uid, payload),
            ];

            if (deletedTemplates.length > 0) {
                const batch = writeBatch(db);
                deletedTemplates.forEach((template) => {
                    batch.delete(doc(db, 'users', user.uid, 'templates', template.id));
                });
                syncTasks.push(batch.commit());
            }

            Promise.all(syncTasks)
                .then(() => {
                    if (consecutiveWriteFailures > 0) {
                        useToastStore.getState().addToast('Sync recovered', 'success');
                    }
                    consecutiveWriteFailures = 0;
                })
                .catch((err) => {
                    console.error('Sync write error:', err);
                    consecutiveWriteFailures++;
                    // Show once, on the 3rd consecutive failure. Don't spam.
                    if (consecutiveWriteFailures === 3) {
                        useToastStore.getState().addToast(
                            'Sync failed — changes saved locally',
                            'error'
                        );
                    }
                });
        }, 1000);
    });

    return cleanupSync;
}

function cleanupSync() {
    unsubscribeSnapshot?.();
    unsubscribeSnapshot = null;
    unsubscribeAuth?.();
    unsubscribeAuth = null;
    unsubscribeStore?.();
    unsubscribeStore = null;
}
