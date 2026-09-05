import { Zap, Sparkles } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { SmartRecommendation } from "../../../utils/progressiveOverload";

export interface RecommendationBadgeProps {
  recommendation: SmartRecommendation;
  onApply: (weight: number, reps: number) => void;
  compact?: boolean;
  className?: string;
}

export function RecommendationBadge({
  recommendation,
  onApply,
  compact = false,
  className,
}: RecommendationBadgeProps) {
  const { action, suggestedWeightKg, suggestedReps, shortBadgeText, reason, isDeload, isOverload } = recommendation;

  const colorStyles = isDeload
    ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
    : isOverload || action === "increase"
      ? "border-primary/30 bg-primary/10 text-primary"
      : "border-blue-500/30 bg-blue-500/10 text-blue-300";

  const targetLabel = suggestedWeightKg > 0
    ? `${suggestedWeightKg}kg × ${suggestedReps} reps`
    : `${suggestedReps} reps`;

  return (
    <div
      title={reason}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all select-none",
        colorStyles,
        className
      )}
    >
      {isDeload ? <Zap className="w-3 h-3 shrink-0 fill-amber-400" /> : <Sparkles className="w-3 h-3 shrink-0 fill-primary" />}
      <span className="font-extrabold uppercase tracking-wider">{shortBadgeText}</span>
      {!compact && <span className="text-zinc-400 font-mono font-medium">({targetLabel})</span>}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          navigator.vibrate?.(30);
          onApply(suggestedWeightKg, suggestedReps);
        }}
        className="min-h-[44px] min-w-[44px] -my-3 -mr-2 px-2 flex items-center justify-center font-black uppercase text-[10px] text-white hover:text-primary transition-colors cursor-pointer"
        aria-label={`Apply recommendation: ${shortBadgeText} (${targetLabel})`}
      >
        Apply
      </button>
    </div>
  );
}