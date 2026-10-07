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
    const isFailed = currentRpe >= 10;

    const rpeBadgeColor = (rpe: number) => {
        if (!rpe) return "text-[#8e95a5] bg-[#1a1e26] border-[#262b36]";
        if (rpe >= 10) return "text-[#ff3b30] bg-[#1f1112] border-[#ff3b30]";
        if (rpe >= 9) return "text-[#ff9500] bg-[#221710] border-[#ff9500]/40";
        return "text-[#ccff00] bg-[#243305] border-[#ccff00]/40";
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
        <div className={cn(
            "border-t border-[#262b36] transition-colors",
            isCompleted && "bg-[#121a10]/70",
            isFailed && !isCompleted && "bg-[#1f1112]/50"
        )}>
            <div
                onClick={() => onOpenSheet?.()}
                className="grid grid-cols-[2.5rem_1.1fr_1.1fr_1.1fr_3rem] gap-1.5 px-3 py-2 items-center cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.05] min-h-[50px]"
            >
                {/* Monospace Tabular Set Index (01, 02) */}
                <div className="flex flex-col items-center justify-center">
                    <span className={cn(
                        "font-display font-black text-sm tracking-wider tabular-nums",
                        isCompleted ? "text-[#ccff00]" : "text-[#8e95a5]"
                    )}>
                        {setNum}
                    </span>
                    {lastSet && (
                        <span className="text-[9px] font-mono text-[#8e95a5]/70 leading-none">
                            {lastSet.weight}×{lastSet.reps}
                        </span>
                    )}
                </div>

                {/* Weight Input Box */}
                <div className="text-center">
                    <div className="h-9 px-1 flex items-center justify-center bg-[#1a1e26] border border-[#262b36] text-[#e2e5eb] font-display text-base font-bold rounded">
                        {currentWeight > 0 ? `${currentWeight} kg` : (lastSet ? `${lastSet.weight} kg` : "-")}
                    </div>
                </div>

                {/* Reps Input Box */}
                <div className="text-center">
                    <div className="h-9 px-1 flex items-center justify-center bg-[#1a1e26] border border-[#262b36] text-[#e2e5eb] font-display text-base font-bold rounded">
                        {currentReps}
                    </div>
                </div>

                {/* RPE Box */}
                <div className="text-center">
                    <div className={cn(
                        "h-9 px-1 flex items-center justify-center border font-mono text-xs font-bold rounded transition-colors",
                        rpeBadgeColor(currentRpe)
                    )}>
                        {currentRpe ? `@${currentRpe}` : "-"}
                    </div>
                </div>

                {/* Tactile Completion Check Button */}
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
                            "w-10 h-10 rounded flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer",
                            isCompleted
                                ? "bg-[#ccff00] text-[#0d0f12] shadow-[0_0_12px_rgba(204,255,0,0.3)]"
                                : "bg-[#1a1e26] border border-[#262b36] text-[#8e95a5] hover:border-[#ccff00] hover:text-[#ccff00]"
                        )}
                    >
                        <Check size={18} strokeWidth={3.5} />
                    </button>
                </div>
            </div>

            {/* Smart Recommendation Banner on Upcoming Uncompleted Set */}
            {!isCompleted && isUpcoming && recommendation && (
                <div className="px-3 pb-2 pt-0.5 flex items-center justify-between gap-2 border-t border-[#262b36]/40 bg-[#14171d]/50">
                    <RecommendationBadge
                        recommendation={recommendation}
                        onApply={handleApplyRec}
                    />
                    <span className="text-[10px] text-[#8e95a5] font-mono truncate max-w-[190px]" title={recommendation.reason}>
                        {recommendation.reason}
                    </span>
                </div>
            )}
        </div>
    );
}