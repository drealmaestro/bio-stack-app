import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Dialog } from "../ui/dialog";
import { COMMON_FOODS } from "../../data/nutrition";

export interface FoodSearchModalProps {
    open: boolean;
    onClose: () => void;
    onLogFood: (food: typeof COMMON_FOODS[0]) => void;
}

export function FoodSearchModal({ open, onClose, onLogFood }: FoodSearchModalProps) {
    const [foodSearchQuery, setFoodSearchQuery] = useState("");

    const filteredFoods = COMMON_FOODS.filter(f =>
        f.name.toLowerCase().includes(foodSearchQuery.toLowerCase())
    );

    const handleSelectFood = (food: typeof COMMON_FOODS[0]) => {
        onLogFood(food);
        setFoodSearchQuery("");
    };

    return (
        <Dialog
            open={open}
            title="Search Food Item"
            onClose={onClose}
        >
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-white text-base">Search Food Item</h3>
                    <button
                        onClick={onClose}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                        aria-label="Close food search"
                    >
                        <Plus className="rotate-45" size={20} />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-3.5 text-zinc-500" size={16} />
                    <input
                        type="text"
                        placeholder="Type food name (e.g. Chicken, Whey, Oats)..."
                        value={foodSearchQuery}
                        onChange={e => setFoodSearchQuery(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-warning font-bold min-h-[44px]"
                        autoFocus
                    />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {filteredFoods.length === 0 ? (
                        <div className="text-center py-6 text-xs text-zinc-500">
                            No matching foods found.
                        </div>
                    ) : filteredFoods.map(food => (
                        <button
                            key={food.id}
                            type="button"
                            onClick={() => handleSelectFood(food)}
                            className="w-full text-left p-3 bg-white/5 hover:bg-white/10 active:scale-98 rounded-2xl flex justify-between items-center cursor-pointer transition-all min-h-[48px]"
                        >
                            <div>
                                <div className="font-bold text-sm text-white">{food.name}</div>
                                <span className="text-[10px] text-zinc-400 font-medium">
                                    {food.serving_label} • {food.calories} kcal • P {food.protein_g}g
                                </span>
                            </div>
                            <Plus size={16} className="text-warning shrink-0" />
                        </button>
                    ))}
                </div>
            </div>
        </Dialog>
    );
}
