import { useStore } from "../store/useStore";
import { Link, useNavigate } from "react-router-dom";
import {
    Play, TrendingUp, Calendar, Coffee, Dumbbell, Quote,
    Footprints, Flame, HeartPulse, MapPin, ChevronRight
} from "lucide-react";
import { calculateAge, getDailyQuote, cn } from "../lib/utils";
import { StatCard } from "../components/ui/stat-card";

export function Home() {
    const { user, templates, logs, startWorkout, activeWorkout, getDailyInsights } = useStore();
    const navigate = useNavigate();

    const age = user?.birthday ? calculateAge(user.birthday) : (user?.age || 47);
    const dailyQuote = getDailyQuote();

    const today = new Date().toISOString().split('T')[0];
    const todayInsights = getDailyInsights(today);

    const insights = todayInsights ?? null;

    // Workouts this week
    const now = new Date();
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

    // C2: Dynamic schedule — find today's template by scheduled_days
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDayIndex = now.getDay(); // 0=Sun … 6=Sat
    const currentDayName = days[todayDayIndex];
    const todayLog = logs.find(l => l.timestamp.startsWith(today));
    const isRestDay = todayDayIndex === 0 || todayDayIndex === 3; // Sunday=0, Wednesday=3
    const todayTemplate = isRestDay
        ? null
        : templates.find(t => t.scheduled_days?.includes(todayDayIndex)) ?? null;
    const targetId: string | 'REST' = isRestDay ? 'REST' : (todayTemplate?.id ?? 'NONE');
    const alreadyWorkedOutToday = !!todayLog;

    return (
        <div className="space-y-7 animate-in fade-in duration-500 pb-20">

            {/* M2: Onboarding card for new users with no profile set */}
            {!user && (
                <div className="glass-card p-5 rounded-2xl border border-primary/30 bg-primary/5 flex items-start gap-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                        <span className="text-lg font-black">👋</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-black text-white text-base">Welcome to Bio Stack!</h3>
                        <p className="text-zinc-400 text-sm mt-0.5">Set up your profile to get personalised insights and track your progress.</p>
                        <Link to="/profile" className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-primary bg-primary/15 px-3 py-1.5 rounded-full hover:bg-primary/25 transition-colors">
                            Set Up Profile <ChevronRight size={12} />
                        </Link>
                    </div>
                </div>
            )}

            {/* ── Greeting ─────────────────────────────────────── */}
            <div className="flex justify-between items-end pt-1">
                <div>
                    <p className="text-xs font-bold text-primary/80 uppercase tracking-widest mb-1">
                        {age > 0 ? `Age ${age} Hypertrophy Protocol` : 'Hypertrophy Protocol'}
                    </p>
                    <h2 className="text-3xl font-black text-white tracking-tight leading-none">
                        Hello,{" "}
                        <span className="text-primary">{user?.name?.split(" ")[0] || "Athlete"}</span>
                    </h2>
                    <p className="text-zinc-400 text-sm font-medium mt-1">
                        {currentDayName} · {targetId === "REST" ? "Recovery day 🌿" : alreadyWorkedOutToday ? "Great session today 💪" : "Time to crush it 💪"}
                    </p>
                </div>
                <button
                    className="rounded-2xl h-14 w-14 bg-linear-to-tr from-primary to-orange-400 text-black shadow-lg shadow-primary/25 hover:scale-105 transition-transform flex items-center justify-center"
                    onClick={() => {
                        if (activeWorkout) { navigate("/active"); return; }
                        if (todayTemplate) startWorkout(todayTemplate.id);
                        navigate("/active");
                    }}
                >
                    <Play fill="currentColor" size={22} className="ml-0.5" />
                </button>
            </div>

            {/* ── Daily Insights ───────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-white">Daily Activity</h3>
                    <span className="text-xs text-zinc-500">Today</span>
                </div>
                {insights ? (
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard
                            icon={<Footprints size={18} />}
                            value={insights.steps.toLocaleString()}
                            label="Steps"
                            color="text-primary"
                        />
                        <StatCard
                            icon={<Flame size={18} />}
                            value={insights.calories_burned}
                            unit="kcal"
                            label="Burned"
                            color="text-orange-400"
                        />
                        <StatCard
                            icon={<HeartPulse size={18} />}
                            value={insights.heart_rate_avg}
                            unit="bpm"
                            label="Avg HR"
                            color="text-rose-400"
                        />
                        <StatCard
                            icon={<MapPin size={18} />}
                            value={insights.distance_km.toFixed(1)}
                            unit="km"
                            label="Distance"
                            color="text-violet-400"
                        />
                    </div>
                ) : (
                    <div className="glass-card p-4 rounded-2xl text-center text-sm text-zinc-500">
                        No activity data yet today. Connect a wearable to track automatically.
                    </div>
                )}
            </div>

            {/* ── Today's Protocol ─────────────────────────────── */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Calendar size={16} className="text-primary" />
                    <h3 className="text-base font-bold text-white">Today's Protocol</h3>
                </div>

                {targetId === "REST" ? (
                    <div className="glass-card p-5 rounded-2xl flex items-center gap-4 border-l-4 border-l-emerald-500 bg-emerald-500/5">
                        <div className="w-11 h-11 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                            <Coffee size={22} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white">Active Recovery</h4>
                            <p className="text-sm text-zinc-400">Light walk, mobility, or full rest.</p>
                        </div>
                    </div>
                ) : todayTemplate ? (
                    // M1: converted from div to button for keyboard/a11y
                    <button
                        className="w-full text-left glass-card p-5 rounded-2xl flex justify-between items-center border-l-4 border-l-primary bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors group"
                        onClick={() => { if (!activeWorkout) startWorkout(todayTemplate.id); navigate("/active"); }}
                    >
                        <div>
                            <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Tap to Start</div>
                            <h4 className="text-xl font-black text-white group-hover:text-primary transition-colors">
                                {todayTemplate.name}
                            </h4>
                            <div className="flex gap-4 mt-1.5 text-xs text-zinc-400">
                                <span className="flex items-center gap-1"><Dumbbell size={12} /> {todayTemplate.exercises.length} Exercises</span>
                                <span className="flex items-center gap-1"><TrendingUp size={12} /> ~{todayTemplate.exercises.length * 5} min</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                            <Play fill="currentColor" size={18} className="ml-0.5" />
                        </div>
                    </button>
                ) : (
                    <div className="p-4 border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-center text-sm">
                        No workout scheduled — <Link to="/workouts" className="text-primary">set one up</Link>
                    </div>
                )}
            </div>

            {/* ── Week Stats ───────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
                <Link to="/history">
                    <div className="glass-card p-4 rounded-2xl space-y-1 hover:bg-white/5 transition-colors group">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1 group-hover:text-primary transition-colors">
                            <TrendingUp size={12} /> This Week
                        </div>
                        <div className="text-3xl font-black text-white">{workoutsThisWeek}</div>
                        <div className="text-[10px] text-zinc-500">sessions done</div>
                    </div>
                </Link>
                <div className="glass-card p-4 rounded-2xl space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">🔥 Streak</div>
                    <div className={cn("text-3xl font-black", streak > 0 ? "text-orange-400" : "text-zinc-600")}>{streak}</div>
                    <div className="text-[10px] text-zinc-500">
                        {streak === 1 ? "day in a row" : streak > 1 ? "days in a row" : "Start today!"}
                    </div>
                </div>
            </div>

            {/* ── Quote ────────────────────────────────────────── */}
            <div className="glass-card p-5 rounded-2xl bg-linear-to-br from-primary/5 to-violet-500/5 border-primary/15 relative overflow-hidden">
                <Quote className="absolute top-2 right-3 text-primary/8 rotate-180" size={56} />
                <p className="text-sm font-medium text-zinc-300 italic relative z-10 leading-relaxed">
                    "{dailyQuote}"
                </p>
            </div>

            {/* ── All Templates ────────────────────────────────── */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold text-white">All Templates</h3>
                    <Link to="/workouts" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                        Manage <ChevronRight size={12} />
                    </Link>
                </div>
                <div className="grid gap-2">
                    {templates.map(t => (
                        <button
                            key={t.id}
                            className="glass-card px-4 py-3 rounded-xl flex justify-between items-center hover:bg-white/5 transition-colors group w-full text-left"
                            onClick={() => { if (!activeWorkout) startWorkout(t.id); navigate("/active"); }}
                        >
                            <div className="font-semibold text-sm text-zinc-300 group-hover:text-white transition-colors">
                                {t.name}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-600">{t.exercises.length} Ex</span>
                                <ChevronRight size={14} className="text-zinc-700 group-hover:text-primary transition-colors" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
