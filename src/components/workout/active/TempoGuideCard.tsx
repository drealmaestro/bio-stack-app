import { getTempoBreakdown } from "../../../lib/utils";
import type { TargetMuscle } from "../../../types";

interface TempoGuideCardProps {
    tempo?: string;
    coachTips?: string;
    targetMuscle?: TargetMuscle;
    isExpanded: boolean;
    onToggleTempo: () => void;
}

export function TempoGuideCard({
    tempo,
    coachTips,
    targetMuscle,
    isExpanded,
    onToggleTempo
}: TempoGuideCardProps) {
    if (!tempo && !coachTips) return null;

    const breakdown = tempo ? getTempoBreakdown(tempo, targetMuscle || 'Other') : null;

    return (
        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3 flex flex-col gap-1.5 text-[11px] mx-1">
            {tempo && (
                <div>
                    <button
                        type="button"
                        onClick={onToggleTempo}
                        className="text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                        <span className="font-bold text-zinc-400 uppercase tracking-wider">Tempo:</span>
                        <span className="font-mono underline decoration-dashed decoration-zinc-600 underline-offset-2">{tempo}</span>
                        <span className="text-[8px] text-primary bg-primary/10 px-1 py-0.2 rounded font-black scale-90 ml-0.5">Guide</span>
                    </button>
                    {isExpanded && breakdown && (
                        <div className="mt-1.5 p-2 bg-black/60 border border-white/5 rounded-xl space-y-0.5 text-[9px] text-zinc-400 animate-in slide-in-from-top-1 duration-150">
                            {breakdown.map((b, i) => (
                                <div key={i} className="flex justify-between items-center py-0.5 border-b border-white/5 last:border-0 last:pb-0">
                                    <span className="font-semibold text-zinc-500">{b.label}</span>
                                    <span className="text-right text-zinc-300">
                                        <span className="font-mono font-bold text-primary mr-1">{b.sec}s</span>
                                        <span className="text-zinc-500">({b.desc})</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {coachTips && (
                <div className="text-zinc-300 font-medium">
                    <span className="text-primary font-bold">💡 Tip:</span> {coachTips}
                </div>
            )}
        </div>
    );
}
