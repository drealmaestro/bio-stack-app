import { Link } from "react-router-dom";
import { Card, CardContent } from "../../ui/card";
import { Dumbbell, Clock, CheckCircle2, Play, ChevronDown, Edit3 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { getMuscleIcon } from "../../../lib/muscleIcons";
import type { WorkoutTemplate, TargetMuscle, ActiveWorkoutState } from "../../../types";

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

interface RoutineCardProps {
    template: WorkoutTemplate;
    isOpen: boolean;
    sessionCount: number;
    lastSessionDate: string | null;
    muscleGroups: TargetMuscle[];
    activeWorkout: ActiveWorkoutState | null;
    onStartWorkout: (templateId: string) => void;
    onToggleEditor: () => void;
}

export function RoutineCard({
    template,
    isOpen,
    sessionCount,
    lastSessionDate,
    muscleGroups,
    activeWorkout,
    onStartWorkout,
    onToggleEditor
}: RoutineCardProps) {
    return (
        <Card className={`transition-all duration-200 ${isOpen
            ? "border-primary/50 bg-primary/5 rounded-b-none border-b-0"
            : "bg-secondary/30 border-white/5 hover:border-white/15"
            }`}>
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-xl text-white leading-tight truncate">
                                {template.name}
                            </h3>
                        </div>

                        {/* Coaching badges */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {template.focus_goal && (
                                <span className="text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md">
                                    {template.focus_goal}
                                </span>
                            )}
                            {template.difficulty && (
                                <span className="text-[10px] font-black uppercase tracking-wider bg-white/5 text-zinc-300 border border-white/10 px-2 py-0.5 rounded-md">
                                    {template.difficulty}
                                </span>
                            )}
                            {template.target_duration && (
                                <span className="text-[10px] font-bold bg-white/5 text-zinc-400 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <Clock size={10} /> {template.target_duration}m
                                </span>
                            )}
                        </div>

                        {template.description && (
                            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                                {template.description}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {muscleGroups.slice(0, 4).map(m => (
                                <span key={m} className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${MUSCLE_COLORS[m]}`}>
                                    {getMuscleIcon(m, 10)} {m}
                                </span>
                            ))}
                            {muscleGroups.length > 4 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-zinc-400">
                                    +{muscleGroups.length - 4}
                                </span>
                            )}
                        </div>

                        <div className="flex gap-3 mt-2.5 text-xs text-zinc-400 border-t border-white/[0.05] pt-2 font-bold">
                            <span className="flex items-center gap-1">
                                <Dumbbell size={12} className="text-primary" /> {template.exercises.length} exercises
                            </span>
                            <span className="flex items-center gap-1">
                                <CheckCircle2 size={12} /> {sessionCount} sessions
                            </span>
                            {lastSessionDate && (
                                <span className="flex items-center gap-1">
                                    <Clock size={12} /> Last: {lastSessionDate}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-2 shrink-0">
                        <Link
                            to="/active"
                            onClick={(e) => {
                                if (activeWorkout) { e.preventDefault(); return; }
                                onStartWorkout(template.id);
                            }}
                            className={cn(
                                "w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-transform shadow-md",
                                activeWorkout
                                    ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                    : "bg-primary text-black hover:scale-105 active:scale-95 shadow-primary/20"
                            )}
                            title={activeWorkout ? "Finish or cancel current session first" : "Start workout"}
                            aria-label={`Start ${template.name}`}
                        >
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                        </Link>
                        <button
                            onClick={onToggleEditor}
                            className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all cursor-pointer ${isOpen
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/5"
                                }`}
                            title="Edit exercises"
                            aria-label={`Edit ${template.name} exercises`}
                        >
                            {isOpen ? <ChevronDown size={20} /> : <Edit3 size={18} />}
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
