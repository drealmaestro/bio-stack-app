import { describe, it, expect } from 'vitest';
import { calculate1RM, calculateWarmUpSets } from './fitnessMath';

describe('fitnessMath utility', () => {
    describe('calculate1RM', () => {
        it('returns weight when reps equal 1', () => {
            expect(calculate1RM(100, 1, 'epley')).toBe(100);
            expect(calculate1RM(100, 1, 'brzycki')).toBe(100);
        });

        it('calculates correctly using Epley formula by default', () => {
            // 100 * (1 + 10 / 30) = 100 * (1 + 0.3333...) = 133.333... => 133.3
            expect(calculate1RM(100, 10)).toBe(133.3);
            // 60 * (1 + 6 / 30) = 60 * 1.2 = 72
            expect(calculate1RM(60, 6)).toBe(72);
        });

        it('calculates correctly using Brzycki formula', () => {
            // 100 * (36 / (37 - 10)) = 100 * (36 / 27) = 133.333... => 133.3
            expect(calculate1RM(100, 10, 'brzycki')).toBe(133.3);
            // 100 * (36 / (37 - 1)) = 100
            expect(calculate1RM(100, 1, 'brzycki')).toBe(100);
            // 80 * (36 / (37 - 5)) = 80 * (36 / 32) = 90
            expect(calculate1RM(80, 5, 'brzycki')).toBe(90);
        });

        it('handles edge cases gracefully', () => {
            expect(calculate1RM(0, 5)).toBe(0);
            expect(calculate1RM(-50, 5)).toBe(0);
            expect(calculate1RM(100, 0)).toBe(0);
            expect(calculate1RM(100, -2)).toBe(0);
            expect(calculate1RM(100, 37, 'brzycki')).toBe(100);
            expect(calculate1RM(100, 40, 'brzycki')).toBe(100);
        });
    });

    describe('calculateWarmUpSets', () => {
        it('calculates 50%, 70%, 85% warm-up sets for 100kg', () => {
            const result = calculateWarmUpSets(100);
            expect(result).toHaveLength(3);

            expect(result[0]).toEqual({
                percentage: 50,
                weight: 50,
                reps: 10,
                label: 'Light Warm-Up',
            });

            expect(result[1]).toEqual({
                percentage: 70,
                weight: 70,
                reps: 6,
                label: 'Moderate Warm-Up',
            });

            expect(result[2]).toEqual({
                percentage: 85,
                weight: 85,
                reps: 3,
                label: 'Heavy Primer',
            });
        });

        it('calculates rounded weights for non-round numbers like 75kg', () => {
            const result = calculateWarmUpSets(75);
            expect(result[0].weight).toBe(37.5);
            expect(result[1].weight).toBe(52.5);
            expect(result[2].weight).toBe(63.8);
        });

        it('returns empty array when workingWeight <= 0', () => {
            expect(calculateWarmUpSets(0)).toEqual([]);
            expect(calculateWarmUpSets(-10)).toEqual([]);
        });
    });
});
