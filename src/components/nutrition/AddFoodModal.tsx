import { useState } from 'react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { COMMON_FOODS, MEAL_PRESETS, type MealPreset } from '../../data/nutrition';
import type { FoodItem, NutritionEntry } from '../../types';
import { Search, X, Zap } from 'lucide-react';

interface AddFoodModalProps {
    open: boolean;
    onClose: () => void;
    onAddEntry: (entry: Omit<NutritionEntry, 'id' | 'logged_at'>) => void;
}

export function AddFoodModal({ open, onClose, onAddEntry }: AddFoodModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [servings, setServings] = useState(1);

    const filtered = COMMON_FOODS.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleClose = () => {
        setSelectedFood(null);
        setServings(1);
        setSearchQuery('');
        onClose();
    };

    const handleAdd = () => {
        if (!selectedFood) return;
        onAddEntry({
            food_item_id: selectedFood.id,
            food_name: selectedFood.name,
            servings,
            calories: Math.round(selectedFood.calories * servings),
            protein_g: Math.round(selectedFood.protein_g * servings * 10) / 10,
            carbs_g: Math.round(selectedFood.carbs_g * servings * 10) / 10,
            fat_g: Math.round(selectedFood.fat_g * servings * 10) / 10,
        });
        handleClose();
    };

    const handleAddPreset = (preset: MealPreset) => {
        onAddEntry({
            food_item_id: preset.id,
            food_name: preset.name,
            servings: 1,
            calories: preset.calories,
            protein_g: preset.protein_g,
            carbs_g: preset.carbs_g,
            fat_g: preset.fat_g,
        });
        handleClose();
    };

    return (
        <Dialog
            open={open}
            title="Add food"
            onClose={handleClose}
            className="z-50 items-end bg-black/80 backdrop-blur-md px-0"
            panelClassName="w-full max-w-lg mx-auto bg-zinc-950 border-white/10 rounded-t-4xl rounded-b-none p-6 space-y-4 animate-in slide-in-from-bottom-[100%] duration-500 pb-safe shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
        >
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-white">Add Food</h3>
                <button
                    onClick={handleClose}
                    className="text-zinc-400 hover:text-white"
                    aria-label="Close add food"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Quick Meal Presets */}
            <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
                    <Zap size={12} /> Quick Meal Presets
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {MEAL_PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            onClick={() => handleAddPreset(preset)}
                            className="shrink-0 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 rounded-xl p-2.5 text-left transition-all tap-active max-w-[150px]"
                        >
                            <div className="text-xs font-black text-amber-300 truncate">{preset.name}</div>
                            <div className="text-[10px] text-zinc-300 font-bold mt-0.5">{preset.calories} kcal</div>
                            <div className="text-[9px] text-zinc-400 font-semibold truncate">
                                P{preset.protein_g}g C{preset.carbs_g}g F{preset.fat_g}g
                            </div>
                        </button>
                    ))}
                </div>
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
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
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
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
    );
}
