import { describe, expect, it } from 'vitest';
import { mergePersistedData, reconcileLegacyAndSubcollections, type PersistedDataSlice } from './dataMerge';

const emptySlice: PersistedDataSlice = {
    user: null,
    templates: [],
    logs: [],
    exercises: [],
    nutritionLogs: [],
    dailyInsights: [],
    seeded: false,
};

describe('mergePersistedData', () => {
    it('keeps existing account profile while importing anonymous records', () => {
        const merged = mergePersistedData(
            {
                ...emptySlice,
                user: {
                    name: 'Google User',
                    age: 40,
                    goals: ['Strength'],
                    experience_level: 'Advanced',
                    stats: { weight: [], body_fat: [] },
                },
            },
            {
                ...emptySlice,
                user: {
                    name: 'Anon User',
                    age: 35,
                    goals: ['Hypertrophy'],
                    experience_level: 'Intermediate',
                    stats: { weight: [], body_fat: [] },
                },
            }
        );

        expect(merged.user?.name).toBe('Google User');
    });

    it('merges records by stable IDs and imports new nutrition entries for the same date', () => {
        const merged = mergePersistedData(
            {
                ...emptySlice,
                templates: [{ id: 'template-1', name: 'Push', exercises: [] }],
                logs: [{
                    id: 'log-1',
                    template_id: 'template-1',
                    timestamp: '2026-05-20T10:00:00.000Z',
                    duration_seconds: 1200,
                    completed_exercises: [],
                }],
                nutritionLogs: [{
                    date: '2026-05-24',
                    entries: [{
                        id: 'food-1',
                        food_item_id: 'rice',
                        food_name: 'Rice',
                        servings: 1,
                        calories: 200,
                        protein_g: 4,
                        carbs_g: 44,
                        fat_g: 0,
                        logged_at: '2026-05-24T08:00:00.000Z',
                    }],
                }],
            },
            {
                ...emptySlice,
                templates: [{ id: 'template-2', name: 'Pull', exercises: [] }],
                logs: [{
                    id: 'log-2',
                    template_id: 'template-2',
                    timestamp: '2026-05-21T10:00:00.000Z',
                    duration_seconds: 1300,
                    completed_exercises: [],
                }],
                nutritionLogs: [{
                    date: '2026-05-24',
                    entries: [{
                        id: 'food-2',
                        food_item_id: 'chicken',
                        food_name: 'Chicken',
                        servings: 1,
                        calories: 250,
                        protein_g: 40,
                        carbs_g: 0,
                        fat_g: 6,
                        logged_at: '2026-05-24T12:00:00.000Z',
                    }],
                }],
            }
        );

        expect(merged.templates.map((t) => t.id)).toEqual(['template-1', 'template-2']);
        expect(merged.logs.map((l) => l.id)).toEqual(['log-1', 'log-2']);
        expect(merged.nutritionLogs[0]?.entries.map((entry) => entry.id)).toEqual(['food-1', 'food-2']);
    });
});

describe('reconcileLegacyAndSubcollections', () => {
    it('returns null when both legacy and subcollection are null', () => {
        const reconciled = reconcileLegacyAndSubcollections(null, null);
        expect(reconciled).toBeNull();
    });

    it('returns legacy if subcollection is null', () => {
        const legacy: PersistedDataSlice = {
            ...emptySlice,
            user: { name: 'Legacy User', age: 30, goals: [], experience_level: 'Beginner', stats: { weight: [], body_fat: [] } },
        };
        const reconciled = reconcileLegacyAndSubcollections(null, legacy);
        expect(reconciled?.user?.name).toBe('Legacy User');
    });

    it('returns subcollection if legacy is null', () => {
        const sub: PersistedDataSlice = {
            ...emptySlice,
            user: { name: 'Sub User', age: 25, goals: [], experience_level: 'Advanced', stats: { weight: [], body_fat: [] } },
        };
        const reconciled = reconcileLegacyAndSubcollections(sub, null);
        expect(reconciled?.user?.name).toBe('Sub User');
    });

    it('converges and merges both when both contain data', () => {
        const sub: PersistedDataSlice = {
            ...emptySlice,
            templates: [{ id: 't-1', name: 'Push', exercises: [] }],
        };
        const legacy: PersistedDataSlice = {
            ...emptySlice,
            templates: [{ id: 't-2', name: 'Pull', exercises: [] }],
        };
        const reconciled = reconcileLegacyAndSubcollections(sub, legacy);
        expect(reconciled?.templates.map(t => t.id)).toEqual(['t-1', 't-2']);
    });
});


