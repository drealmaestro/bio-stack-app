import { Flame } from "lucide-react";
import { getMuscleIcon } from "../../../lib/muscleIcons";
import { cn } from "../../../lib/utils";
import type { TargetMuscle } from "../../../types";

export interface ExerciseCardHeaderProps {
    exerciseName: string;
    muscle: string;
    intensity?: "Light" | "Moderate" | "Heavy" | string;
    restSeconds: number;
    onOpenWarmUp: () => void;
}

export function ExerciseCardHeader({
    exerciseName,
    muscle,
    intensity,
    restSeconds,
    onOpenWarmUp,
}: ExerciseCardHeaderProps) {
    return (
        <div className="flex justify-between items-center px-1">
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <span className="text-primary bg-primary/10 w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                    {getMuscleIcon(muscle as TargetMuscle, 14)}
                </span>
                <span className="truncate">{exerciseName}</span>
                {intensity && (
                    <span className={cn(
                        "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0",
                        intensity === "Heavy" ? "bg-red-500/10 text-red-400 border border-red-500/15" :
                        intensity === "Moderate" ? "bg-blue-500/10 text-blue-400 border border-blue-500/15" :
                        "bg-green-500/10 text-green-400 border border-green-500/15"
                    )}>
                        {intensity}
                    </span>
                )}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
                <button
                    type="button"
                    onClick={onOpenWarmUp}
                    className="text-[10px] font-black text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 px-2.5 py-1 rounded-full flex items-center justify-center gap-1 transition-all tap-active cursor-pointer min-h-[44px]"
                    title="Warm-up Calculator"
                    aria-label="Open warm-up calculator"
                >
                    <Flame size={11} /> Warm-Up
                </button>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {restSeconds}s Rest
                </span>
            </div>
        </div>
    );
}
