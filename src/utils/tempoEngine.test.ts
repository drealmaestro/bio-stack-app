import { describe, it, expect } from 'vitest';
import {
    parseTempo,
    calculateTut,
    getPhaseActionLabel,
    getPhaseColor,
    getPhaseDuration,
    getNextActivePhase,
    type TempoPhase,
} from './tempoEngine';

describe('tempoEngine utility', () => {
    describe('parseTempo', () => {
        it('parses standard 4-digit catalog tempos accurately', () => {
            const cases = [
                { input: '3-0-1-0', ecc: 3, str: 0, con: 1, peak: 0, total: 4 },
                { input: '2-0-1-1', ecc: 2, str: 0, con: 1, peak: 1, total: 4 },
                { input: '3-1-1-0', ecc: 3, str: 1, con: 1, peak: 0, total: 5 },
                { input: '3-0-1-1', ecc: 3, str: 0, con: 1, peak: 1, total: 5 },
                { input: '2-0-1-2', ecc: 2, str: 0, con: 1, peak: 2, total: 5 },
                { input: '2-1-1-0', ecc: 2, str: 1, con: 1, peak: 0, total: 4 },
                { input: '3-1-1-2', ecc: 3, str: 1, con: 1, peak: 2, total: 7 },
                { input: '2-1-1-2', ecc: 2, str: 1, con: 1, peak: 2, total: 6 },
            ];

            cases.forEach(({ input, ecc, str, con, peak, total }) => {
                const parsed = parseTempo(input);
                expect(parsed.eccentric).toBe(ecc);
                expect(parsed.stretch).toBe(str);
                expect(parsed.concentric).toBe(con);
                expect(parsed.peak).toBe(peak);
                expect(parsed.totalSecondsPerRep).toBe(total);
                expect(parsed.isStatic).toBe(false);
                expect(parsed.isControlled).toBe(false);
                expect(parsed.displayString).toBe(input);
            });
        });

        it('parses explosive X/x concentric cadence as 1 second', () => {
            const parsedUpper = parseTempo('3-0-X-0');
            expect(parsedUpper.concentric).toBe(1);
            expect(parsedUpper.totalSecondsPerRep).toBe(4);
            expect(parsedUpper.displayString).toBe('3-0-X-0');

            const parsedLower = parseTempo('3-1-x-0');
            expect(parsedLower.concentric).toBe(1);
            expect(parsedLower.totalSecondsPerRep).toBe(5);
            expect(parsedLower.displayString).toBe('3-1-X-0');
        });

        it('parses Static holds with zero dynamic phases and duration in peak', () => {
            const staticDefault = parseTempo('Static');
            expect(staticDefault.isStatic).toBe(true);
            expect(staticDefault.eccentric).toBe(0);
            expect(staticDefault.stretch).toBe(0);
            expect(staticDefault.concentric).toBe(0);
            expect(staticDefault.peak).toBe(30);
            expect(staticDefault.totalSecondsPerRep).toBe(30);
            expect(staticDefault.displayString).toBe('Static');

            const static45 = parseTempo('Static 45s');
            expect(static45.isStatic).toBe(true);
            expect(static45.peak).toBe(45);
            expect(static45.totalSecondsPerRep).toBe(45);

            const customDefault = parseTempo('Static', 60);
            expect(customDefault.peak).toBe(60);
        });

        it('parses Controlled tempo defaulting to standard hypertrophy 3-0-1-0', () => {
            const parsed = parseTempo('Controlled');
            expect(parsed.isControlled).toBe(true);
            expect(parsed.isStatic).toBe(false);
            expect(parsed.eccentric).toBe(3);
            expect(parsed.stretch).toBe(0);
            expect(parsed.concentric).toBe(1);
            expect(parsed.peak).toBe(0);
            expect(parsed.totalSecondsPerRep).toBe(4);
        });

        it('safely falls back to 3-0-1-0 on invalid, empty or malformed inputs', () => {
            const invalidCases = ['', '   ', 'invalid', '1-2', '1-2-3-4-5', '-1-0-1-0', 'a-b-c-d', '0-0-0-0', undefined];
            invalidCases.forEach(input => {
                const parsed = parseTempo(input);
                expect(parsed.eccentric).toBe(3);
                expect(parsed.stretch).toBe(0);
                expect(parsed.concentric).toBe(1);
                expect(parsed.peak).toBe(0);
                expect(parsed.totalSecondsPerRep).toBe(4);
                expect(parsed.isStatic).toBe(false);
            });
        });

        it('safely falls back to 3-0-1-0 when total cadence duration is zero (e.g. 0-0-0-0)', () => {
            const parsed = parseTempo('0-0-0-0');
            expect(parsed.eccentric).toBe(3);
            expect(parsed.stretch).toBe(0);
            expect(parsed.concentric).toBe(1);
            expect(parsed.peak).toBe(0);
            expect(parsed.totalSecondsPerRep).toBe(4);
            expect(parsed.displayString).toBe('3-0-1-0');
            expect(parsed.isStatic).toBe(false);
            expect(parsed.isControlled).toBe(false);
        });

        it('safely handles non-positive or invalid default static hold duration', () => {
            const parsedZero = parseTempo('Static', 0);
            expect(parsedZero.peak).toBe(30);
            expect(parsedZero.totalSecondsPerRep).toBe(30);

            const parsedNegative = parseTempo('Static', -10);
            expect(parsedNegative.peak).toBe(30);

            const parsedNaN = parseTempo('Static', NaN);
            expect(parsedNaN.peak).toBe(30);
        });
    });

    describe('calculateTut', () => {
        it('calculates total time under tension for rep-based sets', () => {
            expect(calculateTut('3-0-1-0', 10)).toBe(40);
            expect(calculateTut('3-1-1-2', 8)).toBe(56);
            expect(calculateTut('3-0-X-0', 12)).toBe(48);
            expect(calculateTut('Controlled', 10)).toBe(40);
        });

        it('calculates TUT for static holds accurately', () => {
            expect(calculateTut('Static', 1)).toBe(30);
            expect(calculateTut('Static 45s', 1)).toBe(45);
            expect(calculateTut('Static', 2)).toBe(60);
        });

        it('returns 0 for zero or negative reps or non-numeric reps', () => {
            expect(calculateTut('3-0-1-0', 0)).toBe(0);
            expect(calculateTut('3-0-1-0', -5)).toBe(0);
            expect(calculateTut('Static', 0)).toBe(0);
            expect(calculateTut('Static', NaN)).toBe(0);
        });
    });

    describe('getPhaseActionLabel', () => {
        it('returns push verbs for push exercises', () => {
            const pushMuscles = ['Chest', 'Shoulders', 'Legs', 'Triceps'];
            pushMuscles.forEach(muscle => {
                expect(getPhaseActionLabel('eccentric', muscle)).toBe('Lowering down');
                expect(getPhaseActionLabel('stretch', muscle)).toBe('Bottom pause');
                expect(getPhaseActionLabel('concentric', muscle)).toBe('Pushing / Driving up');
                expect(getPhaseActionLabel('peak', muscle)).toBe('Reset at top');
            });
        });

        it('returns pull verbs for pull exercises', () => {
            const pullMuscles = ['Back', 'Biceps'];
            pullMuscles.forEach(muscle => {
                expect(getPhaseActionLabel('eccentric', muscle)).toBe('Releasing / Lowering');
                expect(getPhaseActionLabel('stretch', muscle)).toBe('Full stretch');
                expect(getPhaseActionLabel('concentric', muscle)).toBe('Pulling / Curling up');
                expect(getPhaseActionLabel('peak', muscle)).toBe('Peak squeeze');
            });
        });

        it('defaults to push verbs for unspecified or other muscle groups', () => {
            expect(getPhaseActionLabel('eccentric')).toBe('Lowering down');
            expect(getPhaseActionLabel('concentric', 'Core')).toBe('Pushing / Driving up');
            expect(getPhaseActionLabel('peak', 'Forearms')).toBe('Reset at top');
        });
    });

    describe('getPhaseColor', () => {
        it('returns visual tokens with text, bg, stroke and glow for all phases', () => {
            const phases: TempoPhase[] = ['eccentric', 'stretch', 'concentric', 'peak'];
            phases.forEach(phase => {
                const color = getPhaseColor(phase);
                expect(color.text).toContain('text-');
                expect(color.bg).toContain('bg-');
                expect(color.stroke).toMatch(/^#/);
                expect(color.glow).toContain('rgba');
            });

            expect(getPhaseColor('concentric').stroke).toBe('#3ccf94');
            expect(getPhaseColor('eccentric').stroke).toBe('#38bdf8');
            expect(getPhaseColor('stretch').stroke).toBe('#f59e0b');
            expect(getPhaseColor('peak').stroke).toBe('#a855f7');
        });
    });

    describe('phase navigation helpers for metronome', () => {
        it('retrieves phase duration accurately', () => {
            const parsed = parseTempo('3-1-1-2');
            expect(getPhaseDuration(parsed, 'eccentric')).toBe(3);
            expect(getPhaseDuration(parsed, 'stretch')).toBe(1);
            expect(getPhaseDuration(parsed, 'concentric')).toBe(1);
            expect(getPhaseDuration(parsed, 'peak')).toBe(2);
        });

        it('skips 0-second phases and tracks rep boundaries in getNextActivePhase', () => {
            const parsed = parseTempo('3-0-1-0'); // stretch=0, peak=0
            const step1 = getNextActivePhase('eccentric', parsed);
            expect(step1).toEqual({ phase: 'concentric', isNewRep: false });

            const step2 = getNextActivePhase('concentric', parsed);
            expect(step2).toEqual({ phase: 'eccentric', isNewRep: true });

            const staticHold = parseTempo('Static');
            expect(getNextActivePhase('peak', staticHold)).toEqual({ phase: 'peak', isNewRep: false });
        });
    });
});
