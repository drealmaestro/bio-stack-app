/**
 * Exponential Moving Average (EMA) calculation for 1RM and volume load series.
 * Formula: EMA_0 = dataPoints[0], EMA_t = alpha * dataPoints[t] + (1 - alpha) * EMA_{t-1}
 *
 * @param dataPoints Numerical values series
 * @param alpha Smoothing factor between 0 and 1 (default: 0.3)
 * @returns Array of EMA smoothed values rounded to 1 decimal place
 */
export function calculateEMA(dataPoints: number[], alpha: number = 0.3): number[] {
    if (!dataPoints || dataPoints.length === 0) return [];
    
    const validAlpha = Math.max(0, Math.min(1, alpha));
    const ema: number[] = [dataPoints[0]];

    for (let i = 1; i < dataPoints.length; i++) {
        const prevEMA = ema[i - 1];
        const currentVal = dataPoints[i];
        const nextEMA = validAlpha * currentVal + (1 - validAlpha) * prevEMA;
        ema.push(Math.round(nextEMA * 10) / 10);
    }

    return ema;
}

/**
 * Calculates push/pull ratio, balance score (0-100), and balance status.
 *
 * @param volumeByGroup Map of muscle group name to set count or volume load
 * @returns Object with pushPullRatio, balanceScore (0-100), and status string
 */
export function calculateMuscleBalance(volumeByGroup: Record<string, number>): {
    pushPullRatio: number;
    balanceScore: number;
    status: string;
} {
    let pushVol = 0;
    let pullVol = 0;
    let legsVol = 0;

    Object.entries(volumeByGroup).forEach(([group, vol]) => {
        const lower = group.toLowerCase();
        if (['chest', 'shoulders', 'triceps', 'push'].some(k => lower.includes(k))) {
            pushVol += vol;
        } else if (['back', 'biceps', 'lats', 'traps', 'pull'].some(k => lower.includes(k))) {
            pullVol += vol;
        } else if (['legs', 'quads', 'hamstrings', 'calves', 'glutes'].some(k => lower.includes(k))) {
            legsVol += vol;
        }
    });

    const totalVol = pushVol + pullVol + legsVol;
    if (totalVol === 0) {
        return { pushPullRatio: 1.0, balanceScore: 100, status: 'Balanced' };
    }

    const pushPullRatio = pullVol > 0
        ? Math.round((pushVol / pullVol) * 100) / 100
        : (pushVol > 0 ? 2.0 : 1.0);

    const ratioDeviation = Math.abs(1.0 - pushPullRatio);
    let balanceScore = Math.max(0, Math.min(100, Math.round(100 - ratioDeviation * 50)));

    // Apply minor penalty if legs volume is completely unworked
    if (legsVol === 0 && (pushVol > 0 || pullVol > 0)) {
        balanceScore = Math.max(0, balanceScore - 20);
    }

    let status = 'Optimal Balance';
    if (pushPullRatio > 1.25) {
        status = 'Push Dominant';
    } else if (pushPullRatio < 0.8) {
        status = 'Pull Dominant';
    }

    return { pushPullRatio, balanceScore, status };
}

/**
 * Calculates rest compliance percentage and average actual rest time.
 *
 * @param completedRestSeconds Array of recorded rest durations in seconds
 * @param targetRestSeconds Prescribed target rest time in seconds
 * @returns Object with compliancePct (0-100) and averageRestSec
 */
export function calculateRestCompliance(
    completedRestSeconds: number[],
    targetRestSeconds: number
): { compliancePct: number; averageRestSec: number } {
    if (!completedRestSeconds || completedRestSeconds.length === 0) {
        return { compliancePct: 100, averageRestSec: 0 };
    }

    const totalSec = completedRestSeconds.reduce((sum, s) => sum + s, 0);
    const averageRestSec = Math.round((totalSec / completedRestSeconds.length) * 10) / 10;

    if (targetRestSeconds <= 0) {
        return { compliancePct: 100, averageRestSec };
    }

    const totalCompliance = completedRestSeconds.reduce((acc, currentSec) => {
        const diff = Math.abs(currentSec - targetRestSeconds);
        const itemPct = Math.max(0, 100 - (diff / targetRestSeconds) * 100);
        return acc + itemPct;
    }, 0);

    const compliancePct = Math.round(totalCompliance / completedRestSeconds.length);

    return { compliancePct, averageRestSec };
}
