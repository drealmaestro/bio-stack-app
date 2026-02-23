import { useState } from "react";
import { useStore } from "../store/useStore";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../components/ui/toast";
import {
    Plus, ChevronDown, ChevronUp,
    X, Dumbbell, Clock, ArrowUpDown, Search,
    CheckCircle2, Edit3, Play
} from "lucide-react";
import { nanoid } from "nanoid";
import type { WorkoutTemplate, ExerciseSet } from "../types";
import type { TargetMuscle } from "../types";
import { Link } from "react-router-dom";

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

export function WorkoutManager() {
    const { templates, exercises, logs, addTemplate, updateTemplate, startWorkout } = useStore();
    const toast = useToast();

    // ─── List-level state ────────────────────────────────────────────────────
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");

    // ─── Exercise picker state ────────────────────────────────────────────────
    const [showPicker, setShowPicker] = useState(false);
    const [pickerSearch, setPickerSearch] = useState("");
    const [pickerMuscle, setPickerMuscle] = useState<TargetMuscle | "All">("All");

    // ─── Draft state (local copy while editing) ───────────────────────────────
    const [draft, setDraft] = useState<WorkoutTemplate | null>(null);

    // ─── Helpers ─────────────────────────────────────────────────────────────
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

    // ─── Template create ─────────────────────────────────────────────────────
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
        // Open immediately for editing
        setDraft({ ...newTemplate });
        setEditingId(newTemplate.id);
        toast.success(`"${newTemplate.name}" created — add exercises below!`);
    };

    // ─── Open / close editor ─────────────────────────────────────────────────
    const openEditor = (template: WorkoutTemplate) => {
        setDraft({ ...template, exercises: [...template.exercises] });
        setEditingId(template.id);
        setShowPicker(false);
    };

    const closeEditor = () => {
        setEditingId(null);
        setDraft(null);
        setShowPicker(false);
    };

    // ─── Save draft to store ─────────────────────────────────────────────────
    const saveDraft = () => {
        if (!draft) return;
        updateTemplate(draft);
        toast.success("Workout saved!");
        closeEditor();
    };

    // ─── Exercise set mutations ───────────────────────────────────────────────
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

    // ─── Filtered exercise picker ─────────────────────────────────────────────
    const allMuscles = ["All", ...Array.from(new Set(exercises.map(e => e.target_muscle)))] as (TargetMuscle | "All")[];
    const filteredExercises = exercises.filter(e => {
        const matchesMuscle = pickerMuscle === "All" || e.target_muscle === pickerMuscle;
        const matchesSearch = e.name.toLowerCase().includes(pickerSearch.toLowerCase());
        return matchesMuscle && matchesSearch;
    });

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

            {/* Header */}
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

            {/* Create form */}
            {isCreating && (
                <Card className="border-primary/40 bg-primary/5 animate-in zoom-in-95 duration-200">
                    <CardContent className="p-4 space-y-3">
                        <p className="text-xs font-bold text-primary uppercase tracking-widest">New Routine</p>
                        <Input
                            autoFocus
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                            placeholder="e.g. Arm Blaster, Leg Day Destroyer..."
                            className="bg-black/50"
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleCreate} className="flex-1">Create & Edit</Button>
                            <Button variant="outline" onClick={() => { setIsCreating(false); setNewTemplateName(""); }}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Template list */}
            <div className="grid gap-3">
                {templates.map(template => {
                    const isOpen = editingId === template.id;
                    const sessionCount = totalVolume(template.id);
                    const last = lastSession(template.id);
                    const muscleGroups = [...new Set(
                        template.exercises.map(e => getExerciseMuscle(e.exercise_id))
                    )];

                    return (
                        <div key={template.id}>
                            {/* Template Card */}
                            <Card className={`transition-all duration-200 ${isOpen
                                ? "border-primary/50 bg-primary/5 rounded-b-none border-b-0"
                                : "bg-secondary/30 border-white/5 hover:border-white/15"
                                }`}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-lg text-white leading-tight truncate">
                                                {template.name}
                                            </h3>
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                {muscleGroups.slice(0, 4).map(m => (
                                                    <span key={m} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${MUSCLE_COLORS[m as TargetMuscle]}`}>
                                                        {m}
                                                    </span>
                                                ))}
                                                {muscleGroups.length > 4 && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-zinc-500">
                                                        +{muscleGroups.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-3 mt-2 text-[11px] text-zinc-500">
                                                <span className="flex items-center gap-1">
                                                    <Dumbbell size={10} /> {template.exercises.length} exercises
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 size={10} /> {sessionCount} sessions
                                                </span>
                                                {last && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={10} /> Last: {last}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 ml-2 shrink-0">
                                            <Link
                                                to="/active"
                                                onClick={() => startWorkout(template.id)}
                                                className="w-9 h-9 rounded-xl bg-primary text-black flex items-center justify-center hover:scale-105 transition-transform"
                                                title="Start workout"
                                            >
                                                <Play size={16} fill="currentColor" />
                                            </Link>
                                            <button
                                                onClick={() => isOpen ? closeEditor() : openEditor(template)}
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isOpen
                                                    ? "bg-primary/20 text-primary"
                                                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                                                    }`}
                                                title="Edit exercises"
                                            >
                                                {isOpen ? <ChevronDown size={18} /> : <Edit3 size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Inline Exercise Editor */}
                            {isOpen && draft && (
                                <div className="border border-primary/30 border-t-0 rounded-b-2xl bg-zinc-950 animate-in slide-in-from-top-2 duration-200">

                                    {/* Exercise list */}
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
                                            const muscle = getExerciseMuscle(ex.exercise_id);
                                            return (
                                                <div key={ex.exercise_id}
                                                    className="bg-white/3 border border-white/5 rounded-xl p-3 space-y-2">
                                                    {/* Exercise header */}
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${MUSCLE_COLORS[muscle as TargetMuscle]}`}>
                                                                {muscle}
                                                            </span>
                                                            <span className="font-bold text-sm text-white truncate">
                                                                {getExerciseName(ex.exercise_id)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button
                                                                onClick={() => moveExercise(idx, "up")}
                                                                disabled={idx === 0}
                                                                className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-white disabled:opacity-20 transition-colors"
                                                            ><ChevronUp size={14} /></button>
                                                            <button
                                                                onClick={() => moveExercise(idx, "down")}
                                                                disabled={idx === draft.exercises.length - 1}
                                                                className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-white disabled:opacity-20 transition-colors"
                                                            ><ChevronDown size={14} /></button>
                                                            <button
                                                                onClick={() => removeExerciseFromDraft(ex.exercise_id)}
                                                                className="w-6 h-6 rounded flex items-center justify-center text-zinc-700 hover:text-red-500 transition-colors"
                                                            ><X size={14} /></button>
                                                        </div>
                                                    </div>

                                                    {/* Sets / Reps / Rest row */}
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {(["target_sets", "target_reps", "rest_seconds"] as const).map((field) => {
                                                            const labels = { target_sets: "Sets", target_reps: "Reps", rest_seconds: "Rest (s)" };
                                                            return (
                                                                <div key={field} className="text-center">
                                                                    <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">{labels[field]}</div>
                                                                    <input
                                                                        type="number"
                                                                        value={ex[field]}
                                                                        min={field === "rest_seconds" ? 0 : 1}
                                                                        max={field === "target_sets" ? 10 : field === "target_reps" ? 50 : 300}
                                                                        onChange={(e) => updateExerciseField(ex.exercise_id, field, Number(e.target.value))}
                                                                        className="w-full bg-black/60 border border-white/10 rounded-lg text-center text-white font-bold text-sm py-1.5 focus:outline-none focus:border-primary/50 transition-colors"
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Add Exercise Button */}
                                    <div className="px-4 pb-3">
                                        <button
                                            onClick={() => setShowPicker(!showPicker)}
                                            className="w-full py-3 border border-dashed border-primary/30 rounded-xl text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                                        >
                                            <Plus size={16} />
                                            {showPicker ? "Close Catalog" : "Add Exercise"}
                                        </button>
                                    </div>

                                    {/* Exercise Picker */}
                                    {showPicker && (
                                        <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
                                            {/* Search */}
                                            <div className="relative">
                                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                                <input
                                                    autoFocus
                                                    value={pickerSearch}
                                                    onChange={e => setPickerSearch(e.target.value)}
                                                    placeholder="Search exercises..."
                                                    className="w-full bg-black/60 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-primary/40 transition-colors"
                                                />
                                            </div>

                                            {/* Muscle filter chips */}
                                            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                                                {allMuscles.map(m => (
                                                    <button
                                                        key={m}
                                                        onClick={() => setPickerMuscle(m)}
                                                        className={`shrink-0 text-[10px] font-bold px-3 py-1 rounded-full border transition-colors ${pickerMuscle === m
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
                                                            onClick={() => !alreadyAdded && addExerciseToDraft(e.id)}
                                                            disabled={alreadyAdded}
                                                            className={`flex items-center justify-between p-3 rounded-xl text-left transition-all ${alreadyAdded
                                                                ? "bg-primary/5 border border-primary/20 opacity-60 cursor-not-allowed"
                                                                : "bg-white/3 border border-white/5 hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
                                                                }`}
                                                        >
                                                            <div>
                                                                <div className="text-sm font-bold text-white">{e.name}</div>
                                                                <div className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{e.instructions}</div>
                                                            </div>
                                                            <div className="flex items-center gap-2 ml-2 shrink-0">
                                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${MUSCLE_COLORS[e.target_muscle]}`}>
                                                                    {e.target_muscle}
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
                                    )}

                                    {/* Save / Cancel */}
                                    <div className="flex gap-2 p-4 pt-0">
                                        <Button onClick={saveDraft} className="flex-1">
                                            <CheckCircle2 size={16} className="mr-2" /> Save Changes
                                        </Button>
                                        <Button variant="outline" onClick={closeEditor}>
                                            Discard
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
