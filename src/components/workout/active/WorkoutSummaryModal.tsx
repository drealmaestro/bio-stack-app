import { Button } from "../../ui/button";
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
        <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 ring-2 ring-primary/30">
                <Trophy size={40} className="text-primary" />
            </div>
            <h2 className="text-3xl font-black text-white mb-1">Workout Complete!</h2>
            <p className="text-zinc-400 mb-8">Great session. Here's how you did.</p>

            <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-6">
                <div className="glass-card p-4 rounded-2xl text-center">
                    <Clock size={18} className="mx-auto text-primary mb-1" />
                    <div className="text-xl font-black text-white">
                        <AnimatedNumber
                            value={summaryData.durationSecs}
                            formatter={(val) => formatTime(Math.floor(val))}
                        />
                    </div>
                    <div className="text-xs text-zinc-400">Duration</div>
                </div>
                <div className="glass-card p-4 rounded-2xl text-center">
                    <Check size={18} className="mx-auto text-primary mb-1" />
                    <div className="text-xl font-black text-white">
                        <AnimatedNumber value={summaryData.sets} />
                    </div>
                    <div className="text-xs text-zinc-400">Sets</div>
                </div>
                <div className="glass-card p-4 rounded-2xl text-center">
                    <TrendingUp size={18} className="mx-auto text-primary mb-1" />
                    <div className="text-xl font-black text-white">
                        <AnimatedNumber
                            value={summaryData.volume}
                            formatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}t` : `${Math.round(val)}kg`}
                        />
                    </div>
                    <div className="text-xs text-zinc-400">Volume</div>
                </div>
            </div>

            {summaryData.prs.length > 0 && (
                <div className="w-full max-w-sm glass-card p-4 rounded-2xl border border-primary/30 bg-primary/5 mb-6">
                    <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center justify-center gap-1">
                        <Trophy size={12} /> New Personal Records
                    </div>
                    {summaryData.prs.map((pr, i) => (
                        <div key={i} className="text-sm text-white font-bold py-1">
                            {pr}
                        </div>
                    ))}
                </div>
            )}

            <Button
                onClick={onClose}
                className="w-full max-w-sm h-14 rounded-2xl font-black text-lg bg-primary text-black"
            >
                Done
            </Button>
        </div>
    );
}
