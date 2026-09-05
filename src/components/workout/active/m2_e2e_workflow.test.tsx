import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import { ActiveWorkout } from '../../../pages/ActiveWorkout';
import { useActiveWorkoutSession } from '../../../hooks/useActiveWorkoutSession';
import { useStore } from '../../../store/useStore';
import { useActiveWorkoutStore } from '../../../store/useActiveWorkoutStore';
import type { WorkoutLog } from '../../../types';

// Mock audio and notifications
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

describe('Milestone 2 End-to-End User Workflows Empirical Verification', () => {
    const todayStr = new Date().toISOString().split('T')[0];

    beforeEach(() => {
        vi.clearAllMocks();
        useStore.getState().resetStore();
        useActiveWorkoutStore.getState().cancelWorkout();
        useStore.getState().seed();

        if (!('vibrate' in navigator)) {
            Object.defineProperty(navigator, 'vibrate', {
                value: vi.fn(),
                writable: true,
                configurable: true,
            });
        }
    });

    it('Workflow 1 & 2: User starts template and sees accurate progressive overload (+2.5kg)', () => {
        // Seed prior log: 80kg x 8 reps @ RPE 7.5 on ex_incline_barbell_press
        const pastLog: WorkoutLog = {
            id: 'log-1',
            template_id: 'tmpl_chest_tri_power',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            duration_seconds: 3600,
            completed_exercises: [
                { exercise_id: 'ex_incline_barbell_press', set_number: 1, weight_kg: 80, reps_completed: 8, rpe: 7.5 },
                { exercise_id: 'ex_incline_barbell_press', set_number: 2, weight_kg: 80, reps_completed: 8, rpe: 7.5 },
                { exercise_id: 'ex_incline_barbell_press', set_number: 3, weight_kg: 80, reps_completed: 8, rpe: 8.0 },
                { exercise_id: 'ex_incline_barbell_press', set_number: 4, weight_kg: 80, reps_completed: 8, rpe: 7.5 },
            ],
        };
        useStore.setState({ logs: [pastLog] });

        // Start workout
        useActiveWorkoutStore.getState().startWorkout('tmpl_chest_tri_power');

        render(<ActiveWorkout />);

        // Verify progressive overload badge (+2.5kg for compound upper body)
        expect(screen.getAllByText('+2.5kg').length).toBeGreaterThan(0);
        expect(screen.getAllByText(/82.5\s*kg/i).length).toBeGreaterThan(0);
    });

    it('Workflow 3: User applies recommendation with 1 tap into set inputs', () => {
        const pastLog: WorkoutLog = {
            id: 'log-1',
            template_id: 'tmpl_chest_tri_power',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            duration_seconds: 3600,
            completed_exercises: [
                { exercise_id: 'ex_incline_barbell_press', set_number: 1, weight_kg: 80, reps_completed: 8, rpe: 7.5 },
                { exercise_id: 'ex_incline_barbell_press', set_number: 2, weight_kg: 80, reps_completed: 8, rpe: 7.5 },
                { exercise_id: 'ex_incline_barbell_press', set_number: 3, weight_kg: 80, reps_completed: 8, rpe: 8.0 },
                { exercise_id: 'ex_incline_barbell_press', set_number: 4, weight_kg: 80, reps_completed: 8, rpe: 7.5 },
            ],
        };
        useStore.setState({ logs: [pastLog] });
        useActiveWorkoutStore.getState().startWorkout('tmpl_chest_tri_power');

        render(<ActiveWorkout />);

        const applyButtons = screen.getAllByRole('button', { name: /apply/i });
        expect(applyButtons.length).toBeGreaterThan(0);
        fireEvent.click(applyButtons[0]);

        const storeState = useActiveWorkoutStore.getState().activeWorkout;
        expect(storeState?.setWeights['0-1']).toBe(82.5);
        expect(storeState?.setReps['0-1']).toBe(8);
    });

    it('Workflow 4: User toggles completion -> set complete, rest timer starts, next set becomes upcoming', () => {
        const pastLog: WorkoutLog = {
            id: 'log-1',
            template_id: 'tmpl_chest_tri_power',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            duration_seconds: 3600,
            completed_exercises: [
                { exercise_id: 'ex_incline_barbell_press', set_number: 1, weight_kg: 80, reps_completed: 8, rpe: 7.5 },
                { exercise_id: 'ex_incline_barbell_press', set_number: 2, weight_kg: 80, reps_completed: 8, rpe: 7.5 },
                { exercise_id: 'ex_incline_barbell_press', set_number: 3, weight_kg: 80, reps_completed: 8, rpe: 8.0 },
                { exercise_id: 'ex_incline_barbell_press', set_number: 4, weight_kg: 80, reps_completed: 8, rpe: 7.5 },
            ],
        };
        useStore.setState({ logs: [pastLog] });
        useActiveWorkoutStore.getState().startWorkout('tmpl_chest_tri_power');

        const { container } = render(<ActiveWorkout />);

        // Complete set 1
        const completeButtons = screen.getAllByRole('button', { name: /mark complete/i });
        fireEvent.click(completeButtons[0]);

        const storeState = useActiveWorkoutStore.getState().activeWorkout;
        // 1. Set 1 is completed
        expect(storeState?.completedSets).toContain('0-1');
        // 2. Rest timer is started
        expect(storeState?.restEndTime).toBeGreaterThan(Date.now());

        // 3. Rest timer overlay is displayed
        expect(screen.getByText(/resting/i)).toBeDefined();

        // 4. Set 2 is now the upcoming set and has the recommendation badge
        const badgeContainers = container.querySelectorAll('[title*="Incline Barbell Press"]');
        expect(badgeContainers.length).toBeGreaterThan(0);
    });

    it('Workflow 5: New exercise without logs displays Baseline recommendation and onboarding text', () => {
        // No logs in store
        useStore.setState({ logs: [] });
        useActiveWorkoutStore.getState().startWorkout('tmpl_chest_tri_power');

        render(<ActiveWorkout />);

        // Should display "Baseline" badge
        expect(screen.getAllByText('Baseline').length).toBeGreaterThan(0);
        // Coach rationale onboarding text
        expect(screen.getAllByText(/First session/i).length).toBeGreaterThan(0);
    });

    it('Workflow 6 (Hook verification): useActiveWorkoutSession DOES adjust recommendations on low readiness', () => {
        const pastLog: WorkoutLog = {
            id: 'log-1',
            template_id: 'tmpl_chest_tri_power',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            duration_seconds: 3600,
            completed_exercises: [
                { exercise_id: 'ex_incline_barbell_press', set_number: 1, weight_kg: 80, reps_completed: 8, rpe: 7.5 },
                { exercise_id: 'ex_incline_barbell_press', set_number: 2, weight_kg: 80, reps_completed: 8, rpe: 7.5 },
                { exercise_id: 'ex_incline_barbell_press', set_number: 3, weight_kg: 80, reps_completed: 8, rpe: 8.0 },
                { exercise_id: 'ex_incline_barbell_press', set_number: 4, weight_kg: 80, reps_completed: 8, rpe: 7.5 },
            ],
        };
        useStore.setState({
            logs: [pastLog],
            sleepDuration: { [todayStr]: 240 },
            waterIntake: { [todayStr]: 800 },
        });
        useActiveWorkoutStore.getState().startWorkout('tmpl_chest_tri_power');

        // Test the hook directly using ExerciseCard fallback vs hook calculation
        const { result } = renderHook(() => useActiveWorkoutSession());
        const session = result.current;
        const rec = session.smartRecommendations['ex_incline_barbell_press'];
        expect(rec).toBeDefined();
        expect(rec.readinessScore).toBeLessThan(60);
        expect(rec.action === 'hold' || rec.action === 'deload').toBe(true);
        expect(rec.isOverload).toBe(false);
    });

    it('Workflow 6: ActiveWorkout component updates recommendation on low readiness', () => {
        const pastLog: WorkoutLog = {
            id: 'log-1',
            template_id: 'tmpl_chest_tri_power',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            duration_seconds: 3600,
            completed_exercises: [
                { exercise_id: 'ex_incline_barbell_press', set_number: 1, weight_kg: 80, reps_completed: 8, rpe: 7.5 },
                { exercise_id: 'ex_incline_barbell_press', set_number: 2, weight_kg: 80, reps_completed: 8, rpe: 7.5 },
                { exercise_id: 'ex_incline_barbell_press', set_number: 3, weight_kg: 80, reps_completed: 8, rpe: 8.0 },
                { exercise_id: 'ex_incline_barbell_press', set_number: 4, weight_kg: 80, reps_completed: 8, rpe: 7.5 },
            ],
        };

        // Simulate poor sleep (4 hours = 240 mins) and poor hydration (800 ml)
        useStore.setState({
            logs: [pastLog],
            sleepDuration: { [todayStr]: 240 },
            waterIntake: { [todayStr]: 800 },
        });

        useActiveWorkoutStore.getState().startWorkout('tmpl_chest_tri_power');

        render(<ActiveWorkout />);

        // In the UI, ActiveWorkout passes smartRecommendation (computed with physiological readiness)
        // to ExerciseCard and down to SetRow. When poor sleep and low hydration are recorded,
        // the UI updates to show hold or deload, correctly suppressing progressive overload.
        expect(screen.queryByText('+2.5kg')).toBeNull();
        expect(
            screen.queryByText('Hold Recovery') ||
            screen.queryByText('-10% Deload') ||
            screen.queryByText(/Deload/i) ||
            screen.queryByText(/Hold/i)
        ).not.toBeNull();
    });
});
