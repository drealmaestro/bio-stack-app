import { Button } from '../ui/button';
import type { NutritionLog, NutritionEntry } from '../../types';
import { MEAL_PRESETS, type MealPreset } from '../../data/nutrition';
import { Plus, Flame, Trash2, Zap } from 'lucide-react';

interface FoodDiarySectionProps {
    todayLog?: NutritionLog;
    today: string;
    onOpenAddModal: () => void;
    onDeleteEntry: (date: string, entryId: string) => void;
    onAddEntry?: (entry: Omit<NutritionEntry, 'id' | 'logged_at'>) => void;
}

export function FoodDiarySection({
    todayLog,
    today,
    onOpenAddModal,
    onDeleteEntry,
    onAddEntry
}: FoodDiarySectionProps) {
    const handleQuickPreset = (preset: MealPreset) => {
        if (onAddEntry) {
            onAddEntry({
                food_item_id: preset.id,
                food_name: preset.name,
                servings: 1,
                calories: preset.calories,
                protein_g: preset.protein_g,
                carbs_g: preset.carbs_g,
                fat_g: preset.fat_g,
            });
            navigator.vibrate?.(30);
        }
    };

    return (
        <div className="space-y-4">
            {/* 1-Tap Meal Presets Bar */}
            <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                        <Zap size={12} /> 1-Tap Meal Presets
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">Tap to add</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {MEAL_PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleQuickPreset(preset)}
                            className="shrink-0 bg-amber-400/10 hover:bg-amber-400/20 active:scale-95 border border-amber-400/20 rounded-2xl p-3 text-left transition-all tap-active min-w-[140px] cursor-pointer"
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

            {/* Food Diary List */}
            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-sm font-extrabold text-zinc-500 uppercase tracking-widest">Food Diary</h3>
                    <Button
                        size="sm"
                        onClick={onOpenAddModal}
                        className="h-9 gap-1 text-xs font-black bg-warning hover:bg-warning/90 text-black rounded-full px-4 cursor-pointer min-h-[44px]"
                    >
                        <Plus size={14} /> Add Food
                    </Button>
                </div>

                {!todayLog || todayLog.entries.length === 0 ? (
                    <div
                        className="bg-card border border-dashed border-white/5 p-8 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-zinc-900/50 transition-colors"
                        onClick={onOpenAddModal}
                    >
                        <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                            <Plus size={22} />
                        </div>
                        <p className="text-xs font-bold text-zinc-500">Tap to record your first meal</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {todayLog.entries.map(entry => (
                            <div
                                key={entry.id}
                                className="group bg-card border border-white/5 p-4 rounded-2xl flex justify-between items-center hover:bg-zinc-900/90 transition-colors"
                            >
                                <div className="flex gap-3.5 items-center">
                                    <div className="w-9 h-9 rounded-full bg-warning/10 flex items-center justify-center text-warning shrink-0">
                                        <Flame size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm">{entry.food_name}</div>
                                        <div className="text-[10px] font-bold text-zinc-500 mt-0.5 flex items-center gap-1.5">
                                            {entry.servings > 1 ? <span className="text-white bg-white/10 px-1.5 py-0.5 rounded-md">{entry.servings}x</span> : ''}
                                            <span className="text-protein">P {entry.protein_g}g</span>
                                            <span>•</span>
                                            <span className="text-carbs">C {entry.carbs_g}g</span>
                                            <span>•</span>
                                            <span className="text-fat">F {entry.fat_g}g</span>
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
                                        onClick={() => { onDeleteEntry(today, entry.id); navigator.vibrate?.(20); }}
                                        className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white shrink-0 cursor-pointer min-w-[44px] min-h-[44px]"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
