import { useState, useEffect } from "react";
import { X, Check, Target, Scale, Repeat } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "../../../lib/utils";
import { NumericKeypad } from "../../ui/NumericKeypad";
import { RpeSlider } from "../../ui/RpeSlider";
import { SetAutoFillChips } from "./SetAutoFillChips";
import type { SmartRecommendation } from "../../../utils/progressiveOverload";

export interface SetLoggingBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    exerciseName: string;
    setIndex: number;
    totalSets: number;
    weight: number;
    reps: number;
    rpe?: number;
    isCompleted?: boolean;
    targetReps?: number;
    lastSet?: { weight: number; reps: number };
    previousSet?: { weight: number; reps: number };
    recommendation?: SmartRecommendation | null;
    onSave: (data: { weight: number; reps: number; rpe?: number }) => void;
    onToggleComplete: () => void;
}

export function SetLoggingBottomSheet({
    isOpen,
    onClose,
    exerciseName,
    setIndex,
    totalSets,
    weight,
    reps,
    rpe = 7,
    isCompleted = false,
    targetReps,
    lastSet,
    previousSet,
    recommendation,
    onSave,
    onToggleComplete,
}: SetLoggingBottomSheetProps) {
    const [activeTab, setActiveTab] = useState<"weight" | "reps">("weight");
    const [weightVal, setWeightVal] = useState<number>(weight);
    const [repsVal, setRepsVal] = useState<number>(reps);
    const [rpeVal, setRpeVal] = useState<number>(rpe || 7);

    useEffect(() => {
        if (isOpen) {
            setWeightVal(weight);
            setRepsVal(reps);
            setRpeVal(rpe || 7);
        }
    }, [isOpen, weight, reps, rpe]);

    if (!isOpen) return null;

    const handleKeypadChange = (val: number) => {
        if (activeTab === "weight") {
            setWeightVal(val);
            onSave({ weight: val, reps: repsVal, rpe: rpeVal });
        } else {
            setRepsVal(val);
            onSave({ weight: weightVal, reps: val, rpe: rpeVal });
        }
    };

    const handleRpeChange = (newRpe: number) => {
        setRpeVal(newRpe);
        onSave({ weight: weightVal, reps: repsVal, rpe: newRpe });
    };

    const handleApplySetValues = (targetWeight: number, targetReps: number) => {
        setWeightVal(targetWeight);
        setRepsVal(targetReps);
        onSave({ weight: targetWeight, reps: targetReps, rpe: rpeVal });
        navigator.vibrate?.(30);
    };

    const handleComplete = () => {
        onSave({ weight: weightVal, reps: repsVal, rpe: rpeVal });
        onToggleComplete();
        navigator.vibrate?.([30, 50]);
        try {
            confetti({
                particleCount: 30,
                spread: 60,
                origin: { y: 0.8 },
                colors: ["#22c55e", "#eab308", "#3b82f6", "#ec4899"]
            });
        } catch {
            // Ignore confetti errors if canvas unmounted
        }
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Bottom Sheet Drawer */}
            <div className={cn(
                "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] h-auto bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 rounded-t-[2.5rem] shadow-2xl flex flex-col transition-transform duration-300 ease-out",
                isOpen ? "translate-y-0" : "translate-y-full"
            )}>
                {/* Drag Handle */}
                <div
                    className="w-full py-3 flex justify-center cursor-grab active:cursor-grabbing"
                    onClick={onClose}
                >
                    <div className="w-12 h-1.5 bg-zinc-700 rounded-full hover:bg-zinc-600 transition-colors" />
                </div>

                {/* Header */}
                <div className="px-5 pb-3 flex items-center justify-between border-b border-white/5">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                                Set {setIndex} of {totalSets}
                            </span>
                            {targetReps && (
                                <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                                    <Target className="w-3 h-3 text-zinc-500" /> Target: {targetReps} reps
                                </span>
                            )}
                        </div>
                        <h2 className="text-lg font-black text-white tracking-tight mt-1 truncate max-w-[260px]">
                            {exerciseName}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        aria-label="Close set logging drawer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                    {/* Fast Auto-Fill / Set Duplication & Smart Rec Chips */}
                    <SetAutoFillChips
                        recommendation={recommendation}
                        previousSet={previousSet}
                        previousSetIndex={setIndex - 1}
                        lastSessionSet={lastSet}
                        onApply={handleApplySetValues}
                    />

                    {/* Input Field Selector Tabs */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setActiveTab("weight")}
                            className={cn(
                                "p-3 rounded-2xl border text-left transition-all tap-active flex items-center justify-between cursor-pointer min-h-[64px]",
                                activeTab === "weight"
                                    ? "bg-primary/10 border-primary/50 ring-1 ring-primary/30"
                                    : "bg-black/30 border-white/5 hover:bg-white/5"
                            )}
                        >
                            <div>
                                <span className="text-[10px] font-extrabold uppercase text-zinc-400 flex items-center gap-1">
                                    <Scale className="w-3 h-3" /> Weight (kg)
                                </span>
                                <div className="text-2xl font-mono font-black text-white mt-0.5">
                                    {weightVal} <span className="text-xs font-normal text-zinc-400">kg</span>
                                </div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("reps")}
                            className={cn(
                                "p-3 rounded-2xl border text-left transition-all tap-active flex items-center justify-between cursor-pointer min-h-[64px]",
                                activeTab === "reps"
                                    ? "bg-primary/10 border-primary/50 ring-1 ring-primary/30"
                                    : "bg-black/30 border-white/5 hover:bg-white/5"
                            )}
                        >
                            <div>
                                <span className="text-[10px] font-extrabold uppercase text-zinc-400 flex items-center gap-1">
                                    <Repeat className="w-3 h-3" /> Reps
                                </span>
                                <div className="text-2xl font-mono font-black text-white mt-0.5">
                                    {repsVal} <span className="text-xs font-normal text-zinc-400">reps</span>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Tactile Keypad */}
                    <NumericKeypad
                        value={activeTab === "weight" ? weightVal : repsVal}
                        onChange={handleKeypadChange}
                    />

                    {/* RPE Slider */}
                    <RpeSlider
                        value={rpeVal}
                        onChange={handleRpeChange}
                    />

                    {/* High Contrast Primary CTA */}
                    <button
                        type="button"
                        onClick={handleComplete}
                        className={cn(
                            "w-full min-h-[50px] py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all active:scale-98 shadow-lg mt-2 cursor-pointer",
                            isCompleted
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                                : "bg-primary text-black hover:bg-primary/90 shadow-primary/25"
                        )}
                    >
                        <Check className="w-5 h-5 stroke-[3]" />
                        {isCompleted ? "SET COMPLETED — TAP TO UPDATE" : "COMPLETE & LOG SET"}
                    </button>
                </div>
            </div>
        </>
    );
}