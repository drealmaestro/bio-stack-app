interface TactileProtocolCuesProps {
    tactileCue?: string;
    protocolText?: string;
    previousBest?: string;
    rpe?: number;
}

export function TactileProtocolCues({
    tactileCue = "Pin left shoulder blade down & back, 30° bench angle, 3s controlled negative.",
    protocolText = "Left-Shoulder & Stamina Rule: Start every unilateral set with your LEFT arm. Stop right arm at the same rep. On final set, rest 20s and do +4-5 extra reps on LEFT arm only to break the mid-set fatigue wall.",
    previousBest = "36 KG × 10 REPS",
    rpe = 8.5,
}: TactileProtocolCuesProps) {
    return (
        <div className="space-y-2 my-2">
            {/* Tactile Cue Box */}
            <div className="p-2.5 rounded bg-[#14171d] border border-[#262b36] text-[11px]">
                <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-[#ccff00] uppercase tracking-wider mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" /> COACH CUE (LEFT-SHOULDER LOCK-IN)
                </div>
                <p className="text-[#e2e5eb] font-sans leading-relaxed text-[11px]">
                    {tactileCue}
                </p>
            </div>

            {/* Unilateral / Weak-Side Bias Protocol */}
            <div className="p-2.5 rounded bg-[#1a1e26] border border-[#262b36] text-[11px]">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono font-bold text-white uppercase tracking-wider">
                        LEFT-ARM STAMINA & SYMMETRY PROTOCOL
                    </span>
                    <span className="stitch-badge-target text-[8px] py-0 px-1 font-mono">
                        AGE 48+ ELITE
                    </span>
                </div>
                <p className="text-[#8e95a5] font-sans leading-snug text-[10px]">
                    {protocolText || "Left-Arm Lead Rule: Initiate and match reps to weaker Left arm first. Final set: rest 20s + 4-5 extra Left-only reps."}
                </p>
            </div>

            {/* Previous Best Banner */}
            <div className="flex justify-between items-center px-2.5 py-1.5 rounded bg-[#14171d] border border-[#262b36] text-[10px] font-mono">
                <span className="text-[#8e95a5]">
                    PREVIOUS BEST: <strong className="text-white">{previousBest}</strong>
                </span>
                <span className="stitch-badge-target text-[9px] py-0 px-1">
                    TARGET RPE {rpe}
                </span>
            </div>
        </div>
    );
}
