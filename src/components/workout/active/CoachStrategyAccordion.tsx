interface CoachStrategyAccordionProps {
    description?: string;
    coachNotes?: string;
    showStrategy: boolean;
    onToggle: () => void;
}

export function CoachStrategyAccordion({
    description,
    coachNotes,
    showStrategy,
    onToggle
}: CoachStrategyAccordionProps) {
    if (!description && !coachNotes) return null;

    return (
        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-4.5 mb-5 space-y-2 animate-in slide-in-from-top-3 duration-300">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center text-left"
            >
                <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                    💡 Coach's Strategy
                </span>
                <span className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors">
                    {showStrategy ? "Hide Strategy" : "Show Strategy"}
                </span>
            </button>
            {showStrategy && (
                <div className="space-y-2 animate-in fade-in duration-200">
                    {description && (
                        <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                            {description}
                        </p>
                    )}
                    {coachNotes && (
                        <p className="text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-2">
                            {coachNotes}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
