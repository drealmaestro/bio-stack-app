interface TactileProtocolCuesProps {
    tactileCue?: string;
    protocolText?: string;
    previousBest?: string;
    rpe?: number;
}

export function TactileProtocolCues({
    tactileCue = "Retract scapulae, 30° bench incline, 3s eccentric cadence.",
    protocolText = "Left-Arm Lead Rule: Initiate and match reps to weaker Left arm first. Use unilateral dumbbells/cables to eliminate bilateral compensation.",
    previousBest = "36 KG × 10 REPS",
    rpe = 9,
}: TactileProtocolCuesProps) {
    return (
        <div className="space-y-2 my-2">
            {/* Tactile Cue Box */}
            <div className="p-2.5 rounded bg-[#14171d] border border-[#262b36] text-[11px]">
                <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-[#ccff00] uppercase tracking-wider mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" /> TACTILE CUE
                </div>
                <p className="text-[#e2e5eb] font-sans leading-relaxed text-[11px]">
                    {tactileCue}
                </p>
            </div>

            {/* Unilateral / Weak-Side Bias Protocol */}
            <div className="p-2.5 rounded bg-[#1a1e26] border border-[#262b36] text-[11px]">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono font-bold text-white uppercase tracking-wider">
                        UNILATERAL / WEAK-SIDE BIAS PROTOCOL
                    </span>
                    <span className="stitch-badge-neutral text-[8px] py-0 px-1 font-mono">
                        AGE 40+ SYMMETRICS
                    </span>
                </div>
                <p className="text-[#8e95a5] font-sans leading-snug text-[10px]">
                    {protocolText}
                </p>
            </div>

            {/* Previous Best Banner */}
            <div className="flex justify-between items-center px-2.5 py-1.5 rounded bg-[#14171d] border border-[#262b36] text-[10px] font-mono">
                <span className="text-[#8e95a5]">
                    PREVIOUS BEST: <strong className="text-white">{previousBest}</strong>
                </span>
                <span className="stitch-badge-target text-[9px] py-0 px-1">
                    RPE {rpe}
                </span>
            </div>
        </div>
    );
}
