import { useMemo, useState } from "react";
import { useStore } from "../../store/useStore";
import { useActiveWorkoutStore } from "../../store/useActiveWorkoutStore";
import { Link, useNavigate } from "react-router-dom";
import { Play, ChevronRight, Trophy } from "lucide-react";
import { SamsungActivityHeart } from "../ui/samsung-activity-heart";
import { DailyReadinessCard } from "./DailyReadinessCard";
import { ScheduledProtocolCard } from "./ScheduledProtocolCard";
import { Dialog } from "../ui/dialog";
import { getEffectiveNutritionGoals } from "../../lib/nutritionGoals";

const WORKOUT_TARGET_MINUTES = 45;
const WATER_TARGET_ML = 2000;

export function WorkoutsTab({ todayStr }: { todayStr: string }) {
    const { user, templates, exercises, logs, nutritionLogs, waterIntake, logSleep } = useStore();
    const { activeWorkout, startWorkout } = useActiveWorkoutStore();
    const navigate = useNavigate();

    const [showSleepModal, setShowSleepModal] = useState(false);
    const [sleepHrs, setSleepHrs] = useState("7");
    const [sleepMins, setSleepMins] = useState("30");

    const now = new Date();
    const todayDayIndex = now.getDay();
    const isRestDay = todayDayIndex === 0 || todayDayIndex === 3;
    const todayTemplate = isRestDay
        ? null
        : templates.find(t => t.scheduled_days?.includes(todayDayIndex)) ?? null;

    const getExerciseMuscle = (id: string) => exercises.find(e => e.id === id)?.target_muscle ?? "Other";

    // Workouts this week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const workoutsThisWeek = logs.filter(l => new Date(l.timestamp) >= startOfWeek).length;

    // Streak
    const streak = useMemo(() => {
        if (!logs.length) return 0;
        const logDates = new Set(logs.map(l => new Date(l.timestamp).toDateString()));
        let count = 0;
        const d = new Date();
        while (logDates.has(d.toDateString())) { count++; d.setDate(d.getDate() - 1); }
        if (count === 0) { d.setDate(d.getDate() - 1); while (logDates.has(d.toDateString())) { count++; d.setDate(d.getDate() - 1); } }
        return count;
    }, [logs]);

    const activeMinutesToday = useMemo(() => {
        const secs = logs
            .filter(l => l.timestamp.startsWith(todayStr))
            .reduce((sum, l) => sum + l.duration_seconds, 0);
        return Math.round(secs / 60);
    }, [logs, todayStr]);

    const { goals: nutritionGoals } = getEffectiveNutritionGoals(user);
    const todayCalories = useMemo(() => {
        const entries = nutritionLogs.find(l => l.date === todayStr)?.entries ?? [];
        return entries.reduce((sum, e) => sum + e.calories, 0);
    }, [nutritionLogs, todayStr]);

    const todayWater = waterIntake?.[todayStr] || 0;

    const nextTemplate = todayTemplate || templates[0] || null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Overview Card with Concentric Activity Heart & Metric Tiles */}
            <div className="bg-gradient-to-br from-[#16161a] to-[#0e0e12] border border-white/5 rounded-3xl p-5 shadow-xl relative overflow-hidden space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Daily Movement</span>
                        <h3 className="text-xl font-black text-white leading-tight">
                            {isRestDay ? "Active Recovery" : "Primed & Ready"}
                        </h3>
                        <p className="text-xs text-zinc-400">
                            {isRestDay ? "Zone-2 walk & tissue recovery" : "Optimal CNS readiness for training"}
                        </p>
                    </div>
                    <div className="shrink-0 scale-95 pr-1 drop-shadow-[0_0_15px_rgba(60,207,148,0.15)]">
                        <SamsungActivityHeart
                            stepsProgress={activeMinutesToday / WORKOUT_TARGET_MINUTES}
                            activeProgress={todayWater / WATER_TARGET_ML}
                            caloriesProgress={nutritionGoals.calories > 0 ? todayCalories / nutritionGoals.calories : 0}
                            centerLabel="Fit"
                            size={110}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-center">
                    <div className="bg-black/30 p-2.5 rounded-2xl border border-white/5">
                        <span className="text-[9px] text-zinc-500 font-bold block uppercase">Session</span>
                        <span className="text-sm font-black text-primary">{activeMinutesToday} / {WORKOUT_TARGET_MINUTES}m</span>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-2xl border border-white/5">
                        <span className="text-[9px] text-zinc-500 font-bold block uppercase">Water</span>
                        <span className="text-sm font-black text-carbs">{todayWater} ml</span>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-2xl border border-white/5">
                        <span className="text-[9px] text-zinc-500 font-bold block uppercase">Protein</span>
                        <span className="text-sm font-black text-protein">{Math.round(todayCalories > 0 ? (nutritionLogs.find(l => l.date === todayStr)?.entries ?? []).reduce((s, e) => s + e.protein_g, 0) : 0)} / {nutritionGoals.protein_g}g</span>
                    </div>
                </div>
            </div>

            {/* Daily Readiness & 1-Tap Quick Action Widget */}
            <DailyReadinessCard
                todayStr={todayStr}
                isRestDay={isRestDay}
                activeMinutesToday={activeMinutesToday}
                onOpenSleepModal={() => setShowSleepModal(true)}
            />

            {/* Scheduled Protocol Widget */}
            <ScheduledProtocolCard
                todayTemplate={todayTemplate}
                nextTemplate={nextTemplate}
                isSessionLocked={!!activeWorkout}
                getExerciseMuscle={getExerciseMuscle}
                onStartWorkout={startWorkout}
            />

            {/* Weekly summaries & Streak */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border border-white/5 p-4 rounded-3xl space-y-1">
                    <span className="section-label flex items-center gap-1">
                        <Trophy size={11} className="text-yellow-400" /> Completed
                    </span>
                    <div className="text-2xl font-black text-white">{workoutsThisWeek} sessions</div>
                    <span className="text-[9px] text-zinc-500 block">this calendar week</span>
                </div>
                <div className="bg-card border border-white/5 p-4 rounded-3xl space-y-1">
                    <span className="section-label">🔥 Active Streak</span>
                    <div className="text-2xl font-black text-fat">{streak} days</div>
                    <span className="text-[9px] text-zinc-500 block">consecutive consistency</span>
                </div>
            </div>

            {/* List of Routines */}
            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <h3 className="section-label">Workout Routines</h3>
                    <Link to="/workouts" className="text-xs font-bold text-primary flex items-center gap-0.5 min-h-[44px] items-center">
                        Edit <ChevronRight size={12} />
                    </Link>
                </div>
                <div className="grid gap-2">
                    {templates.map(t => (
                        <div key={t.id} className="bg-card p-4 border border-white/5 rounded-3xl flex justify-between items-center hover:border-primary/20 transition-colors">
                            <div className="space-y-1">
                                <div className="font-extrabold text-sm text-white">{t.name}</div>
                                <span className="text-[10px] text-zinc-500 font-bold">
                                    {t.exercises.length} exercises
                                </span>
                            </div>
                            <button
                                onClick={() => { if (!activeWorkout) startWorkout(t.id); navigate("/active"); }}
                                className="w-11 h-11 rounded-full bg-white/5 text-zinc-300 flex items-center justify-center hover:bg-primary hover:text-black transition-all cursor-pointer"
                                aria-label={`Start ${t.name}`}
                            >
                                <Play fill="currentColor" size={12} className="ml-0.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sleep Logger Dialog */}
            <Dialog
                open={showSleepModal}
                title="Log Sleep"
                onClose={() => setShowSleepModal(false)}
            >
                <div className="space-y-4">
                    <h3 className="text-base font-black text-white">How long did you sleep?</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-zinc-500 uppercase">Hours</label>
                            <input
                                type="number"
                                min={0}
                                max={16}
                                value={sleepHrs}
                                onChange={e => setSleepHrs(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 focus:border-sleep rounded-xl px-3 py-2 text-sm text-white font-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-zinc-500 uppercase">Minutes</label>
                            <input
                                type="number"
                                min={0}
                                max={59}
                                value={sleepMins}
                                onChange={e => setSleepMins(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 focus:border-sleep rounded-xl px-3 py-2 text-sm text-white font-bold"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const totalMins = (parseInt(sleepHrs) || 0) * 60 + (parseInt(sleepMins) || 0);
                            logSleep(todayStr, totalMins);
                            setShowSleepModal(false);
                            navigator.vibrate?.(30);
                        }}
                        className="w-full min-h-[44px] py-2.5 bg-sleep hover:opacity-90 active:scale-95 text-white font-black text-sm rounded-xl transition-all shadow-md cursor-pointer"
                    >
                        Save Sleep Record
                    </button>
                </div>
            </Dialog>
        </div>
    );
}
