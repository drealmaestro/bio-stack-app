import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/toast";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import { Plus, TrendingDown, Scale, Target, User2 } from "lucide-react";
import { DEFAULT_NUTRITION_GOALS } from "../data/nutrition";
import { calculateAge, cn } from "../lib/utils";
import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup, signOut, type User } from "firebase/auth";

// C3b: removed inappropriate goal label
const GOAL_OPTIONS = [
    "Chest Development", "Tricep Hypertrophy", "Bicep Hypertrophy",
    "General Strength", "Fat Loss", "Endurance", "Muscle Gain"
];
const EXPERIENCE_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

export function Profile() {
    const { user, setUser, logs, exercises } = useStore();
    const toast = useToast();

    const [formData, setFormData] = useState({
        name: "",
        birthday: "",  // C3a: no hardcoded default birthday
        experience_level: "Intermediate",
        goals: [] as string[],
    });
    const [nutritionGoals, setNutritionGoals] = useState({
        calories: DEFAULT_NUTRITION_GOALS.calories,
        protein_g: DEFAULT_NUTRITION_GOALS.protein_g,
        carbs_g: DEFAULT_NUTRITION_GOALS.carbs_g,
        fat_g: DEFAULT_NUTRITION_GOALS.fat_g,
    });
    const [newWeight, setNewWeight] = useState("");
    const [showAddWeight, setShowAddWeight] = useState(false);
    const [fbUser, setFbUser] = useState<User | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                birthday: user.birthday || "",  // C3a: preserve empty if not set
                experience_level: user.experience_level,
                goals: user.goals,
            });
            if (user.nutrition_goals) {
                setNutritionGoals({
                    calories: user.nutrition_goals.calories,
                    protein_g: user.nutrition_goals.protein_g,
                    carbs_g: user.nutrition_goals.carbs_g,
                    fat_g: user.nutrition_goals.fat_g,
                });
            }
        }
        
        const unsubscribe = auth.onAuthStateChanged((u) => setFbUser(u));
        return () => unsubscribe();
    }, [user]);

    const toggleGoal = (goal: string) => setFormData(prev => ({
        ...prev,
        goals: prev.goals.includes(goal) ? prev.goals.filter(g => g !== goal) : [...prev.goals, goal]
    }));

    const handleSave = () => {
        setUser({
            ...formData,
            age: calculateAge(formData.birthday),
            stats: user?.stats || { weight: [], body_fat: [] },
            nutrition_goals: nutritionGoals,
        });
        toast.success("Profile saved!");
    };

    const handleAddWeight = () => {
        const val = parseFloat(newWeight);
        if (!val || val < 30 || val > 300) { toast.error("Enter a valid weight (30–300 kg)"); return; }
        const currentStats = user?.stats || { weight: [], body_fat: [] };
        const entry = { date: new Date().toISOString().split("T")[0], value: val };
        setUser({
            ...user!,
            stats: { ...currentStats, weight: [...(currentStats.weight || []), entry] }
        });
        setNewWeight("");
        setShowAddWeight(false);
        toast.success(`Logged ${val} kg`);
    };

    // Chart data
    const weightHistory = (user?.stats?.weight || []).slice(-30);
    const latestWeight = weightHistory.at(-1)?.value;
    const firstWeight = weightHistory[0]?.value;
    const weightDelta = latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : null;

    // M5: pre-fill weight input with last known weight
    const handleOpenAddWeight = () => {
        if (!showAddWeight && latestWeight) {
            setNewWeight(String(latestWeight));
        } else if (!showAddWeight) {
            setNewWeight("");
        }
        setShowAddWeight(!showAddWeight);
    };

    // Calculate Muscle Volume (Sets per Muscle Group)
    const muscleVolume = logs.reduce((acc, log) => {
        log.completed_exercises.forEach(set => {
            const ex = exercises.find(e => e.id === set.exercise_id);
            if (ex) {
                acc[ex.target_muscle] = (acc[ex.target_muscle] || 0) + 1;
            }
        });
        return acc;
    }, {} as Record<string, number>);

    const barChartData = Object.entries(muscleVolume)
        .map(([name, sets]) => ({ name, sets }))
        .sort((a, b) => b.sets - a.sets)
        .slice(0, 5); // display top 5

    // Brand colors for the bar chart
    const COLORS = ['#00D4FF', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">

            {/* ── Section label ─────────────────── */}
            <div className="pt-1 flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white">Profile</h2>
                    <p className="text-zinc-500 text-sm">Manage your settings & goals</p>
                </div>
                {fbUser && !fbUser.isAnonymous ? (
                    <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-zinc-500">Cloud Sync Active</div>
                        <button onClick={() => signOut(auth)} className="text-xs text-red-400 hover:text-red-300 transition-colors font-semibold">Sign Out</button>
                    </div>
                ) : (
                    <Button onClick={() => signInWithPopup(auth, googleProvider)} size="sm" className="bg-white text-black font-bold h-8 text-xs hover:bg-zinc-200">
                        Sign in to Sync
                    </Button>
                )}
            </div>

            {/* ── Weight Tracker ────────────────── */}
            <div className="glass-card p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Scale size={16} className="text-primary" />
                        <h3 className="text-base font-bold text-white">Weight Tracker</h3>
                    </div>
                    <button
                        onClick={handleOpenAddWeight}
                        className="flex items-center gap-1 text-xs text-primary font-bold hover:text-primary/80 transition-colors"
                    >
                        <Plus size={14} /> Log Weight
                    </button>
                </div>

                {/* Stats row */}
                <div className="flex gap-4">
                    <div>
                        <div className="text-2xl font-black text-white">
                            {latestWeight ? `${latestWeight}` : "—"}
                            <span className="text-sm font-normal text-zinc-500 ml-1">kg</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Current</div>
                    </div>
                    {weightDelta !== null && (
                        <div>
                            <div className={cn("text-2xl font-black", parseFloat(weightDelta) < 0 ? "text-emerald-400" : "text-orange-400")}>
                                {parseFloat(weightDelta) > 0 ? "+" : ""}{weightDelta}
                                <span className="text-sm font-normal text-zinc-500 ml-1">kg</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                <TrendingDown size={10} /> 30-day change
                            </div>
                        </div>
                    )}
                </div>

                {/* Add weight form */}
                {showAddWeight && (
                    <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                        <Input
                            type="number"
                            value={newWeight}
                            onChange={e => setNewWeight(e.target.value)}
                            placeholder="e.g. 82.5"
                            className="bg-white/5 border-white/10 text-white"
                            step="0.1"
                        />
                        <Button onClick={handleAddWeight} className="shrink-0 bg-primary text-black font-bold hover:bg-primary/80">
                            Save
                        </Button>
                    </div>
                )}

                {/* Chart */}
                {weightHistory.length >= 2 ? (
                    <div className="h-36">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weightHistory} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#71717a', fontSize: 9 }}
                                    tickFormatter={d => d.slice(5)}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    tick={{ fill: '#71717a', fontSize: 9 }}
                                    domain={['auto', 'auto']}
                                    width={30}
                                />
                                <RechartsTooltip
                                    contentStyle={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
                                    labelStyle={{ color: '#a1a1aa' }}
                                    formatter={(v: number | undefined) => [`${v ?? '—'} kg`, 'Weight'] as [string, string]}
                                    cursor={{ stroke: '#ffffff', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.1 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#00D4FF"
                                    strokeWidth={2}
                                    dot={{ fill: '#00D4FF', r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-24 flex items-center justify-center text-sm text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                        Log at least 2 weight entries to see your chart
                    </div>
                )}
            </div>

            {/* ── Volume Tracker ────────────────── */}
            <div className="glass-card p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                    <Target size={16} className="text-purple-400" />
                    <h3 className="text-base font-bold text-white">Muscle Volume (Sets)</h3>
                </div>

                {barChartData.length > 0 ? (
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fill: '#71717a', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    tick={{ fill: '#71717a', fontSize: 10 }} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <RechartsTooltip 
                                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                                    contentStyle={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
                                    formatter={(v: number | undefined) => [`${v ?? 0} Sets`, 'Volume']}
                                />
                                <Bar dataKey="sets" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                    {barChartData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-24 flex items-center justify-center text-sm text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                        Log workouts to see your volume stats
                    </div>
                )}
            </div>

            {/* ── Profile Info ──────────────────── */}
            <div className="glass-card p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <User2 size={16} className="text-primary" />
                    <h3 className="text-base font-bold text-white">Personal Info</h3>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Name</label>
                    <Input
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        className="bg-white/5 border-white/10 text-white"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Birthday</label>
                        <Input
                            type="date"
                            value={formData.birthday}
                            onChange={e => setFormData({ ...formData, birthday: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Age</label>
                        <div className="flex h-10 items-center px-3 rounded-md border border-white/10 bg-white/5 text-primary font-black text-xl">
                            {calculateAge(formData.birthday)}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Experience Level</label>
                    <div className="flex gap-2">
                        {EXPERIENCE_OPTIONS.map(level => (
                            <button
                                key={level}
                                onClick={() => setFormData({ ...formData, experience_level: level })}
                                className={cn(
                                    "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                                    formData.experience_level === level
                                        ? "bg-primary text-black border-primary"
                                        : "border-white/10 text-zinc-400 hover:border-white/20"
                                )}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Nutrition Goals ───────────────── */}
            <div className="glass-card p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Target size={16} className="text-primary" />
                    <h3 className="text-base font-bold text-white">Nutrition Goals</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {([
                        { key: "calories", label: "Calories", unit: "kcal", color: "text-orange-400" },
                        { key: "protein_g", label: "Protein", unit: "g", color: "text-violet-400" },
                        { key: "carbs_g", label: "Carbs", unit: "g", color: "text-cyan-400" },
                        { key: "fat_g", label: "Fat", unit: "g", color: "text-yellow-400" },
                    ] as const).map(({ key, label, unit, color }) => (
                        <div key={key} className="space-y-1.5">
                            <label className={cn("text-xs font-bold uppercase tracking-widest", color)}>{label} ({unit})</label>
                            <Input
                                type="number"
                                value={nutritionGoals[key]}
                                onChange={e => setNutritionGoals(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Goals ─────────────────────────── */}
            <div className="glass-card p-5 rounded-2xl space-y-3">
                <h3 className="text-base font-bold text-white">Focus Areas</h3>
                <div className="flex flex-col gap-2">
                    {GOAL_OPTIONS.map(goal => (
                        <button
                            key={goal}
                            onClick={() => toggleGoal(goal)}
                            className={cn(
                                "w-full text-left py-3 px-4 rounded-xl text-sm font-semibold border transition-all",
                                formData.goals.includes(goal)
                                    ? "bg-primary/10 border-primary/50 text-primary"
                                    : "border-white/8 text-zinc-400 hover:border-white/15"
                            )}
                        >
                            {formData.goals.includes(goal) ? "✓ " : "+ "}{goal}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Save ──────────────────────────── */}
            <Button
                onClick={handleSave}
                className="w-full py-6 text-base font-black bg-gradient-to-r from-primary to-orange-400 text-black hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
                Save Profile
            </Button>
        </div>
    );
}
