import { useMemo, useState } from "react";
import { useStore } from "../../store/useStore";
import { useActiveWorkoutStore } from "../../store/useActiveWorkoutStore";
import { Link, useNavigate } from "react-router-dom";
import { Play, Coffee, ChevronRight, Trophy } from "lucide-react";
import { SamsungActivityHeart } from "../ui/samsung-activity-heart";
import { DailyReadinessCard } from "./DailyReadinessCard";
import { Dialog } from "../ui/dialog";
import { getEffectiveNutritionGoals } from "../../lib/nutritionGoals";
import type { TargetMuscle } from "../../types";

const MUSCLE_COLORS: Record<TargetMuscle, string> = {
    Chest: "text-orange-400 bg-orange-400/10",
    Back: "text-blue-400 bg-blue-400/10",
    Legs: "text-green-400 bg-green-400/10",
    Shoulders: "text-purple-400 bg-purple-400/10",
    Biceps: "text-pink-400 bg-pink-400/10",
    Triceps: "text-yellow-400 bg-yellow-400/10",
    Core: "text-red-400 bg-red-400/10",
    Forearms: "text-zinc-400 bg-zinc-400/10",
    Other: "text-zinc-400 bg-zinc-400/10",
};

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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Overview Card with Concentric Activity Heart */}
            <div className="bg-gradient-to-br from-[#16161a] to-[#0e0e12] border border-white/5 rounded-3xl p-5 shadow-xl relative overflow-hidden flex items-center justify-between gap-4">
                <div className="space-y-4 flex-1 min-w-0">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Daily Movement</span>
                        <h3 className="text-xl font-black text-white leading-tight">Activity Status</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-steps shrink-0" />
                            <span className="text-zinc-400 font-medium truncate">Workout:</span>
                            <span className="font-extrabold text-white ml-auto shrink-0">{activeMinutesToday} / {WORKOUT_TARGET_MINUTES} min</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-active shrink-0" />
                            <span className="text-zinc-400 font-medium truncate">Hydration:</span>
                            <span className="font-extrabold text-white ml-auto shrink-0">{todayWater} / {WATER_TARGET_ML.toLocaleString()} ml</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-calories shrink-0" />
                            <span className="text-zinc-400 font-medium truncate">Nutrition:</span>
                            <span className="font-extrabold text-white ml-auto shrink-0">{Math.round(todayCalories)} / {nutritionGoals.calories} kcal</span>
                        </div>
                    </div>
                </div>
                <div className="shrink-0 scale-95 pr-1 drop-shadow-[0_0_15px_rgba(60,207,148,0.15)]">
                    <SamsungActivityHeart
                        stepsProgress={activeMinutesToday / WORKOUT_TARGET_MINUTES}
                        activeProgress={todayWater / WATER_TARGET_ML}
                        caloriesProgress={nutritionGoals.calories > 0 ? todayCalories / nutritionGoals.calories : 0}
                        centerLabel="Fit"
                        size={135}
                    />
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
            <div className="space-y-3">
                <h3 className="section-label px-1">Scheduled Protocol</h3>

                {todayTemplate ? (
                    <div className="bg-card border border-primary/25 rounded-3xl p-5 space-y-4 shadow-md">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Today's target routine</span>
                            <h4 className="text-xl font-black text-white leading-tight">{todayTemplate.name}</h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {[...new Set(todayTemplate.exercises.map(e => getExerciseMuscle(e.exercise_id)))].map(muscle => (
                                <span key={muscle} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${MUSCLE_COLORS[muscle as TargetMuscle]}`}>
                                    {muscle}
                                </span>
                            ))}
                        </div>
                        <button
                            onClick={() => { if (!activeWorkout) startWorkout(todayTemplate.id); navigate("/active"); }}
                            className="w-full min-h-[48px] py-3 bg-primary hover:bg-[#2fb27f] text-black font-black rounded-2xl flex items-center justify-center gap-1.5 transition-all tap-active shadow-lg shadow-primary/15 cursor-pointer"
                        >
                            <Play size={15} fill="currentColor" /> {activeWorkout ? "Resume Session" : "Start Workout"}
                        </button>
                    </div>
                ) : (
                    <div className="p-5 bg-card border border-white/5 rounded-3xl text-center space-y-2">
                        <Coffee className="mx-auto text-zinc-500" size={24} />
                        <h4 className="text-sm font-black text-white">Active Recovery Day</h4>
                        <p className="text-xs text-zinc-500 max-w-xs mx-auto">Rebuild muscle tissue. A 30–40 min brisk walk burns chest fat without eating into recovery.</p>
                    </div>
                )}
            </div>

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
