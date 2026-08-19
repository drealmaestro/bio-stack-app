import { useMemo, useState } from "react";
import { useStore } from "../../store/useStore";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { getEffectiveNutritionGoals } from "../../lib/nutritionGoals";
import { FoodSearchModal } from "./FoodSearchModal";
import { MacroTargetCard } from "./MacroTargetCard";

interface PresetItem {
    id: string;
    name: string;
    protein_g: number;
    calories: number;
    carbs_g: number;
    fat_g: number;
}

const PRESET_CHIPS: PresetItem[] = [
    { id: "whey-shake", name: "Whey Shake", protein_g: 30, calories: 140, carbs_g: 3, fat_g: 1.5 },
    { id: "chicken-bowl", name: "Chicken Bowl", protein_g: 45, calories: 480, carbs_g: 50, fat_g: 8 },
    { id: "greek-yogurt", name: "Greek Yogurt", protein_g: 20, calories: 130, carbs_g: 8, fat_g: 0 },
];

export function NutritionTab({ todayStr }: { todayStr: string }) {
    const { user, nutritionLogs, addNutritionEntry, deleteNutritionEntry } = useStore();
    const [showAddFoodModal, setShowAddFoodModal] = useState(false);

    const todayLog = useMemo(
        () => nutritionLogs.find(l => l.date === todayStr),
        [nutritionLogs, todayStr]
    );

    const { goals } = getEffectiveNutritionGoals(user);

    const totals = useMemo(() => {
        const entries = todayLog?.entries ?? [];
        const sum = entries.reduce(
            (acc, e) => ({
                calories: acc.calories + e.calories,
                protein_g: acc.protein_g + e.protein_g,
                carbs_g: acc.carbs_g + e.carbs_g,
                fat_g: acc.fat_g + e.fat_g,
            }),
            { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
        );
        return {
            calories: sum.calories || 1740,
            protein_g: sum.protein_g || 112,
            carbs_g: sum.carbs_g || 160,
            fat_g: sum.fat_g || 48,
        };
    }, [todayLog]);

    const proteinTarget = goals.protein_g || 150;
    const caloriesTarget = goals.calories || 2200;
    const carbsTarget = goals.carbs_g || 220;
    const fatTarget = goals.fat_g || 65;

    const proteinPct = Math.min(totals.protein_g / proteinTarget, 1);
    const proteinRemaining = Math.max(proteinTarget - totals.protein_g, 0);
    const calorieBalance = caloriesTarget - totals.calories;

    const handleLogPreset = (preset: PresetItem) => {
        addNutritionEntry(todayStr, {
            food_item_id: preset.id,
            food_name: preset.name,
            servings: 1,
            calories: preset.calories,
            protein_g: preset.protein_g,
            carbs_g: preset.carbs_g,
            fat_g: preset.fat_g
        });
        navigator.vibrate?.(30);
    };

    const handleLogFood = (food: { id: string; name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number }) => {
        addNutritionEntry(todayStr, {
            food_item_id: food.id,
            food_name: food.name,
            servings: 1,
            calories: food.calories,
            protein_g: food.protein_g,
            carbs_g: food.carbs_g,
            fat_g: food.fat_g
        });
        navigator.vibrate?.(30);
        setShowAddFoodModal(false);
    };

    const circumference = 2 * Math.PI * 38; // ~238.76
    const strokeDashoffset = circumference * (1 - proteinPct);

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Protein First Target Hero Card */}
            <div className="bg-card border border-white/5 rounded-3xl p-5 flex items-center justify-between gap-4 shadow-xl">
                <div className="space-y-2 flex-1 min-w-0">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block">Protein First Target</span>
                    <div className="text-3xl font-black text-white">
                        {Math.round(totals.protein_g)} <span className="text-sm font-bold text-zinc-500">/ {proteinTarget} g</span>
                    </div>
                    <div className="text-xs text-zinc-400 space-y-0.5 font-medium">
                        <div>Remaining: <span className="font-black text-white">{Math.round(proteinRemaining)} g</span></div>
                        <div>Calories: <span className="font-black text-white">{Math.round(totals.calories).toLocaleString()} / {caloriesTarget.toLocaleString()} kcal</span></div>
                    </div>
                    <span className={cn(
                        "inline-block text-[9px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider border",
                        calorieBalance >= 0
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-amber-400/10 text-amber-400 border-amber-400/20"
                    )}>
                        {calorieBalance >= 0
                            ? `${Math.round(calorieBalance)} kcal under budget (Cutting)`
                            : `${Math.round(Math.abs(calorieBalance))} kcal over target`}
                    </span>
                </div>

                {/* SVG Progress Ring */}
                <div className="relative flex items-center justify-center shrink-0">
                    <svg className="w-24 h-24 -rotate-90">
                        <circle cx="48" cy="48" r="38" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="transparent" />
                        <circle
                            cx="48"
                            cy="48"
                            r="38"
                            stroke="#a78bfa"
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                            className="transition-all duration-500"
                        />
                    </svg>
                    <span className="absolute text-sm font-black text-white">
                        {Math.round(proteinPct * 100)}%
                    </span>
                </div>
            </div>

            {/* 1-Tap Fast Meal Presets */}
            <div className="bg-card border border-white/5 p-4 rounded-3xl space-y-3 shadow-xl">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">1-Tap Fast Meal Presets</span>
                    <span className="text-[9px] text-primary font-bold">Tap to add</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {PRESET_CHIPS.map((preset) => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleLogPreset(preset)}
                            className="p-2.5 bg-white/5 hover:bg-purple-500/15 border border-white/5 hover:border-purple-500/30 active:scale-95 rounded-2xl text-left transition-all tap-active cursor-pointer min-h-[44px]"
                        >
                            <span className="text-xs font-black text-white block truncate">{preset.name}</span>
                            <span className="text-[10px] font-bold text-purple-400">+{preset.protein_g}g P</span>
                            <span className="text-[9px] text-zinc-500 block">{preset.calories} kcal</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Macronutrient Target Bars */}
            <MacroTargetCard
                proteinCurrent={totals.protein_g}
                proteinTarget={proteinTarget}
                carbsCurrent={totals.carbs_g}
                carbsTarget={carbsTarget}
                fatCurrent={totals.fat_g}
                fatTarget={fatTarget}
            />

            {/* Logged Meals Today */}
            <div className="bg-card border border-white/5 p-5 rounded-3xl space-y-3 shadow-xl">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Logged Meals Today</span>
                    <button
                        onClick={() => setShowAddFoodModal(true)}
                        className="text-xs font-bold text-amber-400 flex items-center gap-0.5 min-h-[44px] px-2 py-1 cursor-pointer"
                    >
                        Log Food <Plus size={13} />
                    </button>
                </div>

                <div className="divide-y divide-white/5 space-y-2">
                    {(!todayLog?.entries || todayLog.entries.length === 0) ? (
                        <div className="space-y-2">
                            <div className="pt-1 flex justify-between items-center text-xs">
                                <div>
                                    <div className="font-extrabold text-white">4 Eggs + Sourdough Toast</div>
                                    <span className="text-[10px] text-purple-400 font-bold">26g P • 420 kcal</span>
                                </div>
                                <span className="text-[10px] text-zinc-500 font-bold">08:30 AM</span>
                            </div>
                            <div className="pt-2 flex justify-between items-center text-xs">
                                <div>
                                    <div className="font-extrabold text-white">Chicken Breast & Jasmine Rice</div>
                                    <span className="text-[10px] text-purple-400 font-bold">48g P • 580 kcal</span>
                                </div>
                                <span className="text-[10px] text-zinc-500 font-bold">12:45 PM</span>
                            </div>
                            <div className="pt-2 flex justify-between items-center text-xs">
                                <div>
                                    <div className="font-extrabold text-white">Whey Isolate Shake</div>
                                    <span className="text-[10px] text-purple-400 font-bold">38g P • 180 kcal</span>
                                </div>
                                <span className="text-[10px] text-zinc-500 font-bold">04:15 PM</span>
                            </div>
                        </div>
                    ) : (
                        todayLog.entries.map((e) => (
                            <div key={e.id} className="pt-2 flex justify-between items-center text-xs first:pt-0">
                                <div>
                                    <div className="font-extrabold text-white">{e.food_name}</div>
                                    <span className="text-[10px] text-purple-400 font-bold">+{e.protein_g}g P • {e.calories} kcal</span>
                                </div>
                                <button
                                    onClick={() => deleteNutritionEntry(todayStr, e.id)}
                                    className="p-2 text-zinc-500 hover:text-red-400 min-h-[44px] flex items-center"
                                    aria-label="Delete entry"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Food Search Modal */}
            <FoodSearchModal
                open={showAddFoodModal}
                onClose={() => setShowAddFoodModal(false)}
                onLogFood={handleLogFood}
            />
        </div>
    );
}
