import type { TargetMuscle } from '../types';
export type { TargetMuscle };

export type ProgressionAction = 'increase' | 'hold' | 'deload' | 'baseline';
export type ProgressionType = 'weight' | 'reps' | 'maintain' | 'deload';

export interface SetPerformance {
    weight_kg: number;
    reps_completed: number;
    rpe?: number;
    set_number?: number;
}

export interface SmartRecommendationInput {
    exerciseId?: string;
    exerciseName?: string;
    targetSets: number;
    targetReps: number;
    muscle: TargetMuscle;
    lastSets: SetPerformance[];
    readinessScore?: number | null;
    customPlateStep?: number;
    customWeightIncrement?: number;
}

export interface SmartRecommendation {
    action: ProgressionAction;
    type: ProgressionType;
    suggestedWeightKg: number;
    suggestedReps: number;
    deltaWeightKg: number;
    deltaReps: number;
    reason: string;
    shortBadgeText: string;
    confidence: 'high' | 'moderate' | 'low';
    isDeload: boolean;
    isOverload: boolean;
    historicalTopWeight: number;
    historicalMaxRpe?: number;
    readinessScore?: number;
}

/**
 * Rounds a weight to the nearest equipment plate increment.
 * Strips IEEE 754 precision artifacts (e.g. 62.50000000000001).
 */
export function roundToPlateIncrement(weight: number, plateStep: number = 2.5): number {
    if (typeof weight !== 'number' || !isFinite(weight) || weight <= 0) {
        return 0;
    }
    const step = typeof plateStep === 'number' && isFinite(plateStep) && plateStep > 0 ? plateStep : 2.5;
    const rounded = Math.round(weight / step) * step;
    return Math.round(rounded * 10000) / 10000;
}

/**
 * Calculates progressive overload recommendation based on historical set logs,
 * RPE exertion, realistic plate rounding, and physiological readiness.
 */
