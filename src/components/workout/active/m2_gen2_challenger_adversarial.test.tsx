import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, renderHook, act } from '@testing-library/react';
import { roundToPlateIncrement, calculateProgressiveOverload } from '../../../utils/progressiveOverload';
import { useActiveWorkoutSession } from '../../../hooks/useActiveWorkoutSession';
import { useStore } from '../../../store/useStore';
import { useActiveWorkoutStore } from '../../../store/useActiveWorkoutStore';
import { SetRow } from './SetRow';
import type { WorkoutLog } from '../../../types';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

describe('Milestone 2 Gen 2 Empirical Challenger Adversarial Suite', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useStore.getState().resetStore();
        useActiveWorkoutStore.getState().cancelWorkout();
        useStore.getState().seed();
        if (!('vibrate' in navigator)) {
            Object.defineProperty(navigator, 'vibrate', { value: vi.fn(), writable: true, configurable: true });
        }
    });

    describe('1. Progressive Overload Engine & Readiness Stress Testing', () => {
        const history = [
            { weight_kg: 80, reps_completed: 8, rpe: 7.5, set_number: 1 },
            { weight_kg: 80, reps_completed: 8, rpe: 7.5, set_number: 2 },
            { weight_kg: 80, reps_completed: 8, rpe: 8.0, set_number: 3 },
        ];

        it('unlogged recovery (readinessScore undefined/null) does NOT trigger defensive hold', () => {
            const r1 = calculateProgressiveOverload({ exerciseName: 'Bench', targetSets: 3, targetReps: 8, muscle: 'Chest', lastSets: history });
            expect(r1.action).toBe('increase');
            expect(r1.suggestedWeightKg).toBe(82.5);
            expect(r1.isOverload).toBe(true);

            const r2 = calculateProgressiveOverload({ exerciseName: 'Bench', targetSets: 3, targetReps: 8, muscle: 'Chest', lastSets: history, readinessScore: null });
            expect(r2.action).toBe('increase');
            expect(r2.suggestedWeightKg).toBe(82.5);
        });

        it('low readiness (40-59%) triggers Hold Recovery; critically low (<40%) triggers Deload', () => {
            const holdRec = calculateProgressiveOverload({ exerciseName: 'Bench', targetSets: 3, targetReps: 8, muscle: 'Chest', lastSets: history, readinessScore: 50 });
            expect(holdRec.action).toBe('hold');
            expect(holdRec.shortBadgeText).toBe('Hold Recovery');
            expect(holdRec.suggestedWeightKg).toBe(80);

            const deloadRec = calculateProgressiveOverload({ exerciseName: 'Squat', targetSets: 3, targetReps: 8, muscle: 'Legs', lastSets: history, readinessScore: 35 });
            expect(deloadRec.action).toBe('deload');
            expect(deloadRec.shortBadgeText).toBe('-10% Deload');
            expect(deloadRec.suggestedWeightKg).toBe(72.5);
            expect(deloadRec.isDeload).toBe(true);
        });

        it('high readiness (>=60%) allows full progression; handles NaN/Infinity gracefully', () => {
            const highRec = calculateProgressiveOverload({ exerciseName: 'Squat', targetSets: 3, targetReps: 8, muscle: 'Legs', lastSets: history, readinessScore: 88 });
            expect(highRec.action).toBe('increase');
            expect(highRec.suggestedWeightKg).toBe(85);

            const nanRec = calculateProgressiveOverload({ exerciseName: 'Bench', targetSets: 3, targetReps: 8, muscle: 'Chest', lastSets: history, readinessScore: NaN });
            expect(nanRec.action).toBe('increase');
            expect(isNaN(nanRec.suggestedWeightKg)).toBe(false);
        });
    });

    describe('2. Plate Rounding & Discrete Increment Calculations', () => {
        it('rounds barbell compound to 2.5kg, dumbbells to 1.0kg, and cleans IEEE 754 float precision', () => {
            expect(roundToPlateIncrement(81.2, 2.5)).toBe(80);
            expect(roundToPlateIncrement(81.3, 2.5)).toBe(82.5);
            expect(roundToPlateIncrement(14.4, 1.0)).toBe(14);
            expect(roundToPlateIncrement(14.6, 1.0)).toBe(15);
            expect(roundToPlateIncrement(62.50000000000001, 2.5)).toBe(62.5);
        });

        it('supports custom plate steps and enforces minimum increment advancement floor', () => {
            const rec = calculateProgressiveOverload({
                exerciseName: 'Press', targetSets: 1, targetReps: 8, muscle: 'Shoulders',
                lastSets: [{ weight_kg: 50, reps_completed: 8, rpe: 7.0 }],
                customPlateStep: 0.5, customWeightIncrement: 0.5,
            });
            expect(rec.suggestedWeightKg).toBe(50.5);
            expect(rec.deltaWeightKg).toBe(0.5);
            expect(roundToPlateIncrement(-10, 2.5)).toBe(0);
            expect(roundToPlateIncrement(80, -2.5)).toBe(80);
        });
    });

    describe('3. 1-Tap Apply: Never Overwrites Already Completed Sets', () => {
        it('applyRecommendation skips completed sets during exercise-wide apply', () => {
            useActiveWorkoutStore.getState().startWorkout('tmpl_chest_tri_power');
            useActiveWorkoutStore.getState().updateSetWeight(0, 1, 75);
            useActiveWorkoutStore.getState().updateSetReps(0, 1, 7);
            useActiveWorkoutStore.getState().toggleSetComplete(0, 1, 60);
            expect(useActiveWorkoutStore.getState().activeWorkout?.completedSets).toContain('0-1');

            const { result } = renderHook(() => useActiveWorkoutSession());
            act(() => {
                result.current.applyRecommendation(0, {
                    action: 'increase', type: 'weight', suggestedWeightKg: 82.5, suggestedReps: 8,
                    deltaWeightKg: 2.5, deltaReps: 0, reason: 'Test', shortBadgeText: '+2.5kg',
                    confidence: 'high', isDeload: false, isOverload: true, historicalTopWeight: 80,
                });
            });

            const state = useActiveWorkoutStore.getState().activeWorkout;
            expect(state?.setWeights['0-1']).toBe(75);
            expect(state?.setReps['0-1']).toBe(7);
            expect(state?.setWeights['0-2']).toBe(82.5);
            expect(state?.setReps['0-2']).toBe(8);
        });

        it('applyRecommendation does not overwrite completed set on targeted set apply', () => {
            useActiveWorkoutStore.getState().startWorkout('tmpl_chest_tri_power');
            useActiveWorkoutStore.getState().updateSetWeight(0, 1, 77.5);
            useActiveWorkoutStore.getState().updateSetReps(0, 1, 6);
            useActiveWorkoutStore.getState().toggleSetComplete(0, 1, 60);

            const { result } = renderHook(() => useActiveWorkoutSession());
            act(() => { result.current.applyRecommendation(0, 1); });

            const state = useActiveWorkoutStore.getState().activeWorkout;
            expect(state?.setWeights['0-1']).toBe(77.5);
            expect(state?.setReps['0-1']).toBe(6);
        });

        it('SetRow component never renders recommendation badge on a completed set', () => {
            const onWeightChange = vi.fn();
            render(
                <SetRow
                    exerciseName="Bench Press" exerciseIndex={0} setNum={1} targetReps={8}
                    currentWeight={80} currentReps={8} currentRpe={8} isCompleted={true}
                    isUpcoming={false} hasRepsKey={true}
                    recommendation={{
                        action: 'increase', type: 'weight', suggestedWeightKg: 82.5, suggestedReps: 8,
                        deltaWeightKg: 2.5, deltaReps: 0, reason: 'Hit reps', shortBadgeText: '+2.5kg',
                        confidence: 'high', isDeload: false, isOverload: true, historicalTopWeight: 80,
                    }}
                    onWeightChange={onWeightChange} onRepsChange={vi.fn()} onRpeChange={vi.fn()} onToggleComplete={vi.fn()}
                />
            );
            expect(screen.queryByText('+2.5kg')).toBeNull();
            expect(screen.queryByRole('button', { name: /apply/i })).toBeNull();
            expect(onWeightChange).not.toHaveBeenCalled();
        });
    });

    describe('4. Historical Tracking & Cross-Template Fallback', () => {
        it('falls back cleanly to Baseline for brand-new exercises with no past logs', () => {
            useStore.setState({ logs: [] });
            useActiveWorkoutStore.getState().startWorkout('tmpl_chest_tri_power');
            const { result } = renderHook(() => useActiveWorkoutSession());
            const rec = result.current.smartRecommendations['ex_incline_barbell_press'];
            expect(rec).toBeDefined();
            expect(rec.action).toBe('baseline');
            expect(rec.shortBadgeText).toBe('Baseline');
            expect(rec.suggestedWeightKg).toBe(0);
            expect(rec.reason).toContain('First session');
        });

        it('cross-template fallback retrieves logs performed under a different template', () => {
            const crossTemplateLog: WorkoutLog = {
                id: 'cross-log-1', template_id: 'tmpl_custom_split',
                timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), duration_seconds: 2400,
                completed_exercises: [
                    { exercise_id: 'ex_incline_barbell_press', set_number: 1, weight_kg: 85, reps_completed: 8, rpe: 7.5 },
                    { exercise_id: 'ex_incline_barbell_press', set_number: 2, weight_kg: 85, reps_completed: 8, rpe: 7.5 },
                    { exercise_id: 'ex_incline_barbell_press', set_number: 3, weight_kg: 85, reps_completed: 8, rpe: 8.0 },
                    { exercise_id: 'ex_incline_barbell_press', set_number: 4, weight_kg: 85, reps_completed: 8, rpe: 8.0 },
                ],
            };
            useStore.setState({ logs: [crossTemplateLog] });
            useActiveWorkoutStore.getState().startWorkout('tmpl_chest_tri_power');

            const { result } = renderHook(() => useActiveWorkoutSession());
            const rec = result.current.smartRecommendations['ex_incline_barbell_press'];
            expect(rec.suggestedWeightKg).toBe(87.5);
            expect(rec.deltaWeightKg).toBe(2.5);
            expect(rec.historicalTopWeight).toBe(85);
        });

        it('prioritizes template-specific logs over older cross-template logs', () => {
            const oldCross: WorkoutLog = {
                id: 'old-cross', template_id: 'tmpl_other', timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
                duration_seconds: 3000, completed_exercises: [{ exercise_id: 'ex_incline_barbell_press', set_number: 1, weight_kg: 70, reps_completed: 8, rpe: 7.0 }],
            };
            const recentSame: WorkoutLog = {
                id: 'recent-same', template_id: 'tmpl_chest_tri_power', timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
                duration_seconds: 3000,
                completed_exercises: [
                    { exercise_id: 'ex_incline_barbell_press', set_number: 1, weight_kg: 90, reps_completed: 8, rpe: 7.5 },
                    { exercise_id: 'ex_incline_barbell_press', set_number: 2, weight_kg: 90, reps_completed: 8, rpe: 7.5 },
                    { exercise_id: 'ex_incline_barbell_press', set_number: 3, weight_kg: 90, reps_completed: 8, rpe: 7.5 },
                    { exercise_id: 'ex_incline_barbell_press', set_number: 4, weight_kg: 90, reps_completed: 8, rpe: 7.5 },
                ],
            };
            useStore.setState({ logs: [oldCross, recentSame] });
            useActiveWorkoutStore.getState().startWorkout('tmpl_chest_tri_power');

            const { result } = renderHook(() => useActiveWorkoutSession());
            const rec = result.current.smartRecommendations['ex_incline_barbell_press'];
            expect(rec.suggestedWeightKg).toBe(92.5);
            expect(rec.historicalTopWeight).toBe(90);
        });
    });
});
