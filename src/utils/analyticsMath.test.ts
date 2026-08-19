import { describe, it, expect } from 'vitest';
import { calculateEMA, calculateMuscleBalance, calculateRestCompliance } from './analyticsMath';

describe('analyticsMath utility module', () => {
    describe('calculateEMA', () => {
        it('handles empty input array', () => {
            expect(calculateEMA([])).toEqual([]);
        });

        it('handles single item input array', () => {
            expect(calculateEMA([100])).toEqual([100]);
        });

        it('computes EMA with default alpha (0.3)', () => {
            const result = calculateEMA([100, 110, 120]);
            // EMA[0] = 100
            // EMA[1] = 0.3*110 + 0.7*100 = 33 + 70 = 103
            // EMA[2] = 0.3*120 + 0.7*103 = 36 + 72.1 = 108.1
            expect(result).toEqual([100, 103, 108.1]);
        });

        it('computes EMA with custom alpha (0.5)', () => {
            const result = calculateEMA([100, 120, 140], 0.5);
            // EMA[0] = 100
            // EMA[1] = 0.5*120 + 0.5*100 = 110
            // EMA[2] = 0.5*140 + 0.5*110 = 125
            expect(result).toEqual([100, 110, 125]);
        });

        it('clamps alpha to valid range [0, 1]', () => {
            const lowAlpha = calculateEMA([100, 200], -1);
            expect(lowAlpha).toEqual([100, 100]);

            const highAlpha = calculateEMA([100, 200], 2);
            expect(highAlpha).toEqual([100, 200]);
        });
    });

    describe('calculateMuscleBalance', () => {
        it('returns default balanced state for empty volume', () => {
            const res = calculateMuscleBalance({});
            expect(res).toEqual({
                pushPullRatio: 1.0,
                balanceScore: 100,
                status: 'Balanced',
            });
        });

        it('calculates optimal balance for equal push and pull volume with legs', () => {
            const res = calculateMuscleBalance({
                Chest: 50,
                Shoulders: 20,
                Back: 70,
                Legs: 60,
            });
            // push = 70 (Chest + Shoulders), pull = 70 (Back)
            expect(res.pushPullRatio).toBe(1.0);
            expect(res.balanceScore).toBe(100);
            expect(res.status).toBe('Optimal Balance');
        });

        it('detects push dominant balance', () => {
            const res = calculateMuscleBalance({
                Chest: 100,
                Shoulders: 50,
                Back: 50,
                Legs: 80,
            });
            // push = 150, pull = 50 -> ratio = 3.0
            expect(res.pushPullRatio).toBe(3.0);
            expect(res.status).toBe('Push Dominant');
            expect(res.balanceScore).toBeLessThan(100);
        });

        it('detects pull dominant balance', () => {
            const res = calculateMuscleBalance({
                Chest: 30,
                Back: 100,
                Biceps: 40,
                Legs: 80,
            });
            // push = 30, pull = 140 -> ratio = 0.21
            expect(res.pushPullRatio).toBe(0.21);
            expect(res.status).toBe('Pull Dominant');
        });

        it('handles case where pull volume is 0 but push > 0', () => {
            const res = calculateMuscleBalance({
                Chest: 100,
            });
            expect(res.pushPullRatio).toBe(2.0);
            expect(res.status).toBe('Push Dominant');
        });

        it('applies penalty when legs volume is missing', () => {
            const withLegs = calculateMuscleBalance({ Chest: 50, Back: 50, Legs: 50 });
            const withoutLegs = calculateMuscleBalance({ Chest: 50, Back: 50, Legs: 0 });
            expect(withoutLegs.balanceScore).toBeLessThan(withLegs.balanceScore);
        });
    });

    describe('calculateRestCompliance', () => {
        it('returns default 100% compliance when no rests recorded', () => {
            const res = calculateRestCompliance([], 90);
            expect(res).toEqual({ compliancePct: 100, averageRestSec: 0 });
        });

        it('handles targetRestSeconds <= 0', () => {
            const res = calculateRestCompliance([60, 90], 0);
            expect(res).toEqual({ compliancePct: 100, averageRestSec: 75 });
        });

        it('calculates 100% compliance when all rests match target exactly', () => {
            const res = calculateRestCompliance([90, 90, 90], 90);
            expect(res.compliancePct).toBe(100);
            expect(res.averageRestSec).toBe(90);
        });

        it('calculates compliance percentage accurately for slight deviations', () => {
            // Target = 100s. Rest 1 = 90s (90% match), Rest 2 = 110s (90% match) -> compliance 90%
            const res = calculateRestCompliance([90, 110], 100);
            expect(res.averageRestSec).toBe(100);
            expect(res.compliancePct).toBe(90);
        });

        it('clamps negative item compliance to 0', () => {
            // Target = 60s. Rest = 300s -> diff = 240, 100 - (240/60)*100 = -300% -> clamped to 0%
            const res = calculateRestCompliance([300], 60);
            expect(res.compliancePct).toBe(0);
            expect(res.averageRestSec).toBe(300);
        });
    });
});
