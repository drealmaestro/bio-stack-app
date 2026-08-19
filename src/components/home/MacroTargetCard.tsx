interface MacroTargetCardProps {
    proteinCurrent: number;
    proteinTarget: number;
    carbsCurrent: number;
    carbsTarget: number;
    fatCurrent: number;
    fatTarget: number;
}

export function MacroTargetCard({
    proteinCurrent,
    proteinTarget,
    carbsCurrent,
    carbsTarget,
    fatCurrent,
    fatTarget,
}: MacroTargetCardProps) {
    return (
        <div className="bg-card border border-white/5 p-5 rounded-3xl space-y-3 shadow-xl">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Macronutrient Target</span>

            <div className="space-y-3 text-xs">
                <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                        <span className="text-zinc-300">Protein</span>
                        <span className="text-purple-400 font-black">{Math.round(proteinCurrent)} / {proteinTarget}g</span>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-purple-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((proteinCurrent / proteinTarget) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                        <span className="text-zinc-300">Carbohydrates</span>
                        <span className="text-sky-400 font-black">{Math.round(carbsCurrent)} / {carbsTarget}g</span>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-sky-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((carbsCurrent / carbsTarget) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                        <span className="text-zinc-300">Fat</span>
                        <span className="text-orange-400 font-black">{Math.round(fatCurrent)} / {fatTarget}g</span>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-orange-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((fatCurrent / fatTarget) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
