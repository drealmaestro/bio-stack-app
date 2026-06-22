import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile, WorkoutTemplate, WorkoutLog, Exercise, ActiveWorkoutState, NutritionLog, NutritionEntry, DailyInsights, SleepStageData, VitalsData } from '../types';
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

    // Samsung Health v7 Redesign fields
    waterIntake: Record<string, number>; // date -> ml
    sleepDuration: Record<string, number>; // date -> mins
    sleepScore: Record<string, number>; // date -> score
    stressScore: Record<string, number>; // date -> score
    sleepStages: Record<string, SleepStageData>; // date -> stages
    vitals: Record<string, VitalsData>; // date -> vitals

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

    // Samsung Health Actions
    logWaterIntake: (date: string, ml: number) => void;
    logSleep: (date: string, minutes: number, score: number, stages: SleepStageData) => void;
    updateStressScore: (date: string, score: number) => void;
    updateVitals: (date: string, vitals: Partial<VitalsData>) => void;

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
            sleepScore: {},
            stressScore: {},
            sleepStages: {},
            vitals: {},

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

            // --- Samsung Health Actions ---

            logWaterIntake: (date, ml) => set((state) => ({
                waterIntake: {
                    ...state.waterIntake,
                    [date]: Math.max((state.waterIntake[date] || 0) + ml, 0)
                }
            })),

            logSleep: (date, minutes, score, stages) => set((state) => ({
                sleepDuration: {
                    ...state.sleepDuration,
                    [date]: minutes
                },
                sleepScore: {
                    ...state.sleepScore,
                    [date]: score
                },
                sleepStages: {
                    ...state.sleepStages,
                    [date]: stages
                }
            })),

            updateStressScore: (date, score) => set((state) => ({
                stressScore: {
                    ...state.stressScore,
                    [date]: score
                }
            })),

            updateVitals: (date, newVitals) => set((state) => {
                const current = state.vitals[date] || {
                    resting_hr: 62,
                    hrv: 58,
                    spo2: 97,
                    skin_temp: 36.4,
                    resp_rate: 14.5
                };
                return {
                    vitals: {
                        ...state.vitals,
                        [date]: {
                            ...current,
                            ...newVitals
                        }
                    }
                };
            }),

            seed: () => set((state) => {
                const todayStr = new Date().toISOString().slice(0, 10);
                const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
                const twoDaysAgoStr = new Date(Date.now() - 172800000).toISOString().slice(0, 10);

                let updates: Partial<AppState> = {};

                if (!state.seeded) {
                    updates.exercises = INITIAL_EXERCISES;
                    updates.templates = INITIAL_TEMPLATES;
                    updates.seeded = true;
                } else {
                    const existingIds = new Set(state.templates.map(t => t.id));
                    const missingTemplates = INITIAL_TEMPLATES.filter(t => !existingIds.has(t.id));
                    if (missingTemplates.length > 0) {
                        updates.templates = [...state.templates, ...missingTemplates];
                    }
                }

                // Seed daily insights if empty
                if (!state.dailyInsights || state.dailyInsights.length === 0) {
                    updates.dailyInsights = [
                        { date: twoDaysAgoStr, steps: 6120, calories_burned: 280, heart_rate_avg: 74, distance_km: 4.1 },
                        { date: yesterdayStr, steps: 9850, calories_burned: 420, heart_rate_avg: 70, distance_km: 6.8 },
                        { date: todayStr, steps: 7420, calories_burned: 330, heart_rate_avg: 72, distance_km: 5.2 },
                    ];
                }

                // Seed Samsung Health v7 Redesign metrics if empty
                if (!state.waterIntake || Object.keys(state.waterIntake).length === 0) {
                    updates.waterIntake = {
                        [twoDaysAgoStr]: 1750,
                        [yesterdayStr]: 2000,
                        [todayStr]: 1250,
                    };
                    updates.sleepDuration = {
                        [twoDaysAgoStr]: 380,
                        [yesterdayStr]: 480,
                        [todayStr]: 430,
                    };
                    updates.sleepScore = {
                        [twoDaysAgoStr]: 65,
                        [yesterdayStr]: 86,
                        [todayStr]: 78,
                    };
                    updates.sleepStages = {
                        [twoDaysAgoStr]: { deep: 60, rem: 80, light: 200, awake: 40 },
                        [yesterdayStr]: { deep: 95, rem: 110, light: 250, awake: 25 },
                        [todayStr]: { deep: 80, rem: 95, light: 225, awake: 30 },
                    };
                    updates.stressScore = {
                        [twoDaysAgoStr]: 60,
                        [yesterdayStr]: 32,
                        [todayStr]: 45,
                    };
                    updates.vitals = {
                        [twoDaysAgoStr]: { resting_hr: 65, hrv: 50, spo2: 96, skin_temp: 36.6, resp_rate: 15.0 },
                        [yesterdayStr]: { resting_hr: 60, hrv: 64, spo2: 98, skin_temp: 36.2, resp_rate: 14.0 },
                        [todayStr]: { resting_hr: 62, hrv: 58, spo2: 97, skin_temp: 36.4, resp_rate: 14.5 },
                    };
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
                sleepScore: {},
                stressScore: {},
                sleepStages: {},
                vitals: {},
            })
        }),
        {
            name: 'bio-stack-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
