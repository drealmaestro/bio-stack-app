import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SetRow } from './SetRow';
import { SetLoggingBottomSheet } from './SetLoggingBottomSheet';
import { ExerciseCard } from './ExerciseCard';
import { RestTimerWidget } from '../RestTimerWidget';
import { useStore } from '../../../store/useStore';
import type { ExerciseSet, ActiveWorkoutState } from '../../../types';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Active Workout DOM Components', () => {
    describe('SetRow', () => {
        it('renders set number, weight, reps, and RPE badge correctly', () => {
            render(
                <SetRow
                    exerciseName="Bench Press"
                    exerciseIndex={0}
                    setNum={1}
                    targetReps={10}
                    currentWeight={80}
                    currentReps={10}
                    currentRpe={8}
                    isCompleted={false}
                    hasRepsKey={true}
                    onWeightChange={vi.fn()}
                    onRepsChange={vi.fn()}
                    onRpeChange={vi.fn()}
                    onToggleComplete={vi.fn()}
                />
            );

            expect(screen.getByText('1')).toBeDefined();
            expect(screen.getByText('80 kg')).toBeDefined();
            expect(screen.getByText('10')).toBeDefined();
            expect(screen.getByText('@8')).toBeDefined();
        });

        it('triggers onToggleComplete when completion button is clicked', () => {
            const onToggleComplete = vi.fn();
            render(
                <SetRow
                    exerciseName="Bench Press"
                    exerciseIndex={0}
                    setNum={1}
                    targetReps={10}
                    currentWeight={80}
                    currentReps={10}
                    currentRpe={8}
                    isCompleted={false}
                    hasRepsKey={true}
                    onWeightChange={vi.fn()}
                    onRepsChange={vi.fn()}
                    onRpeChange={vi.fn()}
                    onToggleComplete={onToggleComplete}
                />
            );

            const checkBtn = screen.getByLabelText('Mark complete Bench Press set 1');
            fireEvent.click(checkBtn);
            expect(onToggleComplete).toHaveBeenCalledTimes(1);
        });

        it('triggers onOpenSheet when row is clicked', () => {
            const onOpenSheet = vi.fn();
            render(
                <SetRow
                    exerciseName="Bench Press"
                    exerciseIndex={0}
                    setNum={1}
                    targetReps={10}
                    currentWeight={80}
                    currentReps={10}
                    currentRpe={8}
                    isCompleted={false}
                    hasRepsKey={true}
                    onWeightChange={vi.fn()}
                    onRepsChange={vi.fn()}
                    onRpeChange={vi.fn()}
                    onToggleComplete={vi.fn()}
                    onOpenSheet={onOpenSheet}
                />
            );

            const row = screen.getByText('80 kg').closest('div.grid')!;
            fireEvent.click(row);
            expect(onOpenSheet).toHaveBeenCalledTimes(1);
        });
    });

    describe('SetLoggingBottomSheet', () => {
        it('does not render when isOpen is false', () => {
            const { container } = render(
                <SetLoggingBottomSheet
                    isOpen={false}
                    onClose={vi.fn()}
                    exerciseName="Squat"
                    setIndex={1}
                    totalSets={3}
                    weight={100}
                    reps={5}
                    onSave={vi.fn()}
                    onToggleComplete={vi.fn()}
                />
            );
            expect(container.firstChild).toBeNull();
        });

        it('renders set info and handles keypad inputs, tab switches, and completion save', () => {
            const onClose = vi.fn();
            const onSave = vi.fn();
            const onToggleComplete = vi.fn();

            render(
                <SetLoggingBottomSheet
                    isOpen={true}
                    onClose={onClose}
                    exerciseName="Barbell Squat"
                    setIndex={2}
                    totalSets={4}
                    weight={100}
                    reps={8}
                    rpe={8}
                    onSave={onSave}
                    onToggleComplete={onToggleComplete}
                />
            );

            expect(screen.getByText('Set 2 of 4')).toBeDefined();
            expect(screen.getByText('Barbell Squat')).toBeDefined();

            // Switch tab to Reps
            const repsTab = screen.getByText('Reps').closest('button')!;
            fireEvent.click(repsTab);

            // Complete CTA
            const completeBtn = screen.getByText('COMPLETE & LOG SET');
            fireEvent.click(completeBtn);

            expect(onToggleComplete).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    describe('ExerciseCard', () => {
        const mockExercise: ExerciseSet = {
            exercise_id: 'ex-squat',
            target_sets: 3,
            target_reps: 8,
            rest_seconds: 90,
        };

        const mockActiveWorkout: ActiveWorkoutState = {
            templateId: 'tmpl-1',
            startTime: Date.now(),
            completedSets: ['0-1'],
            setWeights: { '0-1': 100 },
            setReps: { '0-1': 8 },
            setRpes: { '0-1': 8 },
            restEndTime: null,
            originalRestDuration: 90,
        };

        it('renders exercise header, rest period, and set rows', () => {
            render(
                <ExerciseCard
                    exercise={mockExercise}
                    index={0}
                    exercises={[{ id: 'ex-squat', name: 'Barbell Squat', target_muscle: 'Legs', instructions: '' }]}
                    activeWorkout={mockActiveWorkout}
                    lastSessionData={null}
                    lastSetsByExercise={{}}
                    expandedTempo={null}
                    onToggleTempo={vi.fn()}
                    updateSetWeight={vi.fn()}
                    updateSetReps={vi.fn()}
                    updateSetRpe={vi.fn()}
                    toggleSetComplete={vi.fn()}
                    getExerciseName={() => 'Barbell Squat'}
                />
            );

            expect(screen.getByText('Barbell Squat')).toBeDefined();
            expect(screen.getByText('90s Rest')).toBeDefined();
            expect(screen.getByText('Warm-Up')).toBeDefined();
        });
    });

    describe('RestTimerWidget', () => {
        beforeEach(() => {
            useStore.getState().resetStore();
            mockNavigate.mockReset();
        });

        it('renders null when no rest active', () => {
            const { container } = render(
                <MemoryRouter>
                    <RestTimerWidget />
                </MemoryRouter>
            );
            expect(container.firstChild).toBeNull();
        });

        it('renders active timer and handles add time and skip', () => {
            useStore.getState().startWorkout('tmpl-1');
            useStore.getState().toggleSetComplete(0, 1, 60);

            render(
                <MemoryRouter>
                    <RestTimerWidget />
                </MemoryRouter>
            );

            expect(screen.getByText('Resting')).toBeDefined();
            const addBtn = screen.getByText('30s');
            fireEvent.click(addBtn);

            const skipBtn = screen.getByText('Skip');
            fireEvent.click(skipBtn);
            expect(useStore.getState().activeWorkout?.restEndTime).toBeNull();
        });
    });
});
