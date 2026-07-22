import { useState } from "react";
import { useStore } from "../store/useStore";
import { useToast } from "../components/ui/toast";
import { nanoid } from "nanoid";
import type { WorkoutTemplate, ExerciseSet, TargetMuscle } from "../types";

export function useRoutineEditor() {
    const { templates, exercises, logs, addTemplate, updateTemplate, startWorkout, activeWorkout } = useStore();
    const toast = useToast();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");

    const [showPicker, setShowPicker] = useState(false);
    const [pickerSearch, setPickerSearch] = useState("");
    const [pickerMuscle, setPickerMuscle] = useState<TargetMuscle | "All">("All");
    const [showCustomCreator, setShowCustomCreator] = useState(false);

    const [draft, setDraft] = useState<WorkoutTemplate | null>(null);
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

    const [formCueOpen, setFormCueOpen] = useState<string | null>(null);
    const [expandedTempo, setExpandedTempo] = useState<string | null>(null);

    const getExerciseData = (id: string) => exercises.find(e => e.id === id);

    const getExerciseName = (id: string) =>
        exercises.find(e => e.id === id)?.name || id;

    const getExerciseMuscle = (id: string) =>
        exercises.find(e => e.id === id)?.target_muscle || "Other";

    const lastSession = (templateId: string) => {
        const sessions = logs.filter(l => l.template_id === templateId);
        if (!sessions.length) return null;
        return new Date(sessions[sessions.length - 1].timestamp).toLocaleDateString();
    };

    const totalVolume = (templateId: string) => {
        const sessions = logs.filter(l => l.template_id === templateId);
        return sessions.length;
    };

    const handleCreate = () => {
        if (!newTemplateName.trim()) return;
        const newTemplate: WorkoutTemplate = {
            id: nanoid(),
            name: newTemplateName.trim(),
            exercises: []
        };
        addTemplate(newTemplate);
        setNewTemplateName("");
        setIsCreating(false);
        setDraft({ ...newTemplate });
        setEditingId(newTemplate.id);
        toast.success(`"${newTemplate.name}" created — add exercises below!`);
    };

    const openEditor = (template: WorkoutTemplate) => {
        setDraft({ ...template, exercises: [...template.exercises] });
        setEditingId(template.id);
        setShowPicker(false);
    };

    const closeEditor = () => {
        setEditingId(null);
        setDraft(null);
        setShowPicker(false);
        setShowDiscardConfirm(false);
    };

    const requestCloseEditor = (originalTemplate: WorkoutTemplate | undefined) => {
        if (!draft || !originalTemplate) { closeEditor(); return; }
        const hasChanges = JSON.stringify(draft) !== JSON.stringify(originalTemplate);
        if (hasChanges) {
            setShowDiscardConfirm(true);
        } else {
            closeEditor();
        }
    };

    const saveDraft = () => {
        if (!draft) return;
        updateTemplate(draft);
        toast.success("Workout saved!");
        closeEditor();
    };

    const addExerciseToDraft = (exerciseId: string) => {
        if (!draft) return;
        if (draft.exercises.find(e => e.exercise_id === exerciseId)) {
            toast.info("Already in this workout.");
            return;
        }
        const newSet: ExerciseSet = {
            exercise_id: exerciseId,
            target_sets: 3,
            target_reps: 10,
            rest_seconds: 90
        };
        setDraft({ ...draft, exercises: [...draft.exercises, newSet] });
        setShowPicker(false);
        setPickerSearch("");
    };

    const removeExerciseFromDraft = (exerciseId: string) => {
        if (!draft) return;
        setDraft({
            ...draft,
            exercises: draft.exercises.filter(e => e.exercise_id !== exerciseId)
        });
    };

    const updateExerciseField = (
        exerciseId: string,
        field: keyof ExerciseSet,
        value: number
    ) => {
        if (!draft) return;
        setDraft({
            ...draft,
            exercises: draft.exercises.map(e =>
                e.exercise_id === exerciseId ? { ...e, [field]: value } : e
            )
        });
    };

    const moveExercise = (index: number, direction: "up" | "down") => {
        if (!draft) return;
        const arr = [...draft.exercises];
        const swapWith = direction === "up" ? index - 1 : index + 1;
        if (swapWith < 0 || swapWith >= arr.length) return;
        [arr[index], arr[swapWith]] = [arr[swapWith], arr[index]];
        setDraft({ ...draft, exercises: arr });
    };

    const allMuscles = ["All", ...Array.from(new Set(exercises.map(e => e.target_muscle)))] as (TargetMuscle | "All")[];
    const filteredExercises = exercises.filter(e => {
        const matchesMuscle = pickerMuscle === "All" || e.target_muscle === pickerMuscle;
        const matchesSearch = e.name.toLowerCase().includes(pickerSearch.toLowerCase());
        return matchesMuscle && matchesSearch;
    });

    return {
        templates,
        exercises,
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
    };
}
