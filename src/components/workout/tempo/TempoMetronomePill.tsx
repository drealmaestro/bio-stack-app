import { Activity } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface TempoMetronomePillProps {
  tempo?: string;
  exerciseName?: string;
  isRunning?: boolean;
  onClick: () => void;
  className?: string;
}

export function TempoMetronomePill({
  tempo = '3-0-1-0',
  isRunning = false,
  onClick,
  className,
}: TempoMetronomePillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-full border text-[11px] font-bold transition-all tap-active cursor-pointer",
        isRunning
          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 ring-1 ring-emerald-500/20"
          : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white",
        className
      )}
      aria-label={`Open live tempo coach for cadence ${tempo}`}
    >
      <Activity
        className={cn(
          "w-3.5 h-3.5 text-primary shrink-0",
          isRunning && "animate-pulse text-emerald-400"
        )}
      />
      <span className="font-mono tracking-tight font-black">{tempo}</span>
      <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-primary/10 text-primary scale-95 border border-primary/20">
        Pacer
      </span>
    </button>
  );
}
