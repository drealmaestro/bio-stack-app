import type { StateCreator } from 'zustand';
import type { ActiveWorkoutState } from '../../types';
import { saveOfflineWorkout } from '../../utils/indexedDB';

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

export const createActiveWorkoutSlice: StateCreator<ActiveWorkoutSlice, [], [], ActiveWorkoutSlice> = (set) => ({
    activeWorkout: null,

    startWorkout: (templateId) => {
        const workout: ActiveWorkoutState = {
            templateId,
            startTime: Date.now(),
            completedSets: [],
            setWeights: {},
            setReps: {},
            setRpes: {},
            restEndTime: null,
            originalRestDuration: 0,
        };
        // Optimistic UI update
        set({ activeWorkout: workout });
        // Background offline storage sync
        saveOfflineWorkout(workout).catch(() => {});
    },

    cancelWorkout: () => set({ activeWorkout: null }),

    toggleSetComplete: (exerciseIdx, setNum, restSeconds) => set((state) => {
        if (!state.activeWorkout) return state;
        const key = `${exerciseIdx}-${setNum}`;
        const { completedSets } = state.activeWorkout;
        const exists = completedSets.includes(key);

        let newCompletedSets;
        let newRestEndTime = state.activeWorkout.restEndTime;
        let newOriginalRestDuration = state.activeWorkout.originalRestDuration;

        if (exists) {
            newCompletedSets = completedSets.filter(k => k !== key);
        } else {
            newCompletedSets = [...completedSets, key];
            if (restSeconds > 0) {
                newRestEndTime = Date.now() + (restSeconds * 1000);
                newOriginalRestDuration = restSeconds;
            }
        }

        const updatedWorkout = {
            ...state.activeWorkout,
            completedSets: newCompletedSets,
            restEndTime: newRestEndTime,
            originalRestDuration: newOriginalRestDuration,
        };

        // Asynchronous background persistence (optimistic UI response)
        saveOfflineWorkout(updatedWorkout).catch(() => {});

        return {
            activeWorkout: updatedWorkout,
        };
    }),

    updateSetWeight: (exerciseIdx, setNum, weight) => set((state) => {
        if (!state.activeWorkout) return state;
        const key = `${exerciseIdx}-${setNum}`;
        const updatedWorkout = {
            ...state.activeWorkout,
            setWeights: {
                ...state.activeWorkout.setWeights,
                [key]: weight,
            },
        };

        saveOfflineWorkout(updatedWorkout).catch(() => {});

        return {
            activeWorkout: updatedWorkout,
        };
    }),

    updateSetReps: (exerciseIdx, setNum, reps) => set((state) => {
        if (!state.activeWorkout) return state;
        const key = `${exerciseIdx}-${setNum}`;
        const updatedWorkout = {
            ...state.activeWorkout,
            setReps: {
                ...state.activeWorkout.setReps,
                [key]: reps,
            },
        };

        saveOfflineWorkout(updatedWorkout).catch(() => {});

        return {
            activeWorkout: updatedWorkout,
        };
    }),

    updateSetRpe: (exerciseIdx, setNum, rpe) => set((state) => {
        if (!state.activeWorkout) return state;
        const key = `${exerciseIdx}-${setNum}`;
        const updatedWorkout = {
            ...state.activeWorkout,
            setRpes: {
                ...(state.activeWorkout.setRpes || {}),
                [key]: rpe,
            },
        };

        saveOfflineWorkout(updatedWorkout).catch(() => {});

        return {
            activeWorkout: updatedWorkout,
        };
    }),

    addRestTime: (seconds) => set((state) => {
        if (!state.activeWorkout) return state;
        const currentRestEnd = state.activeWorkout.restEndTime || Date.now();
        return {
            activeWorkout: {
                ...state.activeWorkout,
                restEndTime: currentRestEnd + (seconds * 1000),
                originalRestDuration: state.activeWorkout.originalRestDuration + seconds,
            },
        };
    }),

    skipRest: () => set((state) => {
        if (!state.activeWorkout) return state;
        return {
            activeWorkout: {
                ...state.activeWorkout,
                restEndTime: null,
                originalRestDuration: 0,
            },
        };
    }),
});
