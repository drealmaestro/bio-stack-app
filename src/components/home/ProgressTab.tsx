import { useMemo } from "react";
import { useStore } from "../../store/useStore";

interface MuscleVolumeRow {
    muscle: string;
    sets: number;
    target: number;
    badge: string;
    badgeColor: string;
    barColor: string;
}

export function ProgressTab({ todayStr: _todayStr }: { todayStr: string }) {
    const { user } = useStore();

    const weightList = user?.stats?.weight ?? [];
    const latestWeight = weightList.length > 0 ? weightList[weightList.length - 1].value : 74.8;
    const targetWeight = 72.0;

    const volumeRows: MuscleVolumeRow[] = useMemo(() => [
        {
            muscle: "Chest",
            sets: 12,
            target: 14,
            badge: "OPTIMAL",
            badgeColor: "bg-primary/15 text-primary border-primary/25",
            barColor: "bg-primary"
        },
        {
            muscle: "Deltoids / Shoulders",
            sets: 14,
            target: 14,
            badge: "TARGET MET",
            badgeColor: "bg-primary/15 text-primary border-primary/25",
            barColor: "bg-primary"
        },
        {
            muscle: "Back & Lats",
            sets: 8,
            target: 14,
            badge: "2 SETS BEHIND",
            badgeColor: "bg-amber-400/15 text-amber-400 border-amber-400/25",
            barColor: "bg-amber-400"
        },
    ], []);

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-12">
            {/* Weekly Growth Volume Card */}
            <div className="bg-card border border-white/5 p-5 rounded-3xl space-y-4 shadow-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Weekly Growth Volume</span>
                        <h4 className="text-lg font-black text-white">Target Sweet Spot (10–16 Sets)</h4>
                    </div>
                    <span className="text-[9px] text-zinc-500 font-bold text-right uppercase tracking-wider">Sets Logged</span>
                </div>

                <div className="space-y-3.5 text-xs">
                    {volumeRows.map((row) => (
                        <div key={row.muscle} className="space-y-1.5">
                            <div className="flex justify-between items-center font-bold">
                                <span className="text-zinc-200 font-black">{row.muscle}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-black">{row.sets} / {row.target} sets</span>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${row.badgeColor}`}>
                                        {row.badge}
                                    </span>
                                </div>
                            </div>
                            <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${row.barColor}`}
                                    style={{ width: `${Math.min((row.sets / row.target) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Body Weight Trend Progress Card */}
            <div className="bg-card border border-white/5 p-5 rounded-3xl space-y-3 shadow-xl">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Body Weight Trend</span>
                    <span className="text-xs font-black text-primary">-1.2 kg this month</span>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{latestWeight} kg</span>
                    <span className="text-xs text-zinc-400 font-bold">Goal: {targetWeight} kg</span>
                </div>

                <div className="h-20 w-full bg-black/30 rounded-2xl border border-white/5 flex items-center justify-center p-3">
                    <svg viewBox="0 0 300 60" className="w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id="weightLineGlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3ccf94" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#3ccf94" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>
                        <path d="M 10 50 L 70 45 L 140 38 L 210 30 L 280 20" fill="none" stroke="#3ccf94" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="280" cy="20" r="4" fill="#3ccf94" stroke="#121216" strokeWidth="2" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
