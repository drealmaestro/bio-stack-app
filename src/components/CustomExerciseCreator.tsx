import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/toast";
import { X, Dumbbell } from "lucide-react";
import { nanoid } from "nanoid";
import { useStore } from "../store/useStore";
import type { TargetMuscle, Exercise } from "../types";

const MUSCLE_OPTIONS: TargetMuscle[] = [
    "Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Core", "Forearms", "Other"
];

interface CustomExerciseCreatorProps {
    onClose: () => void;
    onCreated?: (exerciseId: string) => void;
}

export function CustomExerciseCreator({ onClose, onCreated }: CustomExerciseCreatorProps) {
    const { addExercise } = useStore();
    const toast = useToast();

    const [name, setName] = useState("");
    const [muscle, setMuscle] = useState<TargetMuscle>("Other");
    const [instructions, setInstructions] = useState("");

    const handleSave = () => {
        if (!name.trim()) {
            toast.error("Exercise name is required.");
            return;
        }

        const newExercise: Exercise = {
            id: nanoid(),
            name: name.trim(),
            target_muscle: muscle,
            instructions: instructions.trim() || "Custom exercise.",
        };

        addExercise(newExercise);
        toast.success(`Created exercise: ${newExercise.name}`);
        if (onCreated) onCreated(newExercise.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-sm flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-white/5 bg-white/5">
                    <h3 className="font-black text-white flex items-center gap-2">
                        <Dumbbell size={18} className="text-primary" /> Create Exercise
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-white/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4 overflow-y-auto">
                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Exercise Name</label>
                        <Input
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Reverse Grip Bench Press"
                            className="bg-black/50"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Target Muscle</label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            {MUSCLE_OPTIONS.map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMuscle(m)}
                                    className={`text-[11px] font-bold py-2 rounded-xl transition-colors border ${
                                        muscle === m 
                                        ? "bg-primary text-black border-primary" 
                                        : "bg-white/5 border-white/5 text-zinc-400 hover:border-white/20"
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Instructions / Notes (Optional)</label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Add form cues or specific machine settings..."
                            className="w-full h-24 bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-black/40 flex gap-2">
                    <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button onClick={handleSave} className="flex-1">Save Exercise</Button>
                </div>
            </div>
        </div>
    );
}
