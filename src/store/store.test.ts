import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';
import type { WorkoutTemplate, Exercise, WorkoutLog, UserProfile } from '../types';

describe('Zustand Store Slices & State Synchronization', () => {
    beforeEach(() => {
        useStore.getState().resetStore();
    });

    describe('activeWorkoutSlice', () => {
        it('should initialize with null activeWorkout', () => {
            expect(useStore.getState().activeWorkout).toBeNull();
        });

        it('should start a workout and set default fields', () => {
            useStore.getState().startWorkout('tmpl-1');
            const state = useStore.getState().activeWorkout;
            expect(state).not.toBeNull();
            expect(state?.templateId).toBe('tmpl-1');
            expect(state?.completedSets).toEqual([]);
            expect(state?.setWeights).toEqual({});
            expect(state?.setReps).toEqual({});
            expect(state?.setRpes).toEqual({});
            expect(state?.restEndTime).toBeNull();
            expect(state?.originalRestDuration).toBe(0);
        });

        it('should toggle set complete and set rest end time when restSeconds > 0', () => {
            useStore.getState().startWorkout('tmpl-1');

            // Toggle set complete ON with rest timer of 60s
            const before = Date.now();
            useStore.getState().toggleSetComplete(0, 1, 60);

            let state = useStore.getState().activeWorkout;
            expect(state?.completedSets).toContain('0-1');
            expect(state?.restEndTime).toBeGreaterThanOrEqual(before + 60000);
            expect(state?.originalRestDuration).toBe(60);

            // Toggle set complete OFF
            useStore.getState().toggleSetComplete(0, 1, 60);
            state = useStore.getState().activeWorkout;
            expect(state?.completedSets).not.toContain('0-1');
        });

        it('should update set weights, reps, and RPE accurately', () => {
            useStore.getState().startWorkout('tmpl-1');

            useStore.getState().updateSetWeight(0, 1, 100);
            useStore.getState().updateSetReps(0, 1, 8);
            useStore.getState().updateSetRpe(0, 1, 9);

            const state = useStore.getState().activeWorkout;
            expect(state?.setWeights['0-1']).toBe(100);
            expect(state?.setReps['0-1']).toBe(8);
            expect(state?.setRpes?.['0-1']).toBe(9);
        });

        it('should handle addRestTime and skipRest correctly', () => {
            useStore.getState().startWorkout('tmpl-1');
            useStore.getState().toggleSetComplete(0, 1, 60);

            const initialRestEnd = useStore.getState().activeWorkout?.restEndTime || 0;
            useStore.getState().addRestTime(30);

            let state = useStore.getState().activeWorkout;
            expect(state?.restEndTime).toBe(initialRestEnd + 30000);
            expect(state?.originalRestDuration).toBe(90);

            useStore.getState().skipRest();
            state = useStore.getState().activeWorkout;
            expect(state?.restEndTime).toBeNull();
            expect(state?.originalRestDuration).toBe(0);
        });

        it('should safely handle operations when activeWorkout is null', () => {
            expect(() => {
                useStore.getState().toggleSetComplete(0, 1, 60);
                useStore.getState().updateSetWeight(0, 1, 50);
                useStore.getState().updateSetReps(0, 1, 10);
                useStore.getState().updateSetRpe(0, 1, 8);
                useStore.getState().addRestTime(30);
                useStore.getState().skipRest();
            }).not.toThrow();

            expect(useStore.getState().activeWorkout).toBeNull();
        });

        it('should cancel active workout', () => {
            useStore.getState().startWorkout('tmpl-1');
            expect(useStore.getState().activeWorkout).not.toBeNull();

            useStore.getState().cancelWorkout();
            expect(useStore.getState().activeWorkout).toBeNull();
        });
    });

    describe('routineSlice & exerciseSlice', () => {
        it('should add, update, and delete routine templates', () => {
            const template: WorkoutTemplate = {
                id: 'tmpl-test',
                name: 'Test Workout',
                exercises: [{ exercise_id: 'ex-1', target_sets: 3, target_reps: 10, rest_seconds: 60 }]
            };

            useStore.getState().addTemplate(template);
            expect(useStore.getState().templates).toHaveLength(1);
            expect(useStore.getState().templates[0].name).toBe('Test Workout');

            const updated: WorkoutTemplate = { ...template, name: 'Updated Workout' };
            useStore.getState().updateTemplate(updated);
            expect(useStore.getState().templates[0].name).toBe('Updated Workout');

            useStore.getState().deleteTemplate('tmpl-test');
            expect(useStore.getState().templates).toHaveLength(0);
        });

        it('should add logs and exercises', () => {
            const exercise: Exercise = {
                id: 'ex-test',
                name: 'Test Exercise',
                target_muscle: 'Chest',
                instructions: 'Push the bar up'
            };

            useStore.getState().addExercise(exercise);
            expect(useStore.getState().exercises).toContainEqual(exercise);

            const log: WorkoutLog = {
                id: 'log-1',
                template_id: 'tmpl-1',
                timestamp: new Date().toISOString(),
                duration_seconds: 1800,
                completed_exercises: [
                    { exercise_id: 'ex-test', set_number: 1, reps_completed: 10, weight_kg: 80 }
                ]
            };

            useStore.getState().addLog(log);
            expect(useStore.getState().logs).toHaveLength(1);
            expect(useStore.getState().logs[0].id).toBe('log-1');
        });
    });

    describe('userSlice & nutritionSlice', () => {
        it('should handle user profile state and weight/body fat updates', () => {
            const userProfile: UserProfile = {
                name: 'John Doe',
                age: 28,
                goals: ['Build Muscle'],
                experience_level: 'Intermediate',
                stats: { weight: [{ date: '2026-07-20', value: 75 }], body_fat: [] }
            };

            useStore.getState().setUser(userProfile);
            expect(useStore.getState().user?.name).toBe('John Doe');

            useStore.getState().updateUserStats('weight', { date: '2026-07-21', value: 75.5 });
            expect(useStore.getState().user?.stats.weight).toHaveLength(2);
            expect(useStore.getState().user?.stats.weight[1].value).toBe(75.5);
        });

        it('should handle nutrition entries, water intake, and sleep duration', () => {
            useStore.getState().addNutritionEntry('2026-07-21', {
                food_item_id: 'item-1',
                food_name: 'Chicken Rice',
                servings: 1,
                calories: 500,
                protein_g: 45,
                carbs_g: 50,
                fat_g: 10
            });
            expect(useStore.getState().nutritionLogs).toHaveLength(1);
            expect(useStore.getState().getNutritionLog('2026-07-21')?.entries[0].food_name).toBe('Chicken Rice');

            useStore.getState().logWaterIntake('2026-07-21', 500);
            expect(useStore.getState().waterIntake['2026-07-21']).toBe(500);

            useStore.getState().logWaterIntake('2026-07-21', 250);
            expect(useStore.getState().waterIntake['2026-07-21']).toBe(750);

            useStore.getState().logSleep('2026-07-21', 480);
            expect(useStore.getState().sleepDuration['2026-07-21']).toBe(480);
        });
    });

    describe('useStore seed and resetStore', () => {
        it('should seed store with initial data on seed()', () => {
            expect(useStore.getState().seeded).toBe(false);
            useStore.getState().seed();
            expect(useStore.getState().seeded).toBe(true);
            expect(useStore.getState().exercises.length).toBeGreaterThan(0);
            expect(useStore.getState().templates.length).toBeGreaterThan(0);
        });

        it('should reset store back to initial clean state', () => {
            useStore.getState().seed();
            useStore.getState().setUser({ name: 'Test', age: 25, goals: [], experience_level: 'Beginner', stats: { weight: [], body_fat: [] } });
            useStore.getState().startWorkout('tmpl-1');

            useStore.getState().resetStore();
            expect(useStore.getState().user).toBeNull();
            expect(useStore.getState().templates).toEqual([]);
            expect(useStore.getState().exercises).toEqual([]);
            expect(useStore.getState().logs).toEqual([]);
            expect(useStore.getState().activeWorkout).toBeNull();
            expect(useStore.getState().seeded).toBe(false);
        });
    });
});
