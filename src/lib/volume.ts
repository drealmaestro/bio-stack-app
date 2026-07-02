import type { Exercise, TargetMuscle, WorkoutLog } from '../types';

export interface MuscleVolumeTarget {
    min: number;
    max: number;
}

/**
 * Weekly hard-set targets for hypertrophy (intermediate lifter).
 * Ordered goal-first: chest and arms lead because that's the user's priority.
 */
export const WEEKLY_SET_TARGETS: Partial<Record<TargetMuscle, MuscleVolumeTarget>> = {
    Chest: { min: 12, max: 16 },
    Triceps: { min: 10, max: 14 },
    Biceps: { min: 10, max: 14 },
    Back: { min: 10, max: 16 },
    Shoulders: { min: 8, max: 12 },
    Legs: { min: 10, max: 16 },
    Core: { min: 4, max: 8 },
};

const DISPLAY_ORDER: TargetMuscle[] = ['Chest', 'Triceps', 'Biceps', 'Back', 'Shoulders', 'Legs', 'Core'];

export interface MuscleVolumeRow {
    muscle: TargetMuscle;
    sets: number;
    target: MuscleVolumeTarget;
    status: 'low' | 'on' | 'high';
}

/** Monday 00:00 of the training week containing `date` (program runs Mon–Sat, Sunday rests). */
export function getTrainingWeekStart(date: Date): Date {
    const start = new Date(date);
    start.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    start.setHours(0, 0, 0, 0);
    return start;
}

/** Hard sets per muscle logged in the 7 days from `weekStart`, vs. hypertrophy target bands. */
export function weeklyMuscleVolume(
    logs: WorkoutLog[],
    exercises: Exercise[],
    weekStart: Date
): MuscleVolumeRow[] {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const muscleByExercise = new Map(exercises.map(e => [e.id, e.target_muscle]));
    const counts: Partial<Record<TargetMuscle, number>> = {};

    logs.forEach(log => {
        const ts = new Date(log.timestamp);
        if (ts < weekStart || ts >= weekEnd) return;
        log.completed_exercises.forEach(set => {
            if (set.reps_completed <= 0) return;
            const muscle = muscleByExercise.get(set.exercise_id);
            if (!muscle) return;
            counts[muscle] = (counts[muscle] ?? 0) + 1;
        });
    });

    return DISPLAY_ORDER.map(muscle => {
        const target = WEEKLY_SET_TARGETS[muscle]!;
        const sets = counts[muscle] ?? 0;
        const status: MuscleVolumeRow['status'] =
            sets < target.min ? 'low' : sets > target.max ? 'high' : 'on';
        return { muscle, sets, target, status };
    });
}
