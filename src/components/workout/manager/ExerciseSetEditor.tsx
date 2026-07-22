import { ArrowUpDown, Dumbbell, ChevronUp, ChevronDown, X, Info, AlertTriangle } from "lucide-react";
import { cn, getTempoBreakdown } from "../../../lib/utils";
import { getMuscleIcon } from "../../../lib/muscleIcons";
import type { WorkoutTemplate, Exercise, TargetMuscle, ExerciseSet } from "../../../types";

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

interface ExerciseSetEditorProps {
    draft: WorkoutTemplate;
    getExerciseData: (id: string) => Exercise | undefined;
    getExerciseName: (id: string) => string;
    getExerciseMuscle: (id: string) => TargetMuscle;
    expandedTempo: string | null;
    onToggleExpandedTempo: (id: string | null) => void;
    formCueOpen: string | null;
    onToggleFormCue: (id: string | null) => void;
    onMoveExercise: (index: number, direction: "up" | "down") => void;
    onRemoveExercise: (id: string) => void;
    onUpdateField: (id: string, field: keyof ExerciseSet, val: number) => void;
}

export function ExerciseSetEditor({
    draft,
    getExerciseData,
    getExerciseName,
    getExerciseMuscle,
    expandedTempo,
    onToggleExpandedTempo,
    formCueOpen,
    onToggleFormCue,
    onMoveExercise,
    onRemoveExercise,
    onUpdateField
}: ExerciseSetEditorProps) {
    return (
        <div className="p-4 space-y-2">
            <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <ArrowUpDown size={12} /> Exercises
                </p>
                <span className="text-xs text-zinc-600">{draft.exercises.length} total</span>
            </div>

            {draft.exercises.length === 0 && (
                <div className="text-center py-8 text-zinc-600 text-sm border border-dashed border-zinc-800 rounded-xl">
                    <Dumbbell size={24} className="mx-auto mb-2 text-zinc-800" />
                    No exercises yet. Add from the catalog below.
                </div>
            )}

            {draft.exercises.map((ex, idx) => {
                const exData = getExerciseData(ex.exercise_id);
                const muscle = getExerciseMuscle(ex.exercise_id);
                const intensity = exData?.intensity_level;

                return (
                    <div key={ex.exercise_id} className="bg-white/3 border border-white/5 rounded-xl p-3 space-y-2">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${MUSCLE_COLORS[muscle]}`}>
                                    {getMuscleIcon(muscle, 9)} {muscle}
                                </span>
                                {intensity && (
                                    <span className={cn(
                                        "text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0",
                                        intensity === 'Heavy' ? "bg-red-500/10 text-red-400 border border-red-500/15" :
                                        intensity === 'Moderate' ? "bg-blue-500/10 text-blue-400 border border-blue-500/15" :
                                        "bg-green-500/10 text-green-400 border border-green-500/15"
                                    )}>
                                        {intensity}
                                    </span>
                                )}
                                <span className="font-bold text-sm text-white truncate">
                                    {getExerciseName(ex.exercise_id)}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() => onMoveExercise(idx, "up")}
                                    disabled={idx === 0}
                                    aria-label={`Move ${getExerciseName(ex.exercise_id)} up`}
                                    className="w-11 h-11 rounded flex items-center justify-center text-zinc-600 hover:text-white disabled:opacity-20 transition-colors"
                                ><ChevronUp size={14} /></button>
                                <button
                                    onClick={() => onMoveExercise(idx, "down")}
                                    disabled={idx === draft.exercises.length - 1}
                                    aria-label={`Move ${getExerciseName(ex.exercise_id)} down`}
                                    className="w-11 h-11 rounded flex items-center justify-center text-zinc-600 hover:text-white disabled:opacity-20 transition-colors"
                                ><ChevronDown size={14} /></button>
                                <button
                                    onClick={() => onRemoveExercise(ex.exercise_id)}
                                    aria-label={`Remove ${getExerciseName(ex.exercise_id)}`}
                                    className="w-11 h-11 rounded flex items-center justify-center text-zinc-700 hover:text-red-500 transition-colors"
                                ><X size={14} /></button>
                            </div>
                        </div>

                        {/* Tempo / Tips */}
                        {(exData?.tempo || exData?.coach_tips) && (
                            <div className="bg-black/40 border border-white/5 rounded-lg p-2.5 space-y-1.5">
                                {exData.tempo && (() => {
                                    const isTempoExpanded = expandedTempo === ex.exercise_id;
                                    const breakdown = getTempoBreakdown(exData.tempo, muscle);
                                    return (
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => onToggleExpandedTempo(isTempoExpanded ? null : ex.exercise_id)}
                                                className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                                            >
                                                <span className="font-bold text-zinc-400 uppercase tracking-wider">Tempo:</span>
                                                <span className="font-mono underline decoration-dashed decoration-zinc-600 underline-offset-2">{exData.tempo}</span>
                                                <span className="text-[8px] text-primary bg-primary/10 px-1 py-0.2 rounded font-black scale-90 ml-0.5">Guide</span>
                                            </button>
                                            {isTempoExpanded && breakdown && (
                                                <div className="mt-1.5 p-2 bg-black/60 border border-white/5 rounded-lg space-y-0.5 text-[9px] text-zinc-400 animate-in slide-in-from-top-1 duration-150">
                                                    {breakdown.map((b, i) => (
                                                        <div key={i} className="flex justify-between items-center py-0.5 border-b border-white/5 last:border-0 last:pb-0">
                                                            <span className="font-semibold text-zinc-500">{b.label}</span>
                                                            <span className="text-right text-zinc-300">
                                                                <span className="font-mono font-bold text-primary mr-1">{b.sec}s</span>
                                                                <span className="text-zinc-500">({b.desc})</span>
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                                {exData.coach_tips && (
                                    <div className="text-zinc-400 leading-relaxed text-[11px]">
                                        <span className="text-primary font-bold">💡 Tip:</span> {exData.coach_tips}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Sets / Reps / Rest inputs */}
                        <div className="grid grid-cols-3 gap-2">
                            {(["target_sets", "target_reps", "rest_seconds"] as const).map((field) => {
                                const labels = { target_sets: "Sets", target_reps: "Reps", rest_seconds: "Rest (s)" };
                                return (
                                    <div key={field} className="text-center">
                                        <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">{labels[field]}</div>
                                        <input
                                            type="number"
                                            aria-label={`${getExerciseName(ex.exercise_id)} ${labels[field]}`}
                                            value={ex[field]}
                                            min={field === "rest_seconds" ? 0 : 1}
                                            max={field === "target_sets" ? 10 : field === "target_reps" ? 50 : 300}
                                            onChange={(e) => onUpdateField(ex.exercise_id, field, Number(e.target.value))}
                                            className="w-full bg-black/60 border border-white/10 rounded-lg text-center text-white font-bold text-sm py-1.5 focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Form Guide */}
                        {(() => {
                            const isOpen = formCueOpen === ex.exercise_id;
                            if (!exData?.form_cues?.length) return null;
                            return (
                                <div>
                                    <button
                                        onClick={() => onToggleFormCue(isOpen ? null : ex.exercise_id)}
                                        className="flex items-center gap-1.5 text-xs font-bold text-primary/70 hover:text-primary transition-colors mt-1"
                                    >
                                        <Info size={11} />
                                        {isOpen ? "Hide Form Guide" : "View Form Guide"}
                                    </button>
                                    {isOpen && (
                                        <div className="mt-2 space-y-2 animate-in slide-in-from-top-1 duration-150">
                                            <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 space-y-1.5">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Form Cues</p>
                                                {exData.form_cues.map((cue, i) => (
                                                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                                                        <span className="text-primary mt-0.5 shrink-0">▸</span>{cue}
                                                    </div>
                                                ))}
                                            </div>
                                            {exData.common_mistakes && (
                                                <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-3 space-y-1.5">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-orange-400 mb-1 flex items-center gap-1"><AlertTriangle size={9} /> Common Mistakes</p>
                                                    {exData.common_mistakes.map((m, i) => (
                                                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                                                            <span className="text-orange-400 mt-0.5 shrink-0">✕</span>{m}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                );
            })}
        </div>
    );
}
