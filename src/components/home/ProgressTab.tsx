import { useMemo, useState } from "react";
import { useStore } from "../../store/useStore";
import { User, Target, TrendingUp, Dumbbell } from "lucide-react";
import { cn } from "../../lib/utils";
import { weeklyMuscleVolume, getTrainingWeekStart } from "../../lib/volume";

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
    const { user, logs, exercises, updateUserStats } = useStore();

    const [logWeightVal, setLogWeightVal] = useState("");
    const [logBodyFatVal, setLogBodyFatVal] = useState("");

    const lastWeight = useMemo(() => {
        if (!user?.stats?.weight?.length) return 0;
        const sorted = [...user.stats.weight].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return sorted[0].value;
    }, [user?.stats?.weight]);

    const lastBodyFat = useMemo(() => {
        if (!user?.stats?.body_fat?.length) return 0;
        const sorted = [...user.stats.body_fat].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return sorted[0].value;
    }, [user?.stats?.body_fat]);

    const handleLogWeight = () => {
        const val = parseFloat(logWeightVal);
        if (!isNaN(val) && val > 0) {
            updateUserStats('weight', { date: todayStr, value: val });
            setLogWeightVal("");
        }
    };

    const handleLogBodyFat = () => {
        const val = parseFloat(logBodyFatVal);
        if (!isNaN(val) && val > 0) {
            updateUserStats('body_fat', { date: todayStr, value: val });
            setLogBodyFatVal("");
        }
    };

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
                            {user?.experience_level || "Intermediate"} • {user?.age || 40} yrs old
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

            {/* Weekly Muscle Volume — is chest/arms actually getting enough work? */}
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
                        return (
                            <div key={row.muscle} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-extrabold text-white">{row.muscle}</span>
                                    <span className="font-bold text-zinc-400">
                                        <span className={cn("font-black", style.text)}>{row.sets}</span>
                                        {" / "}{row.target.min}–{row.target.max} sets
                                        <span className={cn("ml-1.5 text-[9px] uppercase font-black", style.text)}>{style.label}</span>
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-black/40 border border-white/5 overflow-hidden relative">
                                    {/* target band marker */}
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
                    10–16 quality sets per muscle per week is the hypertrophy sweet spot. Finish your scheduled sessions and chest, biceps and triceps land in range automatically.
                </p>
            </div>

            {/* Weight & Body Fat Loggers */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border border-white/5 p-4 rounded-3xl space-y-3 shadow-md flex flex-col justify-between">
                    <div>
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Weight</span>
                        <div className="text-2xl font-black text-white mt-0.5">
                            {lastWeight > 0 ? `${lastWeight} kg` : "N/A"}
                        </div>
                    </div>
                    <div>
                        <div className="flex gap-1.5 pt-1">
                            <input
                                type="number"
                                step="0.1"
                                placeholder="kg"
                                value={logWeightVal}
                                onChange={e => setLogWeightVal(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 focus:border-primary rounded-xl px-2 py-1 text-center text-xs text-white font-bold"
                            />
                            <button
                                onClick={handleLogWeight}
                                className="px-3 bg-primary text-black rounded-xl text-xs font-black hover:bg-primary/95 tap-active shadow-sm"
                            >
                                Log
                            </button>
                        </div>
                        <div className="flex gap-1 mt-2">
                            {[-0.5, -0.1, 0.1, 0.5].map(offset => (
                                <button
                                    key={offset}
                                    onClick={() => {
                                        const base = parseFloat(logWeightVal) || lastWeight || 70;
                                        const nextVal = Math.round((base + offset) * 10) / 10;
                                        setLogWeightVal(String(nextVal));
                                    }}
                                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 active:scale-90 border border-white/5 rounded-lg text-[9px] font-black text-zinc-400 hover:text-white transition-all"
                                >
                                    {offset > 0 ? `+${offset}` : offset}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-white/5 p-4 rounded-3xl space-y-3 shadow-md flex flex-col justify-between">
                    <div>
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Body Fat</span>
                        <div className="text-2xl font-black text-fat mt-0.5">
                            {lastBodyFat > 0 ? `${lastBodyFat}%` : "N/A"}
                        </div>
                    </div>
                    <div>
                        <div className="flex gap-1.5 pt-1">
                            <input
                                type="number"
                                step="0.1"
                                placeholder="%"
                                value={logBodyFatVal}
                                onChange={e => setLogBodyFatVal(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 focus:border-fat rounded-xl px-2 py-1 text-center text-xs text-white font-bold"
                            />
                            <button
                                onClick={handleLogBodyFat}
                                className="px-3 bg-fat text-white rounded-xl text-xs font-black hover:opacity-90 tap-active shadow-sm"
                            >
                                Log
                            </button>
                        </div>
                        <div className="flex gap-1 mt-2">
                            {[-0.5, -0.1, 0.1, 0.5].map(offset => (
                                <button
                                    key={offset}
                                    onClick={() => {
                                        const base = parseFloat(logBodyFatVal) || lastBodyFat || 15;
                                        const nextVal = Math.round((base + offset) * 10) / 10;
                                        setLogBodyFatVal(String(nextVal));
                                    }}
                                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 active:scale-90 border border-white/5 rounded-lg text-[9px] font-black text-zinc-400 hover:text-white transition-all"
                                >
                                    {offset > 0 ? `+${offset}` : offset}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

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
