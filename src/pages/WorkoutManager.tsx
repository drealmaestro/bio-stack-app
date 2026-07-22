import { useRoutineEditor } from "../hooks/useRoutineEditor";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { CreateRoutineCard } from "../components/workout/manager/CreateRoutineCard";
import { RoutineList } from "../components/workout/manager/RoutineList";
import { DiscardConfirmDialog } from "../components/workout/manager/DiscardConfirmDialog";
import { CustomExerciseCreator } from "../components/CustomExerciseCreator";

export function WorkoutManager() {
    const {
        templates,
        activeWorkout,
        editingId,
        isCreating,
        setIsCreating,
        newTemplateName,
        setNewTemplateName,
        showPicker,
        setShowPicker,
        pickerSearch,
        setPickerSearch,
        pickerMuscle,
        setPickerMuscle,
        showCustomCreator,
        setShowCustomCreator,
        draft,
        setDraft,
        showDiscardConfirm,
        setShowDiscardConfirm,
        formCueOpen,
        setFormCueOpen,
        expandedTempo,
        setExpandedTempo,
        getExerciseData,
        getExerciseName,
        getExerciseMuscle,
        lastSession,
        totalVolume,
        handleCreate,
        openEditor,
        closeEditor,
        requestCloseEditor,
        saveDraft,
        addExerciseToDraft,
        removeExerciseFromDraft,
        updateExerciseField,
        moveExercise,
        allMuscles,
        filteredExercises,
        startWorkout
    } = useRoutineEditor();

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
            {/* Top Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-white">My Plans</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">{templates.length} active routines</p>
                </div>
                {!isCreating && editingId === null && (
                    <Button onClick={() => setIsCreating(true)} size="sm" className="gap-2">
                        <Plus size={16} /> New Routine
                    </Button>
                )}
            </div>

            {/* Create Routine Form Card */}
            {isCreating && (
                <CreateRoutineCard
                    newTemplateName={newTemplateName}
                    onNameChange={setNewTemplateName}
                    onCreate={handleCreate}
                    onCancel={() => { setIsCreating(false); setNewTemplateName(""); }}
                />
            )}

            {/* Routine List and Editor */}
            <RoutineList
                templates={templates}
                editingId={editingId}
                isCreating={isCreating}
                draft={draft}
                activeWorkout={activeWorkout}
                onOpenCreate={() => setIsCreating(true)}
                onStartWorkout={startWorkout}
                onOpenEditor={openEditor}
                onRequestCloseEditor={requestCloseEditor}
                onUpdateDraft={setDraft}
                getExerciseData={getExerciseData}
                getExerciseName={getExerciseName}
                getExerciseMuscle={getExerciseMuscle}
                totalVolume={totalVolume}
                lastSession={lastSession}
                expandedTempo={expandedTempo}
                onToggleExpandedTempo={setExpandedTempo}
                formCueOpen={formCueOpen}
                onToggleFormCue={setFormCueOpen}
                onMoveExercise={moveExercise}
                onRemoveExercise={removeExerciseFromDraft}
                onUpdateField={updateExerciseField}
                showPicker={showPicker}
                onTogglePicker={() => setShowPicker(!showPicker)}
                pickerSearch={pickerSearch}
                onSearchChange={setPickerSearch}
                pickerMuscle={pickerMuscle}
                onMuscleChange={setPickerMuscle}
                allMuscles={allMuscles}
                filteredExercises={filteredExercises}
                onAddExerciseToDraft={addExerciseToDraft}
                onOpenCustomCreator={() => setShowCustomCreator(true)}
                onSaveDraft={saveDraft}
            />

            {/* Unsaved Changes Discard Confirmation Dialog */}
            <DiscardConfirmDialog
                open={showDiscardConfirm}
                onDiscard={closeEditor}
                onKeepEditing={() => setShowDiscardConfirm(false)}
            />

            {/* Custom Exercise Creator Modal */}
            {showCustomCreator && (
                <CustomExerciseCreator
                    onClose={() => setShowCustomCreator(false)}
                    onCreated={() => setPickerSearch("")}
                />
            )}
        </div>
    );
}
