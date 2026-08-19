import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserProfile, SetLog } from '../types';

export interface SyncResult { success: boolean; error?: string; }
export interface WorkoutLogPayload { id: string; template_id: string; timestamp: string; duration_seconds: number; completed_exercises: SetLog[]; }

export async function syncWorkoutToFirestore(userId: string, workoutLog: WorkoutLogPayload): Promise<SyncResult> {
    if (!userId || !workoutLog?.id) return { success: false, error: 'Invalid payload' };
    try {
        await setDoc(doc(db, 'users', userId, 'workoutLogs', workoutLog.id), workoutLog, { merge: true });
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err?.message || 'Firestore write failed' };
    }
}

export async function syncUserProfileToFirestore(userId: string, profile: Partial<UserProfile>): Promise<SyncResult> {
    if (!userId) return { success: false, error: 'Missing userId' };
    try {
        await setDoc(doc(db, 'users', userId, 'meta', 'profile'), { user: profile, updatedAt: new Date().toISOString() }, { merge: true });
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err?.message || 'Profile sync failed' };
    }
}

export async function fetchFirestoreProfile(userId: string): Promise<{ success: boolean; data?: Partial<UserProfile>; error?: string }> {
    if (!userId) return { success: false, error: 'Missing userId' };
    try {
        const snap = await getDoc(doc(db, 'users', userId, 'meta', 'profile'));
        return { success: true, data: snap.exists() ? snap.data()?.user : undefined };
    } catch (err: any) {
        return { success: false, error: err?.message || 'Fetch failed' };
    }
}

