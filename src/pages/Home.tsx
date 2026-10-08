import { useNavigate } from "react-router-dom";
import { Play, Clock, BarChart2, Calendar, ShieldCheck, ChevronRight, Moon } from "lucide-react";
import { useStore } from "../store/useStore";
import { useActiveWorkoutStore } from "../store/useActiveWorkoutStore";

export function Home() {
    const navigate = useNavigate();
    const { templates } = useStore();
    const { activeWorkout, startWorkout } = useActiveWorkoutStore();

    const primaryTemplate = templates[0] || {
        id: "tpl-push-a",
        name: "DAY 1: CHEST & ARMS DOMINANCE",
        exercises: [{ id: "e1" }, { id: "e2" }, { id: "e3" }, { id: "e4" }, { id: "e5" }, { id: "e6" }],
    };

    const handleStart = () => {
        if (!activeWorkout) {
            startWorkout(primaryTemplate.id);
        }
        navigate("/active");
    };

    const days = [
        { date: "MON 23", name: "CHEST & ARMS", sub: "Push / Arm Hypertrophy Bias", isToday: true, off: false },
        { date: "TUE 24", name: "LEGS & CORE", sub: "Squat Pattern & Posterior Chain", isToday: false, off: false, count: "5 EX" },
        { date: "WED 25", name: "BACK & BICEPS HYPERTROPHY", sub: "Vertical Pull + Elbow Flexion Density", isToday: false, off: false, count: "6 EX" },
        { date: "THU 26", name: "REST & RECOVERY", sub: "Active Mobility • Foam Roll & Hydration", isToday: false, off: true },
        { date: "FRI 27", name: "UPPER BODY PUMP", sub: "Chest & Triceps Overload", isToday: false, off: false, count: "6 EX" },
        { date: "SAT 28", name: "FULL BODY POWER & ARMS", sub: "Compound Speed + Arm Finisher", isToday: false, off: false, count: "5 EX" },
        { date: "SUN 29", name: "REST & RECOVERY", sub: "CNS Reset & Nutritional Reload", isToday: false, off: true },
    ];

    return (
        <div className="space-y-3.5 pb-6 animate-in fade-in duration-300">
            {/* Top Sub-Bar Telemetry */}
            <div className="flex justify-between items-center border-b border-[#1a1e26] pb-2">
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-display font-black text-sm text-white tracking-tight uppercase">
                            MONDAY, OCT 23
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-[#1a1e26] border border-[#262b36] text-[9px] font-mono font-bold text-[#8e95a5]">
                            W4
                        </span>
                    </div>
                    <span className="text-[9px] font-mono text-[#8e95a5] uppercase tracking-wider block">
                        HYPERTROPHY MESOCYCLE • MICROCYCLE 2 OF 4
                    </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#14171d] border border-[#262b36]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
                    <span className="text-[9px] font-mono font-bold text-[#ccff00] uppercase tracking-wider">
                        DB SYNCED
                    </span>
                </div>
            </div>

            {/* Card 1: TODAY'S PROTOCOL */}
            <div className="stitch-card-1 p-3.5 space-y-3 border-[#343b4a]">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-[#ccff00] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" /> TODAY'S PROTOCOL
                    </span>
                    <span className="text-[10px] font-mono text-[#8e95a5] flex items-center gap-1">
                        <Clock size={11} /> EST. 55 MIN
                    </span>
                </div>

                <div>
                    <h2 className="text-xl font-display font-black text-white uppercase tracking-tight leading-tight">
                        DAY 1: CHEST & ARMS DOMINANCE
                    </h2>
                    <p className="text-[11px] text-[#8e95a5] font-sans leading-snug mt-0.5">
                        High-threshold motor unit recruitment with hypertrophic arm isolation.
                    </p>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                    {[
                        { val: "6", label: "EXERCISES", volt: false },
                        { val: "22", label: "WORK SETS", volt: false },
                        { val: "RPE 8", label: "TARGET LOAD", volt: true }
                    ].map((m, i) => (
                        <div key={i} className="p-2 rounded bg-[#1a1e26] border border-[#262b36]">
                            <span className={`text-2xl font-display font-black tabular-nums leading-none block ${m.volt ? "text-[#ccff00]" : "text-white"}`}>{m.val}</span>
                            <span className="text-[9px] font-mono text-[#8e95a5] uppercase mt-0.5 block">{m.label}</span>
                        </div>
                    ))}
                </div>

                {/* Load Distribution */}
                <div>
                    <span className="text-[9px] font-mono text-[#8e95a5] uppercase tracking-widest block mb-1">
                        LOAD DISTRIBUTION
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        <span className="stitch-badge-target text-[9px]">• CHEST 40%</span>
                        <span className="stitch-badge-target text-[9px]">• TRICEPS 35%</span>
                        <span className="stitch-badge-target text-[9px]">• BICEPS 25%</span>
                    </div>
                </div>

                {/* Start Workout Button */}
                <button
                    onClick={handleStart}
                    className="w-full py-3 stitch-btn-primary flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(204,255,0,0.25)]"
                >
                    <Play size={16} fill="#0d0f12" />
                    <span>{activeWorkout ? "RESUME WORKOUT" : "START WORKOUT"}</span>
                </button>
            </div>

            {/* Card 2: WEEKLY TARGET ACCUMULATION */}
            <div className="stitch-card-1 p-3.5 space-y-2.5">
                <div className="flex justify-between items-center">
                    <span className="text-[11px] font-display font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <BarChart2 size={13} className="text-[#ccff00]" /> WEEKLY TARGET ACCUMULATION
                    </span>
                    <span className="text-[9px] font-mono text-[#8e95a5]">RIAS TARGETS</span>
                </div>

                <div className="space-y-2">
                    {[
                        { label: "CHEST VOLUME", curr: 18, total: 20, pct: "90%" },
                        { label: "TRICEPS VOLUME", curr: 15, total: 16, pct: "94%" },
                        { label: "BICEPS VOLUME", curr: 14, total: 16, pct: "87%" },
                    ].map((row, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-white font-bold">{row.label}</span>
                                <span className="text-[#8e95a5]">
                                    <strong className="text-white">{row.curr}</strong> / {row.total} SETS <span className="text-[#ccff00] font-bold ml-1">{row.pct}</span>
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-[#1a1e26] rounded-full overflow-hidden">
                                <div className="h-full bg-[#ccff00]" style={{ width: row.pct }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Card 3: 7-DAY MICROCYCLE */}
            <div className="stitch-card-1 p-3.5 space-y-2">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-display font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#ccff00]" /> 7-DAY MICROCYCLE
                    </span>
                    <span className="text-[9px] font-mono text-[#8e95a5]">5 LIFT / 2 REST</span>
                </div>

                <div className="space-y-1.5">
                    {days.map((d, i) => (
                        <div
                            key={i}
                            className={`p-2 rounded border flex justify-between items-center transition-all ${
                                d.isToday
                                    ? "bg-[#1a1e26] border-[#ccff00] shadow-[0_0_8px_rgba(204,255,0,0.15)]"
                                    : "bg-[#14171d] border-[#262b36]"
                            }`}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                    d.isToday ? "bg-[#ccff00] text-[#0d0f12]" : "bg-[#1a1e26] text-[#8e95a5]"
                                }`}>
                                    {d.date}
                                </span>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-display font-black text-xs text-white uppercase truncate">
                                            {d.name}
                                        </span>
                                        {d.isToday && (
                                            <span className="stitch-badge-target text-[8px] py-0 px-1">TODAY</span>
                                        )}
                                        {d.off && (
                                            <span className="stitch-badge-neutral text-[8px] py-0 px-1">OFF</span>
                                        )}
                                    </div>
                                    <span className="text-[9px] font-sans text-[#8e95a5] block truncate">
                                        {d.sub}
                                    </span>
                                </div>
                            </div>

                            <div className="shrink-0 ml-2">
                                {d.isToday ? (
                                    <button
                                        onClick={handleStart}
                                        className="w-7 h-7 rounded-full bg-[#ccff00] flex items-center justify-center text-[#0d0f12]"
                                        title="Start session"
                                    >
                                        <Play size={12} fill="#0d0f12" />
                                    </button>
                                ) : d.off ? (
                                    <Moon size={14} className="text-[#8e95a5]" />
                                ) : (
                                    <span className="text-[9px] font-mono text-[#8e95a5] flex items-center">
                                        {d.count} <ChevronRight size={12} />
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Card 4: BIO-READINESS SNAPSHOT */}
            <div className="stitch-card-1 p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-[11px] font-display font-black text-white uppercase tracking-wider">
                        BIO-READINESS SNAPSHOT
                    </span>
                    <span className="stitch-badge-target text-[8px]">PRIME TO LIFT</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    {[
                        { label: "SLEEP", val: "7h 45m", sub: "REM + 35m", border: false, volt: false },
                        { label: "RECOVERY", val: "92%", sub: "HIGH CNS", border: true, volt: true },
                        { label: "SORENESS", val: "LOW", sub: "ARMS FRESH", border: false, volt: false },
                    ].map((item, i) => (
                        <div key={i} className={item.border ? "border-x border-[#262b36]" : ""}>
                            <span className="text-[9px] font-mono text-[#8e95a5] uppercase block">{item.label}</span>
                            <span className={`text-base font-display font-black tabular-nums block ${item.volt ? "text-[#ccff00]" : "text-white"}`}>{item.val}</span>
                            <span className="text-[8px] font-mono text-[#8e95a5] block">{item.sub}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Card 5: Pre-Workout Telemetry Verified */}
            <div className="flex items-center gap-2 p-2.5 rounded bg-[#14171d] border border-[#262b36] text-[10px] font-mono">
                <ShieldCheck size={14} className="text-[#ccff00] shrink-0" />
                <div className="min-w-0">
                    <span className="text-white font-bold uppercase block leading-none">PRE-WORKOUT TELEMETRY VERIFIED</span>
                    <span className="text-[#8e95a5] text-[9px] truncate block mt-0.5">Local cache locked • Ready for zero-latency operation</span>
                </div>
            </div>
        </div>
    );
}
