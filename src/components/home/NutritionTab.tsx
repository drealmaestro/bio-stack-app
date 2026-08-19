import { useMemo, useState } from "react";
import { useStore } from "../../store/useStore";
import { Plus, Trash2, Flame, Zap } from "lucide-react";
import { cn } from "../../lib/utils";
import { ProgressRing } from "../ui/progress-ring";
import { MacroBar } from "../ui/macro-bar";
import { MEAL_PRESETS, type MealPreset, type COMMON_FOODS } from "../../data/nutrition";
import { getEffectiveNutritionGoals } from "../../lib/nutritionGoals";
import { FoodSearchModal } from "./FoodSearchModal";

export function NutritionTab({ todayStr }: { todayStr: string }) {
    const { user, nutritionLogs, addNutritionEntry, deleteNutritionEntry } = useStore();
    const [showAddFoodModal, setShowAddFoodModal] = useState(false);

    const todayLog = useMemo(
        () => nutritionLogs.find(l => l.date === todayStr),
        [nutritionLogs, todayStr]
    );

    const { goals, proteinSource } = getEffectiveNutritionGoals(user);

    const totals = useMemo(() => {
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

    const proteinPct = goals.protein_g > 0 ? totals.protein_g / goals.protein_g : 0;
    const proteinRemaining = Math.max(goals.protein_g - totals.protein_g, 0);
    const calorieBalance = goals.calories - totals.calories;

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
        navigator.vibrate?.(30);
        setShowAddFoodModal(false);
    };

    const handleLogPreset = (preset: MealPreset) => {
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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Protein Hero — protein drives muscle retention */}
            <div className="bg-card border border-white/5 rounded-3xl p-5 flex items-center justify-between gap-6 shadow-md">
                <div className="space-y-3 flex-1">
                    <div>
                        <span className="text-[10px] font-black text-protein uppercase tracking-widest block">Protein First</span>
                        <div className="text-3xl font-black text-white mt-1">
                            {Math.round(totals.protein_g)} <span className="text-xs font-bold text-zinc-500">/ {goals.protein_g} g</span>
                        </div>
                        {proteinSource === 'bodyweight' && (
                            <span className="text-[9px] text-zinc-500 font-bold block mt-0.5">target set at 1.8 g per kg body weight</span>
                        )}
                    </div>
                    <div className="space-y-0.5 text-xs text-zinc-400">
                        <div className="flex justify-between items-center gap-4">
                            <span>Still to eat:</span>
                            <span className={cn("font-black", proteinRemaining === 0 ? "text-primary" : "text-white")}>
                                {Math.round(proteinRemaining)} g
                            </span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span>Energy:</span>
                            <span className="font-black text-white">{Math.round(totals.calories)} / {goals.calories} kcal</span>
                        </div>
                    </div>
                    <span className={cn(
                        "inline-block text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider",
                        calorieBalance > 0 ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                    )}>
                        {calorieBalance > 0
                            ? `${calorieBalance} kcal under target`
                            : `${Math.abs(calorieBalance)} kcal over target`}
                    </span>
                </div>
                <div className="relative shrink-0 drop-shadow-[0_0_15px_rgba(167,139,250,0.22)]">
                    <ProgressRing
                        size={110}
                        strokeWidth={9}
                        progress={proteinPct}
                        color="#a78bfa"
                        label={`${Math.round(proteinPct * 100)}%`}
                        sublabel="protein"
                    />
                </div>
            </div>

            {/* 1-Tap Meal Preset Chips */}
            <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                    <span className="section-label flex items-center gap-1">
                        <Zap size={12} className="text-amber-400" /> 1-Tap Meal Presets
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">Instant logging</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {MEAL_PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleLogPreset(preset)}
                            className="shrink-0 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 active:scale-95 rounded-2xl p-3 text-left transition-all tap-active min-w-[140px] cursor-pointer"
                        >
                            <div className="text-xs font-black text-amber-300 truncate">{preset.name}</div>
                            <div className="text-sm font-black text-white mt-1">{preset.calories} <span className="text-[10px] text-zinc-400">kcal</span></div>
                            <div className="text-[10px] font-bold text-protein mt-0.5">
                                P {preset.protein_g}g · C {preset.carbs_g}g
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Macros Target */}
            <div className="bg-card border border-white/5 p-5 rounded-3xl space-y-4 shadow-md">
                <span className="section-label block">Macronutrient Target</span>
                <div className="space-y-3.5">
                    <MacroBar label="Protein" current={totals.protein_g} goal={goals.protein_g} color="bg-protein" />
                    <MacroBar label="Carbohydrates" current={totals.carbs_g} goal={goals.carbs_g} color="bg-carbs" />
                    <MacroBar label="Fat" current={totals.fat_g} goal={goals.fat_g} color="bg-fat" />
                </div>
            </div>

            {/* Food logs & Quick logging */}
            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <h3 className="section-label">Today's Meals</h3>
                    <button
                        onClick={() => setShowAddFoodModal(true)}
                        className="text-xs font-bold text-warning flex items-center gap-0.5 min-h-[44px] px-2 py-1 cursor-pointer"
                    >
                        Log Food <Plus size={13} />
                    </button>
                </div>

                <div className="bg-card border border-white/5 rounded-3xl p-4 divide-y divide-white/[0.04] shadow-md">
                    {(!todayLog?.entries || todayLog.entries.length === 0) ? (
                        <div className="text-center py-4 text-xs text-zinc-500">
                            No food logged yet today. Tap a 1-tap meal preset above or tap Log Food.
                        </div>
                    ) : todayLog.entries.map(e => (
                        <div key={e.id} className="py-2.5 flex justify-between items-center first:pt-0 last:pb-0">
                            <div>
                                <div className="font-extrabold text-sm text-white">{e.food_name}</div>
                                <span className="text-[10px] text-zinc-500 font-bold">
                                    {e.servings} serving • {e.calories} kcal • <span className="text-protein">P: {e.protein_g}g</span>
                                </span>
                            </div>
                            <button
                                onClick={() => { deleteNutritionEntry(todayStr, e.id); navigator.vibrate?.(20); }}
                                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl text-zinc-500 hover:text-red-500 hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
                                title="Delete food entry"
                                aria-label={`Delete ${e.food_name}`}
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}
                </div>

                {totals.calories > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-warning/10 text-warning w-fit ml-auto">
                        <Flame size={12} /> {Math.round(totals.calories)} kcal today
                    </div>
                )}
            </div>

            {/* Food Add Logger Dialog */}
            <FoodSearchModal
                open={showAddFoodModal}
                onClose={() => setShowAddFoodModal(false)}
                onLogFood={handleLogFood}
            />
        </div>
    );
}
