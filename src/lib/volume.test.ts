import { describe, it, expect } from 'vitest';
import { weeklyMuscleVolume, getTrainingWeekStart, WEEKLY_SET_TARGETS } from './volume';
import type { Exercise, WorkoutLog } from '../types';

const EXERCISES: Exercise[] = [
    { id: 'bench', name: 'Bench', target_muscle: 'Chest', instructions: '' },
    { id: 'curl', name: 'Curl', target_muscle: 'Biceps', instructions: '' },
    { id: 'squat', name: 'Squat', target_muscle: 'Legs', instructions: '' },
];

function makeLog(timestamp: string, sets: { exercise_id: string; reps: number; weight?: number }[]): WorkoutLog {
    return {
        id: `log-${timestamp}`,
        template_id: 'tmpl',
        timestamp,
        duration_seconds: 3600,
        completed_exercises: sets.map((s, i) => ({
            exercise_id: s.exercise_id,
            set_number: i + 1,
            reps_completed: s.reps,
            weight_kg: s.weight ?? 50,
        })),
    };
}

describe('getTrainingWeekStart', () => {
    it('returns Monday 00:00 for a mid-week date', () => {
        const start = getTrainingWeekStart(new Date('2026-07-02T15:30:00')); // Thursday
        expect(start.getDay()).toBe(1); // Monday
        expect(start.getHours()).toBe(0);
        expect(start.getDate()).toBe(29); // Mon June 29
    });

    it('returns the same day for a Monday', () => {
        const start = getTrainingWeekStart(new Date('2026-06-29T09:00:00'));
        expect(start.getDate()).toBe(29);
    });

    it('maps Sunday to the preceding Monday', () => {
        const start = getTrainingWeekStart(new Date('2026-07-05T09:00:00')); // Sunday
        expect(start.getDate()).toBe(29);
    });
});

describe('weeklyMuscleVolume', () => {
    const weekStart = getTrainingWeekStart(new Date('2026-07-02T12:00:00'));

    it('counts sets inside the training week and ignores those outside', () => {
        const logs = [
            makeLog('2026-06-29T10:00:00.000Z', [ // in week
                { exercise_id: 'bench', reps: 8 },
                { exercise_id: 'bench', reps: 8 },
            ]),
            makeLog('2026-06-20T10:00:00.000Z', [ // previous week
                { exercise_id: 'bench', reps: 8 },
            ]),
        ];
        const rows = weeklyMuscleVolume(logs, EXERCISES, weekStart);
        expect(rows.find(r => r.muscle === 'Chest')!.sets).toBe(2);
    });

    it('ignores zero-rep sets and unknown exercises', () => {
        const logs = [
            makeLog('2026-06-30T10:00:00.000Z', [
                { exercise_id: 'curl', reps: 0 },
                { exercise_id: 'curl', reps: 12 },
                { exercise_id: 'ghost_exercise', reps: 12 },
            ]),
        ];
        const rows = weeklyMuscleVolume(logs, EXERCISES, weekStart);
        expect(rows.find(r => r.muscle === 'Biceps')!.sets).toBe(1);
    });

    it('counts bodyweight (0kg) sets with reps as hard sets', () => {
        const logs = [
            makeLog('2026-06-30T10:00:00.000Z', [{ exercise_id: 'squat', reps: 10, weight: 0 }]),
        ];
        const rows = weeklyMuscleVolume(logs, EXERCISES, weekStart);
        expect(rows.find(r => r.muscle === 'Legs')!.sets).toBe(1);
    });

    it('flags status low / on / high against the target band', () => {
        const chestTarget = WEEKLY_SET_TARGETS.Chest!;
        const inBand = Array.from({ length: chestTarget.min }, () => ({ exercise_id: 'bench', reps: 8 }));
        const logs = [makeLog('2026-07-01T10:00:00.000Z', inBand)];
        const rows = weeklyMuscleVolume(logs, EXERCISES, weekStart);
        expect(rows.find(r => r.muscle === 'Chest')!.status).toBe('on');
        expect(rows.find(r => r.muscle === 'Biceps')!.status).toBe('low');

        const overBand = Array.from({ length: chestTarget.max + 5 }, () => ({ exercise_id: 'bench', reps: 8 }));
        const rows2 = weeklyMuscleVolume([makeLog('2026-07-01T10:00:00.000Z', overBand)], EXERCISES, weekStart);
        expect(rows2.find(r => r.muscle === 'Chest')!.status).toBe('high');
    });

    it('returns rows in a stable, goal-first display order', () => {
        const rows = weeklyMuscleVolume([], EXERCISES, weekStart);
        expect(rows.map(r => r.muscle)).toEqual(['Chest', 'Triceps', 'Biceps', 'Back', 'Shoulders', 'Legs', 'Core']);
    });
});
