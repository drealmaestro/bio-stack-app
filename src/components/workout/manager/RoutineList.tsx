import { Dumbbell, Plus } from "lucide-react";
import { Button } from "../../ui/button";
import { RoutineCard } from "./RoutineCard";
import { RoutineEditor } from "./RoutineEditor";
import type { WorkoutTemplate, Exercise, TargetMuscle, ExerciseSet, ActiveWorkoutState } from "../../../types";

interface RoutineListProps {
    templates: WorkoutTemplate[];
    editingId: string | null;
    isCreating: boolean;
    draft: WorkoutTemplate | null;
    activeWorkout: ActiveWorkoutState | null;
    onOpenCreate: () => void;
    onStartWorkout: (templateId: string) => void;
    onOpenEditor: (template: WorkoutTemplate) => void;
    onRequestCloseEditor: (orig: WorkoutTemplate) => void;
    onUpdateDraft: (updated: WorkoutTemplate) => void;
    getExerciseData: (id: string) => Exercise | undefined;
    getExerciseName: (id: string) => string;
    getExerciseMuscle: (id: string) => TargetMuscle;
    totalVolume: (templateId: string) => number;
    lastSession: (templateId: string) => string | null;
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
    onMuscleChange: (m: TargetMuscle | "All") => void;
    allMuscles: (TargetMuscle | "All")[];
    filteredExercises: Exercise[];
    onAddExerciseToDraft: (id: string) => void;
    onOpenCustomCreator: () => void;
    onSaveDraft: () => void;
}

export function RoutineList({
    templates,
    editingId,
    isCreating,
    draft,
    activeWorkout,
    onOpenCreate,
    onStartWorkout,
    onOpenEditor,
    onRequestCloseEditor,
    onUpdateDraft,
    getExerciseData,
    getExerciseName,
    getExerciseMuscle,
    totalVolume,
    lastSession,
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
    onSaveDraft
}: RoutineListProps) {
    return (
        <div className="grid gap-3">
            {templates.length === 0 && !isCreating && (
                <div className="glass-card p-8 rounded-2xl text-center border border-dashed border-white/10">
                    <Dumbbell size={32} className="mx-auto mb-3 text-zinc-700" />
                    <p className="text-sm text-zinc-400 mb-4">No routines yet. Create your first plan.</p>
                    <Button onClick={onOpenCreate} className="bg-primary text-black font-black">
                        <Plus size={16} className="mr-2" /> New Routine
                    </Button>
                </div>
            )}
            {templates.map(template => {
                const isOpen = editingId === template.id;
                const sessionCount = totalVolume(template.id);
                const last = lastSession(template.id);
                const muscleGroups = [...new Set(
                    template.exercises.map(e => getExerciseMuscle(e.exercise_id))
                )];

                return (
                    <div key={template.id}>
                        <RoutineCard
                            template={template}
                            isOpen={isOpen}
                            sessionCount={sessionCount}
                            lastSessionDate={last}
                            muscleGroups={muscleGroups}
                            activeWorkout={activeWorkout}
                            onStartWorkout={onStartWorkout}
                            onToggleEditor={() => isOpen ? onRequestCloseEditor(template) : onOpenEditor(template)}
                        />

                        {isOpen && draft && (
                            <RoutineEditor
                                draft={draft}
                                originalTemplate={template}
                                onUpdateDraft={onUpdateDraft}
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
                                showPicker={showPicker}
                                onTogglePicker={onTogglePicker}
                                pickerSearch={pickerSearch}
                                onSearchChange={onSearchChange}
                                pickerMuscle={pickerMuscle}
                                onMuscleChange={onMuscleChange}
                                allMuscles={allMuscles}
                                filteredExercises={filteredExercises}
                                onAddExerciseToDraft={onAddExerciseToDraft}
                                onOpenCustomCreator={onOpenCustomCreator}
                                onSaveDraft={onSaveDraft}
                                onRequestCloseEditor={onRequestCloseEditor}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
