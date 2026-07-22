import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useActiveWorkoutSession } from './useActiveWorkoutSession';
import { useStore } from '../store/useStore';

vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

describe('useActiveWorkoutSession Hook', () => {
    beforeEach(() => {
        useStore.getState().resetStore();
        useStore.getState().seed();
    });

    it('should initialize with default state and templates from store', () => {
        const { result } = renderHook(() => useActiveWorkoutSession());
        expect(result.current.templates.length).toBeGreaterThan(0);
        expect(result.current.activeWorkout).toBeNull();
        expect(result.current.activeTemplate).toBeNull();
        expect(result.current.elapsedSeconds).toBe(0);
    });

    it('should start a workout and compute activeTemplate', () => {
        const { result } = renderHook(() => useActiveWorkoutSession());
        const template = result.current.templates[0];

        act(() => {
            result.current.startWorkout(template.id);
        });

        expect(result.current.activeWorkout).not.toBeNull();
        expect(result.current.activeWorkout?.templateId).toBe(template.id);
        expect(result.current.activeTemplate?.id).toBe(template.id);
    });

    it('should track set completions, weights, reps, and RPEs', () => {
        const { result } = renderHook(() => useActiveWorkoutSession());
        const template = result.current.templates[0];

        act(() => {
            result.current.startWorkout(template.id);
        });

        act(() => {
            result.current.updateSetWeight(0, 1, 100);
        });
        act(() => {
            result.current.updateSetReps(0, 1, 10);
        });
        act(() => {
            result.current.updateSetRpe(0, 1, 8);
        });
        act(() => {
            result.current.toggleSetComplete(0, 1, 90);
        });

        expect(result.current.activeWorkout?.setWeights['0-1']).toBe(100);
        expect(result.current.activeWorkout?.setReps['0-1']).toBe(10);
        expect(result.current.activeWorkout?.setRpes?.['0-1']).toBe(8);
        expect(result.current.activeWorkout?.completedSets).toContain('0-1');
    });

    it('should calculate total volume, PRs, and log completed workout on handleFinish', () => {
        const { result } = renderHook(() => useActiveWorkoutSession());
        const template = result.current.templates[0];

        act(() => {
            result.current.startWorkout(template.id);
        });

        act(() => {
            result.current.updateSetWeight(0, 1, 100);
        });
        act(() => {
            result.current.updateSetReps(0, 1, 10);
        });
        act(() => {
            result.current.toggleSetComplete(0, 1, 90);
        });
        act(() => {
            result.current.updateSetWeight(0, 2, 110);
        });
        act(() => {
            result.current.updateSetReps(0, 2, 8);
        });
        act(() => {
            result.current.toggleSetComplete(0, 2, 90);
        });

        act(() => {
            result.current.handleFinish();
        });

        // Workout should be completed and cleared from activeWorkout
        expect(result.current.activeWorkout).toBeNull();
        expect(result.current.showSummary).toBe(true);

        // Verify summary data
        expect(result.current.summaryData).not.toBeNull();
        expect(result.current.summaryData?.sets).toBe(2);
        // Volume = (100 * 10) + (110 * 8) = 1000 + 880 = 1880
        expect(result.current.summaryData?.volume).toBe(1880);

        // Verify new log in store
        const storeLogs = useStore.getState().logs;
        expect(storeLogs).toHaveLength(1);
        expect(storeLogs[0].template_id).toBe(template.id);
        expect(storeLogs[0].completed_exercises).toHaveLength(2);
        expect(storeLogs[0].completed_exercises[0].weight_kg).toBe(100);
        expect(storeLogs[0].completed_exercises[1].weight_kg).toBe(110);
    });

    it('should calculate PR map correctly across multiple sessions', () => {
        const { result } = renderHook(() => useActiveWorkoutSession());
        const template = result.current.templates[0];
        const exerciseId = template.exercises[0].exercise_id;

        // Session 1: Bench Press 80kg
        act(() => {
            result.current.startWorkout(template.id);
        });
        act(() => {
            result.current.updateSetWeight(0, 1, 80);
        });
        act(() => {
            result.current.updateSetReps(0, 1, 10);
        });
        act(() => {
            result.current.toggleSetComplete(0, 1, 0);
        });
        act(() => {
            result.current.handleFinish();
        });

        expect(useStore.getState().logs).toHaveLength(1);

        // Re-render hook to reflect updated logs in prMap
        const { result: result2 } = renderHook(() => useActiveWorkoutSession());
        expect(result2.current.prMap[exerciseId]).toBe(80);

        // Session 2: Bench Press 90kg -> should trigger PR in handleFinish
        act(() => {
            result2.current.startWorkout(template.id);
        });
        act(() => {
            result2.current.updateSetWeight(0, 1, 90);
        });
        act(() => {
            result2.current.updateSetReps(0, 1, 8);
        });
        act(() => {
            result2.current.toggleSetComplete(0, 1, 0);
        });
        act(() => {
            result2.current.handleFinish();
        });

        expect(result2.current.summaryData?.prs.length).toBeGreaterThan(0);
        expect(useStore.getState().logs).toHaveLength(2);
    });

    it('should handle cancelWorkout cleanly', () => {
        const { result } = renderHook(() => useActiveWorkoutSession());
        const template = result.current.templates[0];

        act(() => {
            result.current.startWorkout(template.id);
        });
        expect(result.current.activeWorkout).not.toBeNull();

        act(() => {
            result.current.cancelWorkout();
        });

        expect(result.current.activeWorkout).toBeNull();
        expect(useStore.getState().logs).toHaveLength(0);
    });
});
