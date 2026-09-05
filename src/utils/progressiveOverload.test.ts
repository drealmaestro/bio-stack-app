import { describe, it, expect } from 'vitest';
import {
    roundToPlateIncrement,
    calculateProgressiveOverload,
    type SmartRecommendationInput,
    type SetPerformance,
    type TargetMuscle,
} from './progressiveOverload';

const set = (weight_kg: number, reps_completed: number, rpe?: number): SetPerformance => ({
    weight_kg, reps_completed, rpe,
});

const makeInput = (overrides?: Partial<SmartRecommendationInput>): SmartRecommendationInput => ({
    targetSets: 3,
    targetReps: 10,
    muscle: 'Chest',
    lastSets: [set(60, 10, 7.5), set(60, 10, 8.0), set(60, 10, 7.5)],
    readinessScore: 80,
    ...overrides,
});

describe('progressiveOverload Engine — Tier 1 Test Suite', () => {
    describe('roundToPlateIncrement', () => {
        it('rounds to standard 2.5kg barbell increments by default', () => {
            [[61.2, 60], [61.3, 62.5], [80.0, 80], [82.5, 82.5]].forEach(([w, exp]) => expect(roundToPlateIncrement(w)).toBe(exp));
        });
        it('rounds to custom 1.0kg increments for dumbbells and small increments', () => {
            [[23.4, 23], [23.6, 24], [14.0, 14]].forEach(([w, exp]) => expect(roundToPlateIncrement(w, 1.0)).toBe(exp));
        });
        it('handles fractional 0.5kg increments cleanly', () => {
            [[12.2, 12], [12.3, 12.5]].forEach(([w, exp]) => expect(roundToPlateIncrement(w, 0.5)).toBe(exp));
        });
        it('prevents floating-point artifacts (.000000000002)', () => {
            const result = roundToPlateIncrement(77.50000000000001, 2.5);
            expect(result).toBe(77.5);
            expect(Number.isInteger(result * 10)).toBe(true);
        });
        it('clamps zero and negative weights to 0', () => {
            [[0, 2.5], [-10, 2.5], [-0.5, 1.0]].forEach(([w, step]) => expect(roundToPlateIncrement(w, step)).toBe(0));
        });
    });

    describe('First-time exercise fallback (cold start)', () => {
        it('returns baseline action with target reps when lastSets is empty', () => {
            const rec = calculateProgressiveOverload(makeInput({ lastSets: [] }));
            expect({ action: rec.action, type: rec.type, w: rec.suggestedWeightKg, r: rec.suggestedReps, dW: rec.deltaWeightKg, dR: rec.deltaReps })
                .toEqual({ action: 'baseline', type: 'maintain', w: 0, r: 10, dW: 0, dR: 0 });
        });

        it('returns baseline action when all previous sets are 0kg and 0 reps', () => {
            const rec = calculateProgressiveOverload(makeInput({ lastSets: [set(0, 0), set(0, 0)] }));
            expect({ a: rec.action, w: rec.suggestedWeightKg }).toEqual({ a: 'baseline', w: 0 });
        });
        it('assigns low confidence and non-overload/non-deload flags on cold start', () => {
            const rec = calculateProgressiveOverload(makeInput({ lastSets: [] }));
            expect({ confidence: rec.confidence, isOverload: rec.isOverload, isDeload: rec.isDeload })
                .toEqual({ confidence: 'low', isOverload: false, isDeload: false });
        });
        it('provides an encouraging onboarding coach rationale and short badge', () => {
            const rec = calculateProgressiveOverload(makeInput({ lastSets: [], exerciseName: 'Overhead Press' }));
            expect(rec.shortBadgeText).toBe('Baseline');
            expect(rec.reason).toContain('Overhead Press');
            expect(rec.reason.length).toBeGreaterThan(15);
        });
        it('safely handles cold start even with low readiness score', () => {
            const rec = calculateProgressiveOverload(makeInput({ lastSets: [], readinessScore: 40 }));
            expect({ a: rec.action, r: rec.suggestedReps }).toEqual({ a: 'baseline', r: 10 });
        });
    });

    describe('Comfortable progression (overload triggers)', () => {
        it('suggests +5kg for Legs when target sets & reps hit at RPE <= 8.0', () => {
            const rec = calculateProgressiveOverload(makeInput({
                muscle: 'Legs', lastSets: [set(100, 10, 7.5), set(100, 10, 8.0), set(100, 10, 8.0)],
            }));
            expect({ action: rec.action, type: rec.type, w: rec.suggestedWeightKg, dW: rec.deltaWeightKg, overload: rec.isOverload, conf: rec.confidence })
                .toEqual({ action: 'increase', type: 'weight', w: 105, dW: 5, overload: true, conf: 'high' });
        });
        it('suggests +2.5kg for Chest/Back/Shoulders when target reps hit', () => {
            const rec = calculateProgressiveOverload(makeInput({ muscle: 'Chest', lastSets: [set(80, 10, 7), set(80, 10, 7.5), set(80, 10, 8)] }));
            expect({ a: rec.action, w: rec.suggestedWeightKg, dw: rec.deltaWeightKg }).toEqual({ a: 'increase', w: 82.5, dw: 2.5 });
        });
        it('suggests progression when RPE is unlogged but all reps completed', () => {
            const rec = calculateProgressiveOverload(makeInput({ muscle: 'Back', lastSets: [set(70, 10), set(70, 10), set(70, 10)] }));
            expect({ a: rec.action, w: rec.suggestedWeightKg, dw: rec.deltaWeightKg }).toEqual({ a: 'increase', w: 72.5, dw: 2.5 });
        });
        it('respects customWeightIncrement for dumbbells (e.g. +2.0kg on Biceps)', () => {
            const rec = calculateProgressiveOverload(makeInput({
                muscle: 'Biceps', customWeightIncrement: 2.0, customPlateStep: 1.0,
                lastSets: [set(14, 10, 7.5), set(14, 10, 7.5), set(14, 10, 8.0)],
            }));
            expect({ a: rec.action, w: rec.suggestedWeightKg, dw: rec.deltaWeightKg }).toEqual({ a: 'increase', w: 16, dw: 2 });
        });
        it('triggers repetition progression (+1 rep) for unweighted bodyweight exercises', () => {
            const rec = calculateProgressiveOverload(makeInput({
                muscle: 'Core', lastSets: [set(0, 10, 7), set(0, 10, 7), set(0, 10, 7.5)],
            }));
            expect({ action: rec.action, type: rec.type, w: rec.suggestedWeightKg, r: rec.suggestedReps, dR: rec.deltaReps, overload: rec.isOverload })
                .toEqual({ action: 'increase', type: 'reps', w: 0, r: 11, dR: 1, overload: true });
        });
        it('assigns high confidence on comfortable overload', () => {
            const rec = calculateProgressiveOverload(makeInput());
            expect({ conf: rec.confidence, b: rec.shortBadgeText }).toEqual({ conf: 'high', b: '+2.5kg' });
        });
    });

    describe('High fatigue and failure deload (RPE >= 9.5 / collapse)', () => {
        it('suggests a 10% deload when top set RPE >= 9.5', () => {
            const rec = calculateProgressiveOverload(makeInput({
                lastSets: [set(100, 10, 8), set(100, 10, 9), set(100, 10, 9.5)],
            }));
            expect({ action: rec.action, type: rec.type, w: rec.suggestedWeightKg, dW: rec.deltaWeightKg, deload: rec.isDeload, overload: rec.isOverload })
                .toEqual({ action: 'deload', type: 'deload', w: 90, dW: -10, deload: true, overload: false });
        });

        it('rounds 10% deload cleanly to nearest plate step (70kg -> 62.5kg)', () => {
            const rec = calculateProgressiveOverload(makeInput({
                lastSets: [set(70, 10, 9), set(70, 10, 9.5), set(70, 8, 10)],
            }));
            expect(rec.action).toBe('deload');
            expect(rec.suggestedWeightKg).toBe(62.5);
            expect(rec.deltaWeightKg).toBe(-7.5);
        });

        it('suggests deload when reps collapsed at maximal exertion (RPE 10)', () => {
            const rec = calculateProgressiveOverload(makeInput({
                lastSets: [set(80, 10, 9), set(80, 6, 10), set(80, 4, 10)],
            }));
            expect(rec.action).toBe('deload');
            expect(rec.suggestedWeightKg).toBeLessThan(80);
            expect(rec.isDeload).toBe(true);
        });

        it('never deloads below 0kg on light weights', () => {
            const rec = calculateProgressiveOverload(makeInput({
                lastSets: [set(2.5, 5, 10), set(2.5, 4, 10), set(2.5, 3, 10)],
            }));
            expect(rec.action).toBe('deload');
            expect(rec.suggestedWeightKg).toBeGreaterThanOrEqual(0);
        });

        it('cites high fatigue and RPE in coach rationale', () => {
            const rec = calculateProgressiveOverload(makeInput({ lastSets: [set(100, 10, 9.5)] }));
            expect(rec.reason).toMatch(/fatigue|RPE|deload|form/i);
            expect(rec.shortBadgeText).toContain('Deload');
        });
    });

    describe('Readiness deficit defense (<60% readiness)', () => {
        it('suppresses progression and holds weight when readiness is 40-59%', () => {
            const rec = calculateProgressiveOverload(makeInput({
                readinessScore: 52, lastSets: [set(60, 10, 7.5), set(60, 10, 7.5), set(60, 10, 8.0)],
            }));
            expect({ action: rec.action, w: rec.suggestedWeightKg, dW: rec.deltaWeightKg, overload: rec.isOverload })
                .toEqual({ action: 'hold', w: 60, dW: 0, overload: false });
        });

        it('triggers 10% deload when daily readiness is critically low (<40%)', () => {
            const rec = calculateProgressiveOverload(makeInput({
                readinessScore: 35, lastSets: [set(100, 10, 8.0), set(100, 10, 8.0), set(100, 10, 8.0)],
            }));
            expect(rec.action).toBe('deload');
            expect(rec.suggestedWeightKg).toBe(90);
            expect(rec.isDeload).toBe(true);
        });

        it('allows normal progression when readiness >= 60%', () => {
            const rec = calculateProgressiveOverload(makeInput({
                readinessScore: 75, lastSets: [set(80, 10, 7.5), set(80, 10, 8.0), set(80, 10, 7.5)],
            }));
            expect(rec.action).toBe('increase');
            expect(rec.suggestedWeightKg).toBe(82.5);
        });

        it('handles null or undefined readiness score gracefully', () => {
            const rec = calculateProgressiveOverload(makeInput({ readinessScore: null }));
            expect(rec.action).toBe('increase');
            expect(rec.suggestedWeightKg).toBe(62.5);
        });

        it('cites readiness score in coach rationale when suppressing progression', () => {
            const rec = calculateProgressiveOverload(makeInput({ readinessScore: 48 }));
            expect(rec.reason).toMatch(/readiness|recovery/i);
            expect(rec.shortBadgeText).toContain('Hold');
        });
    });

    describe('Incomplete reps and volume defense', () => {
        it('holds weight when target reps are missed on working sets', () => {
            const rec = calculateProgressiveOverload(makeInput({
                lastSets: [set(60, 10, 8), set(60, 9, 8.5), set(60, 8, 8.5)],
            }));
            expect({ action: rec.action, w: rec.suggestedWeightKg, dW: rec.deltaWeightKg, badge: rec.shortBadgeText })
                .toEqual({ action: 'hold', w: 60, dW: 0, badge: 'Hold 60kg' });
        });

        it('holds weight when fewer sets than prescribed were completed', () => {
            const rec = calculateProgressiveOverload(makeInput({
                targetSets: 4, lastSets: [set(60, 10, 7.5), set(60, 10, 8.0)],
            }));
            expect(rec.action).toBe('hold');
            expect(rec.suggestedWeightKg).toBe(60);
        });

        it('holds weight when reps were hit but effort was maximal (RPE 8.5 - 9.0)', () => {
            const rec = calculateProgressiveOverload(makeInput({
                lastSets: [set(60, 10, 8.5), set(60, 10, 9.0), set(60, 10, 9.0)],
            }));
            expect(rec.action).toBe('hold');
            expect(rec.suggestedWeightKg).toBe(60);
        });
    });

    describe('Floating-point safety and edge cases', () => {
        it('ignores negative weights in lastSets', () => {
            const rec = calculateProgressiveOverload(makeInput({ lastSets: [set(-20, 10), set(60, 10, 7.5), set(60, 10, 8.0)] }));
            expect(rec.suggestedWeightKg).toBeGreaterThanOrEqual(60);
        });
        it('handles out-of-order set numbers correctly', () => {
            const rec = calculateProgressiveOverload(makeInput({
                lastSets: [{ ...set(60, 10, 8), set_number: 3 }, { ...set(60, 10, 7), set_number: 1 }, { ...set(60, 10, 7.5), set_number: 2 }],
            }));
            expect(rec.action).toBe('increase');
            expect(rec.suggestedWeightKg).toBe(62.5);
        });
        it('handles zero target reps or zero target sets safely without throwing', () => {
            expect(() => calculateProgressiveOverload(makeInput({ targetReps: 0 }))).not.toThrow();
            expect(() => calculateProgressiveOverload(makeInput({ targetSets: 0 }))).not.toThrow();
        });
        it('never produces floating-point noise in suggestedWeightKg', () => {
            const rec = calculateProgressiveOverload(makeInput({ lastSets: [set(61.25, 10, 7), set(61.25, 10, 7), set(61.25, 10, 7.5)] }));
            expect((rec.suggestedWeightKg.toString().split('.')[1] || '').length).toBeLessThanOrEqual(2);
        });
        it('safely handles missing exerciseName or exerciseId', () => {
            const rec = calculateProgressiveOverload(makeInput({ exerciseId: undefined, exerciseName: undefined }));
            expect(rec.reason.length).toBeGreaterThan(10);
        });
    });

    describe('Coach rationale strings and badge texts', () => {
        it('generates concise shortBadgeText under 16 characters for mobile pills', () => {
            const overloadRec = calculateProgressiveOverload(makeInput());
            const holdRec = calculateProgressiveOverload(makeInput({
                lastSets: [set(60, 8, 8), set(60, 8, 8), set(60, 8, 8)],
            }));
            const deloadRec = calculateProgressiveOverload(makeInput({ lastSets: [set(60, 10, 9.5)] }));
            const baseRec = calculateProgressiveOverload(makeInput({ lastSets: [] }));

            expect(overloadRec.shortBadgeText.length).toBeLessThanOrEqual(16);
            expect(holdRec.shortBadgeText.length).toBeLessThanOrEqual(16);
            expect(deloadRec.shortBadgeText.length).toBeLessThanOrEqual(16);
            expect(baseRec.shortBadgeText.length).toBeLessThanOrEqual(16);
        });

        it('generates informative, actionable reason string (>15 chars)', () => {
            const rec = calculateProgressiveOverload(makeInput());
            expect(rec.reason.length).toBeGreaterThan(15);
        });

        it('never contains undefined, NaN, or [object Object] in reason text', () => {
            [
                calculateProgressiveOverload(makeInput()),
                calculateProgressiveOverload(makeInput({ lastSets: [] })),
                calculateProgressiveOverload(makeInput({ readinessScore: 40 })),
                calculateProgressiveOverload(makeInput({ lastSets: [set(50, 5, 10)] })),
            ].forEach(rec => {
                expect(rec.reason).not.toContain('undefined');
                expect(rec.reason).not.toContain('NaN');
                expect(rec.reason).not.toContain('[object Object]');
                expect(rec.reason).not.toContain('null');
            });
        });

        it('includes exercise name in rationale when provided', () => {
            const rec = calculateProgressiveOverload(makeInput({ exerciseName: 'Incline Dumbbell Press' }));
            expect(rec.reason).toContain('Incline Dumbbell Press');
        });
    });

    describe('M1 Iteration 2 Remediations', () => {
        it('safely handles null, undefined, and malformed inputs with baseline fallback', () => {
            const m: TargetMuscle = 'Chest';
            expect(calculateProgressiveOverload(null).action).toBe('baseline');
            expect(calculateProgressiveOverload(undefined).action).toBe('baseline');
            expect(calculateProgressiveOverload({} as SmartRecommendationInput).action).toBe('baseline');
            expect(calculateProgressiveOverload(makeInput({ muscle: m, lastSets: [] })).action).toBe('baseline');
        });

        it('rounds floating-point weights across all hold branches and enforces badge length <= 16', () => {
            const missed = calculateProgressiveOverload(makeInput({ lastSets: [set(61.23496995, 8, 8)] }));
            expect({ a: missed.action, w: missed.suggestedWeightKg, b: missed.shortBadgeText })
                .toEqual({ a: 'hold', w: 60, b: 'Hold 60kg' });
            expect(missed.shortBadgeText.length).toBeLessThanOrEqual(16);
            expect(missed.reason).not.toContain('61.23496995');

            const effort = calculateProgressiveOverload(makeInput({
                lastSets: [set(61.23496995, 10, 8.5), set(61.23496995, 10, 9.0), set(61.23496995, 10, 9.0)],
            }));
            expect({ a: effort.action, w: effort.suggestedWeightKg, b: effort.shortBadgeText })
                .toEqual({ a: 'hold', w: 60, b: 'Hold Form' });
            expect(effort.reason).not.toContain('61.23496995');

            const ready = calculateProgressiveOverload(makeInput({
                readinessScore: 50, lastSets: [set(61.23496995, 10, 7.5), set(61.23496995, 10, 7.5), set(61.23496995, 10, 7.5)],
            }));
            expect({ a: ready.action, w: ready.suggestedWeightKg, b: ready.shortBadgeText })
                .toEqual({ a: 'hold', w: 60, b: 'Hold Recovery' });
            expect(ready.reason).not.toContain('61.23496995');
        });

        it('enforces minimum plateStep floor when customWeightIncrement < plateStep / 2', () => {
            [
                { step: 5.0, inc: 1.0, top: 60, expW: 65, expDelta: 5.0, badge: '+5kg' },
                { step: 2.5, inc: 1.0, top: 80, expW: 82.5, expDelta: 2.5, badge: '+2.5kg' },
            ].forEach(({ step, inc, top, expW, expDelta, badge }) => {
                const rec = calculateProgressiveOverload(makeInput({
                    customPlateStep: step, customWeightIncrement: inc,
                    lastSets: [set(top, 10, 7.5), set(top, 10, 7.5), set(top, 10, 8.0)],
                }));
                expect({ a: rec.action, w: rec.suggestedWeightKg, dw: rec.deltaWeightKg, b: rec.shortBadgeText })
                    .toEqual({ a: 'increase', w: expW, dw: expDelta, b: badge });
            });
        });

        it('sanitizes unrounded floats on overload progression without precision noise', () => {
            const rec = calculateProgressiveOverload(makeInput({
                customPlateStep: 2.5, customWeightIncrement: 1.0,
                lastSets: [set(61.23496995, 10, 7), set(61.23496995, 10, 7.5), set(61.23496995, 10, 8)],
            }));
            expect({ a: rec.action, w: rec.suggestedWeightKg, dw: rec.deltaWeightKg, b: rec.shortBadgeText })
                .toEqual({ a: 'increase', w: 62.5, dw: 2.5, b: '+2.5kg' });
            expect(rec.reason).not.toContain('61.23496995');
        });
    });
});
