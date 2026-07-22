import { describe, it, expect } from 'vitest';
import { calculate1RM, calculateWarmUpSets } from './fitnessMath';
import { calculateMacroProgress, calculateDailyStreak } from './nutritionMath';

describe('Empirical Stress Testing for Milestone 4 Math Modules', () => {
    describe('fitnessMath edge cases', () => {
        it('handles boundary reps for Brzycki and Epley', () => {
            expect(calculate1RM(100, 36, 'brzycki')).toBe(3600);
            expect(calculate1RM(100, 37, 'brzycki')).toBe(100);
            expect(calculate1RM(100, 50, 'brzycki')).toBe(100);
            expect(calculate1RM(100, 30, 'epley')).toBe(200);
        });

        it('handles decimal working weights in warm-up sets', () => {
            const sets = calculateWarmUpSets(62.5);
            expect(sets[0].weight).toBe(31.3); // 50% of 62.5 = 31.25 -> 31.3
            expect(sets[1].weight).toBe(43.8); // 70% of 62.5 = 43.75 -> 43.8
            expect(sets[2].weight).toBe(53.1); // 85% of 62.5 = 53.125 -> 53.1
        });
    });

    describe('nutritionMath streak edge cases', () => {
        it('handles month boundary transitions (e.g., Feb 28 to Mar 1)', () => {
            const logs = [
                { date: '2026-03-02', calories: 2500 },
                { date: '2026-03-01', calories: 2500 },
                { date: '2026-02-28', calories: 2500 },
                { date: '2026-02-27', calories: 2500 },
            ];

            expect(calculateDailyStreak(logs, 2000, '2026-03-02')).toBe(4);
        });

        it('handles year boundary transitions (e.g., Dec 31 to Jan 1)', () => {
            const logs = [
                { date: '2026-01-02', calories: 2500 },
                { date: '2026-01-01', calories: 2500 },
                { date: '2025-12-31', calories: 2500 },
                { date: '2025-12-30', calories: 2500 },
            ];

            expect(calculateDailyStreak(logs, 2000, '2026-01-02')).toBe(4);
        });

        it('handles multiple log entries on the same date by summing calories', () => {
            const logs = [
                { date: '2026-07-22', calories: 1200 },
                { date: '2026-07-22', calories: 1000 }, // Total = 2200
                { date: '2026-07-21', calories: 2000 },
            ];

            expect(calculateDailyStreak(logs, 2000, '2026-07-22')).toBe(2);
        });
    });

    describe('macroProgress edge cases', () => {
        it('handles floating point precision issues gracefully', () => {
            const consumed = { calories: 0.1 + 0.2, protein: 33.333, carbs: 10.55, fat: 5.11 };
            const target = { calories: 2500.4, protein: 180, carbs: 250, fat: 70 };

            const progress = calculateMacroProgress(consumed, target);
            expect(progress.calories.consumed).toBe(0.3);
            expect(progress.protein.consumed).toBe(33.3);
            expect(progress.calories.remaining).toBe(2500.1);
        });
    });
});
