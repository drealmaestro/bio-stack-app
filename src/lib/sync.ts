import { doc, setDoc, onSnapshot, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useStore } from '../store/useStore';
import { onAuthStateChanged } from 'firebase/auth';
import { UserDocSchema, CURRENT_SCHEMA_VERSION } from './schemas';
import { useToastStore } from '../components/ui/toast';

let unsubscribeSnapshot: (() => void) | null = null;
let isHydrating = false;
let consecutiveWriteFailures = 0;

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

export function initSync() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);

            try {
                // 1. If Firestore has no doc yet, seed it from current local state.
                const snap = await getDoc(userDocRef);
                if (!snap.exists()) {
                    await setDoc(userDocRef, buildPayload());
                }
            } catch (err) {
                console.error('Firestore initial seed error:', err);
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
    useStore.subscribe((state, prevState) => {
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
            setDoc(userDocRef, buildPayload(), { merge: true })
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
}
