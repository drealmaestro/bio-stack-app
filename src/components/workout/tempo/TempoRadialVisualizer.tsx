import { useMemo } from 'react';
import type { TempoPhase, ParsedTempo } from '../../../utils/tempoEngine';
import { getPhaseActionLabel, getPhaseColor } from '../../../utils/tempoEngine';

export interface TempoRadialVisualizerProps {
  currentPhase: TempoPhase;
  phaseElapsedMs: number;
  phaseDurationMs: number;
  phaseProgress: number;
  repProgress: number;
  currentRep: number;
  targetReps: number;
  totalTutSeconds: number;
  parsedTempo: ParsedTempo;
  targetMuscle?: string;
  size?: number;
}

const PHASE_KEYS: TempoPhase[] = ['eccentric', 'stretch', 'concentric', 'peak'];

export function TempoRadialVisualizer({
  currentPhase,
  phaseElapsedMs,
  phaseDurationMs,
  phaseProgress,
  currentRep,
  targetReps,
  totalTutSeconds,
  parsedTempo,
  targetMuscle,
  size = 220,
}: TempoRadialVisualizerProps) {
  const r = 85;
  const c = 2 * Math.PI * r;
  const safeSize = Number.isFinite(size) && size > 0 ? size : 220;

  const rawTotalSec = parsedTempo?.totalSecondsPerRep;
  const totalRepSec = Number.isFinite(rawTotalSec) && rawTotalSec > 0 ? rawTotalSec : 1;

  const arcSegments = useMemo(() => {
    let accumulatedAngle = -90;
    return PHASE_KEYS.map((p) => {
      const rawDur =
        p === 'eccentric' ? parsedTempo?.eccentric :
        p === 'stretch' ? parsedTempo?.stretch :
        p === 'concentric' ? parsedTempo?.concentric : parsedTempo?.peak;

      const durSec = Number.isFinite(rawDur) && rawDur > 0 ? rawDur : 0;
      const pct = totalRepSec > 0 ? durSec / totalRepSec : 0;
      const arcLen = pct * c;
      const startAngle = accumulatedAngle;
      accumulatedAngle += pct * 360;

      const safeArcLen = Number.isFinite(arcLen) ? Math.max(0, arcLen) : 0;
      const safeRemainingArc = Math.max(0, c - safeArcLen);
      const dashOffset = -((startAngle + 90) / 360) * c;

      return {
        phase: p,
        durSec,
        arcLen: safeArcLen,
        strokeDasharray: `${safeArcLen} ${safeRemainingArc}`,
        strokeDashoffset: Number.isFinite(dashOffset) ? dashOffset : 0,
        color: getPhaseColor(p),
      };
    });
  }, [c, parsedTempo, totalRepSec]);

  const safeDurationMs = Number.isFinite(phaseDurationMs) ? phaseDurationMs : 0;
  const safeElapsedMs = Number.isFinite(phaseElapsedMs) ? phaseElapsedMs : 0;
  const remainingSeconds = Math.max(
    1,
    Math.ceil(Math.max(0, safeDurationMs - safeElapsedMs) / 1000)
  );

  const actionVerb = getPhaseActionLabel(currentPhase, targetMuscle);
  const activeColor = getPhaseColor(currentPhase);

  const safeProgress = Number.isFinite(phaseProgress) ? Math.min(1, Math.max(0, phaseProgress)) : 0;
  const activeSweepOffset = c - safeProgress * c;
  const safeSweepOffset = Number.isFinite(activeSweepOffset) ? activeSweepOffset : c;

  const safeCurrentRep = Number.isFinite(currentRep) && currentRep > 0 ? currentRep : 1;
  const safeTargetReps = Number.isFinite(targetReps) && targetReps >= 0 ? targetReps : 0;
  const safeTutSeconds = Number.isFinite(totalTutSeconds) && totalTutSeconds >= 0 ? totalTutSeconds : 0;

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none"
      style={{ width: safeSize, height: safeSize }}
    >
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-20 transition-colors duration-500 pointer-events-none"
        style={{ backgroundColor: activeColor.glow }}
      />

      <svg width={safeSize} height={safeSize} viewBox="0 0 220 220" className="transform -rotate-90">
        <circle cx="110" cy="110" r={r} fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="12" />

        {arcSegments.map((arc) =>
          arc.durSec > 0 ? (
            <circle
              key={arc.phase}
              cx="110"
              cy="110"
              r={r}
              fill="none"
              stroke={arc.color.stroke}
              strokeWidth="6"
              strokeDasharray={arc.strokeDasharray}
              strokeDashoffset={arc.strokeDashoffset}
              strokeLinecap="round"
              className="opacity-40 transition-opacity duration-300"
            />
          ) : null
        )}

        <circle
          cx="110"
          cy="110"
          r={r}
          fill="none"
          stroke={activeColor.stroke}
          strokeWidth="10"
          strokeDasharray={c}
          strokeDashoffset={safeSweepOffset}
          strokeLinecap="round"
          className="transition-all duration-75 ease-linear"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
        <span
          className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all duration-300"
          style={{
            color: activeColor.text,
            backgroundColor: activeColor.bg,
            borderColor: activeColor.stroke,
          }}
        >
          {actionVerb}
        </span>

        <div className="text-5xl font-mono font-black text-white tracking-tight my-0.5 drop-shadow-md">
          {remainingSeconds}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
          <span className="text-white font-extrabold">Rep {safeCurrentRep}</span>
          <span className="text-zinc-600">/</span>
          <span>{safeTargetReps}</span>
        </div>

        <div className="text-[10px] font-mono font-semibold text-zinc-500 mt-1">
          TUT: <span className="text-primary font-bold">{safeTutSeconds}s</span>
        </div>
      </div>
    </div>
  );
}
