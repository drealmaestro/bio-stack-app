import { Search, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "../../ui/button";
import { getMuscleIcon } from "../../../lib/muscleIcons";
import type { Exercise, TargetMuscle, WorkoutTemplate } from "../../../types";

const MUSCLE_COLORS: Record<TargetMuscle, string> = {
    Chest: "text-orange-400 bg-orange-400/10",
    Back: "text-blue-400 bg-blue-400/10",
    Legs: "text-green-400 bg-green-400/10",
    Shoulders: "text-purple-400 bg-purple-400/10",
    Biceps: "text-pink-400 bg-pink-400/10",
    Triceps: "text-yellow-400 bg-yellow-400/10",
    Core: "text-red-400 bg-red-400/10",
    Forearms: "text-zinc-400 bg-zinc-400/10",
    Other: "text-zinc-400 bg-zinc-400/10",
};

interface ExerciseSelectorModalProps {
    draft: WorkoutTemplate;
    pickerSearch: string;
    onSearchChange: (val: string) => void;
    pickerMuscle: TargetMuscle | "All";
    onMuscleChange: (muscle: TargetMuscle | "All") => void;
    allMuscles: (TargetMuscle | "All")[];
    filteredExercises: Exercise[];
    onAddExercise: (exerciseId: string) => void;
    onOpenCustomCreator: () => void;
}

export function ExerciseSelectorModal({
    draft,
    pickerSearch,
    onSearchChange,
    pickerMuscle,
    onMuscleChange,
    allMuscles,
    filteredExercises,
    onAddExercise,
    onOpenCustomCreator
}: ExerciseSelectorModalProps) {
    return (
        <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            {/* Search bar & Create button */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        autoFocus
                        value={pickerSearch}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder="Search exercises..."
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-primary/40 transition-colors"
                    />
                </div>
                <Button
                    onClick={onOpenCustomCreator}
                    size="sm"
                    className="shrink-0 h-[38px] px-3 font-bold bg-white/10 text-white hover:bg-white/20 border-0"
                >
                    <Plus size={14} className="mr-1" /> Create
                </Button>
            </div>

            {/* Muscle filter chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {allMuscles.map(m => (
                    <button
                        key={m}
                        onClick={() => onMuscleChange(m)}
                        className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full border transition-colors ${pickerMuscle === m
                            ? "bg-primary text-black border-primary"
                            : "border-white/10 text-zinc-400 hover:border-white/20"
                            }`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {/* Exercise results */}
            <div className="grid gap-1.5 max-h-56 overflow-y-auto pr-1">
                {filteredExercises.map(e => {
                    const alreadyAdded = draft.exercises.some(ex => ex.exercise_id === e.id);
                    return (
                        <button
                            key={e.id}
                            onClick={() => !alreadyAdded && onAddExercise(e.id)}
                            disabled={alreadyAdded}
                            className={`flex items-center justify-between p-3 rounded-xl text-left transition-all ${alreadyAdded
                                ? "bg-primary/5 border border-primary/20 opacity-60 cursor-not-allowed"
                                : "bg-white/3 border border-white/5 hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
                                }`}
                        >
                            <div>
                                <div className="text-sm font-bold text-white">{e.name}</div>
                                <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{e.instructions}</div>
                            </div>
                            <div className="flex items-center gap-2 ml-2 shrink-0">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${MUSCLE_COLORS[e.target_muscle]}`}>
                                    {getMuscleIcon(e.target_muscle, 9)} {e.target_muscle}
                                </span>
                                {alreadyAdded
                                    ? <CheckCircle2 size={16} className="text-primary" />
                                    : <Plus size={16} className="text-zinc-500" />
                                }
                            </div>
                        </button>
                    );
                })}
                {filteredExercises.length === 0 && (
                    <p className="text-center text-zinc-600 text-sm py-4">No exercises match.</p>
                )}
            </div>
        </div>
    );
}
