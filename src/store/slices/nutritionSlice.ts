import type { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import type { NutritionLog, NutritionEntry, DailyInsights } from '../../types';
import { MEAL_PRESETS, type MealPreset } from '../../data/nutrition';
import { saveOfflineNutrition } from '../../utils/indexedDB';

export interface NutritionSlice {
    nutritionLogs: NutritionLog[];
    foodLogs: NutritionEntry[];
    dailyInsights: DailyInsights[];
    mealPresets: MealPreset[];
    addNutritionEntry: (date: string, entry: Omit<NutritionEntry, 'id' | 'logged_at'>) => void;
    logFood: (entry: Omit<NutritionEntry, 'id' | 'logged_at'> & { date?: string }) => void;
    addMealPreset: (date: string, preset: MealPreset) => void;
    deleteNutritionEntry: (date: string, entryId: string) => void;
    getNutritionLog: (date: string) => NutritionLog | undefined;
}

export const createNutritionSlice: StateCreator<NutritionSlice, [], [], NutritionSlice> = (set, get) => ({
    nutritionLogs: [],
    foodLogs: [],
    dailyInsights: [],
    mealPresets: MEAL_PRESETS,

    addNutritionEntry: (date, entryData) => {
        const newEntry: NutritionEntry = {
            ...entryData,
            id: nanoid(),
            logged_at: new Date().toISOString(),
        };

        // Async background sync for offline fallback (optimistic UI update)
        saveOfflineNutrition({ date, entry: newEntry }).catch(() => {});

        set((state) => {
            const existing = state.nutritionLogs.find(l => l.date === date);
            const nextNutritionLogs = existing
                ? state.nutritionLogs.map(l => l.date === date ? { ...l, entries: [...l.entries, newEntry] } : l)
                : [...state.nutritionLogs, { date, entries: [newEntry] }];

            return {
                nutritionLogs: nextNutritionLogs,
                foodLogs: nextNutritionLogs.flatMap(l => l.entries),
            };
        });
    },

    logFood: (entry) => {
        const date = entry.date || new Date().toISOString().split('T')[0];
        const { date: _d, ...entryData } = entry;
        get().addNutritionEntry(date, entryData);
    },

    addMealPreset: (date, preset) => {
        get().addNutritionEntry(date, {
            food_item_id: preset.id,
            food_name: preset.name,
            servings: 1,
            calories: preset.calories,
            protein_g: preset.protein_g,
            carbs_g: preset.carbs_g,
            fat_g: preset.fat_g,
        });
    },

    deleteNutritionEntry: (date, entryId) => set((state) => {
        const nextNutritionLogs = state.nutritionLogs.map(l =>
            l.date === date ? { ...l, entries: l.entries.filter(e => e.id !== entryId) } : l
        );
        return {
            nutritionLogs: nextNutritionLogs,
            foodLogs: nextNutritionLogs.flatMap(l => l.entries),
        };
    }),

    getNutritionLog: (date) => {
        return get().nutritionLogs.find(l => l.date === date);
    },
});
