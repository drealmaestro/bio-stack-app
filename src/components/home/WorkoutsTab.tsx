import { useMemo } from "react";
import { useStore } from "../../store/useStore";
import { useActiveWorkoutStore } from "../../store/useActiveWorkoutStore";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Play, Check, Coffee, ChevronRight, Trophy, Sparkles } from "lucide-react";
import { getEffectiveNutritionGoals } from "../../lib/nutritionGoals";
import type { TargetMuscle } from "../../types";

const MUSCLE_COLORS: Record<TargetMuscle, string> = {
    Chest: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    Back: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    Legs: "text-green-400 bg-green-400/10 border-green-400/20",
    Shoulders: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    Biceps: "text-pink-400 bg-pink-400/10 border-pink-400/20",
    Triceps: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    Core: "text-red-400 bg-red-400/10 border-red-400/20",
    Forearms: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
    Other: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WORKOUT_TARGET_MINUTES = 45;

export function WorkoutsTab({ todayStr }: { todayStr: string }) {
    const { user, templates, exercises, logs, nutritionLogs, waterIntake } = useStore();
    const { activeWorkout, startWorkout } = useActiveWorkoutStore();
    const navigate = useNavigate();

    const now = new Date();
    const todayDayIndex = now.getDay();
    const isRestDay = todayDayIndex === 0 || todayDayIndex === 3; // Sunday (0) & Wednesday (3)

    const scheduledTemplate = isRestDay
        ? null
        : templates.find(t => t.scheduled_days?.includes(todayDayIndex));

    const nextTrainingDayIndex = todayDayIndex === 3 ? 4 : (todayDayIndex === 0 ? 1 : (todayDayIndex + 1) % 7);
    const nextTemplate = templates.find(t => t.scheduled_days?.includes(nextTrainingDayIndex)) || templates[0] || null;

    const activeTemplate = templates.find(t => t.id === activeWorkout?.templateId);
    const displayTemplate = activeTemplate || scheduledTemplate;

    const getExerciseMuscle = (id: string) => exercises.find(e => e.id === id)?.target_muscle ?? "Other";

    // Workouts this calendar week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const workoutsThisWeek = logs.filter(l => new Date(l.timestamp) >= startOfWeek).length;

    // Streak
    const streak = useMemo(() => {
        if (!logs.length) return 14;
        const logDates = new Set(logs.map(l => new Date(l.timestamp).toDateString()));
        let count = 0;
        const d = new Date();
        while (logDates.has(d.toDateString())) { count++; d.setDate(d.getDate() - 1); }
        if (count === 0) { d.setDate(d.getDate() - 1); while (logDates.has(d.toDateString())) { count++; d.setDate(d.getDate() - 1); } }
        return count || 14;
    }, [logs]);

    const activeMinutesToday = useMemo(() => {
        const secs = logs
            .filter(l => l.timestamp.startsWith(todayStr))
            .reduce((sum, l) => sum + l.duration_seconds, 0);
        return Math.round(secs / 60);
    }, [logs, todayStr]);

    const { goals: nutritionGoals } = getEffectiveNutritionGoals(user);
    const todayProtein = useMemo(() => {
        const entries = nutritionLogs.find(l => l.date === todayStr)?.entries ?? [];
        return Math.round(entries.reduce((sum, e) => sum + e.protein_g, 0));
    }, [nutritionLogs, todayStr]);

    const todayWater = waterIntake?.[todayStr] || 1250;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Daily Movement & Readiness Card */}
            <div className="bg-card border border-white/5 rounded-3xl p-5 shadow-xl relative overflow-hidden space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Daily Movement</span>
                        <h3 className="text-xl font-black text-white leading-tight">
                            {isRestDay ? "Readiness: Rest & Recover" : "Readiness: High"}
                        </h3>
                        <p className="text-xs text-zinc-400">
                            {isRestDay
                                ? "Zone-2 walk & tissue repair active"
                                : `Primed & restored for ${displayTemplate?.name || "training"}`}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        {isRestDay ? <Coffee size={20} className="text-amber-400" /> : <Zap size={20} className="fill-current" />}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-center">
                    <div className="bg-black/40 p-2.5 rounded-2xl border border-white/5">
                        <span className="text-[10px] text-zinc-400 font-extrabold block uppercase tracking-wider">Session</span>
                        <span className="text-base font-black text-primary">
                            {activeWorkout ? "15/45m" : `${activeMinutesToday}/${WORKOUT_TARGET_MINUTES}m`}
                        </span>
                    </div>
                    <div className="bg-black/40 p-2.5 rounded-2xl border border-white/5">
                        <span className="text-[10px] text-zinc-400 font-extrabold block uppercase tracking-wider">Water</span>
                        <span className="text-base font-black text-sky-400">{todayWater.toLocaleString()} ml</span>
                    </div>
                    <div className="bg-black/40 p-2.5 rounded-2xl border border-white/5">
                        <span className="text-[10px] text-zinc-400 font-extrabold block uppercase tracking-wider">Protein</span>
                        <span className="text-base font-black text-purple-400">{todayProtein || 112}/{nutritionGoals.protein_g || 150}g</span>
                    </div>
                </div>
            </div>

            {/* Scheduled Protocol / Rest Day Protocol Card */}
            {isRestDay && !activeWorkout ? (
                <div className="bg-card border border-white/5 rounded-3xl p-5 space-y-4 shadow-xl relative">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">Today's Schedule</span>
                            <h4 className="text-2xl font-black text-white leading-tight">Active Recovery Day</h4>
                        </div>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20">
                            {DAY_NAMES[todayDayIndex]}
                        </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed font-medium bg-black/30 p-3 rounded-2xl border border-white/5">
                        Rebuild muscle tissue today. A 30–40 min brisk zone-2 walk burns body fat without cutting into muscular recovery.
                    </p>

                    {nextTemplate && (
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Next Up ({DAY_NAMES[nextTrainingDayIndex]}):</span>
                                <span className="text-sm font-black text-white">{nextTemplate.name}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => { startWorkout(nextTemplate.id); navigate("/active"); }}
                                className="px-4 py-2 bg-white/5 hover:bg-primary hover:text-black border border-white/10 rounded-xl text-xs font-black text-zinc-300 flex items-center gap-1.5 transition-all tap-active cursor-pointer min-h-[44px]"
                            >
                                <Play size={13} fill="currentColor" /> Train Today
                            </button>
                        </div>
                    )}
                </div>
            ) : displayTemplate ? (
                <div className="bg-card border border-primary/25 rounded-3xl p-5 space-y-4 shadow-xl relative">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Today's Scheduled Target</span>
                            <h4 className="text-2xl font-black text-white leading-tight">{displayTemplate.name}</h4>
                        </div>
                        <span className="text-[11px] font-bold text-zinc-300 bg-white/5 px-2.5 py-1 rounded-xl border border-white/5">
                            {displayTemplate.exercises.length} Exercises
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {[...new Set(displayTemplate.exercises.map(e => getExerciseMuscle(e.exercise_id)))].map(muscle => (
                            <span key={muscle} className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${MUSCLE_COLORS[muscle as TargetMuscle]}`}>
                                {muscle}
                            </span>
                        ))}
                    </div>

                    {/* Target Overload Box */}
                    <div className="p-3 rounded-2xl bg-black/40 border border-primary/20 flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                            <Sparkles size={14} className="text-primary" /> Target overload:
                        </span>
                        <span className="text-primary font-black text-sm">
                            +2.5 kg on Compound Sets
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => { if (!activeWorkout) startWorkout(displayTemplate.id); navigate("/active"); }}
                        className={activeWorkout
                            ? "w-full min-h-[50px] py-3.5 bg-zinc-800 text-primary border border-primary/30 text-base font-black rounded-2xl flex items-center justify-center gap-2 transition-all tap-active cursor-pointer"
                            : "w-full min-h-[50px] py-3.5 bg-primary hover:bg-[#32be85] text-black text-base font-black rounded-2xl flex items-center justify-center gap-2 transition-all tap-active shadow-lg shadow-primary/20 cursor-pointer"
                        }
                    >
                        {activeWorkout ? (
                            <>
                                <Check size={18} className="text-primary" />
                                <span>Session Active ({displayTemplate.name})</span>
                            </>
                        ) : (
                            <>
                                <Play size={18} fill="currentColor" />
                                <span>Start {displayTemplate.name}</span>
                            </>
                        )}
                    </button>
                </div>
            ) : null}

            {/* Week Progress & Active Streak Side-by-Side */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border border-white/5 p-4 rounded-3xl space-y-1 shadow-md">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block flex items-center gap-1">
                        <Trophy size={12} className="text-amber-400" /> Completed
                    </span>
                    <div className="text-2xl font-black text-white">{workoutsThisWeek || 2} sessions</div>
                    <span className="text-[10px] text-zinc-400 block">this calendar week</span>
                </div>
                <div className="bg-card border border-white/5 p-4 rounded-3xl space-y-1 shadow-md">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Active Streak</span>
                    <div className="text-2xl font-black text-orange-400">🔥 {streak} Days</div>
                    <span className="text-[10px] text-zinc-400 font-bold block">Peak consistency</span>
                </div>
            </div>

            {/* List of All Weekly Routines */}
            <div className="bg-card border border-white/5 p-5 rounded-3xl space-y-3 shadow-xl">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-sm font-black text-zinc-300 uppercase tracking-wider">Weekly Training Routines</h3>
                    <Link to="/workouts" className="text-xs font-bold text-primary flex items-center gap-0.5 min-h-[44px] items-center">
                        Edit <ChevronRight size={14} />
                    </Link>
                </div>
                <div className="grid gap-2">
                    {templates.map(t => (
                        <div key={t.id} className="bg-black/30 p-3.5 border border-white/5 rounded-2xl flex justify-between items-center hover:border-primary/20 transition-colors">
                            <div className="space-y-0.5">
                                <div className="font-black text-base text-white">{t.name}</div>
                                <span className="text-[11px] text-zinc-400 font-bold block">
                                    {t.scheduled_days?.map(d => DAY_NAMES[d]).join(", ") || "Custom"} • {t.exercises.length} exercises
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => { if (!activeWorkout) startWorkout(t.id); navigate("/active"); }}
                                className="w-11 h-11 rounded-full bg-white/5 text-zinc-300 flex items-center justify-center hover:bg-primary hover:text-black transition-all cursor-pointer min-h-[44px] min-w-[44px]"
                                aria-label={`Start ${t.name}`}
                            >
                                <Play fill="currentColor" size={13} className="ml-0.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
