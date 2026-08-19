import { describe, it, expect } from 'vitest';
import {
    latestWeightKg,
    getEffectiveNutritionGoals,
    calculateBMR,
    calculateTDEE,
    calculateMacroTargetsFromTDEE,
} from './nutritionGoals';
import type { UserProfile } from '../types';
import { DEFAULT_NUTRITION_GOALS } from '../data/nutrition';

describe('nutritionGoals utility functions', () => {
    describe('latestWeightKg', () => {
        it('returns null when user is null or stats/weight is missing/empty', () => {
            expect(latestWeightKg(null)).toBeNull();
            expect(latestWeightKg({ id: 'u1' } as unknown as UserProfile)).toBeNull();
            expect(latestWeightKg({ id: 'u1', stats: { weight: [], body_fat: [] } } as unknown as UserProfile)).toBeNull();
        });

        it('returns the most recent weight based on date sorting', () => {
            const user: Partial<UserProfile> = {
                stats: {
                    weight: [
                        { date: '2026-01-01', value: 75 },
                        { date: '2026-06-15', value: 80 },
                        { date: '2026-03-10', value: 78 },
                    ],
                    body_fat: [],
                },
            };
            expect(latestWeightKg(user as UserProfile)).toBe(80);
        });

        it('returns null if latest logged weight value is 0 or invalid', () => {
            const user: Partial<UserProfile> = {
                stats: {
                    weight: [{ date: '2026-08-01', value: 0 }],
                    body_fat: [],
                },
            };
            expect(latestWeightKg(user as UserProfile)).toBeNull();
        });
    });

    describe('getEffectiveNutritionGoals', () => {
        it('returns custom user nutrition goals when defined', () => {
            const user: Partial<UserProfile> = {
                nutrition_goals: { calories: 2800, protein_g: 200, carbs_g: 300, fat_g: 80 },
            };
            const result = getEffectiveNutritionGoals(user as UserProfile);
            expect(result.proteinSource).toBe('user');
            expect(result.goals).toEqual({ calories: 2800, protein_g: 200, carbs_g: 300, fat_g: 80 });
            expect(result.proteinSuggested).toBeNull();
        });

        it('calculates bodyweight-based protein suggestion (1.8g/kg rounded to nearest 5g)', () => {
            const user: Partial<UserProfile> = {
                stats: {
                    weight: [{ date: '2026-08-01', value: 82 }], // 82 * 1.8 = 147.6 -> rounded to nearest 5 = 150
                    body_fat: [],
                },
            };
            const result = getEffectiveNutritionGoals(user as UserProfile);
            expect(result.proteinSource).toBe('bodyweight');
            expect(result.proteinSuggested).toBe(150);
            expect(result.goals.protein_g).toBe(150);
            expect(result.goals.calories).toBe(DEFAULT_NUTRITION_GOALS.calories);
        });

        it('returns default nutrition goals when user has no custom goals or logged weight', () => {
            const result = getEffectiveNutritionGoals(null);
            expect(result.proteinSource).toBe('default');
            expect(result.proteinSuggested).toBeNull();
            expect(result.goals).toEqual(DEFAULT_NUTRITION_GOALS);
        });
    });

    describe('calculateBMR', () => {
        it('calculates BMR correctly for male using Mifflin-St Jeor formula', () => {
            // Male: 10*80 + 6.25*180 - 5*25 + 5 = 800 + 1125 - 125 + 5 = 1805
            const bmr = calculateBMR({ weightKg: 80, heightCm: 180, ageYears: 25, gender: 'male' });
            expect(bmr).toBe(1805);
        });

        it('calculates BMR correctly for female using Mifflin-St Jeor formula', () => {
            // Female: 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25 -> 1320
            const bmr = calculateBMR({ weightKg: 60, heightCm: 165, ageYears: 30, gender: 'female' });
            expect(bmr).toBe(1320);
        });

        it('returns 0 for invalid zero or negative inputs', () => {
            expect(calculateBMR({ weightKg: 0, heightCm: 180, ageYears: 25, gender: 'male' })).toBe(0);
            expect(calculateBMR({ weightKg: 70, heightCm: -10, ageYears: 25, gender: 'female' })).toBe(0);
            expect(calculateBMR({ weightKg: 70, heightCm: 170, ageYears: 0, gender: 'male' })).toBe(0);
        });
    });

    describe('calculateTDEE', () => {
        it('applies correct activity level multipliers to BMR', () => {
            const bmr = 2000;
            expect(calculateTDEE(bmr, 'sedentary')).toBe(2400);   // 2000 * 1.2
            expect(calculateTDEE(bmr, 'light')).toBe(2750);       // 2000 * 1.375
            expect(calculateTDEE(bmr, 'moderate')).toBe(3100);    // 2000 * 1.55
            expect(calculateTDEE(bmr, 'active')).toBe(3450);      // 2000 * 1.725
            expect(calculateTDEE(bmr, 'extra_active')).toBe(3800); // 2000 * 1.9
        });

        it('defaults to sedentary multiplier (1.2) for unknown activity level', () => {
            expect(calculateTDEE(2000, 'unknown')).toBe(2400);
        });

        it('returns 0 for BMR <= 0', () => {
            expect(calculateTDEE(0, 'active')).toBe(0);
            expect(calculateTDEE(-500, 'active')).toBe(0);
        });
    });

    describe('calculateMacroTargetsFromTDEE', () => {
        it('calculates macro grams based on default 30% P, 40% C, 30% F split', () => {
            // 2000 kcal -> P: 600/4 = 150g, C: 800/4 = 200g, F: 600/9 = 67g
            const targets = calculateMacroTargetsFromTDEE(2000);
            expect(targets).toEqual({
                calories: 2000,
                protein_g: 150,
                carbs_g: 200,
                fat_g: 67,
            });
        });

        it('calculates macro grams based on custom ratios', () => {
            // 2500 kcal with 40% P (1000/4 = 250g), 40% C (1000/4 = 250g), 20% F (500/9 = 56g)
            const targets = calculateMacroTargetsFromTDEE(2500, { proteinPct: 0.4, carbsPct: 0.4, fatPct: 0.2 });
            expect(targets).toEqual({
                calories: 2500,
                protein_g: 250,
                carbs_g: 250,
                fat_g: 56,
            });
        });

        it('returns zero for calories <= 0', () => {
            expect(calculateMacroTargetsFromTDEE(0)).toEqual({ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
            expect(calculateMacroTargetsFromTDEE(-100)).toEqual({ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
        });
    });
});
