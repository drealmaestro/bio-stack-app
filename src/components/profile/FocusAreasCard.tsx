import { cn } from "../../lib/utils";

interface FocusAreasCardProps {
    goalOptions: string[];
    selectedGoals: string[];
    onToggleGoal: (goal: string) => void;
}

export function FocusAreasCard({ goalOptions, selectedGoals, onToggleGoal }: FocusAreasCardProps) {
    return (
        <div className="glass-card p-5 rounded-2xl space-y-3">
            <h3 className="text-base font-bold text-white">Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
                {goalOptions.map(goal => {
                    const isSelected = selectedGoals.includes(goal);
                    return (
                        <button
                            key={goal}
                            onClick={() => onToggleGoal(goal)}
                            className={cn(
                                "flex items-center gap-1.5 py-2 px-4 rounded-full text-sm font-semibold border transition-all duration-300",
                                isSelected
                                    ? "bg-primary/20 border-primary shadow-[0_0_15px_-3px_rgba(0,212,255,0.4)] text-primary scale-105"
                                    : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:bg-white/10"
                            )}
                        >
                            <div className={cn("transition-all duration-300 overflow-hidden flex items-center justify-center", isSelected ? "w-3 scale-100 opacity-100" : "w-0 scale-0 opacity-0")}>
                                {isSelected && "✓"}
                            </div>
                            <span>{goal}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
