import { useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useRepTempoMetronome } from '../../../hooks/useRepTempoMetronome';
import { useRestTimer } from '../../../hooks/useRestTimer';
import { TempoRadialVisualizer } from './TempoRadialVisualizer';
import { TempoPhaseBar } from './TempoPhaseBar';
import { cn } from '../../../lib/utils';

export interface LiveTempoMetronomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  tempo?: string;
  targetReps?: number;
  targetMuscle?: string;
  onRepsUpdate?: (reps: number) => void;
}

export function LiveTempoMetronomeModal({
  isOpen,
  onClose,
  exerciseName,
  tempo,
  targetReps = 10,
  targetMuscle,
  onRepsUpdate,
}: LiveTempoMetronomeModalProps) {
  const metronome = useRepTempoMetronome({
    tempo,
    targetReps,
    targetMuscle,
    onRepComplete: (rep) => onRepsUpdate?.(rep),
  });

  const { isResting, restSecondsRemaining, skipRest } = useRestTimer();

  useEffect(() => {
    if (isResting && metronome.isActive && !metronome.isPaused) {
      metronome.pauseMetronome();
    }
  }, [isResting, metronome.isActive, metronome.isPaused, metronome.pauseMetronome]);

  if (!isOpen) return null;

  const handleClose = () => {
    metronome.resetMetronome();
    onClose();
  };

  const handleTogglePacing = () => {
    if (!metronome.isActive) {
      if (isResting) skipRest();
      metronome.startMetronome();
    } else if (metronome.isPaused) {
      if (isResting) skipRest();
      metronome.resumeMetronome();
    } else {
      metronome.pauseMetronome();
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-sm max-h-[90dvh] overflow-y-auto bg-zinc-950/95 border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col items-center space-y-4">
          <div className="w-full flex items-center justify-between border-b border-white/5 pb-3">
            <div className="truncate pr-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                {metronome.parsedTempo.displayString}
              </span>
              <h2 className="text-base font-black text-white truncate mt-1">{exerciseName}</h2>
            </div>
            <button
              onClick={handleClose}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close metronome modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isResting && (
            <div className="w-full p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between">
              <span>Resting: {restSecondsRemaining}s left</span>
              <button
                onClick={skipRest}
                className="text-[10px] font-black uppercase bg-amber-400 text-black px-2.5 py-1.5 min-h-[44px] flex items-center rounded-lg cursor-pointer"
              >
                Skip Rest
              </button>
            </div>
          )}

          <TempoRadialVisualizer
            currentPhase={metronome.currentPhase}
            phaseElapsedMs={metronome.phaseElapsedMs}
            phaseDurationMs={metronome.phaseDurationMs}
            phaseProgress={metronome.phaseProgress}
            repProgress={metronome.repProgress}
            currentRep={metronome.currentRep}
            targetReps={metronome.targetReps}
            totalTutSeconds={metronome.totalTutSeconds}
            parsedTempo={metronome.parsedTempo}
            targetMuscle={targetMuscle}
            size={210}
          />

          <TempoPhaseBar
            currentPhase={metronome.currentPhase}
            phaseProgress={metronome.phaseProgress}
            parsedTempo={metronome.parsedTempo}
            className="w-full"
          />

          <div className="w-full flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-2 px-3">
            <button
              type="button"
              onClick={metronome.prevRep}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              aria-label="Previous rep"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-black uppercase text-zinc-300">
              Rep {metronome.currentRep} of {metronome.targetReps}
            </span>
            <button
              type="button"
              onClick={metronome.nextRep}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              aria-label="Next rep"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full grid grid-cols-[1fr_auto_auto] gap-2 pt-1">
            <button
              type="button"
              onClick={handleTogglePacing}
              className={cn(
                "py-3.5 px-4 min-h-[44px] rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg",
                !metronome.isActive || metronome.isPaused
                  ? "bg-primary text-black hover:bg-primary/90 shadow-primary/20"
                  : "bg-amber-500 text-black hover:bg-amber-400"
              )}
            >
              {!metronome.isActive || metronome.isPaused ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{metronome.isPaused ? "RESUME" : "START PACING"}</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>PAUSE</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={metronome.resetMetronome}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              title="Reset metronome"
              aria-label="Reset metronome"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={metronome.toggleMute}
              className={cn(
                "w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl border flex items-center justify-center cursor-pointer transition-colors",
                metronome.isMuted
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-white/5 border-white/5 text-zinc-400 hover:text-white"
              )}
              title={metronome.isMuted ? "Unmute audio" : "Mute audio"}
              aria-label="Toggle audio"
            >
              {metronome.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-full min-h-[44px] py-2.5 rounded-xl border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Done with Metronome
          </button>
        </div>
      </div>
    </>
  );
}
