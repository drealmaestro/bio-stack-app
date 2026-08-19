import { describe, it, expect } from 'vitest';
import { calculateDailyReadiness } from './readinessMath';

describe('calculateDailyReadiness', () => {
    it('returns Prime level for high sleep and full hydration', () => {
        const result = calculateDailyReadiness({
            sleepMinutes: 480, // 8h
            targetSleepMinutes: 420,
            waterMl: 2000,
            targetWaterMl: 2000,
            isRestDay: false,
            activeMinutesToday: 45,
        });

        expect(result.score).toBeGreaterThanOrEqual(85);
        expect(result.level).toBe('Prime');
        expect(result.metrics.sleepPct).toBeGreaterThanOrEqual(100);
        expect(result.metrics.hydrationPct).toBe(100);
    });

    it('returns Optimal level for standard moderate sleep and hydration', () => {
        const result = calculateDailyReadiness({
            sleepMinutes: 380, // 6.3h
            targetSleepMinutes: 420,
            waterMl: 1200,
            targetWaterMl: 2000,
            isRestDay: false,
            activeMinutesToday: 0,
        });

        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(result.score).toBeLessThan(85);
        expect(result.level).toBe('Optimal');
    });

    it('handles rest days with recovery status bonus', () => {
        const result = calculateDailyReadiness({
            sleepMinutes: 450,
            waterMl: 1800,
            isRestDay: true,
        });

        expect(result.metrics.trainingStatus).toBe('Active Recovery Day');
        expect(result.score).toBeGreaterThanOrEqual(80);
    });

    it('handles zero or missing sleep safely without throwing', () => {
        const result = calculateDailyReadiness({
            sleepMinutes: 0,
            waterMl: 500,
            isRestDay: false,
        });

        expect(result.score).toBeGreaterThan(0);
        expect(result.metrics.sleepStatus).toBe('Sleep not logged yet');
    });

    it('returns Recovery Priority when sleep and hydration are low', () => {
        const result = calculateDailyReadiness({
            sleepMinutes: 240, // 4h
            targetSleepMinutes: 420,
            waterMl: 300,
            targetWaterMl: 2000,
            isRestDay: false,
        });

        expect(result.score).toBeLessThan(50);
        expect(result.level).toBe('Recovery');
    });
});
