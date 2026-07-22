import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRoutineEditor } from './useRoutineEditor';
import { useStore } from '../store/useStore';

describe('useRoutineEditor Hook', () => {
    beforeEach(() => {
        useStore.getState().resetStore();
        useStore.getState().seed();
    });

    it('should create a new routine template and set up draft state', () => {
        const { result } = renderHook(() => useRoutineEditor());

        act(() => {
            result.current.setNewTemplateName('Chest & Triceps');
        });

        act(() => {
            result.current.handleCreate();
        });

        expect(result.current.isCreating).toBe(false);
        expect(result.current.draft).not.toBeNull();
        expect(result.current.draft?.name).toBe('Chest & Triceps');
        expect(result.current.draft?.exercises).toEqual([]);

        // Template added to store
        const templateInStore = useStore.getState().templates.find(t => t.name === 'Chest & Triceps');
        expect(templateInStore).toBeDefined();
    });

    it('should open editor and update draft exercises across re-renders', () => {
        const { result } = renderHook(() => useRoutineEditor());
        const template = result.current.templates[0];
        const initialExerciseId = template.exercises[0]?.exercise_id || 'ex-1';
        const secondExerciseId = result.current.exercises.find(e => e.id !== initialExerciseId)?.id || 'ex-2';

        act(() => {
            result.current.openEditor(template);
        });

        expect(result.current.editingId).toBe(template.id);
        expect(result.current.draft?.id).toBe(template.id);

        // Add exercise to draft
        act(() => {
            result.current.addExerciseToDraft(secondExerciseId);
        });

        expect(result.current.draft?.exercises).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ exercise_id: secondExerciseId, target_sets: 3, target_reps: 10, rest_seconds: 90 })
            ])
        );

        // Update set fields across distinct renders
        act(() => {
            result.current.updateExerciseField(secondExerciseId, 'target_sets', 4);
        });
        act(() => {
            result.current.updateExerciseField(secondExerciseId, 'target_reps', 12);
        });

        const updatedSet = result.current.draft?.exercises.find(e => e.exercise_id === secondExerciseId);
        expect(updatedSet?.target_sets).toBe(4);
        expect(updatedSet?.target_reps).toBe(12);

        // Remove exercise
        act(() => {
            result.current.removeExerciseFromDraft(secondExerciseId);
        });

        expect(result.current.draft?.exercises.find(e => e.exercise_id === secondExerciseId)).toBeUndefined();
    });

    it('should move exercise order in draft without out of bounds errors', () => {
        const { result } = renderHook(() => useRoutineEditor());
        const template = result.current.templates[0];
        const ex1 = result.current.exercises[0].id;
        const ex2 = result.current.exercises[1].id;

        act(() => {
            result.current.openEditor({ ...template, exercises: [] });
        });
        act(() => {
            result.current.addExerciseToDraft(ex1);
        });
        act(() => {
            result.current.addExerciseToDraft(ex2);
        });

        expect(result.current.draft?.exercises[0].exercise_id).toBe(ex1);
        expect(result.current.draft?.exercises[1].exercise_id).toBe(ex2);

        // Move item 0 up (out of bounds) -> no change
        act(() => {
            result.current.moveExercise(0, 'up');
        });
        expect(result.current.draft?.exercises[0].exercise_id).toBe(ex1);

        // Move item 0 down -> swap positions
        act(() => {
            result.current.moveExercise(0, 'down');
        });
        expect(result.current.draft?.exercises[0].exercise_id).toBe(ex2);
        expect(result.current.draft?.exercises[1].exercise_id).toBe(ex1);
    });

    it('should discard changes or prompt confirmation on closeEditor', () => {
        const { result } = renderHook(() => useRoutineEditor());
        const template = result.current.templates[0];

        act(() => {
            result.current.openEditor(template);
        });

        // Closing without changes should close immediately without prompt
        act(() => {
            result.current.requestCloseEditor(template);
        });

        expect(result.current.editingId).toBeNull();
        expect(result.current.showDiscardConfirm).toBe(false);

        // Modify draft and check prompt
        act(() => {
            result.current.openEditor(template);
        });
        act(() => {
            result.current.addExerciseToDraft(result.current.exercises[result.current.exercises.length - 1].id);
        });

        act(() => {
            result.current.requestCloseEditor(template);
        });

        expect(result.current.showDiscardConfirm).toBe(true);

        // Close editor manually clears state
        act(() => {
            result.current.closeEditor();
        });

        expect(result.current.editingId).toBeNull();
        expect(result.current.draft).toBeNull();
    });

    it('should save draft changes to store', () => {
        const { result } = renderHook(() => useRoutineEditor());
        const template = result.current.templates[0];

        act(() => {
            result.current.openEditor(template);
        });

        act(() => {
            if (result.current.draft) {
                result.current.setDraft({
                    ...result.current.draft,
                    name: 'Renamed Routine'
                });
            }
        });

        act(() => {
            result.current.saveDraft();
        });

        expect(result.current.editingId).toBeNull();
        const savedInStore = useStore.getState().templates.find(t => t.id === template.id);
        expect(savedInStore?.name).toBe('Renamed Routine');
    });
});
