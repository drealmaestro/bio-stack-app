import { MacroBar } from '../ui/macro-bar';
import { Flame, Zap } from 'lucide-react';

interface NutrientTargetCardProps {
    totals: {
        calories: number;
        protein_g: number;
        carbs_g: number;
        fat_g: number;
    };
    goals: {
        calories: number;
        protein_g: number;
        carbs_g: number;
        fat_g: number;
    };
    streak?: number;
}

export function NutrientTargetCard({ totals, goals, streak = 0 }: NutrientTargetCardProps) {
    return (
        <div className="space-y-6">
            {/* Macros Card */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-extrabold text-zinc-500 uppercase tracking-widest">Nutrient target</h3>
                    {streak > 0 && (
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400/10 border border-amber-400/20 text-amber-400 animate-in fade-in duration-300">
                            <Zap size={12} className="fill-amber-400" />
                            <span>{streak} Day Streak</span>
                        </div>
                    )}
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
            <div className="flex gap-2 items-center flex-wrap">
                {[
                    { label: 'P', value: totals.protein_g, color: 'bg-protein/10 text-protein' },
                    { label: 'C', value: totals.carbs_g, color: 'bg-carbs/10 text-carbs' },
                    { label: 'F', value: totals.fat_g, color: 'bg-fat/10 text-fat' },
                ].map(m => (
                    <div key={m.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${m.color}`}>
                        <span className="opacity-80">{m.label}</span>
                        <span>{Math.round(m.value)}g</span>
                    </div>
                ))}
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-warning/10 text-warning ml-auto">
                    <Flame size={12} /> {Math.round(totals.calories)} kcal
                </div>
            </div>
        </div>
    );
}
