import { Trophy, Clock, Check, TrendingUp } from "lucide-react";
import { AnimatedNumber } from "../../ui/AnimatedNumber";

interface WorkoutSummaryModalProps {
    summaryData: {
        durationSecs: number;
        sets: number;
        volume: number;
        prs: string[];
    };
    formatTime: (secs: number) => string;
    onClose: () => void;
}

export function WorkoutSummaryModal({ summaryData, formatTime, onClose }: WorkoutSummaryModalProps) {
    return (
        <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center min-h-[60vh] text-center px-2 py-6">
            <div className="w-16 h-16 rounded bg-[#1a1e26] border border-[#ccff00] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(204,255,0,0.25)]">
                <Trophy size={32} className="text-[#ccff00]" />
            </div>
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-1">
                SESSION COMPLETED & LOGGED
            </h2>
            <p className="text-xs font-mono text-[#8e95a5] uppercase tracking-wider mb-6">
                HYPERTROPHY TELEMETRY UPDATED
            </p>

            <div className="grid grid-cols-3 gap-2 w-full max-w-sm mb-4">
                <div className="stitch-card-1 p-3 text-center">
                    <Clock size={16} className="mx-auto text-[#ccff00] mb-1" />
                    <div className="text-xl font-display font-black text-white tabular-nums">
                        <AnimatedNumber
                            value={summaryData.durationSecs}
                            formatter={(val) => formatTime(Math.floor(val))}
                        />
                    </div>
                    <div className="text-[9px] font-mono text-[#8e95a5] uppercase mt-0.5">TIME</div>
                </div>
                <div className="stitch-card-1 p-3 text-center">
                    <Check size={16} className="mx-auto text-[#ccff00] mb-1" />
                    <div className="text-xl font-display font-black text-[#ccff00] tabular-nums">
                        <AnimatedNumber value={summaryData.sets} />
                    </div>
                    <div className="text-[9px] font-mono text-[#8e95a5] uppercase mt-0.5">SETS</div>
                </div>
                <div className="stitch-card-1 p-3 text-center">
                    <TrendingUp size={16} className="mx-auto text-[#ccff00] mb-1" />
                    <div className="text-xl font-display font-black text-white tabular-nums">
                        <AnimatedNumber
                            value={summaryData.volume}
                            formatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}t` : `${Math.round(val)}kg`}
                        />
                    </div>
                    <div className="text-[9px] font-mono text-[#8e95a5] uppercase mt-0.5">LOAD</div>
                </div>
            </div>

            {summaryData.prs.length > 0 && (
                <div className="w-full max-w-sm stitch-card-1 p-3 mb-6 border-[#ccff00]/40 bg-[#14171d]">
                    <div className="text-[10px] font-mono font-bold text-[#ccff00] uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1">
                        <Trophy size={11} /> NEW PERSONAL RECORDS LOGGED
                    </div>
                    {summaryData.prs.map((pr, i) => (
                        <div key={i} className="text-xs font-display font-black text-white uppercase py-0.5">
                            {pr}
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={onClose}
                className="w-full max-w-sm py-3.5 stitch-btn-primary text-base font-display font-black tracking-wider shadow-[0_0_15px_rgba(204,255,0,0.2)]"
            >
                RETURN TO SCHEDULE
            </button>
        </div>
    );
}
