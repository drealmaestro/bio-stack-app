import { Check } from "lucide-react";
import { cn } from "../../../lib/utils";

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
    onWeightChange: (weight: number) => void;
    onRepsChange: (reps: number) => void;
    onRpeChange: (rpe: number) => void;
    onToggleComplete: () => void;
    onOpenSheet?: () => void;
}

export function SetRow({
    exerciseName,
    setNum,
    currentWeight,
    currentReps,
    currentRpe,
    isCompleted,
    lastSet,
    onToggleComplete,
    onOpenSheet
}: SetRowProps) {
    const rpeBadgeColor = (rpe: number) => {
        if (!rpe) return "text-zinc-500 bg-white/5 border-white/5";
        if (rpe >= 9.5) return "text-red-400 bg-red-500/10 border-red-500/20";
        if (rpe >= 8.5) return "text-orange-400 bg-orange-500/10 border-orange-500/20";
        if (rpe >= 7.5) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    };

    return (
        <div
            onClick={() => onOpenSheet?.()}
            className={cn(
                "grid grid-cols-[2.5rem_1.1fr_1.1fr_1.1fr_3.2rem] gap-1.5 px-3 py-2.5 items-center border-t border-white/5 transition-colors cursor-pointer hover:bg-white/[0.03] active:bg-white/[0.06] tap-active min-h-[52px]",
                isCompleted ? "bg-primary/5" : ""
            )}
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
                    {currentWeight > 0 ? `${currentWeight} kg` : (lastSet ? `${lastSet.weight} kg` : '-')}
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
                    {currentRpe ? `@${currentRpe}` : '-'}
                </div>
            </div>

            {/* Completion toggle button */}
            <div className="flex justify-center">
                <button
                    type="button"
                    aria-label={`${isCompleted ? 'Mark incomplete' : 'Mark complete'} ${exerciseName} set ${setNum}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete();
                        if (!isCompleted) navigator.vibrate?.(50);
                    }}
                    className={cn(
                        "w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer",
                        isCompleted
                            ? "bg-primary text-black shadow-lg shadow-primary/25 scale-105"
                            : "bg-white/5 border border-white/10 text-zinc-500 hover:bg-white/15 hover:text-white"
                    )}
                >
                    <Check size={20} strokeWidth={3.5} />
                </button>
            </div>
        </div>
    );
}
