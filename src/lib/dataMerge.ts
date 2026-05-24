import type { DailyInsights, Exercise, NutritionLog, UserProfile, WorkoutLog, WorkoutTemplate } from '../types';

export interface PersistedDataSlice {
    user: UserProfile | null;
    templates: WorkoutTemplate[];
    logs: WorkoutLog[];
    exercises: Exercise[];
    nutritionLogs: NutritionLog[];
    dailyInsights: DailyInsights[];
    seeded: boolean;
}

function mergeById<T extends { id: string }>(base: T[], incoming: T[]): T[] {
    const map = new Map(base.map((item) => [item.id, item]));
    incoming.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
}

function mergeNutritionLogs(base: NutritionLog[], incoming: NutritionLog[]): NutritionLog[] {
    const map = new Map(base.map((log) => [log.date, { ...log, entries: [...log.entries] }]));
    incoming.forEach((log) => {
        const existing = map.get(log.date);
        if (!existing) {
            map.set(log.date, { ...log, entries: [...log.entries] });
            return;
        }
        map.set(log.date, {
            date: log.date,
            entries: mergeById(existing.entries, log.entries),
        });
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function mergeDailyInsights(base: DailyInsights[], incoming: DailyInsights[]): DailyInsights[] {
    const map = new Map(base.map((item) => [item.date, item]));
    incoming.forEach((item) => map.set(item.date, item));
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function mergePersistedData(
    base: PersistedDataSlice,
    incoming: PersistedDataSlice
): PersistedDataSlice {
    return {
        user: base.user ?? incoming.user,
        templates: mergeById(base.templates, incoming.templates),
        logs: mergeById(base.logs, incoming.logs),
        exercises: mergeById(base.exercises, incoming.exercises),
        nutritionLogs: mergeNutritionLogs(base.nutritionLogs, incoming.nutritionLogs),
        dailyInsights: mergeDailyInsights(base.dailyInsights, incoming.dailyInsights),
        seeded: base.seeded || incoming.seeded,
    };
}

export function reconcileLegacyAndSubcollections(
    subcollection: PersistedDataSlice | null,
    legacy: PersistedDataSlice | null
): PersistedDataSlice | null {
    if (!subcollection && !legacy) return null;
    if (!subcollection) return legacy;
    if (!legacy) return subcollection;

    // Both exist. Merge them to converge.
    return mergePersistedData(subcollection, legacy);
}


