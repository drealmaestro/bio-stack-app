import { CornerDownRight } from "lucide-react";

interface NextExerciseInQueueCardProps {
    nextIndex?: number;
    total?: number;
    exerciseName?: string;
    scheme?: string;
}

export function NextExerciseInQueueCard({
    nextIndex = 2,
    total = 6,
    exerciseName = "Iso-Lateral Cable Pushdown (Left Arm Lead)",
    scheme = "4 Sets • Unilateral Isolation • Imbalance Fix"
}: NextExerciseInQueueCardProps) {
    return (
        <div className="stitch-card-1 p-3 flex items-start gap-2.5 mt-3 border-[#262b36]">
            <div className="w-7 h-7 rounded bg-[#1a1e26] border border-[#262b36] flex items-center justify-center text-[#ccff00] shrink-0 mt-0.5">
                <CornerDownRight size={14} />
            </div>
            <div className="min-w-0 flex-1">
                <span className="text-[9px] font-mono font-bold text-[#8e95a5] uppercase tracking-wider block">
                    NEXT IN QUEUE ({nextIndex} OF {total})
                </span>
                <span className="font-display font-black text-sm text-white uppercase tracking-tight block truncate">
                    {exerciseName}
                </span>
                <span className="text-[10px] font-mono text-[#8e95a5] block truncate mt-0.5">
                    {scheme}
                </span>
            </div>
        </div>
    );
}
