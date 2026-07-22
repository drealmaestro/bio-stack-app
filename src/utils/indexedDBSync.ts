import { useStore } from '../store/useStore';
import type { NutritionEntry, WorkoutLog, SetLog } from '../types';
import {
    getOfflineWorkouts,
    getOfflineNutrition,
    removeOfflineWorkouts,
    removeOfflineNutrition,
    getIsSyncing,
    setIsSyncing,
} from './indexedDB';

export async function syncWorkouts(workouts: any[]): Promise<number> {
    if (workouts.length === 0) return 0;
    const storeState = useStore.getState();
    const syncedIds: string[] = [];
    let workoutsSynced = 0;

    for (const w of workouts) {
        if ('template_id' in w || 'templateId' in w || 'completed_exercises' in w || 'completedSets' in w || w.id) {
            const template_id = w.template_id || w.templateId || 'offline-template';
            const timestamp = w.timestamp || (w.startTime ? new Date(w.startTime).toISOString() : new Date().toISOString());
            const duration_seconds = typeof w.duration_seconds === 'number'
                ? w.duration_seconds
                : (typeof w.durationSeconds === 'number'
                    ? w.durationSeconds
                    : (w.startTime ? Math.max(0, Math.floor((Date.now() - w.startTime) / 1000)) : 0));

            let completed_exercises: SetLog[] = [];
            if (Array.isArray(w.completed_exercises)) {
                completed_exercises = w.completed_exercises;
            } else if (Array.isArray(w.completedSets)) {
                completed_exercises = w.completedSets.map((key: string) => {
                    const [exIdxStr, setNumStr] = key.split('-');
                    const exIdx = parseInt(exIdxStr, 10) || 0;
                    const setNum = parseInt(setNumStr, 10) || 1;
                    const weight = w.setWeights?.[key] || 0;
                    const reps = w.setReps?.[key] || 0;
                    const rpe = w.setRpes?.[key];
                    return {
                        exercise_id: `ex-${exIdx}`,
                        set_number: setNum,
                        reps_completed: reps,
                        weight_kg: weight,
                        ...(rpe !== undefined ? { rpe } : {}),
                    };
                });
            }

            const workoutLog: WorkoutLog = {
                id: w.id || `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                template_id,
                timestamp,
                duration_seconds,
                completed_exercises,
            };

            if (typeof storeState.addLog === 'function') {
                storeState.addLog(workoutLog);
            } else if (typeof (storeState as any).logWorkout === 'function') {
                (storeState as any).logWorkout(workoutLog);
            }
        }
        if (w.id) syncedIds.push(w.id);
        workoutsSynced++;
    }
    await removeOfflineWorkouts(syncedIds);
    return workoutsSynced;
}

export async function syncNutrition(nutrition: any[]): Promise<number> {
    if (nutrition.length === 0) return 0;
    const storeState = useStore.getState();
    const syncedIds: string[] = [];
    let nutritionSynced = 0;

    for (const item of nutrition) {
        const date = item.date || new Date().toISOString().split('T')[0];
        const entry: Omit<NutritionEntry, 'id' | 'logged_at'> = item.entry
            ? {
                food_item_id: item.entry.food_item_id || 'offline_food',
                food_name: item.entry.food_name || 'Offline Food',
                servings: item.entry.servings || 1,
                calories: item.entry.calories || 0,
                protein_g: item.entry.protein_g || 0,
                carbs_g: item.entry.carbs_g || 0,
                fat_g: item.entry.fat_g || 0,
            }
            : {
                food_item_id: item.food_item_id || 'offline_food',
                food_name: item.food_name || item.name || 'Offline Food',
                servings: item.servings || 1,
                calories: item.calories || 0,
                protein_g: item.protein_g || 0,
                carbs_g: item.carbs_g || 0,
                fat_g: item.fat_g || 0,
            };

        if (typeof (storeState as any).logFood === 'function') {
            (storeState as any).logFood({ date, ...entry });
        } else if (typeof storeState.addNutritionEntry === 'function') {
            storeState.addNutritionEntry(date, entry);
        }
        if (item.id) syncedIds.push(item.id);
        if (item.entry?.id) syncedIds.push(item.entry.id);
        nutritionSynced++;
    }
    await removeOfflineNutrition(syncedIds);
    return nutritionSynced;
}

export async function syncOfflineQueue(): Promise<{ workoutsSynced: number; nutritionSynced: number }> {
    if (getIsSyncing()) return { workoutsSynced: 0, nutritionSynced: 0 };
    setIsSyncing(true);
    try {
        const workouts = await getOfflineWorkouts();
        const nutrition = await getOfflineNutrition();
        const workoutsSynced = await syncWorkouts(workouts);
        const nutritionSynced = await syncNutrition(nutrition);
        return { workoutsSynced, nutritionSynced };
    } finally {
        setIsSyncing(false);
    }
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('online', () => {
        syncOfflineQueue().catch(() => {});
    });
}
