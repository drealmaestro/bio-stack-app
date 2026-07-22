import { Button } from "../../ui/button";
import { Play } from "lucide-react";
import type { WorkoutTemplate } from "../../../types";

interface TemplateSelectorProps {
    templates: WorkoutTemplate[];
    onStartWorkout: (templateId: string) => void;
}

export function TemplateSelector({ templates, onStartWorkout }: TemplateSelectorProps) {
    return (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
            <div className="text-center py-8">
                <div className="w-24 h-24 bg-linear-to-br from-primary/20 to-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse ring-1 ring-primary/30">
                    <Play size={48} className="text-primary ml-1" fill="currentColor" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight mb-2">Ready to Train?</h2>
                <p className="text-zinc-400 font-medium">Select a routine to start tracking.</p>
            </div>

            <div className="space-y-3">
                {templates.length === 0 ? (
                    <div className="glass-card p-6 rounded-2xl text-center border border-dashed border-white/10">
                        <p className="text-sm text-zinc-400 mb-4">No routines available yet.</p>
                        <Button className="bg-primary text-black font-black" onClick={() => window.location.assign('/workouts')}>
                            Create Routine
                        </Button>
                    </div>
                ) : templates.map(template => (
                    <button
                        key={template.id}
                        onClick={() => onStartWorkout(template.id)}
                        className="w-full text-left glass-card p-4 rounded-xl flex justify-between items-center cursor-pointer group active:scale-95 transition-all"
                    >
                        <div>
                            <div className="font-bold text-lg text-white group-hover:text-primary transition-colors">{template.name}</div>
                            <div className="text-xs text-zinc-400 font-medium">{template.exercises.length} Exercises</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                            <Play size={20} fill="currentColor" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
