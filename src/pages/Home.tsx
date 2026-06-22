import { useState, useEffect, useMemo } from "react";
import { useStore } from "../store/useStore";
import { Link, useNavigate } from "react-router-dom";
import {
    Play, Coffee, ChevronRight, Plus, Search, Trash2,
    Trophy, TrendingUp, User, Target, Dumbbell
} from "lucide-react";
import { cn } from "../lib/utils";
import { ProgressRing } from "../components/ui/progress-ring";
import { MacroBar } from "../components/ui/macro-bar";
import { COMMON_FOODS } from "../data/nutrition";
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

type ActiveTab = "workouts" | "nutrition" | "progress";

export function Home() {
    const {
        user,
        templates,
        exercises,
        logs,
        startWorkout,
        activeWorkout,
        nutritionLogs,
        addNutritionEntry,
        deleteNutritionEntry,
        updateUserStats
    } = useStore();

    const navigate = useNavigate();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const [activeTab, setActiveTab] = useState<ActiveTab>("workouts");

    // Ensure state is seeded on mount
    const { seed } = useStore();
    useEffect(() => {
        seed();
    }, [seed]);

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

    // Nutrition Totals
    const todayLog = useMemo(() =>
        nutritionLogs.find(l => l.date === todayStr),
        [nutritionLogs, todayStr]
    );

    const nutritionGoals = user?.nutrition_goals ?? {
        calories: 2200,
        protein_g: 140,
        carbs_g: 250,
        fat_g: 70
    };

    const nutritionTotals = useMemo(() => {
        const entries = todayLog?.entries ?? [];
        return entries.reduce(
            (acc, e) => ({
                calories: acc.calories + e.calories,
                protein_g: acc.protein_g + e.protein_g,
                carbs_g: acc.carbs_g + e.carbs_g,
                fat_g: acc.fat_g + e.fat_g,
            }),
            { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
        );
    }, [todayLog]);

    const remainingCalories = Math.max(nutritionGoals.calories - nutritionTotals.calories, 0);
    const caloriePct = nutritionGoals.calories > 0 ? nutritionTotals.calories / nutritionGoals.calories : 0;

    // Schedule logic
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDayIndex = now.getDay();
    const currentDayName = days[todayDayIndex];
    const isRestDay = todayDayIndex === 0 || todayDayIndex === 3;
    const todayTemplate = isRestDay
        ? null
        : templates.find(t => t.scheduled_days?.includes(todayDayIndex)) ?? null;

    const getExerciseMuscle = (id: string) => exercises.find(e => e.id === id)?.target_muscle ?? "Other";

    // ── Nutrition Modal State ──
    const [showAddFoodModal, setShowAddFoodModal] = useState(false);
    const [foodSearchQuery, setFoodSearchQuery] = useState("");
    const filteredFoods = COMMON_FOODS.filter(f =>
        f.name.toLowerCase().includes(foodSearchQuery.toLowerCase())
    );

    const handleLogFood = (food: typeof COMMON_FOODS[0]) => {
        addNutritionEntry(todayStr, {
            food_item_id: food.id,
            food_name: food.name,
            servings: 1,
            calories: food.calories,
            protein_g: food.protein_g,
            carbs_g: food.carbs_g,
            fat_g: food.fat_g
        });
        setShowAddFoodModal(false);
        setFoodSearchQuery("");
    };

    // ── Progress Stats Input State ──
    const [logWeightVal, setLogWeightVal] = useState("");
    const [logBodyFatVal, setLogBodyFatVal] = useState("");

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

    // Get last logged biometrics
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

    // Simple SVG progress path generator for Weight Log History
    const weightChartPath = useMemo(() => {
        if (!user?.stats?.weight || user.stats.weight.length < 2) return "";
        const sorted = [...user.stats.weight].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const width = 340;
        const height = 100;
        const padding = 15;
        
        const weights = sorted.map(w => w.value);
        const minW = Math.min(...weights) - 1;
        const maxW = Math.max(...weights) + 1;
        const rangeW = maxW - minW || 1;
        
        const points = sorted.map((w, idx) => {
            const x = padding + (idx / (sorted.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((w.value - minW) / rangeW) * (height - 2 * padding);
            return `${x},${y}`;
        });
        
        return `M ${points.join(" L ")}`;
    }, [user?.stats?.weight]);

    return (
        <div className={cn("min-h-screen text-foreground space-y-6 pb-24 transition-colors duration-500", 
            activeTab === "workouts" && "bg-pillar-activity",
            activeTab === "nutrition" && "bg-pillar-nutrition",
            activeTab === "progress" && "bg-pillar-sleep"
        )}>
            {/* Top Navigation Pill Tabs (Samsung Health style) */}
            <div className="sticky top-0 z-45 bg-zinc-950/70 backdrop-blur-md border-b border-white/5 py-3 px-2 flex justify-around">
                {(["workouts", "nutrition", "progress"] as ActiveTab[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-6 py-1.5 rounded-full text-xs font-black capitalize transition-all duration-300 tap-active",
                            activeTab === tab 
                                ? "bg-white text-zinc-950 shadow-md scale-105" 
                                : "text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
                        )}
                    >
                        {tab === "workouts" ? "Workouts" : tab === "nutrition" ? "Nutrition" : "Progress"}
                    </button>
                ))}
            </div>

            <div className="px-4 space-y-6">
                {/* Greeting Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-xs font-black text-[#3ccf94] uppercase tracking-widest block mb-0.5">
                            {currentDayName}, {now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                            Hi, <span className="text-[#3ccf94]">{user?.name?.split(" ")[0] || "Athlete"}</span>
                        </h2>
                    </div>
                </div>

                {/* ── TAB 1: WORKOUTS TAB ── */}
                {activeTab === "workouts" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
                        {/* Overview Card */}
                        <div className="bg-gradient-to-br from-[#18181c] to-[#121215] border border-white/5 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
                            <div className="absolute -right-16 -bottom-16 w-36 h-36 bg-[#3ccf94]/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
                            <div className="flex justify-between items-start relative z-10">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
                                        <Trophy size={11} className="text-yellow-400" /> Training Status
                                    </span>
                                    <div className="text-3xl font-black text-white mt-1">
                                        {workoutsThisWeek > 0 ? "Active Routine" : "Ready to Train"}
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white shrink-0 shadow-inner">
                                    <Dumbbell size={18} className="text-primary" />
                                </div>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed mt-4 border-t border-white/5 pt-3 relative z-10">
                                {workoutsThisWeek > 0 
                                    ? `Great consistency! You completed ${workoutsThisWeek} workouts this week.` 
                                    : "No workouts completed yet this week. Choose a program and get started!"
                                }
                            </p>
                        </div>

                        {/* Scheduled Protocol Widget */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest px-1">Scheduled Protocol</h3>
                            
                            {todayTemplate ? (
                                <div className="bg-card border border-[#3ccf94]/25 rounded-3xl p-5 space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-[#3ccf94] uppercase tracking-widest block">Today's target routine</span>
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
                                        className="w-full py-3 bg-[#3ccf94] hover:bg-[#2fb27f] text-black font-black rounded-2xl flex items-center justify-center gap-1.5 transition-all tap-active shadow-lg shadow-[#3ccf94]/15"
                                    >
                                        <Play size={14} fill="currentColor" /> {activeWorkout ? "Resume Session" : "Start Workout"}
                                    </button>
                                </div>
                            ) : (
                                <div className="p-5 bg-card border border-white/5 rounded-3xl text-center space-y-2">
                                    <Coffee className="mx-auto text-zinc-500" size={24} />
                                    <h4 className="text-sm font-black text-white">Active Recovery Day</h4>
                                    <p className="text-xs text-zinc-500 max-w-xs mx-auto">Rebuild muscle tissues. Focus on foam rolling or a light walk.</p>
                                </div>
                            )}
                        </div>

                        {/* Weekly summaries & Streak */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-card border border-white/5 p-4 rounded-3xl space-y-1">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                    <Trophy size={11} className="text-yellow-400" /> Completed
                                </span>
                                <div className="text-2xl font-black text-white">{workoutsThisWeek} sessions</div>
                                <span className="text-[9px] text-zinc-500 block">this calendar week</span>
                            </div>
                            <div className="bg-card border border-white/5 p-4 rounded-3xl space-y-1">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">🔥 Active Streak</span>
                                <div className="text-2xl font-black text-[#ff793f]">{streak} days</div>
                                <span className="text-[9px] text-zinc-500 block">consecutive consistency</span>
                            </div>
                        </div>

                        {/* List of Routines */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Workout Routines</h3>
                                <Link to="/workouts" className="text-xs font-bold text-[#3ccf94] flex items-center gap-0.5">
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
                                            className="w-8 h-8 rounded-full bg-white/5 text-zinc-300 flex items-center justify-center hover:bg-[#3ccf94] hover:text-black transition-all"
                                        >
                                            <Play fill="currentColor" size={10} className="ml-0.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 2: NUTRITION TAB ── */}
                {activeTab === "nutrition" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
                        {/* Calorie Ring */}
                        <div className="bg-card border border-white/5 rounded-3xl p-5 flex items-center justify-between gap-6 shadow-md">
                            <div className="space-y-3">
                                <div>
                                    <span className="text-[10px] font-black text-[#ff9f0a] uppercase tracking-widest block">Dietary Energy</span>
                                    <div className="text-3xl font-black text-white mt-1">
                                        {Math.round(nutritionTotals.calories)} <span className="text-xs font-bold text-zinc-500">kcal</span>
                                    </div>
                                </div>
                                <div className="space-y-0.5 text-xs text-zinc-400">
                                    <div className="flex justify-between items-center gap-4">
                                        <span>Target:</span>
                                        <span className="font-black text-white">{nutritionGoals.calories} kcal</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <span>Remaining:</span>
                                        <span className={cn("font-black", remainingCalories === 0 ? "text-[#ff5975]" : "text-[#3ccf94]")}>
                                            {remainingCalories} kcal
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative shrink-0 drop-shadow-[0_0_12px_rgba(255,159,10,0.2)]">
                                <ProgressRing
                                    size={110}
                                    strokeWidth={9}
                                    progress={caloriePct}
                                    color="#ff9f0a"
                                    label={`${Math.round(caloriePct * 100)}%`}
                                    sublabel="logged"
                                />
                            </div>
                        </div>

                        {/* Macros Target */}
                        <div className="bg-card border border-white/5 p-5 rounded-3xl space-y-4 shadow-md">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Macronutrient Target</span>
                            <div className="space-y-3.5">
                                <MacroBar
                                    label="Protein"
                                    current={nutritionTotals.protein_g}
                                    goal={nutritionGoals.protein_g}
                                    color="bg-protein"
                                />
                                <MacroBar
                                    label="Carbohydrates"
                                    current={nutritionTotals.carbs_g}
                                    goal={nutritionGoals.carbs_g}
                                    color="bg-carbs"
                                />
                                <MacroBar
                                    label="Fat"
                                    current={nutritionTotals.fat_g}
                                    goal={nutritionGoals.fat_g}
                                    color="bg-fat"
                                />
                            </div>
                        </div>

                        {/* Food logs & Quick logging */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Today's Meals</h3>
                                <button
                                    onClick={() => setShowAddFoodModal(true)}
                                    className="text-xs font-bold text-[#ff9f0a] flex items-center gap-0.5"
                                >
                                    Log Food <Plus size={13} />
                                </button>
                            </div>

                            {/* Food items logged */}
                            <div className="bg-card border border-white/5 rounded-3xl p-4 divide-y divide-white/[0.04] shadow-md">
                                {(!todayLog?.entries || todayLog.entries.length === 0) ? (
                                    <div className="text-center py-4 text-xs text-zinc-500">
                                        No food logged yet today. Use the button to search and add!
                                    </div>
                                ) : todayLog.entries.map(e => (
                                    <div key={e.id} className="py-2.5 flex justify-between items-center first:pt-0 last:pb-0">
                                        <div>
                                            <div className="font-extrabold text-sm text-white">{e.food_name}</div>
                                            <span className="text-[10px] text-zinc-500 font-bold">
                                                {e.servings} serving • {e.calories} kcal • P: {e.protein_g}g
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => deleteNutritionEntry(todayStr, e.id)}
                                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-white/5 transition-colors"
                                            title="Delete food entry"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 3: PROGRESS TAB ── */}
                {activeTab === "progress" && (
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
                                        {user?.experience_level || "Intermediate"} • {user?.age || 25} yrs old
                                    </span>
                                </div>
                            </div>

                            {/* Goals badging */}
                            {user?.goals && user.goals.length > 0 && (
                                <div className="space-y-1.5 border-t border-white/5 pt-3">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Active Targets</span>
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

                        {/* Weight & Body Fat Loggers */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-card border border-white/5 p-4 rounded-3xl space-y-3">
                                <div>
                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Weight</span>
                                    <div className="text-2xl font-black text-white mt-0.5">
                                        {lastWeight > 0 ? `${lastWeight} kg` : "N/A"}
                                    </div>
                                </div>
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
                                        className="px-3 bg-primary text-black rounded-xl text-xs font-black hover:bg-primary/95 tap-active"
                                    >
                                        Log
                                    </button>
                                </div>
                            </div>
                            <div className="bg-card border border-white/5 p-4 rounded-3xl space-y-3">
                                <div>
                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Body Fat</span>
                                    <div className="text-2xl font-black text-[#ff793f] mt-0.5">
                                        {lastBodyFat > 0 ? `${lastBodyFat}%` : "N/A"}
                                    </div>
                                </div>
                                <div className="flex gap-1.5 pt-1">
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="%"
                                        value={logBodyFatVal}
                                        onChange={e => setLogBodyFatVal(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 focus:border-[#ff793f] rounded-xl px-2 py-1 text-center text-xs text-white font-bold"
                                    />
                                    <button
                                        onClick={handleLogBodyFat}
                                        className="px-3 bg-[#ff793f] text-white rounded-xl text-xs font-black hover:bg-[#e0622a] tap-active"
                                    >
                                        Log
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Weight Trend Progress Chart */}
                        {user?.stats?.weight && user.stats.weight.length >= 2 && (
                            <div className="bg-card border border-white/5 p-5 rounded-3xl space-y-4 shadow-md">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Weight Trend Progress</span>
                                    <span className="text-[10px] text-primary font-black uppercase flex items-center gap-1">
                                        <TrendingUp size={10} /> Active
                                    </span>
                                </div>

                                {/* Line Chart SVG */}
                                <div className="w-full h-28 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center p-2">
                                    <svg width="100%" height="100%" viewBox="0 0 340 100" className="overflow-visible">
                                        {/* Grid lines */}
                                        <line x1="15" y1="15" x2="325" y2="15" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                        <line x1="15" y1="50" x2="325" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                        <line x1="15" y1="85" x2="325" y2="85" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                        
                                        {/* Trend Line */}
                                        <path
                                            d={weightChartPath}
                                            fill="none"
                                            stroke="var(--color-primary)"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="drop-shadow-[0_0_8px_rgba(60,207,148,0.3)]"
                                        />
                                        
                                        {/* Data points */}
                                        {(() => {
                                            const sorted = [...user.stats.weight].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                                            const weights = sorted.map(w => w.value);
                                            const minW = Math.min(...weights) - 1;
                                            const maxW = Math.max(...weights) + 1;
                                            const rangeW = maxW - minW || 1;
                                            
                                            return sorted.map((w, idx) => {
                                                const x = 15 + (idx / (sorted.length - 1)) * (340 - 30);
                                                const y = 100 - 15 - ((w.value - minW) / rangeW) * (100 - 30);
                                                return (
                                                    <g key={idx} className="group/dot cursor-pointer">
                                                        <circle
                                                            cx={x}
                                                            cy={y}
                                                            r="3.5"
                                                            fill="var(--color-primary)"
                                                            stroke="#18181c"
                                                            strokeWidth="1.5"
                                                        />
                                                        <title>{`${w.value}kg (${w.date})`}</title>
                                                    </g>
                                                );
                                            });
                                        })()}
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Food Add Logger Dialog Modal */}
            {showAddFoodModal && (
                <dialog
                    open
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6 w-full h-full border-0"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowAddFoodModal(false); }}
                >
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-5 w-full max-w-sm flex flex-col gap-4 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center">
                            <h3 className="font-extrabold text-white text-base">Search Food Item</h3>
                            <button
                                onClick={() => setShowAddFoodModal(false)}
                                className="p-1 text-zinc-400 hover:text-white"
                            >
                                <Plus className="rotate-45" size={20} />
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
                            <input
                                type="text"
                                placeholder="Type food name..."
                                value={foodSearchQuery}
                                onChange={e => setFoodSearchQuery(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff9f0a] font-bold"
                            />
                        </div>

                        {/* Food Items List */}
                        <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                            {filteredFoods.length === 0 ? (
                                <div className="text-center py-4 text-xs text-zinc-500">
                                    No matching foods found.
                                </div>
                            ) : filteredFoods.map(food => (
                                <div
                                    key={food.id}
                                    onClick={() => handleLogFood(food)}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl flex justify-between items-center cursor-pointer transition-colors"
                                >
                                    <div>
                                        <div className="font-bold text-sm text-white">{food.name}</div>
                                        <span className="text-[10px] text-zinc-500">
                                            {food.serving_label} • {food.calories} kcal
                                        </span>
                                    </div>
                                    <Plus size={14} className="text-[#ff9f0a]" />
                                </div>
                            ))}
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
}
