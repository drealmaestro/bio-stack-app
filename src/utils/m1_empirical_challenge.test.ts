import { describe, it, expect } from 'vitest';
import {
    calculateProgressiveOverload,
    type SmartRecommendationInput,
    type SetPerformance,
} from './progressiveOverload';

const set = (weight_kg: number, reps_completed: number, rpe?: number): SetPerformance => ({
    weight_kg, reps_completed, rpe,
});

const createInput = (overrides?: Partial<SmartRecommendationInput>): SmartRecommendationInput => ({
    targetSets: 3, targetReps: 10, muscle: 'Chest',
    lastSets: [set(60, 10, 7.5), set(60, 10, 8.0), set(60, 10, 7.5)],
    readinessScore: 80, ...overrides,
});

describe('M1 Empirical Challenger Boundary Stress Suite', () => {
    describe('1. Exact RPE Boundary Conditions', () => {
        it('RPE = 8.0 triggers progressive overload (+2.5kg) when all reps hit', () => {
            const input = createInput({
                lastSets: [set(80, 10, 8.0), set(80, 10, 8.0), set(80, 10, 8.0)],
                readinessScore: 80,
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('increase');
            expect(rec.type).toBe('weight');
            expect(rec.suggestedWeightKg).toBe(82.5);
            expect(rec.deltaWeightKg).toBe(2.5);
            expect(rec.isOverload).toBe(true);
            expect(rec.isDeload).toBe(false);
            expect(rec.shortBadgeText).toBe('+2.5kg');
        });

        it('RPE = 8.1 holds form when all reps hit (exceeds 8.0 threshold)', () => {
            const input = createInput({
                lastSets: [set(80, 10, 8.0), set(80, 10, 8.0), set(80, 10, 8.1)],
                readinessScore: 80,
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('hold');
            expect(rec.type).toBe('maintain');
            expect(rec.suggestedWeightKg).toBe(80);
            expect(rec.deltaWeightKg).toBe(0);
            expect(rec.isOverload).toBe(false);
            expect(rec.isDeload).toBe(false);
            expect(rec.shortBadgeText).toBe('Hold Form');
            expect(rec.reason).toContain('demanding');
            expect(rec.reason).toContain('solidify form');
        });

        it('RPE = 9.4 with target reps hit holds form (does NOT deload at normal readiness)', () => {
            const input = createInput({
                lastSets: [set(80, 10, 8.5), set(80, 10, 9.0), set(80, 10, 9.4)],
                readinessScore: 80,
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('hold');
            expect(rec.type).toBe('maintain');
            expect(rec.suggestedWeightKg).toBe(80);
            expect(rec.deltaWeightKg).toBe(0);
            expect(rec.isDeload).toBe(false);
            expect(rec.isOverload).toBe(false);
            expect(rec.shortBadgeText).toBe('Hold Form');
        });

        it('RPE = 9.4 with missed/collapsed reps holds weight (does NOT deload unless RPE >= 9.5 or readiness < 60)', () => {
            const input = createInput({
                lastSets: [set(80, 10, 8.5), set(80, 5, 9.2), set(80, 2, 9.4)], // 17 / 30 reps (collapse)
                readinessScore: 80,
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('hold');
            expect(rec.type).toBe('maintain');
            expect(rec.suggestedWeightKg).toBe(80);
            expect(rec.deltaWeightKg).toBe(0);
            expect(rec.isDeload).toBe(false);
            expect(rec.shortBadgeText).toBe('Hold 80kg');
            expect(rec.reason).toContain('Missed target reps');
        });

        it('RPE = 9.4 with low readiness (<60%) triggers fatigue deload', () => {
            const input = createInput({
                lastSets: [set(80, 10, 8.5), set(80, 10, 9.0), set(80, 10, 9.4)],
                readinessScore: 55,
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('deload');
            expect(rec.type).toBe('deload');
            expect(rec.suggestedWeightKg).toBe(72.5); // 80 * 0.9 = 72 -> round(72/2.5)*2.5 = 72.5
            expect(rec.isDeload).toBe(true);
        });

        it('RPE = 9.5 triggers -10% deload even when all reps were completed', () => {
            const input = createInput({
                lastSets: [set(80, 10, 8.5), set(80, 10, 9.0), set(80, 10, 9.5)],
                readinessScore: 80,
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('deload');
            expect(rec.type).toBe('deload');
            expect(rec.suggestedWeightKg).toBe(72.5);
            expect(rec.deltaWeightKg).toBe(-7.5);
            expect(rec.isDeload).toBe(true);
            expect(rec.isOverload).toBe(false);
            expect(rec.shortBadgeText).toBe('-10% Deload');
            expect(rec.reason).toContain('RPE 9.5');
        });

        it('RPE = 9.5 with collapsed reps provides collapsed-reps coach rationale', () => {
            const input = createInput({
                lastSets: [set(80, 10, 9.0), set(80, 5, 9.5), set(80, 2, 9.5)],
                readinessScore: 80,
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('deload');
            expect(rec.reason).toContain('Reps collapsed at maximal exertion (RPE 9.5)');
        });
    });

    describe('2. Exact Readiness Boundary Conditions', () => {
        it('readiness = 60 allows normal progression when sets and reps hit at RPE <= 8.0', () => {
            const input = createInput({
                readinessScore: 60,
                lastSets: [set(60, 10, 7.5), set(60, 10, 8.0), set(60, 10, 7.5)],
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('increase');
            expect(rec.suggestedWeightKg).toBe(62.5);
            expect(rec.deltaWeightKg).toBe(2.5);
            expect(rec.isOverload).toBe(true);
            expect(rec.isDeload).toBe(false);
        });

        it('readiness = 59 triggers Hold Recovery even when all reps were hit at RPE <= 8.0', () => {
            const input = createInput({
                readinessScore: 59,
                lastSets: [set(60, 10, 7.5), set(60, 10, 8.0), set(60, 10, 7.5)],
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('hold');
            expect(rec.type).toBe('maintain');
            expect(rec.suggestedWeightKg).toBe(60);
            expect(rec.deltaWeightKg).toBe(0);
            expect(rec.isOverload).toBe(false);
            expect(rec.isDeload).toBe(false);
            expect(rec.shortBadgeText).toBe('Hold Recovery');
            expect(rec.reason).toContain('59%');
            expect(rec.reason).toContain('recovery');
        });

        it('readiness = 40 maintains Hold Recovery (upper boundary of moderate deficit)', () => {
            const input = createInput({
                readinessScore: 40,
                lastSets: [set(60, 10, 7.5), set(60, 10, 8.0), set(60, 10, 7.5)],
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('hold');
            expect(rec.shortBadgeText).toBe('Hold Recovery');
            expect(rec.isDeload).toBe(false);
        });

        it('readiness = 39 triggers critical deload (-10% deload)', () => {
            const input = createInput({
                readinessScore: 39,
                lastSets: [set(60, 10, 7.5), set(60, 10, 8.0), set(60, 10, 7.5)],
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('deload');
            expect(rec.type).toBe('deload');
            expect(rec.suggestedWeightKg).toBe(55); // 60 * 0.9 = 54 -> roundToPlate(54, 2.5) = 55
            expect(rec.deltaWeightKg).toBe(-5);
            expect(rec.isDeload).toBe(true);
            expect(rec.shortBadgeText).toBe('-10% Deload');
            expect(rec.reason).toContain('Daily readiness is critically low (39%)');
        });
    });

    describe('3. Deload Floor Protection with Coarse Plate Steps', () => {
        it('drops 10kg to 7.5kg with 2.5kg plate step (overcomes 10% round-up)', () => {
            // 10 * 0.9 = 9.0; round(9.0 / 2.5) * 2.5 = 10.0 without floor protection
            const input = createInput({
                lastSets: [set(10, 10, 9.5)],
                customPlateStep: 2.5,
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('deload');
            expect(rec.suggestedWeightKg).toBe(7.5);
            expect(rec.deltaWeightKg).toBe(-2.5);
            expect(rec.suggestedWeightKg).toBeLessThan(10);
        });

        it('drops 7.5kg to 5.0kg with 2.5kg plate step (overcomes 10% round-up)', () => {
            // 7.5 * 0.9 = 6.75; round(6.75 / 2.5) * 2.5 = 7.5 without floor protection
            const input = createInput({
                lastSets: [set(7.5, 10, 9.5)],
                customPlateStep: 2.5,
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('deload');
            expect(rec.suggestedWeightKg).toBe(5.0);
            expect(rec.deltaWeightKg).toBe(-2.5);
            expect(rec.suggestedWeightKg).toBeLessThan(7.5);
        });

        it('drops 5.0kg to 2.5kg with 2.5kg plate step (overcomes 10% round-up)', () => {
            // 5.0 * 0.9 = 4.5; round(4.5 / 2.5) * 2.5 = 5.0 without floor protection
            const input = createInput({
                lastSets: [set(5.0, 10, 9.5)],
                customPlateStep: 2.5,
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('deload');
            expect(rec.suggestedWeightKg).toBe(2.5);
            expect(rec.deltaWeightKg).toBe(-2.5);
            expect(rec.suggestedWeightKg).toBeLessThan(5.0);
        });

        it('guarantees deload always reduces weight whenever topWeight > plateStep across random weights', () => {
            const plateSteps = [0.5, 1.0, 2.0, 2.5, 5.0];

            for (const step of plateSteps) {
                // Test multiples of step up to 100kg
                for (let w = step * 2; w <= 100; w += step) {
                    const input = createInput({
                        lastSets: [set(w, 10, 9.5)],
                        customPlateStep: step,
                    });
                    const rec = calculateProgressiveOverload(input);

                    expect(rec.action).toBe('deload');
                    expect(rec.suggestedWeightKg).toBeLessThan(w);
                    expect(rec.suggestedWeightKg).toBeGreaterThanOrEqual(0);
                    expect(rec.deltaWeightKg).toBeLessThan(0);
                    // Verify discrete plate step alignment
                    expect(rec.suggestedWeightKg % step).toBeCloseTo(0, 4);
                }
            }
        });

        it('handles boundary where topWeight <= plateStep without going below zero', () => {
            const input = createInput({
                lastSets: [set(2.5, 10, 9.5)],
                customPlateStep: 2.5,
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('deload');
            expect(rec.suggestedWeightKg).toBeGreaterThanOrEqual(0);
            expect(rec.suggestedWeightKg).toBeLessThanOrEqual(2.5);
        });
    });

    describe('4. Bodyweight Progressions (0kg working weight)', () => {
        it('triggers +1 rep progression (not weight increment) when target reps hit at RPE <= 8.0', () => {
            const input = createInput({
                targetReps: 10,
                targetSets: 3,
                muscle: 'Chest',
                lastSets: [set(0, 10, 7.5), set(0, 10, 8.0), set(0, 10, 7.0)],
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('increase');
            expect(rec.type).toBe('reps');
            expect(rec.suggestedWeightKg).toBe(0);
            expect(rec.suggestedReps).toBe(11);
            expect(rec.deltaWeightKg).toBe(0);
            expect(rec.deltaReps).toBe(1);
            expect(rec.isOverload).toBe(true);
            expect(rec.isDeload).toBe(false);
            expect(rec.shortBadgeText).toBe('+1 Rep');
            expect(rec.reason).toContain('bodyweight reps');
            expect(rec.reason).toContain('Step up to 11 reps today');
        });

        it('suggests rep deload (Math.round(targetReps * 0.9)) on maximal exertion', () => {
            const input = createInput({
                targetReps: 10,
                targetSets: 3,
                lastSets: [set(0, 10, 9.5), set(0, 10, 9.5), set(0, 10, 10.0)],
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('deload');
            expect(rec.type).toBe('deload');
            expect(rec.suggestedWeightKg).toBe(0);
            expect(rec.suggestedReps).toBe(9); // Math.round(10 * 0.9)
            expect(rec.deltaWeightKg).toBe(0);
            expect(rec.deltaReps).toBe(-1);
            expect(rec.isDeload).toBe(true);
            expect(rec.shortBadgeText).toBe('Deload Reps');
        });

        it('holds bodyweight reps when exertion is demanding (RPE 8.5)', () => {
            const input = createInput({
                targetReps: 12,
                targetSets: 3,
                lastSets: [set(0, 12, 8.5), set(0, 12, 8.5), set(0, 12, 8.5)],
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('hold');
            expect(rec.type).toBe('maintain');
            expect(rec.suggestedWeightKg).toBe(0);
            expect(rec.suggestedReps).toBe(12);
            expect(rec.shortBadgeText).toBe('Hold Form');
        });

        it('holds bodyweight reps with "Hold Reps" badge when reps are missed', () => {
            const input = createInput({
                targetReps: 12,
                targetSets: 3,
                lastSets: [set(0, 12, 8.0), set(0, 9, 8.5), set(0, 7, 9.0)],
            });
            const rec = calculateProgressiveOverload(input);

            expect(rec.action).toBe('hold');
            expect(rec.type).toBe('maintain');
            expect(rec.suggestedWeightKg).toBe(0);
            expect(rec.suggestedReps).toBe(12);
            expect(rec.shortBadgeText).toBe('Hold Reps');
        });
    });
});
