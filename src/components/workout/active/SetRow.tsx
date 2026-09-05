import { Check } from "lucide-react";
import { cn } from "../../../lib/utils";
import { RecommendationBadge } from "./RecommendationBadge";
import type { SmartRecommendation } from "../../../utils/progressiveOverload";

export interface SetRowProps {
    exerciseName: string;
    exerciseIndex: number;
    setNum: number;
    targetReps: number;
    currentWeight: number;
    currentReps: number;
    currentRpe: number;
    isCompleted: boolean;
    lastSet?: { weight: number; reps: number };
    hasRepsKey: boolean;
    recommendation?: SmartRecommendation | null;
    isUpcoming?: boolean;
    onWeightChange: (weight: number) => void;
    onRepsChange: (reps: number) => void;
    onRpeChange: (rpe: number) => void;
    onToggleComplete: () => void;
    onOpenSheet?: () => void;
    onApplyRecommendation?: (weight: number, reps: number) => void;
}

export function SetRow({
    exerciseName,
    setNum,
    currentWeight,
    currentReps,
    currentRpe,
    isCompleted,
    lastSet,
    recommendation,
    isUpcoming = false,
    onWeightChange,
    onRepsChange,
    onToggleComplete,
    onOpenSheet,
    onApplyRecommendation
}: SetRowProps) {
    const rpeBadgeColor = (rpe: number) => {
        if (!rpe) return "text-zinc-500 bg-white/5 border-white/5";
        if (rpe >= 9.5) return "text-red-400 bg-red-500/10 border-red-500/20";
        if (rpe >= 8.5) return "text-orange-400 bg-orange-500/10 border-orange-500/20";
        if (rpe >= 7.5) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    };

    const handleApplyRec = (weight: number, reps: number) => {
        if (onApplyRecommendation) {
            onApplyRecommendation(weight, reps);
        } else {
            onWeightChange(weight);
            onRepsChange(reps);
        }
        navigator.vibrate?.(30);
    };

    return (
        <div className={cn("border-t border-white/5 transition-colors", isCompleted ? "bg-primary/5" : "")}>
            <div
                onClick={() => onOpenSheet?.()}
                className="grid grid-cols-[2.5rem_1.1fr_1.1fr_1.1fr_3.2rem] gap-1.5 px-3 py-2.5 items-center cursor-pointer hover:bg-white/[0.03] active:bg-white/[0.06] tap-active min-h-[52px]"
            >
                {/* Set number */}
                <div className="flex flex-col items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-black text-zinc-200 shadow-sm">
                        {setNum}
                    </div>
                    {lastSet && (
                        <span className="text-[9px] text-zinc-400 font-bold mt-0.5 leading-none">
                            {lastSet.weight}x{lastSet.reps}
                        </span>
                    )}
                </div>

                {/* Weight display */}
                <div className="text-center">
                    <div className="h-10 px-1.5 flex items-center justify-center bg-black/40 border border-white/10 text-white font-mono text-base font-black rounded-xl">
                        {currentWeight > 0 ? `${currentWeight} kg` : (lastSet ? `${lastSet.weight} kg` : "-")}
                    </div>
                </div>

                {/* Reps display */}
                <div className="text-center">
                    <div className="h-10 px-1.5 flex items-center justify-center bg-black/40 border border-white/10 text-white font-mono text-base font-black rounded-xl">
                        {currentReps}
                    </div>
                </div>

                {/* RPE badge */}
                <div className="text-center">
                    <div className={cn(
                        "h-10 px-1 flex items-center justify-center border font-mono text-xs font-black rounded-xl transition-colors",
                        rpeBadgeColor(currentRpe)
                    )}>
                        {currentRpe ? `@${currentRpe}` : "-"}
                    </div>
                </div>

                {/* Completion toggle button */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        aria-label={`${isCompleted ? "Mark incomplete" : "Mark complete"} ${exerciseName} set ${setNum}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete();
                            if (!isCompleted) navigator.vibrate?.(50);
                        }}
                        className={cn(
                            "w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer",
                            isCompleted ? "bg-primary text-black shadow-lg shadow-primary/25 scale-105" : "bg-white/5 border border-white/10 text-zinc-500 hover:bg-white/15 hover:text-white"
                        )}
                    >
                        <Check size={20} strokeWidth={3.5} />
                    </button>
                </div>
            </div>

            {/* Smart Recommendation Banner on Upcoming Uncompleted Set */}
            {!isCompleted && isUpcoming && recommendation && (
                <div className="px-3 pb-2 pt-0.5 flex items-center justify-between gap-2 border-t border-white/[0.04] bg-white/[0.01]">
                    <RecommendationBadge
                        recommendation={recommendation}
                        onApply={handleApplyRec}
                    />
                    <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[190px]" title={recommendation.reason}>
                        {recommendation.reason}
                    </span>
                </div>
            )}
        </div>
    );
}