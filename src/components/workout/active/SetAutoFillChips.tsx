import { Zap, Copy, History } from "lucide-react";
import type { SmartRecommendation } from "../../../utils/progressiveOverload";

export interface SetAutoFillChipsProps {
  recommendation?: SmartRecommendation | null;
  previousSet?: { weight: number; reps: number } | null;
  previousSetIndex?: number;
  lastSessionSet?: { weight: number; reps: number } | null;
  onApply: (weight: number, reps: number) => void;
}

export function SetAutoFillChips({
  recommendation,
  previousSet,
  previousSetIndex,
  lastSessionSet,
  onApply,
}: SetAutoFillChipsProps) {
  const hasChips = Boolean(
    (recommendation && (recommendation.suggestedWeightKg > 0 || recommendation.suggestedReps > 0)) ||
    previousSet ||
    lastSessionSet
  );
  if (!hasChips) return null;

  const recWeight = recommendation?.suggestedWeightKg ?? 0;
  const recReps = recommendation?.suggestedReps ?? 0;
  const recTargetText = recWeight > 0 ? `${recWeight}kg × ${recReps}` : `${recReps} reps`;

  return (
    <div className="flex gap-2 items-center overflow-x-auto pb-1 scrollbar-none">
      {recommendation && (
        <button
          type="button"
          onClick={() => onApply(recWeight, recReps)}
          title={recommendation.reason}
          className="shrink-0 bg-primary/20 hover:bg-primary/30 border border-primary/40 rounded-xl px-3 py-2 text-xs font-black text-primary flex items-center gap-1.5 transition-all tap-active cursor-pointer min-h-[44px] shadow-sm shadow-primary/10"
        >
          <Zap size={13} className="fill-primary" />
          <span>⚡ Smart Rec ({recommendation.shortBadgeText}: {recTargetText})</span>
        </button>
      )}

      {previousSet && (
        <button
          type="button"
          onClick={() => onApply(previousSet.weight, previousSet.reps)}
          className="shrink-0 bg-primary/10 hover:bg-primary/20 border border-primary/25 rounded-xl px-3 py-2 text-xs font-bold text-primary flex items-center gap-1.5 transition-all tap-active cursor-pointer min-h-[44px]"
        >
          <Copy size={12} />
          <span>Copy Set {previousSetIndex ?? "Prev"} ({previousSet.weight}kg × {previousSet.reps})</span>
        </button>
      )}

      {lastSessionSet && (
        <button
          type="button"
          onClick={() => onApply(lastSessionSet.weight, lastSessionSet.reps)}
          className="shrink-0 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-zinc-300 flex items-center gap-1.5 transition-all tap-active cursor-pointer min-h-[44px]"
        >
          <History size={12} className="text-zinc-400" />
          <span>Last Session ({lastSessionSet.weight}kg × {lastSessionSet.reps})</span>
        </button>
      )}
    </div>
  );
}