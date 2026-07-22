export interface WarmUpSet {
    percentage: number;
    weight: number;
    reps: number;
    label?: string;
}

/**
 * Calculates estimated 1-Rep Max (1RM) using Epley or Brzycki formulas.
 * @param weight Weight lifted in kg
 * @param reps Number of repetitions completed
 * @param formula 'epley' (default) or 'brzycki'
 * @returns Estimated 1RM rounded to 1 decimal place
 */
export function calculate1RM(
    weight: number,
    reps: number,
    formula: 'epley' | 'brzycki' = 'epley'
): number {
    if (weight <= 0 || reps <= 0) return 0;
    if (reps === 1) return weight;

    let result: number;
    if (formula === 'brzycki') {
        if (reps >= 37) return weight;
        result = weight * (36 / (37 - reps));
    } else {
        // Epley formula: weight * (1 + reps / 30)
        result = weight * (1 + reps / 30);
    }

    return Math.round(result * 10) / 10;
}

/**
 * Calculates standard warm-up set progression for a given working weight.
 * Standard progression:
 * - 50% x 10 reps (Light Warm-Up)
 * - 70% x 6 reps (Moderate Warm-Up)
 * - 85% x 3 reps (Heavy Primer)
 * 
 * @param workingWeight Target working weight in kg
 * @returns Array of WarmUpSet objects
 */
export function calculateWarmUpSets(workingWeight: number): WarmUpSet[] {
    if (workingWeight <= 0) return [];

    const scheme = [
        { percentage: 50, reps: 10, label: 'Light Warm-Up' },
        { percentage: 70, reps: 6, label: 'Moderate Warm-Up' },
        { percentage: 85, reps: 3, label: 'Heavy Primer' },
    ];

    return scheme.map(item => ({
        percentage: item.percentage,
        weight: Math.round(workingWeight * (item.percentage / 100) * 10) / 10,
        reps: item.reps,
        label: item.label,
    }));
}
