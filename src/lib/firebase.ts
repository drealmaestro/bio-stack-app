import { initializeApp } from 'firebase/app';
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
} from 'firebase/firestore';
import {
    getAuth,
    signInAnonymously,
    signInWithPopup,
    linkWithPopup,
    GoogleAuthProvider,
    signInWithCredential,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { useStore } from '../store/useStore';
import { mergePersistedData, type PersistedDataSlice } from './dataMerge';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);

// Modern Firestore cache API (Firebase v12). Replaces deprecated enableMultiTabIndexedDbPersistence.
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
    }),
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

let authInitialized = false;
let anonymousAuthSuspended = false;
let unsubscribeAuth: (() => void) | null = null;

function getPersistedSlice(): PersistedDataSlice {
    const state = useStore.getState();
    return {
        user: state.user,
        templates: state.templates,
        logs: state.logs,
        exercises: state.exercises,
        nutritionLogs: state.nutritionLogs,
        dailyInsights: state.dailyInsights,
        seeded: state.seeded,
    };
}

function applyPersistedSlice(slice: PersistedDataSlice) {
    useStore.setState({
        user: slice.user,
        templates: slice.templates,
        logs: slice.logs,
        exercises: slice.exercises,
        nutritionLogs: slice.nutritionLogs,
        dailyInsights: slice.dailyInsights,
        seeded: slice.seeded,
    });
}

// Auto-fallback to anonymous auth so writes always have an owner.
export const initAuth = () => {
    if (authInitialized) return () => unsubscribeAuth?.();
    authInitialized = true;

    unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
        if (!user && !anonymousAuthSuspended) {
            try {
                await signInAnonymously(auth);
            } catch (error) {
                console.error('Anonymous sign-in failed:', error);
            }
        }
    });

    return () => {
        unsubscribeAuth?.();
        unsubscribeAuth = null;
        authInitialized = false;
    };
};

export function setAnonymousAuthSuspended(suspended: boolean) {
    anonymousAuthSuspended = suspended;
}

export async function signInAnonymousNow() {
    await signInAnonymously(auth);
}

/**
 * Upgrade the current anonymous user to a Google account WITHOUT losing data.
 *
 * Flow:
 *   1. If current user is anonymous -> linkWithPopup keeps the same UID,
 *      so all subcollections and the user doc continue to belong to them.
 *   2. If the chosen Google account is already linked to a different Firebase
 *      user, Firebase returns auth/credential-already-in-use. We fall back to
 *      signing into that existing account (anonymous data is orphaned but the
 *      user keeps access to their real account).
 *   3. If there is no anonymous user (already signed out / never signed in),
 *      just do a normal Google sign-in.
 *
 * Returns: { linked: boolean, fellBack: boolean }
 *   linked   - true if we successfully linked anon -> Google (data preserved)
 *   fellBack - true if we had to sign into an existing Google account instead
 */
export async function linkAnonymousToGoogle(): Promise<{ linked: boolean; fellBack: boolean }> {
    const current = auth.currentUser;
    const anonymousSlice = getPersistedSlice();

    if (current?.isAnonymous) {
        try {
            await linkWithPopup(current, googleProvider);
            return { linked: true, fellBack: false };
        } catch (err) {
            // The chosen Google account is already a separate Firebase user.
            // Sign into that account; the anonymous user (and its local-only data) is orphaned.
            if (err instanceof FirebaseError &&
                (err.code === 'auth/credential-already-in-use' || err.code === 'auth/email-already-in-use')) {
                const credential = GoogleAuthProvider.credentialFromError(err);
                if (credential) {
                    await signInWithCredential(auth, credential);
                    const merged = mergePersistedData(getPersistedSlice(), anonymousSlice);
                    applyPersistedSlice(merged);
                    return { linked: false, fellBack: true };
                }
            }
            throw err;
        }
    }

    // No anonymous user to link from -- plain sign-in.
    await signInWithPopup(auth, googleProvider);
    return { linked: false, fellBack: false };
}
