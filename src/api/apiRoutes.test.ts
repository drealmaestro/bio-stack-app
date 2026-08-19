import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    syncWorkoutToFirestore,
    syncUserProfileToFirestore,
    fetchFirestoreProfile,
} from './syncFirestore';
import {
    syncWorkoutToIndexedDB,
    fetchOfflineWorkouts,
    flushOfflineWorkouts,
    syncNutritionToIndexedDB,
    fetchOfflineNutrition,
} from './syncIndexedDB';
import { resetDBPromiseForTesting } from '../utils/indexedDB';

vi.mock('firebase/firestore', () => ({
    doc: vi.fn((_db, ...pathSegments) => ({ path: pathSegments.join('/') })),
    setDoc: vi.fn().mockImplementation((ref) => {
        if (ref.path.includes('fail_write')) {
            return Promise.reject(new Error('Simulated write failure'));
        }
        return Promise.resolve();
    }),
    getDoc: vi.fn().mockImplementation((ref) => {
        if (ref.path.includes('user_123')) {
            return Promise.resolve({
                exists: () => true,
                data: () => ({ user: { name: 'Test User', bodyweightKg: 75 } }),
            });
        }
        if (ref.path.includes('fail_fetch')) {
            return Promise.reject(new Error('Simulated fetch error'));
        }
        return Promise.resolve({ exists: () => false, data: () => null });
    }),
}));

vi.mock('../lib/firebase', () => ({
    db: {},
}));

describe('API Routes Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetDBPromiseForTesting();
    });

    describe('syncFirestore API Route', () => {
        it('should sync workout session to Firestore successfully', async () => {
            const mockWorkout = {
                id: 'log_1',
                template_id: 't1',
                timestamp: new Date().toISOString(),
                duration_seconds: 1800,
                completed_exercises: [],
            };
            const res = await syncWorkoutToFirestore('user_123', mockWorkout);
            expect(res.success).toBe(true);
        });

        it('should handle missing inputs when syncing workout to Firestore', async () => {
            const res = await syncWorkoutToFirestore('', null as any);
            expect(res.success).toBe(false);
            expect(res.error).toBe('Invalid payload');
        });

        it('should handle Firestore write error when syncing workout', async () => {
            const mockWorkout = { id: 'fail_write', template_id: 't1', timestamp: '', duration_seconds: 0, completed_exercises: [] };
            const res = await syncWorkoutToFirestore('user_123', mockWorkout);
            expect(res.success).toBe(false);
            expect(res.error).toBe('Simulated write failure');
        });

        it('should sync user profile to Firestore', async () => {
            const res = await syncUserProfileToFirestore('user_123', { name: 'Alex' });
            expect(res.success).toBe(true);
        });

        it('should return error for missing userId when syncing profile', async () => {
            const res = await syncUserProfileToFirestore('', { name: 'Alex' });
            expect(res.success).toBe(false);
            expect(res.error).toBe('Missing userId');
        });

        it('should fetch user profile from Firestore', async () => {
            const res = await fetchFirestoreProfile('user_123');
            expect(res.success).toBe(true);
            expect(res.data).toEqual({ name: 'Test User', bodyweightKg: 75 });
        });

        it('should handle fetch profile error', async () => {
            const res = await fetchFirestoreProfile('fail_fetch');
            expect(res.success).toBe(false);
            expect(res.error).toBe('Simulated fetch error');
        });
    });

    describe('syncIndexedDB API Route', () => {
        it('should sync workout to IndexedDB and fetch offline workouts', async () => {
            const workout = { templateId: 'tmpl_1', startTime: Date.now(), completedSets: [] };
            const syncRes = await syncWorkoutToIndexedDB(workout);
            expect(syncRes.success).toBe(true);

            const fetchRes = await fetchOfflineWorkouts();
            expect(fetchRes.success).toBe(true);
            expect(fetchRes.data.length).toBeGreaterThan(0);
        });

        it('should return error for invalid workout payload', async () => {
            const res = await syncWorkoutToIndexedDB(null);
            expect(res.success).toBe(false);
            expect(res.error).toBe('Invalid workout payload');
        });

        it('should sync nutrition to IndexedDB and flush offline entries', async () => {
            const nutr = { calories: 2000, protein: 150 };
            const syncRes = await syncNutritionToIndexedDB(nutr);
            expect(syncRes.success).toBe(true);

            const fetchRes = await fetchOfflineNutrition();
            expect(fetchRes.success).toBe(true);

            const flushRes = await flushOfflineWorkouts();
            expect(flushRes.success).toBe(true);
        });

        it('should return error for invalid nutrition payload', async () => {
            const res = await syncNutritionToIndexedDB(null);
            expect(res.success).toBe(false);
            expect(res.error).toBe('Invalid nutrition payload');
        });
    });
});
