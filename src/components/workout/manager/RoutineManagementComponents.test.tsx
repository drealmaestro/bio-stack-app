import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RoutineList } from './RoutineList';
import { RoutineEditor } from './RoutineEditor';
import { ExerciseSelectorModal } from './ExerciseSelectorModal';
import type { WorkoutTemplate, Exercise } from '../../../types';

const mockTemplate: WorkoutTemplate = {
    id: 'tmpl-1',
    name: 'Upper Body Hypertrophy',
    description: 'Focus on progressive overload',
    coach_notes: 'Keep rest intervals strict',
    exercises: [
        { exercise_id: 'ex-bench', target_sets: 4, target_reps: 10, rest_seconds: 90 },
    ],
};

const mockExercise: Exercise = {
    id: 'ex-bench',
    name: 'Barbell Bench Press',
    target_muscle: 'Chest',
    instructions: 'Lower to mid-chest with control.',
};

describe('Routine Management DOM Components', () => {
    describe('RoutineList', () => {
        it('renders empty state when templates array is empty', () => {
            const onOpenCreate = vi.fn();
            render(
                <MemoryRouter>
                    <RoutineList
                        templates={[]}
                        editingId={null}
                        isCreating={false}
                        draft={null}
                        activeWorkout={null}
                        onOpenCreate={onOpenCreate}
                        onStartWorkout={vi.fn()}
                        onOpenEditor={vi.fn()}
                        onRequestCloseEditor={vi.fn()}
                        onUpdateDraft={vi.fn()}
                        getExerciseData={() => mockExercise}
                        getExerciseName={() => 'Barbell Bench Press'}
                        getExerciseMuscle={() => 'Chest'}
                        totalVolume={() => 0}
                        lastSession={() => null}
                        expandedTempo={null}
                        onToggleExpandedTempo={vi.fn()}
                        formCueOpen={null}
                        onToggleFormCue={vi.fn()}
                        onMoveExercise={vi.fn()}
                        onRemoveExercise={vi.fn()}
                        onUpdateField={vi.fn()}
                        showPicker={false}
                        onTogglePicker={vi.fn()}
                        pickerSearch=""
                        onSearchChange={vi.fn()}
                        pickerMuscle="All"
                        onMuscleChange={vi.fn()}
                        allMuscles={['All', 'Chest', 'Back', 'Legs']}
                        filteredExercises={[mockExercise]}
                        onAddExerciseToDraft={vi.fn()}
                        onOpenCustomCreator={vi.fn()}
                        onSaveDraft={vi.fn()}
                    />
                </MemoryRouter>
            );

            expect(screen.getByText('No routines yet. Create your first plan.')).toBeDefined();
            const createBtn = screen.getByText('New Routine');
            fireEvent.click(createBtn);
            expect(onOpenCreate).toHaveBeenCalledTimes(1);
        });

        it('renders template list and handles start workout trigger', () => {
            const onStartWorkout = vi.fn();
            render(
                <MemoryRouter>
                    <RoutineList
                        templates={[mockTemplate]}
                        editingId={null}
                        isCreating={false}
                        draft={null}
                        activeWorkout={null}
                        onOpenCreate={vi.fn()}
                        onStartWorkout={onStartWorkout}
                        onOpenEditor={vi.fn()}
                        onRequestCloseEditor={vi.fn()}
                        onUpdateDraft={vi.fn()}
                        getExerciseData={() => mockExercise}
                        getExerciseName={() => 'Barbell Bench Press'}
                        getExerciseMuscle={() => 'Chest'}
                        totalVolume={() => 12}
                        lastSession={() => '2026-08-05'}
                        expandedTempo={null}
                        onToggleExpandedTempo={vi.fn()}
                        formCueOpen={null}
                        onToggleFormCue={vi.fn()}
                        onMoveExercise={vi.fn()}
                        onRemoveExercise={vi.fn()}
                        onUpdateField={vi.fn()}
                        showPicker={false}
                        onTogglePicker={vi.fn()}
                        pickerSearch=""
                        onSearchChange={vi.fn()}
                        pickerMuscle="All"
                        onMuscleChange={vi.fn()}
                        allMuscles={['All', 'Chest', 'Back', 'Legs']}
                        filteredExercises={[mockExercise]}
                        onAddExerciseToDraft={vi.fn()}
                        onOpenCustomCreator={vi.fn()}
                        onSaveDraft={vi.fn()}
                    />
                </MemoryRouter>
            );

            expect(screen.getByText('Upper Body Hypertrophy')).toBeDefined();
            const startBtn = screen.getByTitle('Start workout');
            fireEvent.click(startBtn);
            expect(onStartWorkout).toHaveBeenCalledWith('tmpl-1');
        });
    });

    describe('RoutineEditor', () => {
        it('renders coach strategy banner and save/discard buttons', () => {
            const onSaveDraft = vi.fn();
            const onRequestCloseEditor = vi.fn();

            render(
                <RoutineEditor
                    draft={mockTemplate}
                    originalTemplate={mockTemplate}
                    onUpdateDraft={vi.fn()}
                    getExerciseData={() => mockExercise}
                    getExerciseName={() => 'Barbell Bench Press'}
                    getExerciseMuscle={() => 'Chest'}
                    expandedTempo={null}
                    onToggleExpandedTempo={vi.fn()}
                    formCueOpen={null}
                    onToggleFormCue={vi.fn()}
                    onMoveExercise={vi.fn()}
                    onRemoveExercise={vi.fn()}
                    onUpdateField={vi.fn()}
                    showPicker={false}
                    onTogglePicker={vi.fn()}
                    pickerSearch=""
                    onSearchChange={vi.fn()}
                    pickerMuscle="All"
                    onMuscleChange={vi.fn()}
                    allMuscles={['All', 'Chest', 'Back', 'Legs']}
                    filteredExercises={[mockExercise]}
                    onAddExerciseToDraft={vi.fn()}
                    onOpenCustomCreator={vi.fn()}
                    onSaveDraft={onSaveDraft}
                    onRequestCloseEditor={onRequestCloseEditor}
                />
            );

            expect(screen.getAllByText('Keep rest intervals strict').length).toBeGreaterThan(0);

            const saveBtn = screen.getByText('Save Changes');
            fireEvent.click(saveBtn);
            expect(onSaveDraft).toHaveBeenCalledTimes(1);

            const discardBtn = screen.getByText('Discard');
            fireEvent.click(discardBtn);
            expect(onRequestCloseEditor).toHaveBeenCalledWith(mockTemplate);
        });
    });

    describe('ExerciseSelectorModal', () => {
        it('renders search input, muscle filters, and handles adding exercise', () => {
            const onSearchChange = vi.fn();
            const onMuscleChange = vi.fn();
            const onAddExercise = vi.fn();
            const onOpenCustomCreator = vi.fn();

            const availableExercise: Exercise = {
                id: 'ex-incline-db',
                name: 'Incline Dumbbell Press',
                target_muscle: 'Chest',
                instructions: 'Set bench to 30 degrees.',
            };

            render(
                <ExerciseSelectorModal
                    draft={mockTemplate}
                    pickerSearch=""
                    onSearchChange={onSearchChange}
                    pickerMuscle="All"
                    onMuscleChange={onMuscleChange}
                    allMuscles={['All', 'Chest', 'Back', 'Legs']}
                    filteredExercises={[availableExercise]}
                    onAddExercise={onAddExercise}
                    onOpenCustomCreator={onOpenCustomCreator}
                />
            );

            expect(screen.getByPlaceholderText('Search exercises...')).toBeDefined();

            const chestFilter = screen.getAllByText('Chest')[0];
            fireEvent.click(chestFilter);
            expect(onMuscleChange).toHaveBeenCalledWith('Chest');

            const addExerciseBtn = screen.getByText('Incline Dumbbell Press').closest('button')!;
            fireEvent.click(addExerciseBtn);
            expect(onAddExercise).toHaveBeenCalledWith('ex-incline-db');

            const createBtn = screen.getByText('Create');
            fireEvent.click(createBtn);
            expect(onOpenCustomCreator).toHaveBeenCalledTimes(1);
        });

        it('displays no exercises match message when list is empty', () => {
            render(
                <ExerciseSelectorModal
                    draft={mockTemplate}
                    pickerSearch="nonexistent"
                    onSearchChange={vi.fn()}
                    pickerMuscle="All"
                    onMuscleChange={vi.fn()}
                    allMuscles={['All', 'Chest']}
                    filteredExercises={[]}
                    onAddExercise={vi.fn()}
                    onOpenCustomCreator={vi.fn()}
                />
            );

            expect(screen.getByText('No exercises match.')).toBeDefined();
        });
    });
});
