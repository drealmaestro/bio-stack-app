import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { INITIAL_EXERCISES } from '../data/exercises';
import { INITIAL_TEMPLATES } from '../data/templates';
import { createUserSlice, type UserSlice } from './slices/userSlice';
import { createRoutineSlice, type RoutineSlice } from './slices/routineSlice';
import { createExerciseSlice, type ExerciseSlice } from './slices/exerciseSlice';
import { createActiveWorkoutSlice, type ActiveWorkoutSlice } from './slices/activeWorkoutSlice';
import { createNutritionSlice, type NutritionSlice } from './slices/nutritionSlice';

export interface AppState extends UserSlice, RoutineSlice, ExerciseSlice, ActiveWorkoutSlice, NutritionSlice {
    seeded: boolean;
    seed: () => void;
    resetStore: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get, api) => ({
            ...createUserSlice(set, get, api),
            ...createRoutineSlice(set, get, api),
            ...createExerciseSlice(set, get, api),
            ...createActiveWorkoutSlice(set, get, api),
            ...createNutritionSlice(set, get, api),

            seeded: false,

            seed: () => set((state) => {
                let updates: Partial<AppState> = {};

                if (!state.seeded) {
                    updates.exercises = INITIAL_EXERCISES;
                    updates.templates = INITIAL_TEMPLATES;
                    updates.seeded = true;
                } else {
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

                    const updatedTemplates = state.templates.map(t => {
                        const initial = INITIAL_TEMPLATES.find(it => it.id === t.id);
                        return initial ? {
                            ...t,
                            description: t.description || initial.description,
                            coach_notes: t.coach_notes || initial.coach_notes,
                            difficulty: t.difficulty || initial.difficulty,
                            target_duration: t.target_duration || initial.target_duration,
                            focus_goal: t.focus_goal || initial.focus_goal,
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
                foodLogs: [],
                dailyInsights: [],
                waterIntake: {},
                sleepDuration: {},
            })
        }),
        {
            name: 'bio-stack-storage',
            storage: createJSONStorage(() => localStorage),
            version: 2,
            migrate: (persisted, version) => {
                if (version >= 2 || !persisted || typeof persisted !== 'object') return persisted;
                const state = persisted as Record<string, unknown>;
                delete state.sleepScore;
                delete state.sleepStages;
                delete state.stressScore;
                delete state.vitals;
                state.dailyInsights = [];
                return state;
            },
        }
    )
);
