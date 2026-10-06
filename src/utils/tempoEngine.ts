export type TempoPhase = 'eccentric' | 'stretch' | 'concentric' | 'peak';

export interface ParsedTempo {
    eccentric: number;
    stretch: number;
    concentric: number;
    peak: number;
    totalSecondsPerRep: number;
    isStatic: boolean;
    isControlled: boolean;
    displayString: string;
}

export interface PhaseVisualConfig {
    text: string;
    bg: string;
    stroke: string;
    glow: string;
}

export const PHASE_SEQUENCE: readonly TempoPhase[] = ['eccentric', 'stretch', 'concentric', 'peak'] as const;

export const DEFAULT_FALLBACK_TEMPO: ParsedTempo = {
    eccentric: 3,
    stretch: 0,
    concentric: 1,
    peak: 0,
    totalSecondsPerRep: 4,
    isStatic: false,
    isControlled: false,
    displayString: '3-0-1-0',
};

export const DEFAULT_STATIC_SECONDS = 30;

const PULL_MUSCLES = new Set(['back', 'biceps']);

const PHASE_COLORS: Record<TempoPhase, PhaseVisualConfig> = {
    eccentric: {
        text: 'text-sky-400',
        bg: 'bg-sky-500/15',
        stroke: '#38bdf8',
        glow: 'rgba(56, 189, 248, 0.4)',
    },
    stretch: {
        text: 'text-amber-400',
        bg: 'bg-amber-500/15',
        stroke: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.4)',
    },
    concentric: {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/15',
        stroke: '#3ccf94',
        glow: 'rgba(60, 207, 148, 0.4)',
    },
    peak: {
        text: 'text-purple-400',
        bg: 'bg-purple-500/15',
        stroke: '#a855f7',
        glow: 'rgba(168, 85, 247, 0.4)',
    },
};

const DEFAULT_COLOR: PhaseVisualConfig = {
    text: 'text-zinc-400',
    bg: 'bg-zinc-500/15',
    stroke: '#71717a',
    glow: 'rgba(113, 113, 122, 0.3)',
};

export function parseTempo(tempo?: string, defaultStaticDuration = DEFAULT_STATIC_SECONDS): ParsedTempo {
    if (!tempo || typeof tempo !== 'string') {
        return { ...DEFAULT_FALLBACK_TEMPO };
    }

    const trimmed = tempo.trim();
    if (!trimmed) {
        return { ...DEFAULT_FALLBACK_TEMPO };
    }

    const lower = trimmed.toLowerCase();

    // Check for Static holds (e.g. 'Static', 'Static 45s', 'Static (30s)')
    if (lower.startsWith('static')) {
        const durationMatch = trimmed.match(/\d+/);
        const fallbackStatic = Math.max(1, Number.isFinite(defaultStaticDuration) && defaultStaticDuration > 0 ? defaultStaticDuration : DEFAULT_STATIC_SECONDS);
        const duration = durationMatch ? Math.max(1, parseInt(durationMatch[0], 10)) : fallbackStatic;
        return {
            eccentric: 0,
            stretch: 0,
            concentric: 0,
            peak: duration,
            totalSecondsPerRep: duration,
            isStatic: true,
            isControlled: false,
            displayString: trimmed,
        };
    }

    // Check for 'Controlled' tempo (default to 3-0-1-0 hypertrophy cadence)
    if (lower === 'controlled') {
        return {
            eccentric: 3,
            stretch: 0,
            concentric: 1,
            peak: 0,
            totalSecondsPerRep: 4,
            isStatic: false,
            isControlled: true,
            displayString: trimmed,
        };
    }

    const parts = trimmed.split('-').map(p => p.trim());
    if (parts.length !== 4) {
        return { ...DEFAULT_FALLBACK_TEMPO };
    }

    const parsePhaseValue = (raw: string): number | null => {
        if (raw.toUpperCase() === 'X') return 1;
        const val = Number(raw);
        if (!Number.isFinite(val) || val < 0 || Math.floor(val) !== val) return null;
        return val;
    };

    const eccentric = parsePhaseValue(parts[0]);
    const stretch = parsePhaseValue(parts[1]);
    const concentric = parsePhaseValue(parts[2]);
    const peak = parsePhaseValue(parts[3]);

    if (eccentric === null || stretch === null || concentric === null || peak === null) {
        return { ...DEFAULT_FALLBACK_TEMPO };
    }

    const displayParts = [
        eccentric.toString(),
        stretch.toString(),
        parts[2].toUpperCase() === 'X' ? 'X' : concentric.toString(),
        peak.toString(),
    ];

    const totalSecondsPerRep = eccentric + stretch + concentric + peak;
    if (totalSecondsPerRep <= 0) {
        return { ...DEFAULT_FALLBACK_TEMPO };
    }

    return {
        eccentric,
        stretch,
        concentric,
        peak,
        totalSecondsPerRep,
        isStatic: false,
        isControlled: false,
        displayString: displayParts.join('-'),
    };
}

export function calculateTut(tempo: string, reps: number): number {
    if (!reps || reps <= 0 || !Number.isFinite(reps)) return 0;
    const parsed = parseTempo(tempo);
    return Math.round(parsed.totalSecondsPerRep * reps);
}

export function getPhaseActionLabel(phase: TempoPhase, targetMuscle?: string): string {
    const muscle = targetMuscle?.trim().toLowerCase() || '';
    const isPull = PULL_MUSCLES.has(muscle);

    if (isPull) {
        switch (phase) {
            case 'eccentric': return 'Releasing / Lowering';
            case 'stretch': return 'Full stretch';
            case 'concentric': return 'Pulling / Curling up';
            case 'peak': return 'Peak squeeze';
        }
    }

    switch (phase) {
        case 'eccentric': return 'Lowering down';
        case 'stretch': return 'Bottom pause';
        case 'concentric': return 'Pushing / Driving up';
        case 'peak': return 'Reset at top';
    }

    return 'Action';
}

export function getPhaseColor(phase: TempoPhase): PhaseVisualConfig {
    return PHASE_COLORS[phase] || DEFAULT_COLOR;
}

export function getPhaseDuration(tempo: ParsedTempo, phase: TempoPhase): number {
    switch (phase) {
        case 'eccentric': return tempo.eccentric;
        case 'stretch': return tempo.stretch;
        case 'concentric': return tempo.concentric;
        case 'peak': return tempo.peak;
        default: return 0;
    }
}

export function getNextActivePhase(
    currentPhase: TempoPhase,
    tempo: ParsedTempo
): { phase: TempoPhase; isNewRep: boolean } {
    if (tempo.isStatic) {
        return { phase: 'peak', isNewRep: false };
    }
    const idx = PHASE_SEQUENCE.indexOf(currentPhase);
    for (let step = 1; step <= 4; step++) {
        const nextIdx = (idx + step) % 4;
        const candidate = PHASE_SEQUENCE[nextIdx];
        const isNewRep = nextIdx <= idx;
        if (getPhaseDuration(tempo, candidate) > 0) {
            return { phase: candidate, isNewRep };
        }
    }
    return { phase: 'eccentric', isNewRep: true };
}
