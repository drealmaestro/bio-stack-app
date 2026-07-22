import { Sparkles } from "lucide-react";
import { cn } from "../../../lib/utils";

interface ProgressionCoachBannerProps {
    suggestion: {
        action: 'increase' | 'hold' | 'deload';
        weightKg: number;
        reason: string;
    } | null;
    onApply: () => void;
}

export function ProgressionCoachBanner({ suggestion, onApply }: ProgressionCoachBannerProps) {
    if (!suggestion || suggestion.weightKg <= 0) return null;

    return (
        <div className={cn(
            "rounded-2xl p-3 mx-1 flex items-center justify-between gap-3 border",
            suggestion.action === 'increase' ? "bg-primary/5 border-primary/15" :
            suggestion.action === 'deload' ? "bg-warning/5 border-warning/15" :
            "bg-white/[0.02] border-white/5"
        )}>
            <div className="flex items-start gap-2 min-w-0">
                <Sparkles size={13} className={cn(
                    "mt-0.5 shrink-0",
                    suggestion.action === 'increase' ? "text-primary" :
                    suggestion.action === 'deload' ? "text-warning" : "text-zinc-400"
                )} />
                <div className="min-w-0">
                    <div className="text-[11px] font-black text-white">
                        Coach: {suggestion.weightKg}kg today
                        <span className={cn(
                            "ml-1.5 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider",
                            suggestion.action === 'increase' ? "bg-primary/10 text-primary" :
                            suggestion.action === 'deload' ? "bg-warning/10 text-warning" :
                            "bg-white/5 text-zinc-400"
                        )}>
                            {suggestion.action === 'increase' ? '+ Progress' : suggestion.action === 'deload' ? 'Deload' : 'Repeat'}
                        </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-snug mt-0.5">{suggestion.reason}</p>
                </div>
            </div>
            <button
                onClick={onApply}
                className="shrink-0 px-3 py-1.5 bg-white/5 hover:bg-primary hover:text-black border border-white/10 rounded-xl text-[10px] font-black text-white transition-all tap-active"
            >
                Apply
            </button>
        </div>
    );
}
