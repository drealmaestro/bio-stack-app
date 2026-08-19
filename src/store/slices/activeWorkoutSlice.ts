import type { StateCreator } from 'zustand';
import type { ActiveWorkoutState } from '../../types';
import { useActiveWorkoutStore } from '../useActiveWorkoutStore';

export interface ActiveWorkoutSlice {
    activeWorkout: ActiveWorkoutState | null;
    startWorkout: (templateId: string) => void;
    cancelWorkout: () => void;
    toggleSetComplete: (exerciseIdx: number, setNum: number, restSeconds: number) => void;
    updateSetWeight: (exerciseIdx: number, setNum: number, weight: number) => void;
    updateSetReps: (exerciseIdx: number, setNum: number, reps: number) => void;
    updateSetRpe: (exerciseIdx: number, setNum: number, rpe: number) => void;
    addRestTime: (seconds: number) => void;
    skipRest: () => void;
}

let subscribed = false;

function ensureSubscribed(set: (partial: Partial<ActiveWorkoutSlice>) => void) {
    if (!subscribed && typeof useActiveWorkoutStore !== 'undefined' && useActiveWorkoutStore?.subscribe) {
        subscribed = true;
        useActiveWorkoutStore.subscribe((state) => {
            set({ activeWorkout: state.activeWorkout });
        });
    }
}

export const createActiveWorkoutSlice: StateCreator<ActiveWorkoutSlice, [], [], ActiveWorkoutSlice> = (set) => {
    return {
        activeWorkout: typeof useActiveWorkoutStore !== 'undefined' ? useActiveWorkoutStore.getState()?.activeWorkout ?? null : null,

        startWorkout: (templateId) => {
            ensureSubscribed(set);
            useActiveWorkoutStore.getState().startWorkout(templateId);
            set({ activeWorkout: useActiveWorkoutStore.getState().activeWorkout });
        },

        cancelWorkout: () => {
            ensureSubscribed(set);
            useActiveWorkoutStore.getState().cancelWorkout();
            set({ activeWorkout: null });
        },

        toggleSetComplete: (exerciseIdx, setNum, restSeconds) => {
            ensureSubscribed(set);
            useActiveWorkoutStore.getState().toggleSetComplete(exerciseIdx, setNum, restSeconds);
            set({ activeWorkout: useActiveWorkoutStore.getState().activeWorkout });
        },

        updateSetWeight: (exerciseIdx, setNum, weight) => {
            ensureSubscribed(set);
            useActiveWorkoutStore.getState().updateSetWeight(exerciseIdx, setNum, weight);
            set({ activeWorkout: useActiveWorkoutStore.getState().activeWorkout });
        },

        updateSetReps: (exerciseIdx, setNum, reps) => {
            ensureSubscribed(set);
            useActiveWorkoutStore.getState().updateSetReps(exerciseIdx, setNum, reps);
            set({ activeWorkout: useActiveWorkoutStore.getState().activeWorkout });
        },

        updateSetRpe: (exerciseIdx, setNum, rpe) => {
            ensureSubscribed(set);
            useActiveWorkoutStore.getState().updateSetRpe(exerciseIdx, setNum, rpe);
            set({ activeWorkout: useActiveWorkoutStore.getState().activeWorkout });
        },

        addRestTime: (seconds) => {
            ensureSubscribed(set);
            useActiveWorkoutStore.getState().addRestTime(seconds);
            set({ activeWorkout: useActiveWorkoutStore.getState().activeWorkout });
        },

        skipRest: () => {
            ensureSubscribed(set);
            useActiveWorkoutStore.getState().skipRest();
            set({ activeWorkout: useActiveWorkoutStore.getState().activeWorkout });
        },
    };
};
