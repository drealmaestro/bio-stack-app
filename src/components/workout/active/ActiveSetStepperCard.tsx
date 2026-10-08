import { Minus, Plus, Check } from "lucide-react";

interface ActiveSetStepperCardProps {
    setNum: number;
    weight: number;
    reps: number;
    onWeightChange: (w: number) => void;
    onRepsChange: (r: number) => void;
    onLogSet: () => void;
}

export function ActiveSetStepperCard({
    setNum,
    weight,
    reps,
    onWeightChange,
    onRepsChange,
    onLogSet,
}: ActiveSetStepperCardProps) {
    const formattedSet = setNum < 10 ? `0${setNum}` : `${setNum}`;

    return (
        <div className="stitch-card-active p-3.5 space-y-3 border-[#ccff00] bg-[#1a1e26] my-3">
            {/* Protocol Header */}
            <div className="flex justify-between items-center text-[10px] font-mono border-b border-[#343b4a] pb-2">
                <span className="text-white font-bold uppercase tracking-wider">
                    UNILATERAL SPLIT / L & R TRACKING
                </span>
                <span className="stitch-badge-target text-[9px] py-0 px-1.5">
                    LEFT ARM LEAD
                </span>
            </div>

            {/* Threshold Dual Columns */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono p-2 rounded bg-[#14171d] border border-[#262b36]">
                <div>
                    <span className="text-[#ccff00] font-bold block">LEFT (WEAK) [LEAD]</span>
                    <span className="text-white font-bold">{weight}kg × {reps} (Threshold)</span>
                </div>
                <div className="border-l border-[#262b36] pl-2">
                    <span className="text-[#8e95a5] font-bold block">RIGHT (DOMINANT)</span>
                    <span className="text-[#8e95a5]">Match Left (No Comp)</span>
                </div>
            </div>

            {/* 48px Touch Steppers */}
            <div className="grid grid-cols-2 gap-2.5">
                {/* Weight Stepper */}
                <div className="space-y-1">
                    <span className="text-[9px] font-mono text-[#8e95a5] uppercase block text-center">
                        WEIGHT (KG)
                    </span>
                    <div className="flex items-center justify-between bg-[#14171d] border border-[#262b36] rounded p-1">
                        <button
                            type="button"
                            onClick={() => onWeightChange(Math.max(0, weight - 2.5))}
                            className="w-11 h-11 stitch-stepper text-white"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="text-2xl font-display font-black text-white tabular-nums px-1">
                            {weight}
                        </span>
                        <button
                            type="button"
                            onClick={() => onWeightChange(weight + 2.5)}
                            className="w-11 h-11 stitch-stepper text-white"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                {/* Reps Stepper */}
                <div className="space-y-1">
                    <span className="text-[9px] font-mono text-[#8e95a5] uppercase block text-center">
                        TARGET REPS
                    </span>
                    <div className="flex items-center justify-between bg-[#14171d] border border-[#262b36] rounded p-1">
                        <button
                            type="button"
                            onClick={() => onRepsChange(Math.max(1, reps - 1))}
                            className="w-11 h-11 stitch-stepper text-white"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="text-2xl font-display font-black text-[#ccff00] tabular-nums px-1">
                            {reps}
                        </span>
                        <button
                            type="button"
                            onClick={() => onRepsChange(reps + 1)}
                            className="w-11 h-11 stitch-stepper text-white"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Primary Action Button */}
            <button
                type="button"
                onClick={onLogSet}
                className="w-full py-3.5 stitch-btn-primary text-base flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)]"
            >
                <Check size={18} strokeWidth={3.5} />
                <span>LOG SET {formattedSet}</span>
            </button>
        </div>
    );
}
