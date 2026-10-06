import { useState } from "react";
import { Eye, ChevronUp } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { Exercise, TargetMuscle } from "../../../types";
import { TempoMetronomePill } from "../tempo/TempoMetronomePill";
import { LiveTempoMetronomeModal } from "../tempo/LiveTempoMetronomeModal";
import { VisualCueFallback } from "../media/VisualCueFallback";

export interface SetLoggingPacerBarProps {
    exerciseName: string;
    tempo?: string;
    targetReps?: number;
    targetMuscle?: TargetMuscle;
    exercise?: Exercise | null;
    onRepsUpdate?: (reps: number) => void;
    className?: string;
}

export function SetLoggingPacerBar({
    exerciseName,
    tempo = "3-0-1-0",
    targetReps = 10,
    targetMuscle,
    exercise,
    onRepsUpdate,
    className,
}: SetLoggingPacerBarProps) {
    const [isMetronomeOpen, setIsMetronomeOpen] = useState(false);
    const [showVisualCue, setShowVisualCue] = useState(false);

    const activeTempo = tempo || exercise?.tempo || "3-0-1-0";
    const activeMuscle = (targetMuscle || exercise?.target_muscle || "Other") as TargetMuscle;

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center justify-between gap-2">
                <TempoMetronomePill
                    tempo={activeTempo}
                    isRunning={isMetronomeOpen}
                    onClick={() => setIsMetronomeOpen(true)}
                    className="flex-1 justify-center"
                />

                <button
                    type="button"
                    onClick={() => setShowVisualCue(!showVisualCue)}
                    className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-full border text-[11px] font-bold transition-all tap-active cursor-pointer",
                        showVisualCue
                            ? "bg-sky-500/15 border-sky-500/30 text-sky-300 ring-1 ring-sky-500/20"
                            : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
                    )}
                    aria-label={showVisualCue ? "Hide exercise visual cues" : "Show exercise visual cues"}
                >
                    {showVisualCue ? (
                        <>
                            <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
                            <span>Hide Cue</span>
                        </>
                    ) : (
                        <>
                            <Eye className="w-3.5 h-3.5 text-sky-400" />
                            <span>Visual Cue</span>
                        </>
                    )}
                </button>
            </div>

            {showVisualCue && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    <VisualCueFallback
                        exercise={exercise ?? { id: "sheet-ex", name: exerciseName, target_muscle: activeMuscle, instructions: "" }}
                        targetMuscle={activeMuscle}
                        compact={true}
                        showChecklist={true}
                    />
                </div>
            )}

            <LiveTempoMetronomeModal
                isOpen={isMetronomeOpen}
                onClose={() => setIsMetronomeOpen(false)}
                exerciseName={exerciseName}
                tempo={activeTempo}
                targetReps={targetReps}
                targetMuscle={activeMuscle}
                onRepsUpdate={onRepsUpdate}
            />
        </div>
    );
}
