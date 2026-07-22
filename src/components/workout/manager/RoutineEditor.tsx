import { Plus, CheckCircle2 } from "lucide-react";
import { Button } from "../../ui/button";
import { RoutineCoachingForm } from "./RoutineCoachingForm";
import { ExerciseSetEditor } from "./ExerciseSetEditor";
import { ExerciseSelectorModal } from "./ExerciseSelectorModal";
import type { WorkoutTemplate, Exercise, TargetMuscle, ExerciseSet } from "../../../types";

interface RoutineEditorProps {
    draft: WorkoutTemplate;
    originalTemplate: WorkoutTemplate;
    onUpdateDraft: (updated: WorkoutTemplate) => void;
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
    showPicker: boolean;
    onTogglePicker: () => void;
    pickerSearch: string;
    onSearchChange: (val: string) => void;
    pickerMuscle: TargetMuscle | "All";
    onMuscleChange: (muscle: TargetMuscle | "All") => void;
    allMuscles: (TargetMuscle | "All")[];
    filteredExercises: Exercise[];
    onAddExerciseToDraft: (id: string) => void;
    onOpenCustomCreator: () => void;
    onSaveDraft: () => void;
    onRequestCloseEditor: (orig: WorkoutTemplate) => void;
}

export function RoutineEditor({
    draft,
    originalTemplate,
    onUpdateDraft,
    getExerciseData,
    getExerciseName,
    getExerciseMuscle,
    expandedTempo,
    onToggleExpandedTempo,
    formCueOpen,
    onToggleFormCue,
    onMoveExercise,
    onRemoveExercise,
    onUpdateField,
    showPicker,
    onTogglePicker,
    pickerSearch,
    onSearchChange,
    pickerMuscle,
    onMuscleChange,
    allMuscles,
    filteredExercises,
    onAddExerciseToDraft,
    onOpenCustomCreator,
    onSaveDraft,
    onRequestCloseEditor
}: RoutineEditorProps) {
    return (
        <div className="border border-primary/30 border-t-0 rounded-b-2xl bg-zinc-950 animate-in slide-in-from-top-2 duration-200">
            {/* Coaching Form */}
            <RoutineCoachingForm draft={draft} onUpdateDraft={onUpdateDraft} />

            {/* Coach Strategy Banner if coach notes exist */}
            {draft.coach_notes && (
                <div className="mx-4 mt-4 p-3 bg-primary/5 border border-primary/10 rounded-2xl">
                    <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-0.5 flex items-center gap-1">
                        💡 Coach's Strategy
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-medium">{draft.coach_notes}</p>
                </div>
            )}

            {/* Exercise Set Editor */}
            <ExerciseSetEditor
                draft={draft}
                getExerciseData={getExerciseData}
                getExerciseName={getExerciseName}
                getExerciseMuscle={getExerciseMuscle}
                expandedTempo={expandedTempo}
                onToggleExpandedTempo={onToggleExpandedTempo}
                formCueOpen={formCueOpen}
                onToggleFormCue={onToggleFormCue}
                onMoveExercise={onMoveExercise}
                onRemoveExercise={onRemoveExercise}
                onUpdateField={onUpdateField}
            />

            {/* Add Exercise Trigger Button */}
            <div className="px-4 pb-3">
                <button
                    onClick={onTogglePicker}
                    className="w-full py-3 border border-dashed border-primary/30 rounded-xl text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                >
                    <Plus size={16} />
                    {showPicker ? "Close Catalog" : "Add Exercise"}
                </button>
            </div>

            {/* Exercise Catalog Modal */}
            {showPicker && (
                <ExerciseSelectorModal
                    draft={draft}
                    pickerSearch={pickerSearch}
                    onSearchChange={onSearchChange}
                    pickerMuscle={pickerMuscle}
                    onMuscleChange={onMuscleChange}
                    allMuscles={allMuscles}
                    filteredExercises={filteredExercises}
                    onAddExercise={onAddExerciseToDraft}
                    onOpenCustomCreator={onOpenCustomCreator}
                />
            )}

            {/* Save / Discard Actions */}
            <div className="flex gap-2 p-4 pt-0">
                <Button onClick={onSaveDraft} className="flex-1">
                    <CheckCircle2 size={16} className="mr-2" /> Save Changes
                </Button>
                <Button variant="outline" onClick={() => onRequestCloseEditor(originalTemplate)}>
                    Discard
                </Button>
            </div>
        </div>
    );
}
