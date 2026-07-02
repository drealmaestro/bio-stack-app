import { describe, it, expect } from 'vitest';
import { suggestNextWeight } from './progression';

const set = (weight_kg: number, reps_completed: number, rpe?: number) => ({ weight_kg, reps_completed, rpe });

describe('suggestNextWeight — double progression', () => {
    it('returns null with no previous sets (first session)', () => {
        expect(suggestNextWeight({ targetSets: 4, targetReps: 8, lastSets: [], muscle: 'Chest' })).toBeNull();
    });

    it('returns null when all previous sets are bodyweight/zero (e.g. plank)', () => {
        const lastSets = [set(0, 1), set(0, 1), set(0, 1)];
        expect(suggestNextWeight({ targetSets: 3, targetReps: 1, lastSets, muscle: 'Core' })).toBeNull();
    });

    it('suggests +2.5kg upper body when all sets hit target reps with no RPE logged', () => {
        const lastSets = [set(60, 8), set(60, 8), set(60, 8), set(60, 8)];
        const s = suggestNextWeight({ targetSets: 4, targetReps: 8, lastSets, muscle: 'Chest' });
        expect(s).toEqual(expect.objectContaining({ weightKg: 62.5, action: 'increase' }));
    });

    it('suggests +5kg for legs when all sets hit target reps', () => {
        const lastSets = [set(100, 8), set(100, 8), set(100, 8), set(100, 8)];
        const s = suggestNextWeight({ targetSets: 4, targetReps: 8, lastSets, muscle: 'Legs' });
        expect(s).toEqual(expect.objectContaining({ weightKg: 105, action: 'increase' }));
    });

    it('holds the weight when reps were hit but top-set RPE was 9.5+', () => {
        const lastSets = [set(60, 8, 8), set(60, 8, 9), set(60, 8, 9.5), set(60, 8, 10)];
        const s = suggestNextWeight({ targetSets: 4, targetReps: 8, lastSets, muscle: 'Chest' });
        expect(s).toEqual(expect.objectContaining({ weightKg: 60, action: 'hold' }));
    });

    it('holds the weight when reps were slightly missed', () => {
        const lastSets = [set(60, 8), set(60, 8), set(60, 7), set(60, 6)];
        const s = suggestNextWeight({ targetSets: 4, targetReps: 8, lastSets, muscle: 'Chest' });
        expect(s).toEqual(expect.objectContaining({ weightKg: 60, action: 'hold' }));
    });

    it('holds when fewer sets than prescribed were done at the top weight', () => {
        const lastSets = [set(55, 8), set(60, 8), set(60, 8)];
        const s = suggestNextWeight({ targetSets: 4, targetReps: 8, lastSets, muscle: 'Chest' });
        expect(s).toEqual(expect.objectContaining({ weightKg: 60, action: 'hold' }));
    });

    it('suggests a deload when reps collapsed at maximal RPE', () => {
        const lastSets = [set(60, 5, 10), set(60, 4, 10), set(60, 4, 10), set(60, 3, 10)];
        const s = suggestNextWeight({ targetSets: 4, targetReps: 8, lastSets, muscle: 'Chest' });
        expect(s).toEqual(expect.objectContaining({ weightKg: 57.5, action: 'deload' }));
    });

    it('rounds increased weight to the nearest 0.5kg', () => {
        const lastSets = [set(61.2, 12), set(61.2, 12), set(61.2, 12)];
        const s = suggestNextWeight({ targetSets: 3, targetReps: 12, lastSets, muscle: 'Biceps' });
        expect(s!.weightKg).toBe(63.5);
        expect(s!.action).toBe('increase');
    });

    it('never suggests below 0 on deload', () => {
        const lastSets = [set(2, 3, 10), set(2, 2, 10), set(2, 2, 10)];
        const s = suggestNextWeight({ targetSets: 3, targetReps: 12, lastSets, muscle: 'Shoulders' });
        expect(s!.weightKg).toBeGreaterThanOrEqual(0);
    });

    it('exposes a human-readable reason', () => {
        const lastSets = [set(60, 8), set(60, 8), set(60, 8), set(60, 8)];
        const s = suggestNextWeight({ targetSets: 4, targetReps: 8, lastSets, muscle: 'Chest' });
        expect(s!.reason.length).toBeGreaterThan(10);
    });
});
