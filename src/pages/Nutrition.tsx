import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ProgressRing } from '../components/ui/progress-ring';
import { MacroBar } from '../components/ui/macro-bar';
import { Button } from '../components/ui/button';
import { Dialog } from '../components/ui/dialog';
import { COMMON_FOODS, DEFAULT_NUTRITION_GOALS } from '../data/nutrition';
import type { FoodItem } from '../types';
import { Plus, X, Flame, Search, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

function todayLabel() {
    return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function Nutrition() {
    const { user, nutritionLogs, addNutritionEntry, deleteNutritionEntry } = useStore();
    const goals = user?.nutrition_goals ?? DEFAULT_NUTRITION_GOALS;

    // ── State declarations (must come before useEffect that references them) ──
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [servings, setServings] = useState(1);

    // M3: today date computed inside component and refreshed at midnight
    const [today, setToday] = useState(() => new Date().toISOString().slice(0, 10));
    useEffect(() => {
        const msUntilMidnight = () => {
            const now = new Date();
            const midnight = new Date(now);
            midnight.setDate(now.getDate() + 1);
            midnight.setHours(0, 0, 0, 0);
            return midnight.getTime() - now.getTime();
        };
        const timer = setTimeout(() => {
            setToday(new Date().toISOString().slice(0, 10));
        }, msUntilMidnight());
        return () => clearTimeout(timer);
    }, [today]);

    const todayLog = useMemo(() =>
        nutritionLogs.find(l => l.date === today),
        [nutritionLogs, today]
    );

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

    const caloriePct = goals.calories > 0 ? totals.calories / goals.calories : 0;
    const remaining = Math.max(goals.calories - totals.calories, 0);

    const filtered = COMMON_FOODS.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = () => {
        if (!selectedFood) return;
        addNutritionEntry(today, {
            food_item_id: selectedFood.id,
            food_name: selectedFood.name,
            servings,
            calories: Math.round(selectedFood.calories * servings),
            protein_g: Math.round(selectedFood.protein_g * servings * 10) / 10,
            carbs_g: Math.round(selectedFood.carbs_g * servings * 10) / 10,
            fat_g: Math.round(selectedFood.fat_g * servings * 10) / 10,
        });
        setSelectedFood(null);
        setServings(1);
        setSearchQuery('');
        setShowAddModal(false);
    };
    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">

            {/* Header */}
            <div className="px-1">
                <span className="text-xs font-black text-[#3ccf94] uppercase tracking-widest block mb-0.5">Nutrition</span>
                <h2 className="text-2xl font-extrabold text-white">{todayLabel()}</h2>
            </div>

            {/* Calorie Card Hero */}
            <div className="bg-card border border-white/5 rounded-3xl p-6 shadow-md flex justify-between items-center gap-6">
                <div className="flex-1 space-y-5">
                    <div>
                        <div className="text-4xl font-extrabold text-white tracking-tight leading-none">
                            {Math.round(totals.calories)}
                            <span className="text-xs font-bold text-zinc-500 ml-1">kcal</span>
                        </div>
                        <div className="text-xs font-black text-[#ff9f0a] uppercase tracking-widest mt-1.5">Calories eaten</div>
                    </div>
                    <div className="space-y-2 text-xs font-semibold text-zinc-400">
                        <div className="flex justify-between items-center">
                            <span>Daily target</span>
                            <span className="text-white font-extrabold">{goals.calories} kcal</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Remaining</span>
                            <span className={cn("font-extrabold", remaining === 0 ? "text-[#ff793f]" : "text-[#3ccf94]")}>
                                {remaining} kcal
                            </span>
                        </div>
                    </div>
                </div>
                <div className="shrink-0 relative drop-shadow-[0_0_12px_rgba(255,159,10,0.15)]">
                    <ProgressRing
                        size={120}
                        strokeWidth={11}
                        progress={caloriePct}
                        color="#ff9f0a"
                        label={`${Math.round(caloriePct * 100)}%`}
                        sublabel="logged"
                    />
                </div>
            </div>

            {/* Macros Card */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-extrabold text-zinc-500 uppercase tracking-widest">Nutrient target</h3>
                </div>
                <div className="bg-card border border-white/5 p-6 rounded-3xl space-y-5 shadow-md">
                    <MacroBar
                        label="Protein"
                        current={totals.protein_g}
                        goal={goals.protein_g}
                        color="bg-protein"
                    />
                    <MacroBar
                        label="Carbohydrates"
                        current={totals.carbs_g}
                        goal={goals.carbs_g}
                        color="bg-carbs"
                    />
                    <MacroBar
                        label="Fat"
                        current={totals.fat_g}
                        goal={goals.fat_g}
                        color="bg-fat"
                    />
                </div>
            </div>

            {/* Macro Pill Summary */}
            <div className="flex gap-2">
                {[
                    { label: 'P', value: totals.protein_g, color: 'bg-protein/10 text-protein' },
                    { label: 'C', value: totals.carbs_g, color: 'bg-carbs/10 text-[#36b4ff]' },
                    { label: 'F', value: totals.fat_g, color: 'bg-fat/10 text-[#ff793f]' },
                ].map(m => (
                    <div key={m.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${m.color}`}>
                        <span className="opacity-80">{m.label}</span>
                        <span>{Math.round(m.value)}g</span>
                    </div>
                ))}
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#ff9f0a]/10 text-[#ff9f0a] ml-auto">
                    <Flame size={12} /> {Math.round(totals.calories)} kcal
                </div>
            </div>

            {/* Today's Log */}
            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-sm font-extrabold text-zinc-500 uppercase tracking-widest">Food Diary</h3>
                    <Button
                        size="sm"
                        onClick={() => setShowAddModal(true)}
                        className="h-8 gap-1 text-xs font-bold bg-[#ff9f0a] hover:bg-[#ff9f0a]/90 text-black rounded-full px-3.5"
                    >
                        <Plus size={13} /> Add Food
                    </Button>
                </div>

                {!todayLog || todayLog.entries.length === 0 ? (
                    <div
                        className="bg-card border border-dashed border-white/5 p-8 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-zinc-900/50 transition-colors"
                        onClick={() => setShowAddModal(true)}
                    >
                        <div className="w-12 h-12 rounded-full bg-[#ff9f0a]/10 flex items-center justify-center text-[#ff9f0a]">
                            <Plus size={22} />
                        </div>
                        <p className="text-xs font-bold text-zinc-500">Tap to record your first meal</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {todayLog!.entries.map(entry => (
                            <div
                                key={entry.id}
                                className="group bg-card border border-white/5 p-4 rounded-2xl flex justify-between items-center hover:bg-zinc-900/90 transition-colors"
                            >
                                <div className="flex gap-3.5 items-center">
                                    <div className="w-9 h-9 rounded-full bg-[#ff9f0a]/10 flex items-center justify-center text-[#ff9f0a] shrink-0">
                                        <Flame size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm">{entry.food_name}</div>
                                        <div className="text-[10px] font-bold text-zinc-500 mt-0.5 flex items-center gap-1.5">
                                            {entry.servings > 1 ? <span className="text-white bg-white/10 px-1.5 py-0.5 rounded-md">{entry.servings}x</span> : ''}
                                            <span className="text-protein">P {entry.protein_g}g</span>
                                            <span>•</span>
                                            <span className="text-[#36b4ff]">C {entry.carbs_g}g</span>
                                            <span>•</span>
                                            <span className="text-[#ff793f]">F {entry.fat_g}g</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="text-base font-extrabold text-white">{entry.calories}</div>
                                        <div className="text-[9px] uppercase tracking-widest font-black text-zinc-500 leading-none">kcal</div>
                                    </div>
                                    <button
                                        aria-label={`Delete ${entry.food_name}`}
                                        onClick={() => deleteNutritionEntry(today, entry.id)}
                                        className="w-9 h-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white shrink-0"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog
                open={showAddModal}
                title="Add food"
                onClose={() => setShowAddModal(false)}
                className="z-50 items-end bg-black/80 backdrop-blur-md px-0"
                panelClassName="w-full max-w-lg mx-auto bg-zinc-950 border-white/10 rounded-t-4xl rounded-b-none p-6 space-y-5 animate-in slide-in-from-bottom-[100%] duration-500 pb-safe shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
            >
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-black text-white">Add Food</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-zinc-400 hover:text-white"
                                aria-label="Close add food"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                aria-label="Search foods"
                                placeholder="Search foods..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                                autoFocus
                            />
                        </div>

                        {/* Selected Food + Servings */}
                        {selectedFood && (
                            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-white">{selectedFood.name}</div>
                                        <div className="text-xs text-muted-foreground">{selectedFood.serving_label} per serving</div>
                                    </div>
                                    <button onClick={() => setSelectedFood(null)} className="text-zinc-500">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">Servings:</span>
                                    <button
                                        onClick={() => setServings(s => Math.max(0.5, s - 0.5))}
                                        className="w-8 h-8 rounded-full bg-white/10 text-white font-bold flex items-center justify-center"
                                    >−</button>
                                    <span className="text-lg font-black text-white w-8 text-center">{servings}</span>
                                    <button
                                        onClick={() => setServings(s => s + 0.5)}
                                        className="w-8 h-8 rounded-full bg-white/10 text-white font-bold flex items-center justify-center"
                                    >+</button>
                                    <div className="ml-auto text-right">
                                        <div className="text-primary font-black">{Math.round(selectedFood.calories * servings)} kcal</div>
                                        <div className="text-xs text-muted-foreground">
                                            P {Math.round(selectedFood.protein_g * servings)}g · C {Math.round(selectedFood.carbs_g * servings)}g · F {Math.round(selectedFood.fat_g * servings)}g
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={handleAdd} className="w-full bg-primary text-black font-black">
                                    Log Food
                                </Button>
                            </div>
                        )}

                        {/* Food List */}
                        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                            {filtered.map(food => (
                                <button
                                    key={food.id}
                                    onClick={() => { setSelectedFood(food); setServings(1); }}
                                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                                        selectedFood?.id === food.id
                                            ? 'bg-primary/10 border-primary/30'
                                            : 'bg-white/3 border-transparent hover:bg-white/5'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-sm font-bold text-white">{food.name}</div>
                                            <div className="text-xs text-muted-foreground">{food.serving_label}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-primary">{food.calories} kcal</div>
                                            <div className="text-xs text-muted-foreground">
                                                P{Math.round(food.protein_g)} C{Math.round(food.carbs_g)} F{Math.round(food.fat_g)}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                            {filtered.length === 0 && (
                                <div className="text-center text-zinc-500 text-sm py-6 border border-dashed border-white/10 rounded-xl">
                                    No foods found. Try a different search.
                                </div>
                            )}
                        </div>
            </Dialog>
        </div>
    );
}
