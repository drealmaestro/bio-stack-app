import { cn } from '../../lib/utils';
import { Activity } from 'lucide-react';

export interface RpeSliderProps {
    value: number;
    onChange: (val: number) => void;
    className?: string;
}

export function RpeSlider({ value, onChange, className }: RpeSliderProps) {
    const currentRpe = value || 7;

    const getRpeBadgeStyle = (rpe: number) => {
        if (rpe >= 9.5) return 'bg-red-500/20 text-red-400 border-red-500/30';
        if (rpe >= 8.5) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        if (rpe >= 7.5) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        if (rpe >= 6.5) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    };

    const getRpeDescription = (rpe: number) => {
        if (rpe >= 10) return 'Max Effort (0 RIR — No reps left)';
        if (rpe >= 9.5) return 'Near Max (1 rep maybe left)';
        if (rpe >= 9) return 'Heavy Effort (1 RIR remaining)';
        if (rpe >= 8.5) return 'Challenging (1–2 RIR remaining)';
        if (rpe >= 8) return 'Solid Work (2 RIR remaining)';
        if (rpe >= 7.5) return 'Moderate (2–3 RIR remaining)';
        if (rpe >= 7) return 'Controlled (3 RIR remaining)';
        if (rpe >= 6.5) return 'Light-Moderate (3–4 RIR)';
        if (rpe >= 6) return 'Light (4+ RIR remaining)';
        return 'Warm-up / Light Effort';
    };

    const quickValues = [6, 7, 8, 8.5, 9, 9.5, 10];

    return (
        <div className={cn("w-full bg-black/20 border border-white/5 rounded-2xl p-3.5 space-y-3", className)}>
            {/* Header & Effort Badge */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-300">
                        RPE / Effort Rating
                    </span>
                </div>
                <div className={cn(
                    "px-2.5 py-0.5 text-xs font-mono font-black rounded-full border transition-colors",
                    getRpeBadgeStyle(currentRpe)
                )}>
                    @ RPE {currentRpe}
                </div>
            </div>

            {/* Effort Description */}
            <p className="text-xs font-medium text-zinc-400 leading-snug">
                {getRpeDescription(currentRpe)}
            </p>

            {/* Touch Range Slider */}
            <div className="px-1 py-1">
                <input
                    type="range"
                    min="5"
                    max="10"
                    step="0.5"
                    value={currentRpe}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    aria-label="RPE Effort Slider"
                    className="w-full accent-primary h-2 bg-white/10 rounded-lg cursor-pointer transition-all"
                />
            </div>

            {/* Quick RPE Tap Pills */}
            <div className="flex justify-between gap-1">
                {quickValues.map((v) => (
                    <button
                        key={v}
                        type="button"
                        onClick={() => onChange(v)}
                        className={cn(
                            "flex-1 py-1 text-[10px] font-mono font-bold rounded-lg border transition-all tap-active cursor-pointer",
                            currentRpe === v
                                ? "bg-primary text-black border-primary font-black scale-105"
                                : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10"
                        )}
                    >
                        {v}
                    </button>
                ))}
            </div>
        </div>
    );
}
