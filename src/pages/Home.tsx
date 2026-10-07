import { useNavigate } from "react-router-dom";
import { Dumbbell, Calendar, Flame, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { useStore } from "../store/useStore";
import { useActiveWorkoutStore } from "../store/useActiveWorkoutStore";

export function Home() {
    const navigate = useNavigate();
    const { templates, logs } = useStore();
    const { activeWorkout, startWorkout } = useActiveWorkoutStore();

    // Default to the first template (e.g. Push Hypertrophy A) or active one
    const primaryTemplate = templates[0] || {
        id: "tpl-push-a",
        name: "Push Hypertrophy A",
        exercises: [{ id: "e1" }, { id: "e2" }, { id: "e3" }, { id: "e4" }, { id: "e5" }, { id: "e6" }],
    };

    const handleStartWorkout = () => {
        if (!activeWorkout) {
            startWorkout(primaryTemplate.id);
        }
        navigate("/active");
    };

    const weeklyVolume = [
        { muscle: "CHEST", current: 14, target: 16, status: "OPTIMAL" },
        { muscle: "BACK / LATS", current: 16, target: 16, status: "MAX STIMULUS" },
        { muscle: "QUADS", current: 10, target: 14, status: "ON TRACK" },
        { muscle: "HAMSTRINGS", current: 8, target: 10, status: "ON TRACK" },
        { muscle: "DELTOIDS", current: 16, target: 16, status: "MAX STIMULUS" },
        { muscle: "ARMS", current: 12, target: 14, status: "OPTIMAL" },
    ];

    const days = [
        { day: "MON", label: "PUSH A", status: "completed" },
        { day: "TUE", label: "PULL A", status: "completed" },
        { day: "WED", label: "REST", status: "rest" },
        { day: "THU", label: "LEGS A", status: "today" },
        { day: "FRI", label: "UPPER B", status: "scheduled" },
        { day: "SAT", label: "LOWER B", status: "scheduled" },
        { day: "SUN", label: "REST", status: "rest" },
    ];

    return (
        <div className="space-y-4 pb-6 animate-in fade-in duration-300">
            {/* Header Telemetry */}
            <div className="flex items-center justify-between border-b border-[#262b36] pb-2">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-[#8e95a5] tracking-widest uppercase">
                        MESOCYCLE 02 • WEEK 4
                    </span>
                </div>
                <span className="stitch-badge-target font-mono">OVERLOAD PHASE</span>
            </div>

            {/* Today's Target Card - Stitch Level 1 with Kinetic Glow */}
            <div className="stitch-card-1 p-4 relative overflow-hidden space-y-4 border-[#343b4a]">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-[11px] font-mono font-bold text-[#8e95a5] uppercase tracking-wider block">
                            TODAY'S TARGET FOCUS
                        </span>
                        <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight mt-0.5">
                            {activeWorkout ? "SESSION IN PROGRESS" : primaryTemplate.name}
                        </h2>
                    </div>
                    <div className="w-8 h-8 rounded bg-[#1a1e26] border border-[#262b36] flex items-center justify-center text-[#ccff00]">
                        <Dumbbell size={16} />
                    </div>
                </div>

                {/* Target Muscle Badges */}
                <div className="flex flex-wrap gap-1.5">
                    <span className="stitch-badge-target">CHEST</span>
                    <span className="stitch-badge-target">LATERAL DELTS</span>
                    <span className="stitch-badge-target">TRICEPS</span>
                    <span className="stitch-badge-neutral">RPE 8-10</span>
                </div>

                {/* Telemetry Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#262b36]/60 text-center">
                    <div>
                        <span className="text-[10px] font-mono text-[#8e95a5] block uppercase">EXERCISES</span>
                        <span className="text-xl font-display font-black text-white tabular-nums">
                            {primaryTemplate.exercises?.length || 6}
                        </span>
                    </div>
                    <div className="border-x border-[#262b36]/60">
                        <span className="text-[10px] font-mono text-[#8e95a5] block uppercase">PLANNED SETS</span>
                        <span className="text-xl font-display font-black text-[#ccff00] tabular-nums">18</span>
                    </div>
                    <div>
                        <span className="text-[10px] font-mono text-[#8e95a5] block uppercase">EST. TIME</span>
                        <span className="text-xl font-display font-black text-white tabular-nums">~50m</span>
                    </div>
                </div>

                {/* Overload Guidance Callout */}
                <div className="flex items-center gap-2 p-2.5 rounded bg-[#1a1e26] border border-[#262b36] text-xs">
                    <Flame size={15} className="text-[#ccff00] shrink-0" />
                    <span className="text-[#e2e5eb] font-sans text-[11px] leading-tight">
                        <strong className="text-[#ccff00]">Progressive Overload Target:</strong> +2.5 kg on Incline Dumbbell Press vs Week 3.
                    </span>
                </div>

                {/* Primary Action Button */}
                <button
                    onClick={handleStartWorkout}
                    className="w-full py-3.5 stitch-btn-primary flex items-center justify-center gap-2 text-base shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                >
                    <Zap size={18} fill="#0d0f12" />
                    <span>{activeWorkout ? "RESUME ACTIVE SESSION" : "START WORKOUT SESSION"}</span>
                    <ArrowRight size={18} />
                </button>
            </div>

            {/* 7-Day Split Microcycle Tracker */}
            <div className="stitch-card-1 p-3.5 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-display font-black text-[#e2e5eb] uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#ccff00]" /> 7-DAY MICROCYCLE SCHEDULE
                    </span>
                    <span className="text-[10px] font-mono text-[#8e95a5]">{logs.length} SESSIONS LOGGED</span>
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {days.map((d, i) => (
                        <div
                            key={i}
                            className={`flex flex-col items-center justify-center p-1.5 rounded border text-center transition-all ${
                                d.status === "completed"
                                    ? "bg-[#121a10] border-[#ccff00]/40 text-[#ccff00]"
                                    : d.status === "today"
                                    ? "bg-[#1a1e26] border-[#ccff00] shadow-[0_0_8px_rgba(204,255,0,0.25)] text-white"
                                    : d.status === "rest"
                                    ? "bg-[#0d0f12] border-[#262b36] text-[#8e95a5]/60"
                                    : "bg-[#14171d] border-[#262b36] text-[#8e95a5]"
                            }`}
                        >
                            <span className="text-[9px] font-mono font-bold tracking-tight">{d.day}</span>
                            <span className="text-[10px] font-display font-bold leading-none my-1">{d.label}</span>
                            {d.status === "completed" ? (
                                <CheckCircle2 size={10} className="text-[#ccff00]" />
                            ) : (
                                <div className={`w-1 h-1 rounded-full ${d.status === "today" ? "bg-[#ccff00]" : "bg-transparent"}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Muscle Hypertrophy Volume Thresholds (MAV / MRV) */}
            <div className="stitch-card-1 p-3.5 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-display font-black text-[#e2e5eb] uppercase tracking-wider">
                        WEEKLY VOLUME THRESHOLDS (SETS)
                    </span>
                    <span className="text-[10px] font-mono text-[#ccff00]">OPTIMAL HYPERTROPHY ZONE</span>
                </div>

                <div className="space-y-2.5">
                    {weeklyVolume.map((item, idx) => {
                        const pct = Math.min(100, Math.round((item.current / item.target) * 100));
                        return (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-[11px] font-mono">
                                    <span className="font-bold text-[#e2e5eb]">{item.muscle}</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[#8e95a5]">{item.current} / {item.target} SETS</span>
                                        <span className="text-[9px] px-1 py-0.2 rounded bg-[#1a1e26] text-[#ccff00] font-bold">
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-[#1a1e26] overflow-hidden">
                                    <div
                                        className="h-full bg-[#ccff00] transition-all duration-500"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
