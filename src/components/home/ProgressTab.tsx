import { useMemo } from "react";
import { useStore } from "../../store/useStore";
import { User, Target, Dumbbell, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";
import { weeklyMuscleVolume, getTrainingWeekStart } from "../../lib/volume";
import { MuscleHeatmap } from "../analytics/MuscleHeatmap";
import { MuscleDistributionChart } from "../analytics/MuscleDistributionChart";
import { WeightBodyFatCard } from "./WeightBodyFatCard";

const CHART_W = 340;
const CHART_H = 100;
const CHART_PAD = 15;

function buildWeightPaths(weights: { date: string; value: number }[]) {
    if (weights.length < 2) return { line: "", area: "", points: [] as { x: number; y: number; label: string }[] };
    const sorted = [...weights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const values = sorted.map(w => w.value);
    const minW = Math.min(...values) - 1;
    const maxW = Math.max(...values) + 1;
    const rangeW = maxW - minW || 1;

    const points = sorted.map((w, idx) => ({
        x: CHART_PAD + (idx / (sorted.length - 1)) * (CHART_W - 2 * CHART_PAD),
        y: CHART_H - CHART_PAD - ((w.value - minW) / rangeW) * (CHART_H - 2 * CHART_PAD),
        label: `${w.value}kg (${w.date})`,
    }));

    const coords = points.map(p => `${p.x},${p.y}`);
    const line = `M ${coords.join(" L ")}`;
    const area = `M ${coords.join(" L ")} L ${points[points.length - 1].x},${CHART_H - CHART_PAD} L ${CHART_PAD},${CHART_H - CHART_PAD} Z`;
    return { line, area, points };
}

const VOLUME_STATUS_STYLES = {
    low: { bar: "bg-zinc-600", text: "text-warning", label: "below" },
    on: { bar: "bg-primary", text: "text-primary", label: "on target" },
    high: { bar: "bg-fat", text: "text-fat", label: "high" },
} as const;

export function ProgressTab({ todayStr }: { todayStr: string }) {
    const { user, logs, exercises } = useStore();

    const volumeRows = useMemo(
        () => weeklyMuscleVolume(logs, exercises, getTrainingWeekStart(new Date())),
        [logs, exercises]
    );

    const chart = useMemo(
        () => buildWeightPaths(user?.stats?.weight ?? []),
        [user?.stats?.weight]
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Profile Info Summary */}
            <div className="bg-card border border-white/5 p-5 rounded-3xl space-y-4 shadow-md">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black text-lg">
                        {user?.name ? user.name[0].toUpperCase() : <User size={20} />}
                    </div>
                    <div>
                        <h4 className="font-black text-white text-base leading-tight">{user?.name || "Athlete Profile"}</h4>
                        <span className="text-xs text-zinc-500 font-bold capitalize mt-0.5">
                            {user?.experience_level || "Intermediate"} • {user?.age || 47} yrs old
                        </span>
                    </div>
                </div>

                {user?.goals && user.goals.length > 0 && (
                    <div className="space-y-1.5 border-t border-white/5 pt-3">
                        <span className="section-label block">Active Targets</span>
                        <div className="flex flex-wrap gap-1.5">
                            {user.goals.map((g, idx) => (
                                <span key={idx} className="text-[10px] font-extrabold px-3 py-1 bg-white/5 text-zinc-300 rounded-full flex items-center gap-1">
                                    <Target size={10} className="text-primary" /> {g}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Interactive Muscle Heatmap */}
            <MuscleHeatmap volumeRows={volumeRows} />

            {/* Muscle Volume Distribution */}
            <MuscleDistributionChart logs={logs} exercises={exercises} />

            {/* Weekly Muscle Volume — comparative overload deltas */}
            <div className="bg-card border border-white/5 p-5 rounded-3xl space-y-4 shadow-md">
                <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest block">This Training Week</span>
                        <h4 className="text-lg font-black text-white flex items-center gap-2">
                            <Dumbbell size={16} className="text-primary" /> Muscle Volume
                        </h4>
                    </div>
                    <span className="text-[9px] text-zinc-500 font-bold text-right">hard sets<br />vs. growth target</span>
                </div>

                <div className="space-y-3">
                    {volumeRows.map(row => {
                        const style = VOLUME_STATUS_STYLES[row.status];
                        const pct = Math.min(row.sets / row.target.max, 1) * 100;
                        const delta = row.sets - row.target.min;
                        return (
                            <div key={row.muscle} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-extrabold text-white">{row.muscle}</span>
                                    <span className="font-bold text-zinc-400">
                                        <span className={cn("font-black", style.text)}>{row.sets}</span>
                                        {" / "}{row.target.min}–{row.target.max} sets
                                        <span className={cn("ml-1.5 text-[9px] uppercase font-black", style.text)}>
                                            {delta >= 0 ? `+${delta} delta` : style.label}
                                        </span>
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-black/40 border border-white/5 overflow-hidden relative">
                                    <div
                                        className="absolute top-0 bottom-0 bg-white/5"
                                        style={{
                                            left: `${(row.target.min / row.target.max) * 100}%`,
                                            right: 0,
                                        }}
                                    />
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-700", style.bar)}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed border-t border-white/5 pt-3">
                    10–16 quality sets per muscle per week is the hypertrophy sweet spot. Finish scheduled sessions to hit target range automatically.
                </p>
            </div>

            {/* Weight & Body Fat Loggers */}
            <WeightBodyFatCard todayStr={todayStr} />

            {/* Weight Trend Progress Chart */}
            {chart.points.length >= 2 && (
                <div className="bg-card border border-white/5 p-5 rounded-3xl space-y-4 shadow-md">
                    <div className="flex justify-between items-center">
                        <span className="section-label">Weight Trend Progress</span>
                        <span className="text-[10px] text-primary font-black uppercase flex items-center gap-1">
                            <TrendingUp size={10} /> Active
                        </span>
                    </div>

                    <div className="w-full h-28 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center p-2">
                        <svg width="100%" height="100%" viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="overflow-visible">
                            <defs>
                                <linearGradient id="weightAreaGlow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>

                            <line x1="15" y1="15" x2="325" y2="15" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                            <line x1="15" y1="50" x2="325" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                            <line x1="15" y1="85" x2="325" y2="85" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                            <path d={chart.area} fill="url(#weightAreaGlow)" />
                            <path
                                d={chart.line}
                                fill="none"
                                stroke="var(--color-primary)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="drop-shadow-[0_0_8px_rgba(60,207,148,0.45)]"
                            />
                            {chart.points.map((p, idx) => (
                                <g key={idx} className="cursor-pointer">
                                    <circle cx={p.x} cy={p.y} r="3.5" fill="var(--color-primary)" stroke="#121216" strokeWidth="1.5" />
                                    <title>{p.label}</title>
                                </g>
                            ))}
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}
