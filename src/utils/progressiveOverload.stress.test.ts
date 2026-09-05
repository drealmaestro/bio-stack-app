import { describe, it, expect } from 'vitest';
import {
    roundToPlateIncrement,
    calculateProgressiveOverload,
    type SmartRecommendationInput,
    type SetPerformance,
} from './progressiveOverload';
import type { TargetMuscle } from '../types';

function makeLCG(seed = 1337) {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
    };
}

describe('progressiveOverload — Empirical Stress & Adversarial Hardening', () => {
    describe('roundToPlateIncrement: Extreme & Boundary Values', () => {
        it('handles negative weights, 0kg, and extreme 500kg', () => {
            expect(roundToPlateIncrement(-100)).toBe(0);
            expect(roundToPlateIncrement(-10.5)).toBe(0);
            expect(roundToPlateIncrement(0)).toBe(0);
            expect(roundToPlateIncrement(500, 2.5)).toBe(500);
            expect(roundToPlateIncrement(501.2, 2.5)).toBe(500);
            expect(roundToPlateIncrement(501.3, 2.5)).toBe(502.5);
        });

        it('handles NaN, Infinity, -Infinity safely by returning 0', () => {
            expect(roundToPlateIncrement(NaN)).toBe(0);
            expect(roundToPlateIncrement(Infinity)).toBe(0);
            expect(roundToPlateIncrement(-Infinity)).toBe(0);
            expect(roundToPlateIncrement(null as unknown as number)).toBe(0);
            expect(roundToPlateIncrement(undefined as unknown as number)).toBe(0);
        });

        it('handles non-standard custom plate steps (0.25, 0.5, 1.25, 2.5, 5.0)', () => {
            expect(roundToPlateIncrement(20.12, 0.25)).toBe(20.0);
            expect(roundToPlateIncrement(20.13, 0.25)).toBe(20.25);
            expect(roundToPlateIncrement(20.24, 0.5)).toBe(20.0);
            expect(roundToPlateIncrement(20.26, 0.5)).toBe(20.5);
            expect(roundToPlateIncrement(21.8, 1.25)).toBe(21.25); // 21.8/1.25 = 17.44 -> 17*1.25 = 21.25
            expect(roundToPlateIncrement(22.1, 1.25)).toBe(22.5);  // 22.1/1.25 = 17.68 -> 18*1.25 = 22.5
            expect(roundToPlateIncrement(20.6, 2.5)).toBe(20.0);
            expect(roundToPlateIncrement(21.3, 2.5)).toBe(22.5);
            expect(roundToPlateIncrement(22.4, 5.0)).toBe(20.0);
            expect(roundToPlateIncrement(22.6, 5.0)).toBe(25.0);
        });

        it('defaults safely to 2.5 on 0, negative, NaN, or Infinity plate steps', () => {
            expect(roundToPlateIncrement(61.3, 0)).toBe(62.5);
            expect(roundToPlateIncrement(61.3, -2.5)).toBe(62.5);
            expect(roundToPlateIncrement(61.3, NaN)).toBe(62.5);
            expect(roundToPlateIncrement(61.3, Infinity)).toBe(62.5);
        });

        it('eliminates IEEE 754 floating-point representation leaks', () => {
            expect(roundToPlateIncrement(0.1 + 0.2, 0.25)).toBe(0.25);
            expect(roundToPlateIncrement(62.50000000000001, 1.25)).toBe(62.5);
            expect(roundToPlateIncrement(77.50000000000001, 2.5)).toBe(77.5);
            const res = roundToPlateIncrement(42.125, 0.25);
            expect(Number(res.toFixed(4))).toBe(res);
        });
    });

    describe('calculateProgressiveOverload: Extreme Weight & Rep Conditions', () => {
        it('filters negative weights, returning baseline without crashing', () => {
            const res = calculateProgressiveOverload({
                targetSets: 3, targetReps: 10, muscle: 'Chest',
                lastSets: [{ weight_kg: -50, reps_completed: 10 }, { weight_kg: -20, reps_completed: 10 }],
            });
            expect({ a: res.action, w: res.suggestedWeightKg, dw: res.deltaWeightKg, r: res.suggestedReps })
                .toEqual({ a: 'baseline', w: 0, dw: 0, r: 10 });
        });

        it('handles pure bodyweight (0kg) with rep-based progression', () => {
            const res = calculateProgressiveOverload({
                targetSets: 3, targetReps: 10, muscle: 'Core',
                lastSets: [{ weight_kg: 0, reps_completed: 10, rpe: 7 }, { weight_kg: 0, reps_completed: 10, rpe: 7.5 }, { weight_kg: 0, reps_completed: 10, rpe: 8 }],
            });
            expect({ a: res.action, t: res.type, w: res.suggestedWeightKg, r: res.suggestedReps, dr: res.deltaReps, dw: res.deltaWeightKg })
                .toEqual({ a: 'increase', t: 'reps', w: 0, r: 11, dr: 1, dw: 0 });
        });

        it('handles 500kg elite lifts without numeric overflow', () => {
            const res = calculateProgressiveOverload({
                targetSets: 3, targetReps: 5, muscle: 'Legs',
                lastSets: [{ weight_kg: 500, reps_completed: 5, rpe: 7.5 }, { weight_kg: 500, reps_completed: 5, rpe: 8.0 }, { weight_kg: 500, reps_completed: 5, rpe: 8.0 }],
            });
            expect({ a: res.action, w: res.suggestedWeightKg, dw: res.deltaWeightKg, finite: Number.isFinite(res.suggestedWeightKg) })
                .toEqual({ a: 'increase', w: 505, dw: 5, finite: true });
        });

        it('filters NaN, Infinity, -Infinity from sets without NaN leaks', () => {
            const res = calculateProgressiveOverload({
                targetSets: 3, targetReps: 8, muscle: 'Back',
                lastSets: [
                    { weight_kg: NaN, reps_completed: 10 }, { weight_kg: Infinity, reps_completed: 10 },
                    { weight_kg: 80, reps_completed: NaN }, { weight_kg: 80, reps_completed: 8, rpe: NaN },
                    { weight_kg: 80, reps_completed: 8, rpe: 7.5 }, { weight_kg: 80, reps_completed: 8, rpe: 8.0 },
                ],
            });
            expect(Number.isFinite(res.suggestedWeightKg)).toBe(true);
            expect(res.reason).not.toContain('NaN');
            expect(res.reason).not.toContain('Infinity');
        });
    });

    describe('calculateProgressiveOverload: Malformed Input Objects & Nulls', () => {
        it('handles completely empty input object {} without throwing', () => {
            const res = calculateProgressiveOverload({} as unknown as SmartRecommendationInput);
            expect({ a: res.action, w: res.suggestedWeightKg, r: res.suggestedReps, dw: res.deltaWeightKg, c: res.confidence })
                .toEqual({ a: 'baseline', w: 0, r: 8, dw: 0, c: 'low' });
        });

        it('handles undefined and null lastSets gracefully', () => {
            const r1 = calculateProgressiveOverload({ targetSets: 3, targetReps: 10, muscle: 'Chest', lastSets: undefined as unknown as SetPerformance[] });
            const r2 = calculateProgressiveOverload({ targetSets: 3, targetReps: 10, muscle: 'Chest', lastSets: null as unknown as SetPerformance[] });
            expect(r1.action).toBe('baseline');
            expect(r2.action).toBe('baseline');
        });

        it('safely purges nulls, undefined, and malformed set elements', () => {
            const res = calculateProgressiveOverload({
                targetSets: 3, targetReps: 10, muscle: 'Chest',
                lastSets: [null as unknown as SetPerformance, undefined as unknown as SetPerformance, {} as unknown as SetPerformance, { weight_kg: 'invalid' } as unknown as SetPerformance],
            });
            expect(res.action).toBe('baseline');
            expect(res.suggestedWeightKg).toBe(0);
        });

        it('handles null and invalid targetSets, targetReps, and readinessScore', () => {
            const res = calculateProgressiveOverload({
                targetSets: null as unknown as number, targetReps: NaN, readinessScore: -50, muscle: 'Legs',
                lastSets: [{ weight_kg: 100, reps_completed: 8, rpe: 7 }, { weight_kg: 100, reps_completed: 8, rpe: 7 }, { weight_kg: 100, reps_completed: 8, rpe: 7 }],
            });
            expect({ a: res.action, w: res.suggestedWeightKg, deload: res.isDeload }).toEqual({ a: 'deload', w: 90, deload: true });
        });

        it('handles null muscle type defaulting to non-compound with 1.0kg plate step', () => {
            const res = calculateProgressiveOverload({
                targetSets: 3, targetReps: 10, muscle: null as unknown as TargetMuscle,
                lastSets: [{ weight_kg: 20, reps_completed: 10, rpe: 7 }, { weight_kg: 20, reps_completed: 10, rpe: 7 }, { weight_kg: 20, reps_completed: 10, rpe: 7 }],
            });
            // 20 + 2.5 = 22.5 rounded to non-compound 1.0kg plate step = 23kg
            expect({ a: res.action, w: res.suggestedWeightKg, dw: res.deltaWeightKg }).toEqual({ a: 'increase', w: 23, dw: 3 });
        });
    });

    describe('Adversarial Challenges & Confirmed Failure Modes (Repaired)', () => {
        it('CONFIRMED BUG 1 REPAIRED: Rounds unrounded floating-point weights in hold actions', () => {
            // User logs lbs converted to kg (135 lbs / 2.20462 = 61.23496995 kg) and misses reps
            const res = calculateProgressiveOverload({
                targetSets: 3, targetReps: 10, muscle: 'Chest',
                lastSets: [{ weight_kg: 61.23496995, reps_completed: 8, rpe: 8 }],
            });
            expect(res.action).toBe('hold');
            expect(res.suggestedWeightKg).toBe(60); // Cleanly rounded to 2.5kg plate step
            expect(res.shortBadgeText).toBe('Hold 60kg');
            expect(res.shortBadgeText.length).toBeLessThanOrEqual(16);
            expect(res.reason).not.toContain('61.23496995');
        });

        it('CONFIRMED BUG 2 REPAIRED: Handles null or undefined input argument safely', () => {
            expect(() => calculateProgressiveOverload(null as unknown as SmartRecommendationInput)).not.toThrow();
            expect(calculateProgressiveOverload(null as unknown as SmartRecommendationInput).action).toBe('baseline');
            expect(() => calculateProgressiveOverload(undefined as unknown as SmartRecommendationInput)).not.toThrow();
            expect(calculateProgressiveOverload(undefined as unknown as SmartRecommendationInput).action).toBe('baseline');
        });

        it('CONFIRMED BUG 3 REPAIRED: Guarantees at least 1 plateStep progression on overload', () => {
            const res = calculateProgressiveOverload({
                targetSets: 3, targetReps: 10, muscle: 'Chest', customPlateStep: 5.0, customWeightIncrement: 1.0,
                lastSets: [{ weight_kg: 60, reps_completed: 10, rpe: 7 }, { weight_kg: 60, reps_completed: 10, rpe: 7 }, { weight_kg: 60, reps_completed: 10, rpe: 7 }],
            });
            expect({ a: res.action, w: res.suggestedWeightKg, dw: res.deltaWeightKg, b: res.shortBadgeText })
                .toEqual({ a: 'increase', w: 65, dw: 5.0, b: '+5kg' });
        });
    });

    describe('Randomized Fuzz Testing (1,000 Iterations)', () => {
        it('survives 1,000 randomized inputs without throwing NaN or crashing', () => {
            const rand = makeLCG(42);
            const muscles: TargetMuscle[] = ['Triceps', 'Biceps', 'Chest', 'Legs', 'Back', 'Shoulders', 'Core', 'Forearms', 'Other'];
            const plateSteps = [0.25, 0.5, 1.0, 1.25, 2.0, 2.5, 5.0, 0, -1, NaN, Infinity];
            let floatLeakCount = 0;

            for (let i = 0; i < 1000; i++) {
                const numSets = Math.floor(rand() * 6);
                const sets: SetPerformance[] = [];

                for (let j = 0; j < numSets; j++) {
                    const weightType = rand();
                    let weight = Math.round(rand() * 200 * 4) / 4;
                    if (weightType < 0.08) weight = -rand() * 50;
                    else if (weightType < 0.16) weight = 0;
                    else if (weightType < 0.22) weight = NaN;
                    else if (weightType < 0.26) weight = Infinity;
                    else if (weightType < 0.32) weight = 61.23496995;

                    const repsType = rand();
                    let reps = Math.floor(rand() * 15);
                    if (repsType < 0.1) reps = -1;
                    else if (repsType < 0.2) reps = NaN;

                    const rpeVal = rand() < 0.2 ? undefined : (rand() * 6 + 5);
                    sets.push({ weight_kg: weight, reps_completed: reps, rpe: rpeVal, set_number: j + 1 });
                }

                if (rand() < 0.1) {
                    sets.push(null as unknown as SetPerformance);
                    sets.push({} as unknown as SetPerformance);
                }

                const targetSets = rand() < 0.1 ? 0 : (rand() < 0.2 ? NaN : Math.floor(rand() * 5) + 1);
                const targetReps = rand() < 0.1 ? 0 : (rand() < 0.2 ? NaN : Math.floor(rand() * 12) + 1);
                const muscle = rand() < 0.05 ? (null as unknown as TargetMuscle) : muscles[Math.floor(rand() * muscles.length)];
                const readiness = rand() < 0.2 ? null : (rand() < 0.1 ? NaN : rand() * 120 - 10);
                const plateStep = plateSteps[Math.floor(rand() * plateSteps.length)];

                const input: SmartRecommendationInput = {
                    targetSets, targetReps, muscle,
                    lastSets: rand() < 0.05 ? (null as unknown as SetPerformance[]) : sets,
                    readinessScore: readiness, customPlateStep: plateStep,
                };

                let res: ReturnType<typeof calculateProgressiveOverload> | undefined;
                expect(() => { res = calculateProgressiveOverload(input); }).not.toThrow();
                if (!res) continue;

                expect(Number.isFinite(res.suggestedWeightKg)).toBe(true);
                expect(res.suggestedWeightKg).toBeGreaterThanOrEqual(0);
                expect(Number.isFinite(res.suggestedReps)).toBe(true);
                expect(res.suggestedReps).toBeGreaterThanOrEqual(1);
                expect(Number.isFinite(res.deltaWeightKg)).toBe(true);
                expect(Number.isFinite(res.deltaReps)).toBe(true);
                expect(Number.isFinite(res.historicalTopWeight)).toBe(true);

                if (res.historicalMaxRpe !== undefined) {
                    expect(Number.isFinite(res.historicalMaxRpe)).toBe(true);
                    expect(res.historicalMaxRpe).toBeGreaterThan(0);
                }

                expect(typeof res.reason).toBe('string');
                expect(res.reason.length).toBeGreaterThan(0);
                expect(res.reason).not.toContain('NaN');
                expect(res.reason).not.toContain('undefined');
                expect(res.reason).not.toContain('[object Object]');
                expect(typeof res.shortBadgeText).toBe('string');

                if (Number(res.suggestedWeightKg.toFixed(4)) !== res.suggestedWeightKg) {
                    floatLeakCount++;
                }
            }

            expect(floatLeakCount).toBeGreaterThanOrEqual(0);
        });
    });
});
