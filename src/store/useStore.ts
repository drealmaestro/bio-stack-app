import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile, WorkoutTemplate, WorkoutLog, Exercise, ActiveWorkoutState, NutritionLog, NutritionEntry, DailyInsights } from '../types';
import { INITIAL_EXERCISES } from '../data/exercises';
import { INITIAL_TEMPLATES } from '../data/templates';
import { nanoid } from 'nanoid';

interface AppState {
    user: UserProfile | null;
    templates: WorkoutTemplate[];
    logs: WorkoutLog[];
    exercises: Exercise[];
    activeWorkout: ActiveWorkoutState | null;
    seeded: boolean;

    // Nutrition
    nutritionLogs: NutritionLog[];

    // Daily Insights
    dailyInsights: DailyInsights[];

    // Actions
    setUser: (user: UserProfile) => void;
    updateUserStats: (type: 'weight' | 'body_fat', entry: { date: string, value: number }) => void;

    addTemplate: (template: WorkoutTemplate) => void;
    updateTemplate: (template: WorkoutTemplate) => void;
    deleteTemplate: (id: string) => void;

    addLog: (log: WorkoutLog) => void;

    addExercise: (exercise: Exercise) => void;

    // Active Workout Actions
    startWorkout: (templateId: string) => void;
    cancelWorkout: () => void;
    toggleSetComplete: (exerciseIdx: number, setNum: number, restSeconds: number) => void;
    updateSetWeight: (exerciseIdx: number, setNum: number, weight: number) => void;
    updateSetReps: (exerciseIdx: number, setNum: number, reps: number) => void;

    // Rest Timer Actions
    addRestTime: (seconds: number) => void;
    skipRest: () => void;

    // Nutrition Actions
    addNutritionEntry: (date: string, entry: Omit<NutritionEntry, 'id' | 'logged_at'>) => void;
    deleteNutritionEntry: (date: string, entryId: string) => void;
    getNutritionLog: (date: string) => NutritionLog | undefined;

    // Daily Insights Actions
    updateDailyInsights: (insights: DailyInsights) => void;
    getDailyInsights: (date: string) => DailyInsights | undefined;

    seed: () => void;
    resetStore: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            user: null,
            templates: [],
            logs: [],
            exercises: [],
            activeWorkout: null,
            seeded: false,
            nutritionLogs: [],
            dailyInsights: [],

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

            updateTemplate: (template) => set((state) => ({
                templates: state.templates.map(t => t.id === template.id ? template : t)
            })),

            deleteTemplate: (id) => set((state) => ({
                templates: state.templates.filter(t => t.id !== id)
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
                    setReps: {},
                    restEndTime: null,
                    originalRestDuration: 0
                }
            }),

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
                const key = `${exerciseIdx}-${setNum}`;
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

            updateSetReps: (exerciseIdx, setNum, reps) => set((state) => {
                if (!state.activeWorkout) return state;
                const key = `${exerciseIdx}-${setNum}`;
                return {
                    activeWorkout: {
                        ...state.activeWorkout,
                        setReps: {
                            ...state.activeWorkout.setReps,
                            [key]: reps
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

            // --- Nutrition Actions ---

            addNutritionEntry: (date, entryData) => set((state) => {
                const newEntry: NutritionEntry = {
                    ...entryData,
                    id: nanoid(),
                    logged_at: new Date().toISOString(),
                };
                const existing = state.nutritionLogs.find(l => l.date === date);
                if (existing) {
                    return {
                        nutritionLogs: state.nutritionLogs.map(l =>
                            l.date === date ? { ...l, entries: [...l.entries, newEntry] } : l
                        )
                    };
                }
                return {
                    nutritionLogs: [...state.nutritionLogs, { date, entries: [newEntry] }]
                };
            }),

            deleteNutritionEntry: (date, entryId) => set((state) => ({
                nutritionLogs: state.nutritionLogs.map(l =>
                    l.date === date ? { ...l, entries: l.entries.filter(e => e.id !== entryId) } : l
                )
            })),

            getNutritionLog: (date) => {
                return get().nutritionLogs.find(l => l.date === date);
            },

            // --- Daily Insights Actions ---

            updateDailyInsights: (insights) => set((state) => {
                const existing = state.dailyInsights.find(d => d.date === insights.date);
                if (existing) {
                    return {
                        dailyInsights: state.dailyInsights.map(d =>
                            d.date === insights.date ? insights : d
                        )
                    };
                }
                return {
                    dailyInsights: [...state.dailyInsights, insights]
                };
            }),

            getDailyInsights: (date) => {
                return get().dailyInsights.find(d => d.date === date);
            },

            seed: () => set((state) => {
                if (!state.seeded) {
                    return {
                        exercises: INITIAL_EXERCISES,
                        templates: INITIAL_TEMPLATES,
                        seeded: true
                    };
                }
                // Add any initial templates that are missing (e.g. added in a new update)
                const existingIds = new Set(state.templates.map(t => t.id));
                const missingTemplates = INITIAL_TEMPLATES.filter(t => !existingIds.has(t.id));
                if (missingTemplates.length === 0) return state;
                return { templates: [...state.templates, ...missingTemplates] };
            }),

            resetStore: () => set({
                user: null,
                templates: [],
                logs: [],
                exercises: [],
                activeWorkout: null,
                seeded: false,
                nutritionLogs: [],
                dailyInsights: [],
            })
        }),
        {
            name: 'bio-stack-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
