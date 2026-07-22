import { ProgressRing } from '../ui/progress-ring';
import { cn } from '../../lib/utils';

interface ProteinHeroCardProps {
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
    proteinSource?: string;
}

export function ProteinHeroCard({ totals, goals, proteinSource }: ProteinHeroCardProps) {
    const proteinPct = goals.protein_g > 0 ? totals.protein_g / goals.protein_g : 0;
    const proteinRemaining = Math.max(goals.protein_g - totals.protein_g, 0);
    const calorieBalance = goals.calories - totals.calories;

    return (
        <div className="bg-card border border-white/5 rounded-3xl p-6 shadow-md flex justify-between items-center gap-6">
            <div className="flex-1 space-y-5">
                <div>
                    <div className="text-4xl font-extrabold text-white tracking-tight leading-none">
                        {Math.round(totals.protein_g)}
                        <span className="text-xs font-bold text-zinc-500 ml-1">/ {goals.protein_g} g</span>
                    </div>
                    <div className="text-xs font-black text-protein uppercase tracking-widest mt-1.5">Protein first</div>
                    {proteinSource === 'bodyweight' && (
                        <div className="text-[9px] font-bold text-zinc-500 mt-1">target = 1.8 g × your logged body weight</div>
                    )}
                </div>
                <div className="space-y-2 text-xs font-semibold text-zinc-400">
                    <div className="flex justify-between items-center">
                        <span>Protein still to eat</span>
                        <span className={cn("font-extrabold", proteinRemaining === 0 ? "text-primary" : "text-white")}>
                            {Math.round(proteinRemaining)} g
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Energy</span>
                        <span className="text-white font-extrabold">{Math.round(totals.calories)} / {goals.calories} kcal</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Balance</span>
                        <span className={cn("font-extrabold", calorieBalance > 0 ? "text-primary" : "text-warning")}>
                            {calorieBalance > 0 ? `${calorieBalance} kcal under` : `${Math.abs(calorieBalance)} kcal over`}
                        </span>
                    </div>
                </div>
            </div>
            <div className="shrink-0 relative drop-shadow-[0_0_12px_rgba(167,139,250,0.18)]">
                <ProgressRing
                    size={120}
                    strokeWidth={11}
                    progress={proteinPct}
                    color="#a78bfa"
                    label={`${Math.round(proteinPct * 100)}%`}
                    sublabel="protein"
                />
            </div>
        </div>
    );
}
