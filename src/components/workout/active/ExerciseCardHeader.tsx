import { Flame } from "lucide-react";
import { getMuscleIcon } from "../../../lib/muscleIcons";
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
            <h3 className="text-lg font-display font-black text-white uppercase tracking-tight flex items-center gap-2 truncate">
                <span className="text-[#ccff00] bg-[#1a1e26] border border-[#262b36] w-7 h-7 rounded flex items-center justify-center shrink-0">
                    {getMuscleIcon(muscle as TargetMuscle, 14)}
                </span>
                <span className="truncate">{exerciseName}</span>
                <span className="stitch-badge-target text-[9px] shrink-0">
                    {muscle}
                </span>
                {intensity && (
                    <span className="stitch-badge-neutral text-[9px] shrink-0">
                        {intensity}
                    </span>
                )}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
                <button
                    type="button"
                    onClick={onOpenWarmUp}
                    className="stitch-badge-neutral uppercase hover:border-[#ccff00] flex items-center justify-center gap-1 transition-all cursor-pointer min-h-[36px]"
                    title="Warm-up Calculator"
                    aria-label="Open warm-up calculator"
                >
                    <Flame size={11} className="text-[#ff9500]" /> Warm-Up
                </button>
                <span className="stitch-badge-neutral font-mono text-[9px]">
                    {restSeconds}s Rest
                </span>
            </div>
        </div>
    );
}
