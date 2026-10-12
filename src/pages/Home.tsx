import { useNavigate } from "react-router-dom";
import { Play, Clock, BarChart2, Calendar, ShieldCheck, Moon, Zap } from "lucide-react";
import { useStore } from "../store/useStore";
import { useActiveWorkoutStore } from "../store/useActiveWorkoutStore";

export function Home() {
    const navigate = useNavigate();
    const { templates } = useStore();
    const { activeWorkout, startWorkout, cancelWorkout } = useActiveWorkoutStore();

    const now = new Date();
    const dayIndex = now.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
    const formattedDate = now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }).toUpperCase();

    const scheduleMap: Record<number, string> = {
        1: "tmpl_chest_tri_power",
        2: "tmpl_back_bi_builder",
        3: "tmpl_lower_foundation",
        5: "tmpl_shoulder_core",
        6: "tmpl_chest_arms_vol",
    };

    const todayTemplateId = scheduleMap[dayIndex] || "tmpl_chest_tri_power";
    const primaryTemplate = templates.find(t => t.id === todayTemplateId) || templates[0] || {
        id: "tmpl_chest_tri_power",
        name: "DAY 1: CHEST & TRICEPS + LEFT-SHOULDER LOCK-IN",
        description: "2-min Left-Shoulder Rotator Cuff Lock-In + Unilateral DB & Cable Chest/Tricep Stamina.",
        exercises: Array.from({ length: 8 }, (_, i) => ({ exercise_id: `e${i}`, target_sets: 3, target_reps: 12, rest_seconds: 90 })),
    };

    const totalWorkSets = primaryTemplate.exercises.reduce((sum, e) => sum + (e.target_sets || 3), 0);

    const handleLaunchTemplate = (templateId: string) => {
        if (activeWorkout && activeWorkout.templateId !== templateId && activeWorkout.completedSets.length === 0) {
            cancelWorkout();
            startWorkout(templateId);
        } else if (!activeWorkout) {
            startWorkout(templateId);
        }
        navigate("/active");
    };

    const days = [
        { dayNum: 1, date: "MON", name: "CHEST, TRICEPS & LEFT SHOULDER", sub: "2-Min Cuff Lock-In + Unilateral Push Stamina", tmplId: "tmpl_chest_tri_power", count: "8 EX" },
        { dayNum: 2, date: "TUE", name: "BACK, REAR DELTS & BICEP PEAK", sub: "Lat Width + Posterior Shoulder Support & Curls", tmplId: "tmpl_back_bi_builder", count: "7 EX" },
        { dayNum: 3, date: "WED", name: "FULL LEGS, LEFT SHOULDER & CORE", sub: "Spine-Safe Legs + Left Delt Endurance Rebuild", tmplId: "tmpl_lower_foundation", count: "8 EX" },
        { dayNum: 4, date: "THU", name: "REST & RECOVERY (DAY 1)", sub: "48h Muscle & Left-Shoulder Tendon Recovery", tmplId: null, count: "REST" },
        { dayNum: 5, date: "FRI", name: "UPPER CHEST, BICEPS & TRICEPS", sub: "Upper Chest Cable Pre-Exhaust + Arm Supersets", tmplId: "tmpl_shoulder_core", count: "8 EX" },
        { dayNum: 6, date: "SAT", name: "FULL-BODY POWER & ARM FINISHER", sub: "Total Body Hypertrophy + Left-Arm Stamina", tmplId: "tmpl_chest_arms_vol", count: "7 EX" },
        { dayNum: 0, date: "SUN", name: "REST & RECOVERY (DAY 2)", sub: "Full CNS Reset & Nutritional Reload", tmplId: null, count: "REST" },
    ];

    return (
        <div className="space-y-3.5 pb-6 animate-in fade-in duration-300">
            {/* Top Sub-Bar Telemetry */}
            <div className="flex justify-between items-center border-b border-[#1a1e26] pb-2">
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-display font-black text-sm text-white tracking-tight uppercase">{formattedDate}</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#1a1e26] border border-[#262b36] text-[9px] font-mono font-bold text-[#ccff00]">48+ ELITE</span>
                    </div>
                    <span className="text-[9px] font-mono text-[#8e95a5] uppercase tracking-wider block">LEFT-SHOULDER LOCK-IN • CHEST & ARM SPECIALIZATION</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#14171d] border border-[#262b36]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
                    <span className="text-[9px] font-mono font-bold text-[#ccff00] uppercase tracking-wider">DB SYNCED</span>
                </div>
            </div>

            {/* Card 1: TODAY'S PROTOCOL */}
            <div className="stitch-card-1 p-3.5 space-y-3 border-[#343b4a]">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-[#ccff00] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" /> TODAY'S GYM PROTOCOL
                    </span>
                    <span className="text-[10px] font-mono text-[#8e95a5] flex items-center gap-1"><Clock size={11} /> EST. 60 MIN</span>
                </div>
                <div>
                    <h2 className="text-xl font-display font-black text-white uppercase tracking-tight leading-tight">{primaryTemplate.name}</h2>
                    <p className="text-[11px] text-[#8e95a5] font-sans leading-snug mt-0.5">{primaryTemplate.description}</p>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                    {[
                        { val: String(primaryTemplate.exercises.length), label: "EXERCISES", volt: false },
                        { val: String(totalWorkSets), label: "WORK SETS", volt: false },
                        { val: "LEFT LEAD", label: "+20s OFFSET", volt: true }
                    ].map((m, i) => (
                        <div key={i} className="p-2 rounded bg-[#1a1e26] border border-[#262b36]">
                            <span className={`text-xl font-display font-black tabular-nums leading-none block ${m.volt ? "text-[#ccff00]" : "text-white"}`}>{m.val}</span>
                            <span className="text-[9px] font-mono text-[#8e95a5] uppercase mt-0.5 block">{m.label}</span>
                        </div>
                    ))}
                </div>

                {/* Load Distribution */}
                <div>
                    <span className="text-[9px] font-mono text-[#8e95a5] uppercase tracking-widest block mb-1">
                        SESSION FOCUS & DOCTOR PROTOCOL
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        <span className="stitch-badge-target text-[9px]">• LEFT SHOULDER LOCK-IN</span>
                        <span className="stitch-badge-target text-[9px]">• CHEST 40%</span>
                        <span className="stitch-badge-target text-[9px]">• TRICEPS & BICEPS 45%</span>
                    </div>
                </div>

                {/* Start Workout Button */}
                <button
                    onClick={() => handleLaunchTemplate(primaryTemplate.id)}
                    className="w-full py-3 stitch-btn-primary flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(204,255,0,0.25)]"
                >
                    <Play size={16} fill="#0d0f12" />
                    <span>{activeWorkout ? "RESUME TODAY'S WORKOUT" : "START TODAY'S WORKOUT"}</span>
                </button>

                {/* Quick At-Home Stretch Band Option */}
                <button
                    onClick={() => handleLaunchTemplate("tmpl_home_band_protocol")}
                    className="w-full py-2 rounded bg-[#1a1e26] border border-[#ccff00]/40 text-[#ccff00] font-mono font-bold text-[11px] uppercase flex items-center justify-center gap-1.5 hover:bg-[#ccff00]/10 transition-all"
                >
                    <Zap size={13} /> STAYING HOME? START STRETCH-BAND WORKOUT (35m)
                </button>
            </div>

            {/* Card 2: WEEKLY TARGET ACCUMULATION */}
            <div className="stitch-card-1 p-3.5 space-y-2.5">
                <div className="flex justify-between items-center">
                    <span className="text-[11px] font-display font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <BarChart2 size={13} className="text-[#ccff00]" /> WEEKLY TARGET ACCUMULATION
                    </span>
                    <span className="text-[9px] font-mono text-[#8e95a5]">LEFT-SIDE PRIORITY</span>
                </div>

                <div className="space-y-2">
                    {[
                        { label: "CHEST + LEFT STAMINA", curr: 18, total: 20, pct: "90%" },
                        { label: "TRICEPS + LOCKOUT", curr: 15, total: 16, pct: "94%" },
                        { label: "BICEPS + LEFT SHOULDER", curr: 14, total: 16, pct: "87%" },
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
                        <Calendar size={13} className="text-[#ccff00]" /> 7-DAY MICROCYCLE (TAP ANY DAY TO START)
                    </span>
                    <span className="text-[9px] font-mono text-[#8e95a5]">5 GYM / 2 REST</span>
                </div>
                <div className="space-y-1.5">
                    {days.map((d, i) => {
                        const isToday = d.dayNum === dayIndex;
                        const isOff = d.tmplId === null;
                        return (
                            <div
                                key={i}
                                onClick={() => d.tmplId && handleLaunchTemplate(d.tmplId)}
                                className={`p-2 rounded border flex justify-between items-center transition-all ${d.tmplId ? "cursor-pointer hover:border-[#ccff00]/60" : ""} ${isToday ? "bg-[#1a1e26] border-[#ccff00] shadow-[0_0_8px_rgba(204,255,0,0.15)]" : "bg-[#14171d] border-[#262b36]"}`}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${isToday ? "bg-[#ccff00] text-[#0d0f12]" : "bg-[#1a1e26] text-[#8e95a5]"}`}>{d.date}</span>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-display font-black text-xs text-white uppercase truncate">{d.name}</span>
                                            {isToday && <span className="stitch-badge-target text-[8px] py-0 px-1">TODAY</span>}
                                            {isOff && <span className="stitch-badge-neutral text-[8px] py-0 px-1">REST</span>}
                                        </div>
                                        <span className="text-[9px] font-sans text-[#8e95a5] block truncate">{d.sub}</span>
                                    </div>
                                </div>
                                <div className="shrink-0 ml-2">
                                    {d.tmplId ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleLaunchTemplate(d.tmplId!); }}
                                            className={`w-7 h-7 rounded-full flex items-center justify-center ${isToday ? "bg-[#ccff00] text-[#0d0f12]" : "bg-[#1a1e26] text-[#ccff00] border border-[#262b36]"}`}
                                            title={`Start ${d.name}`}
                                        >
                                            <Play size={11} fill="currentColor" />
                                        </button>
                                    ) : <Moon size={14} className="text-[#8e95a5]" />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Card 4: BIO-READINESS SNAPSHOT */}
            <div className="stitch-card-1 p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-[11px] font-display font-black text-white uppercase tracking-wider">BIO-READINESS SNAPSHOT</span>
                    <span className="stitch-badge-target text-[8px]">PRIME TO LIFT</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    {[
                        { label: "LEFT CUFF", val: "PRIMED", sub: "2-SET WARMUP", border: false, volt: true },
                        { label: "RECOVERY", val: "92%", sub: "48H SPACING", border: true, volt: true },
                        { label: "JOINTS", val: "SAFE", sub: "30° / CABLES", border: false, volt: false },
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
                    <span className="text-white font-bold uppercase block leading-none">48+ LEFT-SHOULDER & HYPERTROPHY PROTOCOL READY</span>
                    <span className="text-[#8e95a5] text-[9px] truncate block mt-0.5">Left-arm lead • 20s rest-pause offset • 100% offline-ready</span>
                </div>
            </div>
        </div>
    );
}
