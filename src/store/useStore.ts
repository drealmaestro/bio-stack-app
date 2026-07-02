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

    // Daily Insights — legacy synced field, kept for Firestore compat (no UI usage)
    dailyInsights: DailyInsights[];

    // Manual recovery tracking (no wearable data — user-entered only)
    waterIntake: Record<string, number>; // date -> ml
    sleepDuration: Record<string, number>; // date -> mins

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
    updateSetRpe: (exerciseIdx: number, setNum: number, rpe: number) => void;

    // Rest Timer Actions
    addRestTime: (seconds: number) => void;
    skipRest: () => void;

    // Nutrition Actions
    addNutritionEntry: (date: string, entry: Omit<NutritionEntry, 'id' | 'logged_at'>) => void;
    deleteNutritionEntry: (date: string, entryId: string) => void;
    getNutritionLog: (date: string) => NutritionLog | undefined;

    // Recovery Actions (manual entry only)
    logWaterIntake: (date: string, deltaMl: number) => void;
    resetWater: (date: string) => void;
    logSleep: (date: string, minutes: number) => void;

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
            waterIntake: {},
            sleepDuration: {},

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
                    setRpes: {},
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

            updateSetRpe: (exerciseIdx, setNum, rpe) => set((state) => {
                if (!state.activeWorkout) return state;
                const key = `${exerciseIdx}-${setNum}`;
                return {
                    activeWorkout: {
                        ...state.activeWorkout,
                        setRpes: {
                            ...(state.activeWorkout.setRpes || {}),
                            [key]: rpe
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

            // --- Recovery Actions (manual entry only) ---

            logWaterIntake: (date, deltaMl) => set((state) => ({
                waterIntake: {
                    ...state.waterIntake,
                    [date]: Math.max((state.waterIntake[date] || 0) + deltaMl, 0)
                }
            })),

            resetWater: (date) => set((state) => ({
                waterIntake: {
                    ...state.waterIntake,
                    [date]: 0
                }
            })),

            logSleep: (date, minutes) => set((state) => ({
                sleepDuration: {
                    ...state.sleepDuration,
                    [date]: minutes
                }
            })),

            seed: () => set((state) => {
                let updates: Partial<AppState> = {};

                if (!state.seeded) {
                    updates.exercises = INITIAL_EXERCISES;
                    updates.templates = INITIAL_TEMPLATES;
                    updates.seeded = true;
                } else {
                    // Update existing exercises with new coaching attributes if they are defaults
                    const updatedExercises = state.exercises.map(ex => {
                        const initial = INITIAL_EXERCISES.find(ie => ie.id === ex.id);
                        return initial ? { 
                            ...ex, 
                            intensity_level: ex.intensity_level || initial.intensity_level, 
                            tempo: ex.tempo || initial.tempo, 
                            coach_tips: ex.coach_tips || initial.coach_tips 
                        } : ex;
                    });
                    
                    const existingExIds = new Set(state.exercises.map(e => e.id));
                    const missingExercises = INITIAL_EXERCISES.filter(e => !existingExIds.has(e.id));
                    updates.exercises = missingExercises.length > 0 ? [...updatedExercises, ...missingExercises] : updatedExercises;

                    // Update existing templates with new coaching attributes if they are defaults
                    const updatedTemplates = state.templates.map(t => {
                        const initial = INITIAL_TEMPLATES.find(it => it.id === t.id);
                        return initial ? {
                            ...t,
                            description: t.description || initial.description,
                            coach_notes: t.coach_notes || initial.coach_notes,
                            difficulty: t.difficulty || initial.difficulty,
                            target_duration: t.target_duration || initial.target_duration,
                            focus_goal: t.focus_goal || initial.focus_goal,
                            // Templates stored before scheduling existed never got their day —
                            // without it the home screen shows a rest day instead of the workout
                            scheduled_days: t.scheduled_days?.length ? t.scheduled_days : initial.scheduled_days
                        } : t;
                    });

                    const existingTmplIds = new Set(state.templates.map(t => t.id));
                    const missingTemplates = INITIAL_TEMPLATES.filter(t => !existingTmplIds.has(t.id));
                    updates.templates = missingTemplates.length > 0 ? [...updatedTemplates, ...missingTemplates] : updatedTemplates;
                }

                if (Object.keys(updates).length === 0) return state;
                return updates;
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
                waterIntake: {},
                sleepDuration: {},
            })
        }),
        {
            name: 'bio-stack-storage',
            storage: createJSONStorage(() => localStorage),
            version: 2,
            // v2: wearable-style metrics removed (sleep stages/score, stress, vitals,
            // fake dailyInsights seeds). Only strips dead keys — never touches
            // logs, templates, nutritionLogs, or user profile.
            migrate: (persisted, version) => {
                if (version >= 2 || !persisted || typeof persisted !== 'object') return persisted;
                const state = persisted as Record<string, unknown>;
                delete state.sleepScore;
                delete state.sleepStages;
                delete state.stressScore;
                delete state.vitals;
                // dailyInsights was only ever seeded with demo values — clear it
                state.dailyInsights = [];
                return state;
            },
        }
    )
);
