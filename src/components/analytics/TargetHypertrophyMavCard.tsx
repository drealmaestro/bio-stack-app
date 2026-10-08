interface MuscleProgress {
    muscle: string;
    logged: number;
    target: number;
    pct: number;
    badge?: string;
    isOverreach?: boolean;
}

const DEFAULT_TARGETS: MuscleProgress[] = [
    { muscle: "Chest", logged: 20, target: 22, pct: 91, badge: "91%" },
    { muscle: "Triceps", logged: 18, target: 18, pct: 100, badge: "Overreach", isOverreach: true },
    { muscle: "Biceps", logged: 16, target: 16, pct: 100, badge: "Saturated" },
    { muscle: "Shoulders & Back", logged: 14, target: 20, pct: 70, badge: "70%" },
    { muscle: "Legs", logged: 12, target: 16, pct: 75, badge: "75%" },
];

export function TargetHypertrophyMavCard() {
    const totalSets = DEFAULT_TARGETS.reduce((sum, item) => sum + item.logged, 0);

    return (
        <section className="stitch-card-1 p-4 border border-[#262b36] bg-[#14171d] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xs font-mono font-bold tracking-wider text-[#8e95a5] uppercase">
                        Target Hypertrophy (MAV)
                    </h2>
                    <p className="text-[10px] text-[#8e95a5] font-mono mt-0.5">
                        {totalSets} Sets Logged This Cycle
                    </p>
                </div>
                <span className="stitch-badge-target font-mono text-[10px]">
                    Optimum Range
                </span>
            </div>

            <div className="space-y-3 pt-1">
                {DEFAULT_TARGETS.map(item => (
                    <div key={item.muscle} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-white uppercase tracking-tight text-[11px]">
                                    {item.muscle}
                                </span>
                                {item.badge && (
                                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                                        item.isOverreach
                                            ? "bg-[#ccff00] text-black"
                                            : "bg-[#1e232d] text-[#8e95a5] border border-[#262b36]"
                                    }`}>
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className="font-mono font-bold text-xs text-white">
                                {item.logged} / {item.target} Sets
                            </span>
                        </div>
                        <div className="w-full bg-[#1e232d] h-2 rounded-full overflow-hidden">
                            <div
                                style={{ width: `${item.pct}%` }}
                                className={`h-full rounded-full transition-all duration-500 ${
                                    item.pct >= 100
                                        ? "bg-[#ccff00] shadow-[0_0_8px_rgba(204,255,0,0.3)]"
                                        : "bg-[#ccff00]/80"
                                }`}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
