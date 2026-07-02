import type { TargetMuscle } from '../types';

export interface ProgressionInput {
    targetSets: number;
    targetReps: number;
    /** Sets logged for this exercise in the most recent session of the same template */
    lastSets: { weight_kg: number; reps_completed: number; rpe?: number }[];
    muscle: TargetMuscle;
}

export interface ProgressionSuggestion {
    weightKg: number;
    action: 'increase' | 'hold' | 'deload';
    reason: string;
}

const LOWER_BODY_INCREMENT = 5;
const UPPER_BODY_INCREMENT = 2.5;

function roundToHalf(value: number): number {
    return Math.round(value * 2) / 2;
}

/**
 * Double progression: master the prescribed sets × reps at a weight (at RPE ≤ ~8.5),
 * then add a small increment. Miss reps → repeat. Collapse at max effort → deload.
 * Returns null when there is no weighted history to base a suggestion on.
 */
export function suggestNextWeight(input: ProgressionInput): ProgressionSuggestion | null {
    const { targetSets, targetReps, lastSets, muscle } = input;

    const workingSets = lastSets.filter(s => s.weight_kg > 0);
    if (workingSets.length === 0) return null;

    const topWeight = Math.max(...workingSets.map(s => s.weight_kg));
    const topSets = workingSets.filter(s => s.weight_kg === topWeight);
    const increment = muscle === 'Legs' ? LOWER_BODY_INCREMENT : UPPER_BODY_INCREMENT;

    const rpes = topSets.map(s => s.rpe).filter((r): r is number => typeof r === 'number' && r > 0);
    const maxRpe = rpes.length ? Math.max(...rpes) : undefined;

    const allSetsDone = topSets.length >= targetSets;
    const allRepsHit = allSetsDone && topSets.every(s => s.reps_completed >= targetReps);
    const totalReps = topSets.reduce((sum, s) => sum + s.reps_completed, 0);
    const repsCollapsed = totalReps < 0.7 * targetSets * targetReps;

    if (allRepsHit && (maxRpe === undefined || maxRpe <= 8.5)) {
        return {
            weightKg: roundToHalf(topWeight + increment),
            action: 'increase',
            reason: `You owned ${targetSets}×${targetReps} at ${topWeight}kg last time — add ${increment}kg and grow.`,
        };
    }

    if (repsCollapsed && maxRpe !== undefined && maxRpe >= 9.5) {
        return {
            weightKg: Math.max(roundToHalf(topWeight - increment), 0),
            action: 'deload',
            reason: `Reps collapsed at RPE ${maxRpe} — drop ${increment}kg, rebuild with clean form.`,
        };
    }

    return {
        weightKg: topWeight,
        action: 'hold',
        reason: allRepsHit
            ? `Reps were there but effort was maximal — repeat ${topWeight}kg and make it smoother.`
            : `Chase ${targetSets}×${targetReps} at ${topWeight}kg before adding weight.`,
    };
}
