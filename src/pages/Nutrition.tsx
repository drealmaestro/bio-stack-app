import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getEffectiveNutritionGoals } from '../lib/nutritionGoals';
import { calculateDailyStreak } from '../utils/nutritionMath';
import type { NutritionEntry } from '../types';
import { ProteinHeroCard } from '../components/nutrition/ProteinHeroCard';
import { NutrientTargetCard } from '../components/nutrition/NutrientTargetCard';
import { FoodDiarySection } from '../components/nutrition/FoodDiarySection';
import { AddFoodModal } from '../components/nutrition/AddFoodModal';
import { Zap } from 'lucide-react';

function todayLabel() {
    return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function Nutrition() {
    const { user, nutritionLogs, addNutritionEntry, deleteNutritionEntry } = useStore();
    const { goals, proteinSource } = getEffectiveNutritionGoals(user);
    const [showAddModal, setShowAddModal] = useState(false);

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

    const streak = useMemo(() =>
        calculateDailyStreak(nutritionLogs, goals.calories, today),
        [nutritionLogs, goals.calories, today]
    );

    const handleAddEntry = (entry: Omit<NutritionEntry, 'id' | 'logged_at'>) => {
        addNutritionEntry(today, entry);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex justify-between items-end px-1">
                <div>
                    <span className="text-xs font-black text-primary uppercase tracking-widest block mb-0.5">Nutrition</span>
                    <h2 className="text-2xl font-extrabold text-white">{todayLabel()}</h2>
                </div>
                {streak > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-amber-400/10 border border-amber-400/20 text-amber-400">
                        <Zap size={14} className="fill-amber-400" />
                        <span>{streak} Day Streak</span>
                    </div>
                )}
            </div>

            <ProteinHeroCard
                totals={totals}
                goals={goals}
                proteinSource={proteinSource}
            />

            <NutrientTargetCard
                totals={totals}
                goals={goals}
                streak={streak}
            />

            <FoodDiarySection
                todayLog={todayLog}
                today={today}
                onOpenAddModal={() => setShowAddModal(true)}
                onDeleteEntry={deleteNutritionEntry}
                onAddEntry={handleAddEntry}
            />

            <AddFoodModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAddEntry={handleAddEntry}
            />
        </div>
    );
}
