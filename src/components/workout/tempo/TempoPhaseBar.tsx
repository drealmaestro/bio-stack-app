import type { TempoPhase, ParsedTempo } from '../../../utils/tempoEngine';
import { getPhaseColor } from '../../../utils/tempoEngine';
import { cn } from '../../../lib/utils';

export interface TempoPhaseBarProps {
  currentPhase: TempoPhase;
  phaseProgress: number;
  parsedTempo: ParsedTempo;
  className?: string;
}

const PHASES: { phase: TempoPhase; label: string }[] = [
  { phase: 'eccentric', label: 'ECC' },
  { phase: 'stretch', label: 'HOLD' },
  { phase: 'concentric', label: 'CON' },
  { phase: 'peak', label: 'TOP' },
];

export function TempoPhaseBar({
  currentPhase,
  phaseProgress,
  parsedTempo,
  className,
}: TempoPhaseBarProps) {
  return (
    <div className={cn("grid grid-cols-4 gap-2 w-full", className)}>
      {PHASES.map(({ phase, label }) => {
        const durSec =
          phase === 'eccentric' ? parsedTempo.eccentric :
          phase === 'stretch' ? parsedTempo.stretch :
          phase === 'concentric' ? parsedTempo.concentric : parsedTempo.peak;

        const isActive = currentPhase === phase;
        const color = getPhaseColor(phase);
        const isZero = durSec === 0;

        return (
          <div
            key={phase}
            className={cn(
              "relative overflow-hidden rounded-xl border p-2 text-center transition-all",
              isActive
                ? "bg-black/60 border-white/20 shadow-lg ring-1 ring-white/10"
                : isZero
                ? "bg-zinc-950/40 border-white/5 opacity-40"
                : "bg-black/30 border-white/5 text-zinc-500"
            )}
          >
            {isActive && !isZero && (
              <div
                className="absolute inset-y-0 left-0 transition-all duration-75 ease-linear opacity-25"
                style={{
                  width: `${Math.round(phaseProgress * 100)}%`,
                  backgroundColor: color.stroke,
                }}
              />
            )}

            <div className="relative z-10 flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                {label}
              </span>
              <span
                className={cn(
                  "text-xs font-mono font-black mt-0.5",
                  isActive ? "text-white" : "text-zinc-500"
                )}
                style={isActive ? { color: color.text } : undefined}
              >
                {durSec}s
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
