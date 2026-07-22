import { Button } from '../ui/button';
import type { NutritionLog } from '../../types';
import { Plus, Flame, Trash2 } from 'lucide-react';

interface FoodDiarySectionProps {
    todayLog?: NutritionLog;
    today: string;
    onOpenAddModal: () => void;
    onDeleteEntry: (date: string, entryId: string) => void;
}

export function FoodDiarySection({ todayLog, today, onOpenAddModal, onDeleteEntry }: FoodDiarySectionProps) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-extrabold text-zinc-500 uppercase tracking-widest">Food Diary</h3>
                <Button
                    size="sm"
                    onClick={onOpenAddModal}
                    className="h-8 gap-1 text-xs font-bold bg-warning hover:bg-warning/90 text-black rounded-full px-3.5"
                >
                    <Plus size={13} /> Add Food
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
                                    onClick={() => onDeleteEntry(today, entry.id)}
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
    );
}
