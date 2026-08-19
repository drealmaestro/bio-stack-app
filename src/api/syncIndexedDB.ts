import {
    saveOfflineWorkout, getOfflineWorkouts, clearOfflineWorkouts,
    saveOfflineNutrition, getOfflineNutrition,
} from '../utils/indexedDB';

export interface IndexedDBSyncResult { success: boolean; count?: number; error?: string; }

export async function syncWorkoutToIndexedDB(workout: any): Promise<IndexedDBSyncResult> {
    if (!workout) return { success: false, error: 'Invalid workout payload' };
    try {
        await saveOfflineWorkout(workout);
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err?.message || 'IndexedDB write failed' };
    }
}

export async function fetchOfflineWorkouts(): Promise<{ success: boolean; data: any[]; error?: string }> {
    try {
        const data = await getOfflineWorkouts();
        return { success: true, data };
    } catch (err: any) {
        return { success: false, data: [], error: err?.message || 'IndexedDB read failed' };
    }
}

export async function flushOfflineWorkouts(): Promise<IndexedDBSyncResult> {
    try {
        const items = await getOfflineWorkouts();
        await clearOfflineWorkouts();
        return { success: true, count: items.length };
    } catch (err: any) {
        return { success: false, error: err?.message || 'IndexedDB clear failed' };
    }
}

export async function syncNutritionToIndexedDB(entry: any): Promise<IndexedDBSyncResult> {
    if (!entry) return { success: false, error: 'Invalid nutrition payload' };
    try {
        await saveOfflineNutrition(entry);
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err?.message || 'IndexedDB write failed' };
    }
}

export async function fetchOfflineNutrition(): Promise<{ success: boolean; data: any[]; error?: string }> {
    try {
        const data = await getOfflineNutrition();
        return { success: true, data };
    } catch (err: any) {
        return { success: false, data: [], error: err?.message || 'IndexedDB read failed' };
    }
}

