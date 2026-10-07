import { Link } from "react-router-dom";
import { Dumbbell, Clock, CheckCircle2, Play, ChevronDown, Edit3 } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { WorkoutTemplate, TargetMuscle, ActiveWorkoutState } from "../../../types";
import { RoutineMediaDownloadButton } from "../media/RoutineMediaDownloadButton";

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
        <div className={cn(
            "stitch-card-1 p-4 transition-all duration-200",
            isOpen ? "border-[#ccff00] bg-[#1a1e26] rounded-b-none" : "hover:border-[#343b4a]"
        )}>
            <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                        <h3 className="font-display font-black text-xl text-white uppercase tracking-tight truncate">
                            {template.name}
                        </h3>
                    </div>

                    {/* Coaching Badges */}
                    <div className="flex flex-wrap gap-1.5">
                        {template.focus_goal && (
                            <span className="stitch-badge-target font-mono">
                                {template.focus_goal}
                            </span>
                        )}
                        {template.difficulty && (
                            <span className="stitch-badge-neutral font-mono">
                                {template.difficulty}
                            </span>
                        )}
                        {template.target_duration && (
                            <span className="stitch-badge-neutral flex items-center gap-1 font-mono">
                                <Clock size={10} /> {template.target_duration}m
                            </span>
                        )}
                    </div>

                    {template.description && (
                        <p className="text-xs text-[#8e95a5] font-sans leading-relaxed line-clamp-2">
                            {template.description}
                        </p>
                    )}

                    {/* Target Muscle Chips */}
                    <div className="flex flex-wrap gap-1 pt-1">
                        {muscleGroups.slice(0, 4).map(m => (
                            <span key={m} className="stitch-badge-target text-[9px]">
                                {m}
                            </span>
                        ))}
                        {muscleGroups.length > 4 && (
                            <span className="stitch-badge-neutral text-[9px]">
                                +{muscleGroups.length - 4}
                            </span>
                        )}
                    </div>

                    {/* Telemetry Row */}
                    <div className="flex gap-4 pt-2 text-xs text-[#8e95a5] border-t border-[#262b36] font-mono">
                        <span className="flex items-center gap-1">
                            <Dumbbell size={12} className="text-[#ccff00]" /> {template.exercises.length} EXERCISES
                        </span>
                        <span className="flex items-center gap-1">
                            <CheckCircle2 size={12} /> {sessionCount} SESSIONS
                        </span>
                        {lastSessionDate && (
                            <span className="flex items-center gap-1 text-[11px]">
                                LAST: {lastSessionDate}
                            </span>
                        )}
                    </div>

                    <div className="pt-2 border-t border-[#262b36]/60">
                        <RoutineMediaDownloadButton exerciseIds={template.exercises.map(e => e.exercise_id)} />
                    </div>
                </div>

                {/* Right Action Steppers / Buttons */}
                <div className="flex flex-col gap-2 shrink-0">
                    <Link
                        to="/active"
                        onClick={(e) => {
                            if (activeWorkout) { e.preventDefault(); return; }
                            onStartWorkout(template.id);
                        }}
                        className={cn(
                            "w-12 h-12 rounded flex items-center justify-center transition-all select-none",
                            activeWorkout
                                ? "bg-[#1a1e26] text-[#8e95a5]/40 border border-[#262b36] cursor-not-allowed"
                                : "stitch-btn-primary shadow-[0_0_15px_rgba(204,255,0,0.25)]"
                        )}
                        title={activeWorkout ? "Active session in progress" : "Start workout"}
                        aria-label={`Start ${template.name}`}
                    >
                        <Play size={20} fill="#0d0f12" />
                    </Link>

                    <button
                        onClick={onToggleEditor}
                        className={cn(
                            "w-12 h-12 rounded flex items-center justify-center transition-all stitch-btn-ghost",
                            isOpen && "border-[#ccff00] text-[#ccff00]"
                        )}
                        title="Edit routine"
                        aria-label={`Edit ${template.name} exercises`}
                    >
                        {isOpen ? <ChevronDown size={20} /> : <Edit3 size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
