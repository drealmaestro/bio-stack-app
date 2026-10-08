import { Flag } from "lucide-react";

interface ActiveWorkoutHeaderProps {
    templateName: string;
    elapsedSeconds: number;
    formatTime: (secs: number) => string;
    onCancel: () => void;
    totalVolumeKg?: number;
    onFinish?: () => void;
}

export function ActiveWorkoutHeader({
    elapsedSeconds,
    formatTime,
    onCancel,
    totalVolumeKg = 8420,
    onFinish
}: ActiveWorkoutHeaderProps) {
    return (
        <div className="flex justify-between items-center bg-[#14171d] border border-[#262b36] p-2.5 rounded mb-3">
            <div className="flex items-center gap-4">
                <div>
                    <span className="text-[9px] font-mono text-[#8e95a5] block leading-none">ELAPSED</span>
                    <span className="text-xl font-display font-black text-white tabular-nums tracking-tight leading-none mt-0.5 block">
                        {formatTime(elapsedSeconds)}
                    </span>
                </div>
                <div className="border-l border-[#262b36] pl-4">
                    <span className="text-[9px] font-mono text-[#8e95a5] block leading-none">LOAD VOL</span>
                    <span className="text-xl font-display font-black text-[#ccff00] tabular-nums tracking-tight leading-none mt-0.5 block">
                        {totalVolumeKg ? totalVolumeKg.toLocaleString() : "8,420"} <span className="text-xs text-[#8e95a5]">KG</span>
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1.5">
                {onFinish && (
                    <button
                        type="button"
                        onClick={onFinish}
                        className="stitch-btn-ghost px-2.5 py-1 text-[11px] font-bold text-white border-[#343b4a] hover:border-[#ccff00] flex items-center gap-1"
                    >
                        <Flag size={11} className="text-[#ccff00]" /> FINISH
                    </button>
                )}
                <button
                    type="button"
                    onClick={onCancel}
                    className="stitch-btn-ghost text-[10px] py-1 px-2 text-[#ff3b30] border-[#ff3b30]/30 hover:border-[#ff3b30]"
                >
                    ABORT
                </button>
            </div>
        </div>
    );
}
