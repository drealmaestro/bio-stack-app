import { describe, it, expect } from 'vitest';
import { calculateMacroProgress, calculateDailyStreak } from './nutritionMath';

describe('nutritionMath utility', () => {
    describe('calculateMacroProgress', () => {
        it('calculates macro progress correctly when under target', () => {
            const consumed = { calories: 1500, protein: 120, carbs: 150, fat: 45 };
            const target = { calories: 2500, protein: 180, carbs: 250, fat: 75 };

            const progress = calculateMacroProgress(consumed, target);

            expect(progress.calories).toEqual({
                consumed: 1500,
                target: 2500,
                remaining: 1000,
                percentage: 60,
            });

            expect(progress.protein).toEqual({
                consumed: 120,
                target: 180,
                remaining: 60,
                percentage: 67,
            });

            expect(progress.carbs).toEqual({
                consumed: 150,
                target: 250,
                remaining: 100,
                percentage: 60,
            });

            expect(progress.fat).toEqual({
                consumed: 45,
                target: 75,
                remaining: 30,
                percentage: 60,
            });
        });

        it('caps percentage at 100% when consumed exceeds target and remaining to 0', () => {
            const consumed = { calories: 3000, protein: 200, carbs: 300, fat: 90 };
            const target = { calories: 2500, protein: 180, carbs: 250, fat: 75 };

            const progress = calculateMacroProgress(consumed, target);

            expect(progress.calories.percentage).toBe(100);
            expect(progress.calories.remaining).toBe(0);
            expect(progress.protein.percentage).toBe(100);
            expect(progress.protein.remaining).toBe(0);
        });

        it('handles zero target gracefully', () => {
            const consumed = { calories: 500, protein: 30, carbs: 50, fat: 15 };
            const target = { calories: 0, protein: 0, carbs: 0, fat: 0 };

            const progress = calculateMacroProgress(consumed, target);

            expect(progress.calories.percentage).toBe(0);
            expect(progress.calories.remaining).toBe(0);
        });
    });

    describe('calculateDailyStreak', () => {
        const refDate = '2026-07-22';

        it('returns 0 for empty logs', () => {
            expect(calculateDailyStreak([], 2000, refDate)).toBe(0);
        });

        it('calculates streak including today', () => {
            const logs = [
                { date: '2026-07-22', calories: 2200 },
                { date: '2026-07-21', calories: 2100 },
                { date: '2026-07-20', calories: 2000 },
                { date: '2026-07-19', calories: 1900 },
            ];

            expect(calculateDailyStreak(logs, 2000, refDate)).toBe(4);
        });

        it('calculates streak ending yesterday when today is not logged yet', () => {
            const logs = [
                { date: '2026-07-21', calories: 2100 },
                { date: '2026-07-20', calories: 2000 },
                { date: '2026-07-19', calories: 2000 },
            ];

            expect(calculateDailyStreak(logs, 2000, refDate)).toBe(3);
        });

        it('breaks streak when a day is missing', () => {
            const logs = [
                { date: '2026-07-22', calories: 2200 },
                { date: '2026-07-21', calories: 2100 },
                // 2026-07-20 missing
                { date: '2026-07-19', calories: 2000 },
            ];

            expect(calculateDailyStreak(logs, 2000, refDate)).toBe(2);
        });

        it('handles entries array format', () => {
            const logs = [
                {
                    date: '2026-07-22',
                    entries: [
                        { calories: 1000 },
                        { calories: 1200 },
                    ],
                },
                {
                    date: '2026-07-21',
                    entries: [
                        { calories: 1800 },
                    ],
                },
            ];

            expect(calculateDailyStreak(logs, 2000, refDate)).toBe(2);
        });

        it('returns 0 when neither today nor yesterday meet the goal', () => {
            const logs = [
                { date: '2026-07-19', calories: 2200 },
                { date: '2026-07-18', calories: 2100 },
            ];

            expect(calculateDailyStreak(logs, 2000, refDate)).toBe(0);
        });
    });
});
