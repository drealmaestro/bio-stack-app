import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useActiveWorkoutStore } from '../store/useActiveWorkoutStore';
import { useStore } from '../store/useStore';
import { syncWorkoutToFirestore, syncUserProfileToFirestore, fetchFirestoreProfile } from './syncFirestore';
import { syncWorkoutToIndexedDB, fetchOfflineWorkouts, flushOfflineWorkouts, syncNutritionToIndexedDB, fetchOfflineNutrition } from './syncIndexedDB';

// Mock Firebase firestore methods
vi.mock('firebase/firestore', () => ({
    doc: vi.fn((_db, ...pathSegments) => pathSegments.join('/')),
    setDoc: vi.fn().mockResolvedValue(undefined),
    getDoc: vi.fn().mockResolvedValue({
        exists: () => true,
        data: () => ({ user: { name: 'Test User', age: 30 } }),
    }),
}));

// Mock Firebase db export
vi.mock('../lib/firebase', () => ({
    db: {},
}));

describe('M3 Empirical Verification - Active Workout Store & API Routes', () => {
    beforeEach(() => {
        // Reset active workout store state
        useActiveWorkoutStore.setState({
            activeWorkout: null,
            activeDrawerSet: null,
        });
        vi.clearAllMocks();
    });

    describe('1. Active Workout Store State Decoupling & Isolation', () => {
        it('initializes with null activeWorkout and activeDrawerSet', () => {
            const state = useActiveWorkoutStore.getState();
            expect(state.activeWorkout).toBeNull();
            expect(state.activeDrawerSet).toBeNull();
        });

        it('starts workout and initializes all required fields', () => {
            const store = useActiveWorkoutStore.getState();
            store.startWorkout('template-123');

            const state = useActiveWorkoutStore.getState();
            expect(state.activeWorkout).not.toBeNull();
            expect(state.activeWorkout?.templateId).toBe('template-123');
            expect(state.activeWorkout?.completedSets).toEqual([]);
            expect(state.activeWorkout?.setWeights).toEqual({});
            expect(state.activeWorkout?.setReps).toEqual({});
            expect(state.activeWorkout?.setRpes).toEqual({});
            expect(state.activeWorkout?.restEndTime).toBeNull();
            expect(state.activeWorkout?.originalRestDuration).toBe(0);
        });

        it('toggles set completion and updates rest timer correctly', () => {
            const store = useActiveWorkoutStore.getState();
            store.startWorkout('template-123');

            // Complete set (exercise 0, set 1, 60s rest)
            useActiveWorkoutStore.getState().toggleSetComplete(0, 1, 60);
            let state = useActiveWorkoutStore.getState();
            expect(state.activeWorkout?.completedSets).toContain('0-1');
            expect(state.activeWorkout?.originalRestDuration).toBe(60);
            expect(state.activeWorkout?.restEndTime).toBeGreaterThan(Date.now());

            // Toggle set complete again (uncomplete set)
            useActiveWorkoutStore.getState().toggleSetComplete(0, 1, 60);
            state = useActiveWorkoutStore.getState();
            expect(state.activeWorkout?.completedSets).not.toContain('0-1');
        });

        it('handles set weight, reps, and RPE updates independently', () => {
            const store = useActiveWorkoutStore.getState();
            store.startWorkout('template-123');

            useActiveWorkoutStore.getState().updateSetWeight(0, 1, 100);
            useActiveWorkoutStore.getState().updateSetReps(0, 1, 10);
            useActiveWorkoutStore.getState().updateSetRpe(0, 1, 8.5);

            const state = useActiveWorkoutStore.getState();
            expect(state.activeWorkout?.setWeights['0-1']).toBe(100);
            expect(state.activeWorkout?.setReps['0-1']).toBe(10);
            expect(state.activeWorkout?.setRpes?.['0-1']).toBe(8.5);
        });

        it('manages rest timer adjustments (addRestTime, skipRest, getRemainingRestSeconds)', () => {
            const store = useActiveWorkoutStore.getState();
            store.startWorkout('template-123');

            useActiveWorkoutStore.getState().toggleSetComplete(0, 1, 60);
            let remaining = useActiveWorkoutStore.getState().getRemainingRestSeconds();
            expect(remaining).toBeGreaterThan(0);
            expect(remaining).toBeLessThanOrEqual(60);

            // Add 30 seconds
            useActiveWorkoutStore.getState().addRestTime(30);
            let state = useActiveWorkoutStore.getState();
            expect(state.activeWorkout?.originalRestDuration).toBe(90);

            // Skip rest
            useActiveWorkoutStore.getState().skipRest();
            state = useActiveWorkoutStore.getState();
            expect(state.activeWorkout?.restEndTime).toBeNull();
            expect(state.activeWorkout?.originalRestDuration).toBe(0);
            expect(useActiveWorkoutStore.getState().getRemainingRestSeconds()).toBe(0);
        });

        it('manages drawer state cleanly', () => {
            const drawerSet = { exerciseIdx: 1, setNum: 2, targetReps: 12 };
            useActiveWorkoutStore.getState().setActiveDrawerSet(drawerSet);
            expect(useActiveWorkoutStore.getState().activeDrawerSet).toEqual(drawerSet);

            useActiveWorkoutStore.getState().closeActiveDrawerSet();
            expect(useActiveWorkoutStore.getState().activeDrawerSet).toBeNull();
        });

        it('verifies state isolation from main store', () => {
            // Get initial main store state
            const initialMainState = useStore.getState();

            // Perform active workout mutations
            useActiveWorkoutStore.getState().startWorkout('template-isolation');
            useActiveWorkoutStore.getState().updateSetWeight(0, 1, 225);
            useActiveWorkoutStore.getState().updateSetReps(0, 1, 5);
            useActiveWorkoutStore.getState().updateSetRpe(0, 1, 9.5);

            // Main store's non-workout slices should remain unchanged
            const currentMainState = useStore.getState();
            expect(currentMainState.user).toEqual(initialMainState.user);
            expect(currentMainState.templates).toEqual(initialMainState.templates);
            expect(currentMainState.nutritionLogs).toEqual(initialMainState.nutritionLogs);
        });

        it('cancels workout cleanly resetting activeWorkout and activeDrawerSet', () => {
            useActiveWorkoutStore.getState().startWorkout('template-123');
            useActiveWorkoutStore.getState().setActiveDrawerSet({ exerciseIdx: 0, setNum: 1 });

            useActiveWorkoutStore.getState().cancelWorkout();
            const state = useActiveWorkoutStore.getState();
            expect(state.activeWorkout).toBeNull();
            expect(state.activeDrawerSet).toBeNull();
        });
    });

    describe('2. Firestore Sync API Route Payload Handling & Validation', () => {
        it('validates invalid payloads for syncWorkoutToFirestore', async () => {
            const res1 = await syncWorkoutToFirestore('', { id: 'w1', template_id: 't1', timestamp: '2026-08-07', duration_seconds: 300, completed_exercises: [] });
            expect(res1).toEqual({ success: false, error: 'Invalid payload' });

            const res2 = await syncWorkoutToFirestore('user123', null as any);
            expect(res2).toEqual({ success: false, error: 'Invalid payload' });

            const res3 = await syncWorkoutToFirestore('user123', { id: '' } as any);
            expect(res3).toEqual({ success: false, error: 'Invalid payload' });
        });

        it('successfully syncs valid workout payload to Firestore', async () => {
            const payload = {
                id: 'workout-101',
                template_id: 'temp-push',
                timestamp: new Date().toISOString(),
                duration_seconds: 1800,
                completed_exercises: [
                    { exercise_id: 'bench-press', set_number: 1, weight_kg: 100, reps_completed: 8 }
                ],
            };

            const res = await syncWorkoutToFirestore('user-1', payload);
            expect(res.success).toBe(true);
        });

        it('validates invalid user ID for syncUserProfileToFirestore', async () => {
            const res = await syncUserProfileToFirestore('', { name: 'John' });
            expect(res).toEqual({ success: false, error: 'Missing userId' });
        });

        it('successfully syncs user profile payload to Firestore', async () => {
            const res = await syncUserProfileToFirestore('user-1', { name: 'John Doe', age: 30 });
            expect(res.success).toBe(true);
        });

        it('fetches Firestore profile correctly', async () => {
            const invalidRes = await fetchFirestoreProfile('');
            expect(invalidRes).toEqual({ success: false, error: 'Missing userId' });

            const validRes = await fetchFirestoreProfile('user-1');
            expect(validRes.success).toBe(true);
            expect(validRes.data).toEqual({ name: 'Test User', age: 30 });
        });
    });

    describe('3. Offline IndexedDB Sync API Route Fallback & Payload Handling', () => {
        it('validates invalid workout payloads for syncWorkoutToIndexedDB', async () => {
            const res = await syncWorkoutToIndexedDB(null);
            expect(res).toEqual({ success: false, error: 'Invalid workout payload' });
        });

        it('syncs workout payload to IndexedDB offline storage', async () => {
            const res = await syncWorkoutToIndexedDB({ id: 'off-1', templateId: 't1' });
            expect(res.success).toBe(true);

            const fetched = await fetchOfflineWorkouts();
            expect(fetched.success).toBe(true);
            expect(Array.isArray(fetched.data)).toBe(true);
        });

        it('flushes offline workouts correctly', async () => {
            await syncWorkoutToIndexedDB({ id: 'off-flush-1' });
            const flushRes = await flushOfflineWorkouts();
            expect(flushRes.success).toBe(true);
            expect(typeof flushRes.count).toBe('number');
        });

        it('validates invalid nutrition payloads for syncNutritionToIndexedDB', async () => {
            const res = await syncNutritionToIndexedDB(null);
            expect(res).toEqual({ success: false, error: 'Invalid nutrition payload' });
        });

        it('syncs nutrition payload to IndexedDB offline storage', async () => {
            const entry = { id: 'nutr-1', name: 'Protein Shake', calories: 250, protein: 30, carbs: 10, fat: 3 };
            const res = await syncNutritionToIndexedDB(entry);
            expect(res.success).toBe(true);

            const fetched = await fetchOfflineNutrition();
            expect(fetched.success).toBe(true);
            expect(Array.isArray(fetched.data)).toBe(true);
        });
    });

    describe('4. File Line Count Constraints Enforcement', () => {
        it('enforces useActiveWorkoutStore.ts line count strictly < 250 lines (limit 350)', () => {
            const files = import.meta.glob<string>('../store/useActiveWorkoutStore.ts', { query: '?raw', import: 'default', eager: true });
            const content = Object.values(files)[0] || '';
            expect(content.split('\n').length).toBeLessThanOrEqual(250);
        });

        it('enforces syncFirestore.ts line count strictly < 60 lines', () => {
            const files = import.meta.glob<string>('./syncFirestore.ts', { query: '?raw', import: 'default', eager: true });
            const content = Object.values(files)[0] || '';
            expect(content.split('\n').length).toBeLessThanOrEqual(60);
        });

        it('enforces syncIndexedDB.ts line count strictly < 60 lines', () => {
            const files = import.meta.glob<string>('./syncIndexedDB.ts', { query: '?raw', import: 'default', eager: true });
            const content = Object.values(files)[0] || '';
            expect(content.split('\n').length).toBeLessThanOrEqual(60);
        });
    });
});
