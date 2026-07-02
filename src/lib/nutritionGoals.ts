import type { UserProfile } from '../types';
import { DEFAULT_NUTRITION_GOALS } from '../data/nutrition';

export interface EffectiveNutritionGoals {
    goals: { calories: number; protein_g: number; carbs_g: number; fat_g: number };
    /** 1.8 g/kg from the most recent logged body weight, rounded to 5g. Null when no weight logged. */
    proteinSuggested: number | null;
    proteinSource: 'user' | 'bodyweight' | 'default';
}

const PROTEIN_G_PER_KG = 1.8;

export function latestWeightKg(user: UserProfile | null): number | null {
    if (!user?.stats?.weight?.length) return null;
    const sorted = [...user.stats.weight].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted[0].value || null;
}

/**
 * Protein target priority: explicit user goal > body-weight based (1.8 g/kg) > default.
 * A user-set goal is never silently overridden — the suggestion is exposed for display.
 */
export function getEffectiveNutritionGoals(user: UserProfile | null): EffectiveNutritionGoals {
    const weight = latestWeightKg(user);
    const proteinSuggested = weight ? Math.round((weight * PROTEIN_G_PER_KG) / 5) * 5 : null;

    if (user?.nutrition_goals) {
        return { goals: user.nutrition_goals, proteinSuggested, proteinSource: 'user' };
    }

    if (proteinSuggested) {
        return {
            goals: { ...DEFAULT_NUTRITION_GOALS, protein_g: proteinSuggested },
            proteinSuggested,
            proteinSource: 'bodyweight',
        };
    }

    return { goals: DEFAULT_NUTRITION_GOALS, proteinSuggested: null, proteinSource: 'default' };
}
