import { useStore } from "../store/useStore";
import { Link, useNavigate } from "react-router-dom";
import {
    Play, TrendingUp, Coffee, Dumbbell, Quote,
    ChevronRight, Calendar, Sparkles
} from "lucide-react";
import { getDailyQuote, cn } from "../lib/utils";
import { getMuscleIcon } from "../lib/muscleIcons";
import type { TargetMuscle } from "../types";

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

export function Home() {
    const { user, templates, exercises, logs, startWorkout, activeWorkout } = useStore();
    const navigate = useNavigate();
    const dailyQuote = getDailyQuote();

    const now = new Date();

    // Workouts this week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const workoutsThisWeek = logs.filter(l => new Date(l.timestamp) >= startOfWeek).length;

    // Streak
    const streak = (() => {
        if (!logs.length) return 0;
        const logDates = new Set(logs.map(l => new Date(l.timestamp).toDateString()));
        let count = 0;
        const d = new Date();
        while (logDates.has(d.toDateString())) { count++; d.setDate(d.getDate() - 1); }
        if (count === 0) { d.setDate(d.getDate() - 1); while (logDates.has(d.toDateString())) { count++; d.setDate(d.getDate() - 1); } }
        return count;
    })();

    // Schedule logic
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDayIndex = now.getDay();
    const currentDayName = days[todayDayIndex];
    
    // Rest days are Sunday (0) and Wednesday (3)
    const isRestDay = todayDayIndex === 0 || todayDayIndex === 3;
    const todayTemplate = isRestDay
        ? null
        : templates.find(t => t.scheduled_days?.includes(todayDayIndex)) ?? null;
    const targetId: string | 'REST' = isRestDay ? 'REST' : (todayTemplate?.id ?? 'NONE');

    const getExerciseName = (id: string) => {
        return exercises.find(e => e.id === id)?.name ?? id;
    };

    const getExerciseMuscle = (id: string) => {
        return exercises.find(e => e.id === id)?.target_muscle ?? "Other";
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Greeting Header */}
            <div className="flex justify-between items-end px-1 pt-2">
                <div>
                    <span className="text-xs font-black text-[#3ccf94] uppercase tracking-widest block mb-0.5">
                        {currentDayName}, {now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                        Hello, <span className="text-[#3ccf94]">{user?.name?.split(" ")[0] || "Athlete"}</span>
                    </h2>
                </div>
            </div>

            {/* Onboarding card for new users with no profile set */}
            {!user && (
                <div className="bg-card border border-[#3ccf94]/20 rounded-3xl p-5 flex items-start gap-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="w-10 h-10 rounded-full bg-[#3ccf94]/10 flex items-center justify-center text-[#3ccf94] shrink-0 font-bold">
                        👋
                    </div>
                    <div className="flex-1">
                        <h3 className="font-extrabold text-white text-base">Setup Profile</h3>
                        <p className="text-zinc-500 text-sm mt-0.5">Enter your biometrics to set custom training and recovery goals.</p>
                        <Link to="/profile" className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-[#3ccf94] bg-[#3ccf94]/10 px-3 py-1.5 rounded-full hover:bg-[#3ccf94]/20 transition-colors">
                            Set Up Now <ChevronRight size={12} />
                        </Link>
                    </div>
                </div>
            )}

            {/* ── HERO: Workout Scheduler ──────────────── */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar size={13} /> Scheduled Protocol
                    </h3>
                </div>

                {targetId === "REST" ? (
                    <div className="bg-card border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                        <div className="absolute -right-4 -bottom-4 text-white/[0.02] pointer-events-none">
                            <Coffee size={120} />
                        </div>
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-full bg-[#3ccf94]/10 flex items-center justify-center text-[#3ccf94] shrink-0">
                                <Coffee size={24} />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-[#3ccf94] uppercase tracking-widest">Recovery Phase</span>
                                <h4 className="text-xl font-extrabold text-white">Active Recovery Day</h4>
                                <p className="text-sm text-zinc-400 leading-relaxed mt-1">
                                    Let your muscles rebuild and adapt. Hydrate well, do a light walk or stretch, and rest up for your next session.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : todayTemplate ? (
                    <div className="bg-card border border-[#3ccf94]/30 rounded-3xl p-6 relative overflow-hidden shadow-xl bg-gradient-to-br from-card to-zinc-950/80">
                        <div className="absolute -right-6 -bottom-6 text-white/[0.02] pointer-events-none">
                            <Dumbbell size={140} />
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-[#3ccf94] uppercase tracking-widest flex items-center gap-1">
                                        <Sparkles size={10} className="animate-pulse" /> Today's Target
                                    </span>
                                    <h4 className="text-2xl font-black text-white leading-tight">
                                        {todayTemplate.name}
                                    </h4>
                                </div>
                            </div>

                            {/* Muscle Group Badges */}
                            <div className="flex flex-wrap gap-1.5">
                                {[...new Set(todayTemplate.exercises.map(e => getExerciseMuscle(e.exercise_id)))].map(muscle => (
                                    <span key={muscle} className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${MUSCLE_COLORS[muscle as TargetMuscle]}`}>
                                        {getMuscleIcon(muscle as TargetMuscle, 11)} {muscle}
                                    </span>
                                ))}
                            </div>

                            {/* Exercises List Preview */}
                            <div className="space-y-1 bg-black/40 p-4 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">Workout Plan Preview</p>
                                {todayTemplate.exercises.slice(0, 4).map((ex, idx) => {
                                    const muscle = getExerciseMuscle(ex.exercise_id);
                                    return (
                                        <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.03] last:border-0">
                                            <span className="text-zinc-300 font-bold truncate pr-3">{getExerciseName(ex.exercise_id)}</span>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${MUSCLE_COLORS[muscle as TargetMuscle]}`}>
                                                {getMuscleIcon(muscle as TargetMuscle, 9)} {muscle}
                                            </span>
                                        </div>
                                    );
                                })}
                                {todayTemplate.exercises.length > 4 && (
                                    <div className="text-[10px] text-zinc-500 font-bold text-center mt-2 pt-1 border-t border-white/[0.03]">
                                        + {todayTemplate.exercises.length - 4} more exercises in this routine
                                    </div>
                                )}
                            </div>

                            {/* Start Workout Call to Action */}
                            <button
                                onClick={() => { if (!activeWorkout) startWorkout(todayTemplate.id); navigate("/active"); }}
                                className="w-full mt-4 py-3.5 bg-[#3ccf94] hover:bg-[#2fb27f] text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_4px_20px_rgba(60,207,148,0.2)]"
                            >
                                <Play size={16} fill="currentColor" />
                                {activeWorkout ? "Resume Active Session" : "Start Workout"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 bg-card border border-dashed border-white/10 rounded-3xl text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 mx-auto">
                            <Calendar size={22} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-base font-extrabold text-white">No Workout Scheduled Today</h4>
                            <p className="text-xs text-zinc-500 max-w-xs mx-auto">Set up your routine program schedule to build consistency, or start any routine below.</p>
                        </div>
                        <Link to="/workouts" className="inline-flex items-center gap-1.5 text-xs font-black text-[#3ccf94] bg-[#3ccf94]/10 hover:bg-[#3ccf94]/20 px-4 py-2 rounded-full transition-colors">
                            Configure Schedule <ChevronRight size={12} />
                        </Link>
                    </div>
                )}
            </div>

            {/* ── Week Summary Stats ─────────────────── */}
            <div className="grid grid-cols-2 gap-3">
                <Link to="/history">
                    <div className="bg-card border border-white/5 p-4 rounded-3xl space-y-1 hover:bg-zinc-900/90 transition-colors group">
                        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1 group-hover:text-[#3ccf94] transition-colors">
                            <TrendingUp size={11} /> This Week
                        </div>
                        <div className="text-3xl font-extrabold text-white">{workoutsThisWeek}</div>
                        <div className="text-[10px] font-bold text-zinc-500">sessions completed</div>
                    </div>
                </Link>
                <div className="bg-card border border-white/5 p-4 rounded-3xl space-y-1">
                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">🔥 Streak</div>
                    <div className={cn("text-3xl font-extrabold", streak > 0 ? "text-[#ff793f]" : "text-zinc-600")}>{streak}</div>
                    <div className="text-[10px] font-bold text-zinc-500">
                        {streak === 1 ? "day in a row" : streak > 1 ? "days in a row" : "Start today!"}
                    </div>
                </div>
            </div>

            {/* ── Tip of the Day (Quote) ───────────────── */}
            <div className="bg-card border border-white/5 p-5 rounded-3xl relative overflow-hidden">
                <Quote className="absolute top-2 right-3 text-white/[0.02] rotate-180" size={56} />
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-1">Wellness Tip</span>
                <p className="text-sm font-medium text-zinc-300 italic relative z-10 leading-relaxed">
                    "{dailyQuote}"
                </p>
            </div>

            {/* ── Workout Routines List ──────────────────── */}
            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Workout Routines</h3>
                    <Link to="/workouts" className="text-xs font-bold text-[#3ccf94] uppercase tracking-widest hover:text-white transition-colors flex items-center gap-0.5">
                        Manage <ChevronRight size={13} />
                    </Link>
                </div>
                <div className="grid gap-3">
                    {templates.length === 0 ? (
                        <div className="bg-card p-6 rounded-3xl text-center border border-dashed border-white/5">
                            <p className="text-sm text-zinc-500 mb-3">No routines yet.</p>
                            <Link to="/workouts" className="inline-flex items-center gap-1 text-xs font-bold text-[#3ccf94] bg-[#3ccf94]/10 px-3 py-1.5 rounded-full">
                                Create Routine <ChevronRight size={12} />
                            </Link>
                        </div>
                    ) : templates.map(t => {
                        const templateMuscles = [...new Set(t.exercises.map(e => getExerciseMuscle(e.exercise_id)))];
                        return (
                            <div
                                key={t.id}
                                className="bg-card p-5 border border-white/5 rounded-3xl flex justify-between items-center hover:border-[#3ccf94]/30 transition-all group"
                            >
                                <div className="space-y-2 flex-1 min-w-0 pr-4">
                                    <div className="font-extrabold text-base text-white truncate group-hover:text-[#3ccf94] transition-colors">
                                        {t.name}
                                    </div>
                                    {/* Muscles trained in this routine */}
                                    <div className="flex flex-wrap gap-1">
                                        {templateMuscles.slice(0, 3).map(muscle => (
                                            <span key={muscle} className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${MUSCLE_COLORS[muscle as TargetMuscle]}`}>
                                                {getMuscleIcon(muscle as TargetMuscle, 9)} {muscle}
                                            </span>
                                        ))}
                                        {templateMuscles.length > 3 && (
                                            <span className="text-[10px] text-zinc-500 font-bold px-1.5 py-0.5 bg-white/5 rounded-full">
                                                +{templateMuscles.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <button
                                        onClick={() => { if (!activeWorkout) startWorkout(t.id); navigate("/active"); }}
                                        className="w-10 h-10 rounded-full bg-white/5 text-zinc-300 hover:bg-[#3ccf94] hover:text-black flex items-center justify-center transition-all shadow-sm group-hover:scale-105"
                                        title="Start routine"
                                    >
                                        <Play fill="currentColor" size={14} className="ml-0.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
