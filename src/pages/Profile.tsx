import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/toast";
import { DEFAULT_NUTRITION_GOALS } from "../data/nutrition";
import { calculateAge } from "../lib/utils";
import { auth, linkAnonymousToGoogle } from "../lib/firebase";
import { type User } from "firebase/auth";
import { signOutAndResetLocalData } from "../lib/accountBoundary";
import { WeightTrackerCard } from "../components/profile/WeightTrackerCard";
import { MuscleVolumeCard } from "../components/profile/MuscleVolumeCard";
import { PersonalInfoCard } from "../components/profile/PersonalInfoCard";
import { NutritionGoalsCard } from "../components/profile/NutritionGoalsCard";
import { FocusAreasCard } from "../components/profile/FocusAreasCard";

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
        birthday: "",
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
                birthday: user.birthday || "",
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

    const weightHistory = (user?.stats?.weight || []).slice(-30);
    const latestWeight = weightHistory.at(-1)?.value;
    const firstWeight = weightHistory[0]?.value;
    const weightDelta = latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : null;

    const handleOpenAddWeight = () => {
        if (!showAddWeight && latestWeight) {
            setNewWeight(String(latestWeight));
        } else if (!showAddWeight) {
            setNewWeight("");
        }
        setShowAddWeight(!showAddWeight);
    };

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
        .slice(0, 5);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="pt-1 flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white">Profile</h2>
                    <p className="text-zinc-500 text-sm">Manage your settings & goals</p>
                </div>
                {fbUser && !fbUser.isAnonymous ? (
                    <div className="text-right">
                        <div className="text-xs uppercase font-bold text-zinc-500">Cloud Sync Active</div>
                        <button
                            onClick={async () => {
                                await signOutAndResetLocalData();
                                toast.info("Signed out — local data cleared");
                            }}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors font-semibold"
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <Button
                        onClick={async () => {
                            try {
                                const { linked, fellBack } = await linkAnonymousToGoogle();
                                if (linked) toast.success("Account upgraded — data preserved");
                                else if (fellBack) toast.info("Signed into existing Google account");
                                else toast.success("Signed in");
                            } catch (e) {
                                console.error(e);
                                toast.error("Sign-in failed");
                            }
                        }}
                        size="sm"
                        className="bg-white text-black font-bold h-8 text-xs hover:bg-zinc-200"
                    >
                        Sign in to Sync
                    </Button>
                )}
            </div>

            <WeightTrackerCard
                latestWeight={latestWeight}
                weightDelta={weightDelta}
                showAddWeight={showAddWeight}
                newWeight={newWeight}
                weightHistory={weightHistory}
                onToggleAddWeight={handleOpenAddWeight}
                onWeightChange={setNewWeight}
                onAddWeight={handleAddWeight}
            />

            <MuscleVolumeCard barChartData={barChartData} />

            <PersonalInfoCard
                formData={formData}
                experienceOptions={EXPERIENCE_OPTIONS}
                onUpdateForm={updates => setFormData(prev => ({ ...prev, ...updates }))}
            />

            <NutritionGoalsCard
                nutritionGoals={nutritionGoals}
                onUpdateGoal={(key, val) => setNutritionGoals(prev => ({ ...prev, [key]: val }))}
            />

            <FocusAreasCard
                goalOptions={GOAL_OPTIONS}
                selectedGoals={formData.goals}
                onToggleGoal={toggleGoal}
            />

            <div className="space-y-4">
                <Button
                    onClick={handleSave}
                    className="w-full py-6 text-base font-black bg-linear-to-r from-primary to-orange-400 text-black hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                    Save Profile
                </Button>
                <div className="text-center text-[10px] font-extrabold text-zinc-600 uppercase tracking-widest pt-2">
                    v1.4.0 (Action & UI/UX Engine)
                </div>
            </div>
        </div>
    );
}