export function calculateProgressiveOverload(input?: SmartRecommendationInput | null): SmartRecommendation {
    const safeInput = (input && typeof input === 'object') ? input : ({} as SmartRecommendationInput);
    const {
        exerciseName,
        targetSets,
        targetReps,
        muscle,
        lastSets = [],
        readinessScore,
        customPlateStep,
        customWeightIncrement,
    } = safeInput;

    const safeTargetSets = Math.max(1, typeof targetSets === 'number' && isFinite(targetSets) && targetSets > 0 ? targetSets : 3);
    const safeTargetReps = Math.max(1, typeof targetReps === 'number' && isFinite(targetReps) && targetReps > 0 ? targetReps : 8);

    const validReadiness = typeof readinessScore === 'number' && isFinite(readinessScore) ? readinessScore : undefined;

    // Filter valid non-negative sets
    const validSets = (lastSets || []).filter(
        (s): s is SetPerformance =>
            Boolean(s) &&
            typeof s.weight_kg === 'number' &&
            isFinite(s.weight_kg) &&
            s.weight_kg >= 0 &&
            typeof s.reps_completed === 'number' &&
            isFinite(s.reps_completed) &&
            s.reps_completed >= 0
    );

    const meaningfulSets = validSets.filter(s => s.weight_kg > 0 || s.reps_completed > 0);

    // Fallback: No prior performance history or only zero-weight/rep placeholders
    if (meaningfulSets.length === 0) {
        return {
            action: 'baseline',
            type: 'maintain',
            suggestedWeightKg: 0,
            suggestedReps: safeTargetReps,
            deltaWeightKg: 0,
            deltaReps: 0,
            reason: exerciseName
                ? `First session logging ${exerciseName}! Start with warm-ups to establish your working baseline.`
                : 'First session for this exercise! Start with warm-ups to establish your working baseline.',
            shortBadgeText: 'Baseline',
            confidence: 'low',
            isDeload: false,
            isOverload: false,
            historicalTopWeight: 0,
            readinessScore: validReadiness,
        };
    }

    const sortedSets = [...meaningfulSets].sort((a, b) => (a.set_number ?? 0) - (b.set_number ?? 0));
    const isCompound = muscle === 'Legs' || muscle === 'Chest' || muscle === 'Back';
    const plateStep = typeof customPlateStep === 'number' && isFinite(customPlateStep) && customPlateStep > 0
        ? customPlateStep
        : (isCompound ? 2.5 : 1.0);

    const weightIncrement = typeof customWeightIncrement === 'number' && isFinite(customWeightIncrement) && customWeightIncrement > 0
        ? customWeightIncrement
        : (muscle === 'Legs' ? 5.0 : 2.5);

    const isPureBodyweight = sortedSets.every(s => s.weight_kg === 0);
    const topWeight = isPureBodyweight ? 0 : Math.max(...sortedSets.map(s => s.weight_kg));
    const safeTopWeight = roundToPlateIncrement(topWeight, plateStep);
    const topSets = sortedSets.filter(s => s.weight_kg === topWeight);

    const rpes = topSets
        .map(s => s.rpe)
        .filter((r): r is number => typeof r === 'number' && isFinite(r) && r > 0);
    const maxRpe = rpes.length > 0 ? Math.max(...rpes) : undefined;

    const confidence: 'high' | 'moderate' | 'low' =
        rpes.length >= safeTargetSets ? 'high' : (sortedSets.length > 1 ? 'moderate' : 'low');

    const totalReps = topSets.reduce((sum, s) => sum + s.reps_completed, 0);
    const targetTotalReps = safeTargetSets * safeTargetReps;
    const allSetsDone = topSets.length >= safeTargetSets;
    const allRepsHit = allSetsDone && topSets.slice(0, safeTargetSets).every(s => s.reps_completed >= safeTargetReps);
    const repsCollapsed = totalReps < 0.7 * targetTotalReps;

    const hasCriticallyLowReadiness = validReadiness !== undefined && validReadiness < 40;
    const hasModerateLowReadiness = validReadiness !== undefined && validReadiness >= 40 && validReadiness < 60;

    const isDeloadTriggered =
        hasCriticallyLowReadiness ||
        (maxRpe !== undefined && maxRpe >= 9.5) ||
        (validReadiness !== undefined && validReadiness < 60 && maxRpe !== undefined && maxRpe >= 9.0);

    // 1. Fatigue & Recovery Deload
    if (isDeloadTriggered) {
        if (isPureBodyweight) {
            const deloadReps = Math.max(1, Math.round(safeTargetReps * 0.9));
            const deltaReps = deloadReps - safeTargetReps;
            const reason = hasCriticallyLowReadiness
                ? `Daily readiness is critically low (${validReadiness}%). Reduce to ${deloadReps} reps for active recovery.`
                : (maxRpe !== undefined && maxRpe >= 9.5
                    ? `High exertion detected (RPE ${maxRpe}). Reduce to ${deloadReps} reps to recover form.`
                    : `Fatigue elevated. Reduce to ${deloadReps} reps to consolidate form.`);

            return {
                action: 'deload',
                type: 'deload',
                suggestedWeightKg: 0,
                suggestedReps: deloadReps,
                deltaWeightKg: 0,
                deltaReps,
                reason,
                shortBadgeText: 'Deload Reps',
                confidence,
                isDeload: true,
                isOverload: false,
                historicalTopWeight: 0,
                historicalMaxRpe: maxRpe,
                readinessScore: validReadiness,
            };
        }

        let deloadWeight = roundToPlateIncrement(safeTopWeight * 0.9, plateStep);
        if (deloadWeight >= safeTopWeight && safeTopWeight > plateStep) {
            deloadWeight = roundToPlateIncrement(safeTopWeight - plateStep, plateStep);
        }
        deloadWeight = Math.max(0, deloadWeight);
        const delta = Number((deloadWeight - safeTopWeight).toFixed(2));

        let reason = '';
        if (hasCriticallyLowReadiness) {
            reason = `Daily readiness is critically low (${validReadiness}%). A 10% deload to ${deloadWeight}kg promotes recovery.`;
        } else if (maxRpe !== undefined && maxRpe >= 9.5) {
            reason = repsCollapsed
                ? `Reps collapsed at maximal exertion (RPE ${maxRpe}). Deload to ${deloadWeight}kg to restore capacity.`
                : `Peak exertion reached (RPE ${maxRpe}). Deload to ${deloadWeight}kg to relieve fatigue and protect form.`;
        } else {
            reason = `Fatigue elevated with reduced readiness (${validReadiness}%). Deload 10% to ${deloadWeight}kg.`;
        }

        return {
            action: 'deload',
            type: 'deload',
            suggestedWeightKg: deloadWeight,
            suggestedReps: safeTargetReps,
            deltaWeightKg: delta,
            deltaReps: 0,
            reason,
            shortBadgeText: '-10% Deload',
            confidence,
            isDeload: true,
            isOverload: false,
            historicalTopWeight: safeTopWeight,
            historicalMaxRpe: maxRpe,
            readinessScore: validReadiness,
        };
    }

    // 2. Readiness Deficit Defense (40-59% Readiness Hold)
    if (hasModerateLowReadiness) {
        const holdWeightStr = isPureBodyweight ? 'bodyweight' : `${safeTopWeight}kg`;
        const reason = `Daily readiness is moderate (${validReadiness}%). Hold ${holdWeightStr} today for recovery and avoid overreaching.`;
        return {
            action: 'hold',
            type: 'maintain',
            suggestedWeightKg: safeTopWeight,
            suggestedReps: safeTargetReps,
            deltaWeightKg: 0,
            deltaReps: 0,
            reason,
            shortBadgeText: 'Hold Recovery',
            confidence,
            isDeload: false,
            isOverload: false,
            historicalTopWeight: safeTopWeight,
            historicalMaxRpe: maxRpe,
            readinessScore: validReadiness,
        };
    }

    // 3. Progressive Overload
    if (allRepsHit && (maxRpe === undefined || maxRpe <= 8.0)) {
        if (isPureBodyweight) {
            const addedReps = 1;
            const newTargetReps = safeTargetReps + addedReps;
            const exStr = exerciseName ? ` on ${exerciseName}` : '';
            const rpeStr = maxRpe !== undefined ? ` at RPE ${maxRpe}` : '';
            const reason = `Mastered all ${safeTargetSets}×${safeTargetReps} bodyweight reps${rpeStr}${exStr}! Step up to ${newTargetReps} reps today.`;

            return {
                action: 'increase',
                type: 'reps',
                suggestedWeightKg: 0,
                suggestedReps: newTargetReps,
                deltaWeightKg: 0,
                deltaReps: addedReps,
                reason,
                shortBadgeText: `+${addedReps} Rep`,
                confidence,
                isDeload: false,
                isOverload: true,
                historicalTopWeight: 0,
                historicalMaxRpe: maxRpe,
                readinessScore: validReadiness,
            };
        }

        const minNextWeight = roundToPlateIncrement(safeTopWeight + plateStep, plateStep);
        const targetNextWeight = roundToPlateIncrement(safeTopWeight + weightIncrement, plateStep);
        const nextWeight = Math.max(minNextWeight, targetNextWeight);
        const delta = Number((nextWeight - safeTopWeight).toFixed(2));
        const exStr = exerciseName ? ` on ${exerciseName}` : '';
        const rpeStr = maxRpe !== undefined ? ` (RPE ${maxRpe})` : '';
        const reason = `Conquered ${safeTargetSets}×${safeTargetReps} at ${safeTopWeight}kg${rpeStr}${exStr}! Step up +${delta}kg to ${nextWeight}kg.`;

        return {
            action: 'increase',
            type: 'weight',
            suggestedWeightKg: nextWeight,
            suggestedReps: safeTargetReps,
            deltaWeightKg: delta,
            deltaReps: 0,
            reason,
            shortBadgeText: `+${delta}kg`,
            confidence,
            isDeload: false,
            isOverload: true,
            historicalTopWeight: safeTopWeight,
            historicalMaxRpe: maxRpe,
            readinessScore: validReadiness,
        };
    }

    // 4. Form Solidification / Effort Demanding Hold
    if (allRepsHit) {
        const exStr = exerciseName ? ` on ${exerciseName}` : '';
        const rpeStr = maxRpe !== undefined ? ` (RPE ${maxRpe})` : '';
        const targetStr = isPureBodyweight ? `${safeTargetReps} reps` : `${safeTopWeight}kg`;
        return {
            action: 'hold',
            type: 'maintain',
            suggestedWeightKg: safeTopWeight,
            suggestedReps: safeTargetReps,
            deltaWeightKg: 0,
            deltaReps: 0,
            reason: `Hit target reps${rpeStr}${exStr}, but effort was demanding. Repeat ${targetStr} to solidify form.`,
            shortBadgeText: 'Hold Form',
            confidence,
            isDeload: false,
            isOverload: false,
            historicalTopWeight: safeTopWeight,
            historicalMaxRpe: maxRpe,
            readinessScore: validReadiness,
        };
    }

    // 5. Missed Reps or Incomplete Sets Hold
    const exStr = exerciseName ? ` on ${exerciseName}` : '';
    const weightDesc = isPureBodyweight ? 'bodyweight' : `${safeTopWeight}kg`;
    const missedReason = !allSetsDone
        ? `Logged ${topSets.length}/${safeTargetSets} sets at ${weightDesc}${exStr}. Complete all prescribed sets before adding weight.`
        : `Missed target reps at ${weightDesc}${exStr}. Hold weight and conquer ${safeTargetSets}×${safeTargetReps} before progressing.`;

    const badge = isPureBodyweight ? 'Hold Reps' : `Hold ${safeTopWeight}kg`;
    const shortBadgeText = badge.length <= 16 ? badge : 'Hold Weight';

    return {
        action: 'hold',
        type: 'maintain',
        suggestedWeightKg: safeTopWeight,
        suggestedReps: safeTargetReps,
        deltaWeightKg: 0,
        deltaReps: 0,
        reason: missedReason,
        shortBadgeText,
        confidence,
        isDeload: false,
        isOverload: false,
        historicalTopWeight: safeTopWeight,
        historicalMaxRpe: maxRpe,
        readinessScore: validReadiness,
    };
}
