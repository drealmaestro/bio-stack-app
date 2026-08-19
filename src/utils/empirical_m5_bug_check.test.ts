import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../store/useStore';
import { calculateDailyReadiness } from './readinessMath';
import { useActiveWorkoutStore } from '../store/useActiveWorkoutStore';

describe('Empirical M5 Quality Assurance & Boundary Verification', () => {
    const today = '2026-08-19';

    beforeEach(() => {
        useStore.getState().resetStore();
        useActiveWorkoutStore.getState().cancelWorkout();
        vi.restoreAllMocks();
    });

    describe('Daily Readiness Boundary Stress Tests', () => {
        it('handles zero water, zero sleep, and high active minutes without crashing', () => {
            const readiness = calculateDailyReadiness({
                sleepMinutes: 0,
                waterMl: 0,
                isRestDay: false,
                activeMinutesToday: 120,
            });

            expect(readiness.score).toBeGreaterThanOrEqual(0);
            expect(readiness.score).toBeLessThanOrEqual(100);
            expect(readiness.label).toBeDefined();
            expect(readiness.summary).toBeDefined();
            expect(readiness.metrics.sleepPct).toBe(60); // Baseline default when unlogged
            expect(readiness.metrics.hydrationPct).toBe(0);
        });

        it('handles saturated sleep and hydration over 100% target', () => {
            const readiness = calculateDailyReadiness({
                sleepMinutes: 10 * 60, // 10h sleep
                waterMl: 4000,         // 4L water
                isRestDay: true,
                activeMinutesToday: 0,
            });

            expect(readiness.score).toBeGreaterThan(80);
            expect(readiness.level).toMatch(/Prime|Optimal/i);
            expect(readiness.metrics.sleepPct).toBe(125); // Capped at 125% max ratio
            expect(readiness.metrics.hydrationPct).toBe(125);
        });
    });

    describe('1-Tap Immediate Logging & State Synchrony', () => {
        it('immediately reflects incremental water intake bumps in store and readiness calculation', () => {
            const store = useStore.getState();

            // Initial water state
            expect(store.waterIntake[today] || 0).toBe(0);

            // 1-Tap bump +250ml
            store.logWaterIntake(today, 250);
            expect(useStore.getState().waterIntake[today]).toBe(250);

            // 1-Tap bump +500ml
            useStore.getState().logWaterIntake(today, 500);
            expect(useStore.getState().waterIntake[today]).toBe(750);

            // Verify readiness reacts immediately
            const readiness = calculateDailyReadiness({
                sleepMinutes: 450,
                waterMl: useStore.getState().waterIntake[today],
                isRestDay: false,
                activeMinutesToday: 45,
            });

            expect(readiness.metrics.hydrationPct).toBe(Math.round((750 / 2000) * 100));
        });

        it('records sleep accurately and updates readiness score', () => {
            const store = useStore.getState();
            store.logSleep(today, 480); // 8 hours

            expect(useStore.getState().sleepDuration[today]).toBe(480);

            const readiness = calculateDailyReadiness({
                sleepMinutes: useStore.getState().sleepDuration[today],
                waterMl: 2000,
                isRestDay: false,
                activeMinutesToday: 30,
            });

            expect(readiness.metrics.sleepPct).toBe(Math.round((480 / 420) * 100));
            expect(readiness.score).toBeGreaterThanOrEqual(80);
        });
    });

    describe('Fast Set Duplication / Previous Weight Auto-Fill', () => {
        it('auto-fills and persists workout set weights and reps accurately', () => {
            const workoutStore = useActiveWorkoutStore.getState();
            workoutStore.startWorkout('tmpl-1');

            // Log set 1: 80kg x 10 reps, RPE 8
            workoutStore.updateSetWeight(0, 1, 80);
            workoutStore.updateSetReps(0, 1, 10);
            workoutStore.updateSetRpe(0, 1, 8);

            const active = useActiveWorkoutStore.getState().activeWorkout;
            expect(active).toBeDefined();
            expect(active?.setWeights['0-1']).toBe(80);
            expect(active?.setReps?.['0-1']).toBe(10);
            expect(active?.setRpes?.['0-1']).toBe(8);

            // Auto-fill Set 2 with Set 1's values
            workoutStore.updateSetWeight(0, 2, active!.setWeights['0-1']);
            workoutStore.updateSetReps(0, 2, active!.setReps!['0-1']);
            workoutStore.updateSetRpe(0, 2, active!.setRpes!['0-1']);

            const updatedActive = useActiveWorkoutStore.getState().activeWorkout;
            expect(updatedActive?.setWeights['0-2']).toBe(80);
            expect(updatedActive?.setReps?.['0-2']).toBe(10);
            expect(updatedActive?.setRpes?.['0-2']).toBe(8);
        });
    });
});
