import { useMemo, useState } from "react";
import { useStore } from "../../store/useStore";
import { Plus, Search, Trash2, Flame } from "lucide-react";
import { cn } from "../../lib/utils";
import { ProgressRing } from "../ui/progress-ring";
import { MacroBar } from "../ui/macro-bar";
import { Dialog } from "../ui/dialog";
import { COMMON_FOODS } from "../../data/nutrition";
import { getEffectiveNutritionGoals } from "../../lib/nutritionGoals";

export function NutritionTab({ todayStr }: { todayStr: string }) {
    const { user, nutritionLogs, addNutritionEntry, deleteNutritionEntry } = useStore();

    const [showAddFoodModal, setShowAddFoodModal] = useState(false);
    const [foodSearchQuery, setFoodSearchQuery] = useState("");

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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Protein Hero — protein drives muscle retention while cutting chest fat */}
            <div className="bg-card border border-white/5 rounded-3xl p-5 flex items-center justify-between gap-6 shadow-md">
                <div className="space-y-3">
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
                        className="text-xs font-bold text-warning flex items-center gap-0.5"
                    >
                        Log Food <Plus size={13} />
                    </button>
                </div>

                <div className="bg-card border border-white/5 rounded-3xl p-4 divide-y divide-white/[0.04] shadow-md">
                    {(!todayLog?.entries || todayLog.entries.length === 0) ? (
                        <div className="text-center py-4 text-xs text-zinc-500">
                            No food logged yet today. Protein first — hit your target on training days especially.
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
                                onClick={() => deleteNutritionEntry(todayStr, e.id)}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-white/5 transition-colors"
                                title="Delete food entry"
                            >
                                <Trash2 size={13} />
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
            <Dialog
                open={showAddFoodModal}
                title="Search Food Item"
                onClose={() => setShowAddFoodModal(false)}
            >
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-extrabold text-white text-base">Search Food Item</h3>
                        <button
                            onClick={() => setShowAddFoodModal(false)}
                            className="p-1 text-zinc-400 hover:text-white"
                            aria-label="Close food search"
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
                            className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-warning font-bold"
                        />
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                        {filteredFoods.length === 0 ? (
                            <div className="text-center py-4 text-xs text-zinc-500">
                                No matching foods found.
                            </div>
                        ) : filteredFoods.map(food => (
                            <button
                                key={food.id}
                                onClick={() => handleLogFood(food)}
                                className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-2xl flex justify-between items-center cursor-pointer transition-colors"
                            >
                                <div>
                                    <div className="font-bold text-sm text-white">{food.name}</div>
                                    <span className="text-[10px] text-zinc-500">
                                        {food.serving_label} • {food.calories} kcal • P {food.protein_g}g
                                    </span>
                                </div>
                                <Plus size={14} className="text-warning" />
                            </button>
                        ))}
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
