export interface ReadinessEvaluation {
    score: number; // 0 - 100
    level: 'Prime' | 'Optimal' | 'Moderate' | 'Recovery';
    label: string;
    badgeColor: string;
    textColor: string;
    summary: string;
    metrics: {
        sleepStatus: string;
        sleepPct: number;
        hydrationStatus: string;
        hydrationPct: number;
        trainingStatus: string;
    };
}

export interface ReadinessInput {
    sleepMinutes: number;
    targetSleepMinutes?: number;
    waterMl: number;
    targetWaterMl?: number;
    isRestDay?: boolean;
    activeMinutesToday?: number;
}

/**
 * Calculates authentic daily readiness based on logged sleep duration,
 * hydration level, and scheduled training vs rest protocol.
 * Zero fabricated or hallucinated biometric noise.
 */
export function calculateDailyReadiness({
    sleepMinutes,
    targetSleepMinutes = 420, // 7 hours
    waterMl,
    targetWaterMl = 2000,    // 2 Liters
    isRestDay = false,
    activeMinutesToday = 0,
}: ReadinessInput): ReadinessEvaluation {
    const safeSleepTarget = Math.max(1, targetSleepMinutes);
    const safeWaterTarget = Math.max(1, targetWaterMl);

    const hasSleepLogged = sleepMinutes > 0;
    const sleepRatio = hasSleepLogged ? Math.min(sleepMinutes / safeSleepTarget, 1.25) : 0.6;
    const waterRatio = Math.min(waterMl / safeWaterTarget, 1.25);

    // Sleep component (55% weight)
    const sleepScore = Math.min(100, Math.round(sleepRatio * 100));

    // Hydration component (35% weight)
    const hydrationScore = Math.min(100, Math.round(waterRatio * 100));

    // Schedule / protocol adherence bonus (10% weight)
    const protocolScore = isRestDay
        ? 90
        : (activeMinutesToday >= 30 ? 100 : activeMinutesToday > 0 ? 80 : 70);

    const rawScore = Math.round(
        (sleepScore * 0.55) + (hydrationScore * 0.35) + (protocolScore * 0.10)
    );
    const score = Math.max(15, Math.min(100, rawScore));

    let level: ReadinessEvaluation['level'];
    let label: string;
    let badgeColor: string;
    let textColor: string;
    let summary: string;

    if (score >= 85) {
        level = 'Prime';
        label = 'Prime Conditioning';
        badgeColor = 'bg-primary/10 border-primary/25';
        textColor = 'text-primary';
        summary = 'Peak recovery state. Nervous system and tissue repair fully primed for high-effort output.';
    } else if (score >= 70) {
        level = 'Optimal';
        label = 'Optimal Readiness';
        badgeColor = 'bg-sky-400/10 border-sky-400/25';
        textColor = 'text-sky-400';
        summary = 'Solid recovery baseline. Ready for the scheduled protocol with proper warmup.';
    } else if (score >= 50) {
        level = 'Moderate';
        label = 'Moderate Recovery';
        badgeColor = 'bg-amber-400/10 border-amber-400/25';
        textColor = 'text-amber-400';
        summary = 'Adequate readiness. Hydrate with +500ml and focus on clean movement execution.';
    } else {
        level = 'Recovery';
        label = 'Recovery Priority';
        badgeColor = 'bg-red-400/10 border-red-400/25';
        textColor = 'text-red-400';
        summary = 'Rest deficit detected. Prioritize hydration bumps, high protein, and earlier bedtime.';
    }

    const sleepHrs = Math.floor(sleepMinutes / 60);
    const sleepMins = sleepMinutes % 60;
    const sleepStatus = hasSleepLogged
        ? `${sleepHrs}h ${sleepMins > 0 ? `${sleepMins}m` : ''} logged (${Math.round(sleepRatio * 100)}% target)`
        : 'Sleep not logged yet';

    const hydrationStatus = `${waterMl} / ${safeWaterTarget} ml (${Math.round(waterRatio * 100)}%)`;

    const trainingStatus = isRestDay
        ? 'Active Recovery Day'
        : (activeMinutesToday > 0 ? `${activeMinutesToday}m active completed` : 'Target Session Pending');

    return {
        score,
        level,
        label,
        badgeColor,
        textColor,
        summary,
        metrics: {
            sleepStatus,
            sleepPct: Math.round(sleepRatio * 100),
            hydrationStatus,
            hydrationPct: Math.round(waterRatio * 100),
            trainingStatus,
        }
    };
}
