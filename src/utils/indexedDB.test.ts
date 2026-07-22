import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    saveOfflineWorkout,
    getOfflineWorkouts,
    clearOfflineWorkouts,
    saveOfflineNutrition,
    getOfflineNutrition,
    clearOfflineNutrition,
    syncOfflineQueue,
    resetDBPromiseForTesting,
} from './indexedDB';
import { useStore } from '../store/useStore';

describe('IndexedDB Offline Fallback Storage Manager', () => {
    beforeEach(async () => {
        resetDBPromiseForTesting();
        await clearOfflineWorkouts();
        await clearOfflineNutrition();
        useStore.getState().resetStore();
    });

    afterEach(async () => {
        await clearOfflineWorkouts();
        await clearOfflineNutrition();
        vi.restoreAllMocks();
    });

    it('should save and retrieve offline workout logs', async () => {
        const workoutData = {
            id: 'w-101',
            template_id: 'tmpl-1',
            duration_seconds: 3600,
            completed_exercises: [
                { exercise_id: 'ex-1', set_number: 1, reps_completed: 10, weight_kg: 100 }
            ],
            timestamp: '2026-07-22T08:00:00Z',
        };

        await saveOfflineWorkout(workoutData);
        const workouts = await getOfflineWorkouts();

        expect(workouts).toHaveLength(1);
        expect(workouts[0].id).toBe('w-101');
        expect(workouts[0].template_id).toBe('tmpl-1');
        expect(workouts[0].completed_exercises).toHaveLength(1);
    });

    it('should clear offline workouts', async () => {
        await saveOfflineWorkout({ id: 'w-1', template_id: 'tmpl-1' });
        await saveOfflineWorkout({ id: 'w-2', template_id: 'tmpl-2' });

        let workouts = await getOfflineWorkouts();
        expect(workouts).toHaveLength(2);

        await clearOfflineWorkouts();
        workouts = await getOfflineWorkouts();
        expect(workouts).toHaveLength(0);
    });

    it('should save and retrieve offline nutrition entries', async () => {
        const nutritionData = {
            id: 'nutr-1',
            date: '2026-07-22',
            food_item_id: 'food-chicken',
            food_name: 'Chicken Breast',
            servings: 2,
            calories: 330,
            protein_g: 62,
            carbs_g: 0,
            fat_g: 7,
        };

        await saveOfflineNutrition(nutritionData);
        const entries = await getOfflineNutrition();

        expect(entries).toHaveLength(1);
        expect(entries[0].id).toBe('nutr-1');
        expect(entries[0].food_name).toBe('Chicken Breast');
        expect(entries[0].protein_g).toBe(62);
    });

    it('should clear offline nutrition entries', async () => {
        await saveOfflineNutrition({ id: 'n-1', date: '2026-07-22', food_name: 'Apple' });
        await saveOfflineNutrition({ id: 'n-2', date: '2026-07-22', food_name: 'Banana' });

        let entries = await getOfflineNutrition();
        expect(entries).toHaveLength(2);

        await clearOfflineNutrition();
        entries = await getOfflineNutrition();
        expect(entries).toHaveLength(0);
    });

    it('should sync offline queue to Zustand store and clear offline storage', async () => {
        const workoutData = {
            id: 'w-sync-1',
            template_id: 'tmpl-bench',
            timestamp: '2026-07-22T08:30:00Z',
            duration_seconds: 1800,
            completed_exercises: [],
        };

        const nutritionData = {
            id: 'n-sync-1',
            date: '2026-07-22',
            entry: {
                food_item_id: 'f-oats',
                food_name: 'Oatmeal',
                servings: 1,
                calories: 150,
                protein_g: 5,
                carbs_g: 27,
                fat_g: 3,
            },
        };

        await saveOfflineWorkout(workoutData);
        await saveOfflineNutrition(nutritionData);

        const syncResult = await syncOfflineQueue();

        expect(syncResult.workoutsSynced).toBe(1);
        expect(syncResult.nutritionSynced).toBe(1);

        // Verify storage is cleared after sync
        const remainingWorkouts = await getOfflineWorkouts();
        const remainingNutrition = await getOfflineNutrition();
        expect(remainingWorkouts).toHaveLength(0);
        expect(remainingNutrition).toHaveLength(0);

        // Verify entry added to Zustand store
        const storeLogs = useStore.getState().logs;
        expect(storeLogs).toHaveLength(1);
        expect(storeLogs[0].id).toBe('w-sync-1');
        expect(storeLogs[0].template_id).toBe('tmpl-bench');

        const foodLogs = useStore.getState().foodLogs;
        expect(foodLogs).toBeDefined();
        expect(foodLogs.some(e => e.food_name === 'Oatmeal')).toBe(true);

        const log = useStore.getState().getNutritionLog('2026-07-22');
        expect(log).toBeDefined();
        expect(log?.entries.some(e => e.food_name === 'Oatmeal')).toBe(true);
    });

    it('should automatically trigger syncOfflineQueue when online event fires', async () => {
        await saveOfflineNutrition({
            id: 'n-online-1',
            date: '2026-07-22',
            food_name: 'Eggs',
            calories: 140,
            protein_g: 12,
            carbs_g: 1,
            fat_g: 10,
        });

        // Trigger online event
        const onlineEvent = new Event('online');
        window.dispatchEvent(onlineEvent);

        // Wait brief tick for async handler
        await new Promise(r => setTimeout(r, 50));

        const remainingNutrition = await getOfflineNutrition();
        expect(remainingNutrition).toHaveLength(0);
    });

    it('should work with mock IndexedDB API if present', async () => {
        // Test IndexedDB API wrapper logic with a mock DB object
        const mockStoreMap = new Map<string, any[]>();
        mockStoreMap.set('offline_workouts', []);
        mockStoreMap.set('offline_nutrition', []);

        const mockDB: any = {
            objectStoreNames: {
                contains: (name: string) => name === 'offline_workouts' || name === 'offline_nutrition',
            },
            transaction: (storeName: string, _mode: string) => {
                const list = mockStoreMap.get(storeName) || [];
                return {
                    objectStore: () => ({
                        put: (item: any) => {
                            const idx = list.findIndex(i => i.id === item.id);
                            if (idx >= 0) list[idx] = item;
                            else list.push(item);
                            const req: any = {};
                            setTimeout(() => req.onsuccess?.(), 0);
                            return req;
                        },
                        getAll: () => {
                            const req: any = { result: [...list] };
                            setTimeout(() => req.onsuccess?.(), 0);
                            return req;
                        },
                        clear: () => {
                            mockStoreMap.set(storeName, []);
                            const req: any = {};
                            setTimeout(() => req.onsuccess?.(), 0);
                            return req;
                        },
                    }),
                };
            },
        };

        const mockIDBFactory: any = {
            open: () => {
                const req: any = { result: mockDB };
                setTimeout(() => {
                    req.onupgradeneeded?.();
                    req.onsuccess?.();
                }, 0);
                return req;
            },
        };

        vi.stubGlobal('indexedDB', mockIDBFactory);
        resetDBPromiseForTesting();

        await saveOfflineWorkout({ id: 'idb-w1', template_id: 'tmpl-1' });
        const workouts = await getOfflineWorkouts();
        expect(workouts).toHaveLength(1);
        expect(workouts[0].id).toBe('idb-w1');

        await clearOfflineWorkouts();
        const cleared = await getOfflineWorkouts();
        expect(cleared).toHaveLength(0);
    });
});
