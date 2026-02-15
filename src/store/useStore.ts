import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile, WorkoutTemplate, WorkoutLog, Exercise, ActiveWorkoutState } from '../types';
import { INITIAL_EXERCISES } from '../data/exercises';
import { INITIAL_TEMPLATES } from '../data/templates';

interface AppState {
    user: UserProfile | null;
    templates: WorkoutTemplate[];
    logs: WorkoutLog[];
    exercises: Exercise[];
    activeWorkout: ActiveWorkoutState | null;

    // Actions
    setUser: (user: UserProfile) => void;
    updateUserStats: (type: 'weight' | 'body_fat', entry: { date: string, value: number }) => void;

    addTemplate: (template: WorkoutTemplate) => void;
    deleteTemplate: (id: string) => void;

    logWorkout: (log: WorkoutLog) => void;
    addLog: (log: WorkoutLog) => void; // Alias for logWorkout for consistency

    addExercise: (exercise: Exercise) => void;

    // Active Workout Actions
    startWorkout: (templateId: string) => void;
    cancelWorkout: () => void;
    toggleSetComplete: (exerciseIdx: number, setNum: number, restSeconds: number) => void;
    updateSetWeight: (exerciseIdx: number, setNum: number, weight: number) => void;

    // Rest Timer Actions
    addRestTime: (seconds: number) => void;
    skipRest: () => void;

    seed: () => void;
    resetStore: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            user: null,
            templates: [],
            logs: [],
            exercises: [],
            activeWorkout: null,

            setUser: (user) => set({ user }),

            updateUserStats: (type, entry) => set((state) => {
                if (!state.user) return state;
                return {
                    user: {
                        ...state.user,
                        stats: {
                            ...state.user.stats,
                            [type]: [...state.user.stats[type], entry]
                        }
                    }
                };
            }),

            addTemplate: (template) => set((state) => ({
                templates: [...state.templates, template]
            })),

            deleteTemplate: (id) => set((state) => ({
                templates: state.templates.filter(t => t.id !== id)
            })),

            logWorkout: (log) => set((state) => ({
                logs: [...state.logs, log]
            })),

            addLog: (log) => set((state) => ({
                logs: [...state.logs, log]
            })),

            addExercise: (exercise) => set((state) => ({
                exercises: [...state.exercises, exercise]
            })),

            // --- Active Workout Actions ---

            startWorkout: (templateId) => set({
                activeWorkout: {
                    templateId,
                    startTime: Date.now(),
                    completedSets: [],
                    setWeights: {},
                    restEndTime: null,
                    originalRestDuration: 0
                }
            }),

            cancelWorkout: () => set({ activeWorkout: null }),

            toggleSetComplete: (exerciseIdx, setNum, restSeconds) => set((state) => {
                if (!state.activeWorkout) return state;
                const key = `${exerciseIdx}-${setNum}`; // Standardized key format (no spaces)
                const { completedSets } = state.activeWorkout;
                const exists = completedSets.includes(key);

                let newCompletedSets;
                let newRestEndTime = state.activeWorkout.restEndTime;
                let newOriginalRestDuration = state.activeWorkout.originalRestDuration;

                if (exists) {
                    newCompletedSets = completedSets.filter(k => k !== key);
                } else {
                    newCompletedSets = [...completedSets, key];
                    // Trigger Rest Timer if completing a new set and rest > 0
                    if (restSeconds > 0) {
                        newRestEndTime = Date.now() + (restSeconds * 1000);
                        newOriginalRestDuration = restSeconds;
                    }
                }

                return {
                    activeWorkout: {
                        ...state.activeWorkout,
                        completedSets: newCompletedSets,
                        restEndTime: newRestEndTime,
                        originalRestDuration: newOriginalRestDuration
                    }
                };
            }),

            updateSetWeight: (exerciseIdx, setNum, weight) => set((state) => {
                if (!state.activeWorkout) return state;
                const key = `${exerciseIdx}-${setNum}`; // Standardized key format
                return {
                    activeWorkout: {
                        ...state.activeWorkout,
                        setWeights: {
                            ...state.activeWorkout.setWeights,
                            [key]: weight
                        }
                    }
                };
            }),

            addRestTime: (seconds) => set((state) => {
                if (!state.activeWorkout) return state;
                const currentRestEnd = state.activeWorkout.restEndTime || Date.now();
                return {
                    activeWorkout: {
                        ...state.activeWorkout,
                        restEndTime: currentRestEnd + (seconds * 1000),
                        originalRestDuration: state.activeWorkout.originalRestDuration + seconds
                    }
                };
            }),

            skipRest: () => set((state) => {
                if (!state.activeWorkout) return state;
                return {
                    activeWorkout: {
                        ...state.activeWorkout,
                        restEndTime: null,
                        originalRestDuration: 0
                    }
                };
            }),

            seed: () => {
                // For development/iteration, always sync to latest code constants
                // This ensures protocol updates (rest times, exercises) are reflected immediately
                set({
                    exercises: INITIAL_EXERCISES,
                    templates: INITIAL_TEMPLATES
                });
            },

            resetStore: () => set({
                user: null,
                templates: [],
                logs: [],
                activeWorkout: null
            })
        }),
        {
            name: 'bio-stack-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
