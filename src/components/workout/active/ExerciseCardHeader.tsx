import { Flame, Clock } from "lucide-react";
import { getMuscleIcon } from "../../../lib/muscleIcons";
import type { TargetMuscle } from "../../../types";

export interface ExerciseCardHeaderProps {
    exerciseName: string;
    muscle: string;
    intensity?: "Light" | "Moderate" | "Heavy" | string;
    restSeconds: number;
    onOpenWarmUp: () => void;
    exerciseIndex?: number;
    totalExercises?: number;
}

export function ExerciseCardHeader({
    exerciseName,
    muscle,
    intensity,
    restSeconds,
    onOpenWarmUp,
    exerciseIndex = 0,
    totalExercises = 6,
}: ExerciseCardHeaderProps) {
    return (
        <div className="space-y-1.5 px-0.5">
            {/* Top Index & Muscle Chips Bar */}
            <div className="flex justify-between items-center text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-[#ccff00] text-[#0d0f12] font-black font-display text-xs">
                        {exerciseIndex + 1} OF {totalExercises}
                    </span>
                    <span className="text-[#8e95a5] font-bold uppercase tracking-wider">
                        {muscle} • TRICEPS • DELTS
                    </span>
                </div>
                <div className="flex items-center gap-1 text-[#8e95a5]">
                    <Clock size={11} />
                    <span>{restSeconds}s Rest</span>
                </div>
            </div>

            {/* Main Headline */}
            <div className="flex justify-between items-start gap-2">
                <div>
                    <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight leading-tight flex items-center gap-2">
                        <span className="text-[#ccff00] bg-[#1a1e26] border border-[#262b36] w-6 h-6 rounded flex items-center justify-center shrink-0">
                            {getMuscleIcon(muscle as TargetMuscle, 13)}
                        </span>
                        <span className="truncate">{exerciseName}</span>
                        {intensity && (
                            <span className="stitch-badge-neutral text-[8px] py-0 px-1 shrink-0">
                                {intensity}
                            </span>
                        )}
                    </h3>
                    <p className="text-[10px] text-[#8e95a5] font-sans leading-tight mt-0.5">
                        Target: Upper Pectoralis (Primary), Anterior Deltoid, Triceps
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onOpenWarmUp}
                    className="stitch-badge-neutral uppercase hover:border-[#ccff00] flex items-center justify-center gap-1 transition-all cursor-pointer min-h-[30px] shrink-0 text-[9px]"
                    title="Warm-up Calculator"
                    aria-label="Open warm-up calculator"
                >
                    <Flame size={10} className="text-[#ff9500]" /> Warm-Up
                </button>
            </div>
        </div>
    );
}
