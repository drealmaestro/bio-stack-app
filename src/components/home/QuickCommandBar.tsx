import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/useStore";
import { useActiveWorkoutStore } from "../../store/useActiveWorkoutStore";
import { Play, Sparkles, Flame, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { getEffectiveNutritionGoals } from "../../lib/nutritionGoals";
import { calculateDailyReadiness } from "../../utils/readinessMath";

export function QuickCommandBar({ todayStr }: { todayStr: string }) {
    const { user, templates, logs, nutritionLogs, waterIntake, sleepDuration } = useStore();
    const { activeWorkout, startWorkout } = useActiveWorkoutStore();
    const navigate = useNavigate();

    const now = new Date();
    const todayDayIndex = now.getDay();
    const isRestDay = todayDayIndex === 0 || todayDayIndex === 3;

    // Today's scheduled or active routine
    const scheduledTemplate = isRestDay
        ? null
        : templates.find(t => t.scheduled_days?.includes(todayDayIndex));
    const activeTemplate = templates.find(t => t.id === activeWorkout?.templateId);
    const currentTemplate = activeTemplate || scheduledTemplate || templates[0];

    // Nutrition status
    const todayLog = useMemo(
        () => nutritionLogs.find(l => l.date === todayStr),
        [nutritionLogs, todayStr]
    );
    const { goals } = getEffectiveNutritionGoals(user);
    const totals = useMemo(() => {
        const entries = todayLog?.entries ?? [];
        return entries.reduce(
            (acc, e) => ({
                calories: acc.calories + e.calories,
                protein_g: acc.protein_g + e.protein_g,
            }),
            { calories: 0, protein_g: 0 }
        );
    }, [todayLog]);

    const proteinTarget = goals.protein_g || 150;
    const caloriesTarget = goals.calories || 2200;
    const proteinLeft = Math.max(proteinTarget - (totals.protein_g || 112), 0);
    const caloriesLeft = Math.max(caloriesTarget - (totals.calories || 1740), 0);

    // Readiness
    const todayWater = waterIntake?.[todayStr] || 1250;
    const todaySleep = sleepDuration?.[todayStr] || (7 * 60 + 45);
    const activeMinutesToday = useMemo(() => {
        const secs = logs
            .filter(l => l.timestamp.startsWith(todayStr))
            .reduce((sum, l) => sum + l.duration_seconds, 0);
        return Math.round(secs / 60);
    }, [logs, todayStr]);

    const readiness = useMemo(() => {
        return calculateDailyReadiness({
            sleepMinutes: todaySleep,
            waterMl: todayWater,
            isRestDay,
            activeMinutesToday,
        });
    }, [todaySleep, todayWater, isRestDay, activeMinutesToday]);

    return (
        <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/10 rounded-3xl p-4.5 shadow-2xl space-y-3.5 backdrop-blur-md">
            {/* Top Quick Status Row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                        Today at a Glance
                    </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-black">
                    <Sparkles size={13} />
                    <span>{readiness.score}% Readiness</span>
                </div>
            </div>

            {/* Glanceable Metrics Hero Grid */}
            <div className="grid grid-cols-2 gap-2.5">
                {/* 1-Tap Workout Hero Card */}
                <div
                    onClick={() => {
                        if (activeWorkout) {
                            navigate("/active");
                        } else if (currentTemplate) {
                            startWorkout(currentTemplate.id);
                            navigate("/active");
                        } else {
                            navigate("/workouts");
                        }
                    }}
                    className="bg-black/40 hover:bg-black/60 border border-white/5 hover:border-primary/40 rounded-2xl p-3.5 flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer group tap-active min-h-[110px]"
                >
                    <div className="flex items-start justify-between">
                        <span className="text-[10px] font-black uppercase text-primary tracking-wider flex items-center gap-1">
                            <Zap size={11} className="fill-current" /> {activeWorkout ? "In Progress" : "Training"}
                        </span>
                        <div className="w-7 h-7 rounded-xl bg-primary/15 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                            {activeWorkout ? <CheckCircle2 size={15} /> : <Play size={13} fill="currentColor" className="ml-0.5" />}
                        </div>
                    </div>
                    <div>
                        <div className="text-base font-black text-white leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {activeWorkout ? "Active Session" : (isRestDay ? "Rest & Recover" : (currentTemplate?.name || "Train"))}
                        </div>
                        <span className="text-[11px] font-bold text-zinc-400 block mt-0.5">
                            {activeWorkout ? "Tap to continue" : (isRestDay ? "Zone-2 recovery" : "1-tap to start")}
                        </span>
                    </div>
                </div>

                {/* Glanceable Fuel Hero Card */}
                <div
                    onClick={() => navigate("/nutrition")}
                    className="bg-black/40 hover:bg-black/60 border border-white/5 hover:border-purple-500/40 rounded-2xl p-3.5 flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer group tap-active min-h-[110px]"
                >
                    <div className="flex items-start justify-between">
                        <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider flex items-center gap-1">
                            <Flame size={11} /> Fuel Status
                        </span>
                        <div className="w-7 h-7 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <ArrowRight size={13} />
                        </div>
                    </div>
                    <div>
                        <div className="text-xl font-black text-white leading-tight">
                            {Math.round(proteinLeft)}g <span className="text-xs font-bold text-purple-400">P left</span>
                        </div>
                        <span className="text-[11px] font-bold text-zinc-400 block mt-0.5 truncate">
                            {caloriesLeft > 0 ? `${caloriesLeft.toLocaleString()} kcal left` : "Target reached"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
