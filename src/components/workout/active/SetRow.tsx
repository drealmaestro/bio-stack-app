import { Input } from "../../ui/input";
import { Check } from "lucide-react";
import { cn } from "../../../lib/utils";

interface SetRowProps {
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
}

export function SetRow({
    exerciseName,
    setNum,
    targetReps,
    currentWeight,
    currentReps,
    currentRpe,
    isCompleted,
    lastSet,
    hasRepsKey,
    onWeightChange,
    onRepsChange,
    onRpeChange,
    onToggleComplete
}: SetRowProps) {
    const weightPlaceholder = lastSet ? String(lastSet.weight) : '0';

    return (
        <div className={cn(
            "grid grid-cols-[2.5rem_1.1fr_1.1fr_1.1fr_3rem] gap-1.5 px-3 py-2 items-center border-t border-white/5 transition-colors",
            isCompleted ? "bg-primary/5" : ""
        )}>
            {/* Set number */}
            <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-xs font-bold text-zinc-400">
                    {setNum}
                </div>
                {lastSet && (
                    <span className="text-[8px] text-zinc-600 mt-0.5 leading-none">
                        {lastSet.weight}x{lastSet.reps}
                    </span>
                )}
            </div>

            {/* Weight */}
            <div>
                <Input
                    type="number"
                    inputMode="decimal"
                    aria-label={`${exerciseName} set ${setNum} weight in kilograms`}
                    placeholder={weightPlaceholder}
                    min={0}
                    step={0.5}
                    value={currentWeight || ''}
                    className="h-11 text-center bg-black/30 border-white/5 focus:border-primary text-white font-mono text-sm font-bold rounded-xl"
                    onChange={(e) => onWeightChange(Math.max(0, parseFloat(e.target.value) || 0))}
                />
            </div>

            {/* Reps */}
            <div>
                <Input
                    type="number"
                    inputMode="numeric"
                    aria-label={`${exerciseName} set ${setNum} reps`}
                    placeholder={String(targetReps)}
                    min={0}
                    max={999}
                    value={currentReps === targetReps && !hasRepsKey ? '' : currentReps}
                    className="h-11 text-center bg-black/30 border-white/5 focus:border-primary text-white font-mono text-sm font-bold rounded-xl"
                    onChange={(e) => onRepsChange(Math.max(0, parseInt(e.target.value) || targetReps))}
                />
            </div>

            {/* RPE */}
            <div>
                <select
                    aria-label={`${exerciseName} set ${setNum} RPE`}
                    value={currentRpe || ''}
                    onChange={(e) => onRpeChange(parseFloat(e.target.value) || 0)}
                    className="w-full h-11 text-center bg-black/30 border border-white/5 focus:border-primary text-white font-mono text-xs font-bold rounded-xl outline-none transition-colors cursor-pointer appearance-none px-1"
                >
                    <option value="" className="bg-[#18181c] text-zinc-500">-</option>
                    <option value="10" className="bg-[#18181c] text-red-400 font-bold">10</option>
                    <option value="9.5" className="bg-[#18181c] text-orange-400">9.5</option>
                    <option value="9" className="bg-[#18181c] text-orange-400">9</option>
                    <option value="8.5" className="bg-[#18181c] text-yellow-400">8.5</option>
                    <option value="8" className="bg-[#18181c] text-yellow-400">8</option>
                    <option value="7.5" className="bg-[#18181c] text-blue-400">7.5</option>
                    <option value="7" className="bg-[#18181c] text-blue-400">7</option>
                    <option value="6.5" className="bg-[#18181c] text-zinc-400">6.5</option>
                    <option value="6" className="bg-[#18181c] text-zinc-400">6</option>
                    <option value="5" className="bg-[#18181c] text-zinc-500">5</option>
                </select>
            </div>

            {/* Done toggle */}
            <div className="flex justify-center">
                <button
                    aria-label={`${isCompleted ? 'Mark incomplete' : 'Mark complete'} ${exerciseName} set ${setNum}`}
                    onClick={() => {
                        onToggleComplete();
                        if (!isCompleted) navigator.vibrate?.(50);
                    }}
                    className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95",
                        isCompleted
                            ? "bg-primary text-black shadow-md shadow-primary/20 scale-105"
                            : "bg-white/5 border border-white/5 text-zinc-600 hover:bg-white/10"
                    )}
                >
                    <Check size={18} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
}
