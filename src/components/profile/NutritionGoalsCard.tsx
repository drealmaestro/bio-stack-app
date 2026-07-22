import { Target } from "lucide-react";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";

interface NutritionGoalsCardProps {
    nutritionGoals: {
        calories: number;
        protein_g: number;
        carbs_g: number;
        fat_g: number;
    };
    onUpdateGoal: (key: "calories" | "protein_g" | "carbs_g" | "fat_g", value: number) => void;
}

export function NutritionGoalsCard({ nutritionGoals, onUpdateGoal }: NutritionGoalsCardProps) {
    return (
        <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-1">
                <Target size={16} className="text-primary" />
                <h3 className="text-base font-bold text-white">Nutrition Goals</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {([
                    { key: "calories", label: "Calories", unit: "kcal", color: "text-orange-400" },
                    { key: "protein_g", label: "Protein", unit: "g", color: "text-violet-400" },
                    { key: "carbs_g", label: "Carbs", unit: "g", color: "text-cyan-400" },
                    { key: "fat_g", label: "Fat", unit: "g", color: "text-yellow-400" },
                ] as const).map(({ key, label, unit, color }) => (
                    <div key={key} className="space-y-1.5">
                        <label className={cn("text-xs font-bold uppercase tracking-widest", color)}>{label} ({unit})</label>
                        <Input
                            type="number"
                            value={nutritionGoals[key]}
                            onChange={e => onUpdateGoal(key, parseInt(e.target.value) || 0)}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
