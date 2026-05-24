import { signOut } from 'firebase/auth';
import { auth, setAnonymousAuthSuspended, signInAnonymousNow } from './firebase';
import { setSyncPaused } from './sync';
import { useStore } from '../store/useStore';

export async function signOutAndResetLocalData() {
    setSyncPaused(true);
    setAnonymousAuthSuspended(true);

    try {
        useStore.getState().resetStore();
        localStorage.removeItem('bio-stack-storage');
        await signOut(auth);
    } finally {
        setAnonymousAuthSuspended(false);
        await signInAnonymousNow();
        setSyncPaused(false);
    }
}

