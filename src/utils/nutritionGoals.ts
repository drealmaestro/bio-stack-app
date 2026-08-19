import { latestWeightKg as libLatestWeightKg, getEffectiveNutritionGoals as libGetEffectiveNutritionGoals, type EffectiveNutritionGoals } from '../lib/nutritionGoals';

export type { EffectiveNutritionGoals };

export const latestWeightKg = libLatestWeightKg;
export const getEffectiveNutritionGoals = libGetEffectiveNutritionGoals;

export interface BMRParams {
    weightKg: number;
    heightCm: number;
    ageYears: number;
    gender: 'male' | 'female';
}

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor formula.
 * Male: 10*weight + 6.25*height - 5*age + 5
 * Female: 10*weight + 6.25*height - 5*age - 161
 */
export function calculateBMR({ weightKg, heightCm, ageYears, gender }: BMRParams): number {
    if (weightKg <= 0 || heightCm <= 0 || ageYears <= 0) return 0;
    const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
    const bmr = gender === 'male' ? base + 5 : base - 161;
    return Math.max(0, Math.round(bmr));
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE) based on BMR and activity multiplier.
 */
export function calculateTDEE(bmr: number, activityLevel: string): number {
    if (bmr <= 0) return 0;
    const multipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        extra_active: 1.9,
    };
    const mult = multipliers[activityLevel.toLowerCase()] || 1.2;
    return Math.round(bmr * mult);
}

export interface MacroRatios {
    proteinPct: number; // e.g. 0.30 for 30%
    carbsPct: number;   // e.g. 0.40 for 40%
    fatPct: number;     // e.g. 0.30 for 30%
}

/**
 * Calculates protein (4 kcal/g), carbs (4 kcal/g), and fat (9 kcal/g) targets from total calories and macro ratios.
 */
export function calculateMacroTargetsFromTDEE(
    calories: number,
    ratios: MacroRatios = { proteinPct: 0.3, carbsPct: 0.4, fatPct: 0.3 }
): { calories: number; protein_g: number; carbs_g: number; fat_g: number } {
    if (calories <= 0) {
        return { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
    }
    const proteinCal = calories * ratios.proteinPct;
    const carbsCal = calories * ratios.carbsPct;
    const fatCal = calories * ratios.fatPct;

    return {
        calories: Math.round(calories),
        protein_g: Math.round(proteinCal / 4),
        carbs_g: Math.round(carbsCal / 4),
        fat_g: Math.round(fatCal / 9),
    };
}
