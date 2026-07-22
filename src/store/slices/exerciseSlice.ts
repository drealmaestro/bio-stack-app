import type { StateCreator } from 'zustand';
import type { Exercise } from '../../types';

export interface ExerciseSlice {
    exercises: Exercise[];
    addExercise: (exercise: Exercise) => void;
}

export const createExerciseSlice: StateCreator<ExerciseSlice, [], [], ExerciseSlice> = (set) => ({
    exercises: [],

    addExercise: (exercise) => set((state) => ({
        exercises: [...state.exercises, exercise]
    }))
});
