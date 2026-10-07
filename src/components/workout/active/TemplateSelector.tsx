import { Play, Dumbbell, ArrowRight } from "lucide-react";
import type { WorkoutTemplate } from "../../../types";

interface TemplateSelectorProps {
    templates: WorkoutTemplate[];
    onStartWorkout: (templateId: string) => void;
}

export function TemplateSelector({ templates, onStartWorkout }: TemplateSelectorProps) {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center py-6 border-b border-[#262b36]">
                <div className="w-14 h-14 bg-[#1a1e26] border border-[#262b36] rounded flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(204,255,0,0.15)]">
                    <Play size={24} className="text-[#ccff00] ml-0.5" fill="#ccff00" />
                </div>
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">
                    ACTIVE WORKOUT PLAYER
                </h2>
                <p className="text-xs font-mono text-[#8e95a5] uppercase tracking-wider mt-1">
                    SELECT A MESOCYCLE ROUTINE TO BEGIN LOGGING
                </p>
            </div>

            <div className="space-y-2.5">
                {templates.length === 0 ? (
                    <div className="stitch-card-1 p-6 text-center border-dashed">
                        <p className="text-xs text-[#8e95a5] mb-3">No active routines configured.</p>
                        <button
                            className="stitch-btn-primary px-4 py-2 text-xs"
                            onClick={() => window.location.assign('/workouts')}
                        >
                            CREATE ROUTINE
                        </button>
                    </div>
                ) : templates.map(template => (
                    <button
                        key={template.id}
                        onClick={() => onStartWorkout(template.id)}
                        className="w-full text-left stitch-card-1 p-3.5 flex justify-between items-center cursor-pointer group hover:border-[#ccff00] active:scale-[0.99] transition-all"
                    >
                        <div>
                            <div className="font-display font-black text-base text-white uppercase tracking-tight group-hover:text-[#ccff00] transition-colors">
                                {template.name}
                            </div>
                            <div className="text-[10px] font-mono text-[#8e95a5] mt-0.5 flex items-center gap-1.5">
                                <Dumbbell size={10} className="text-[#ccff00]" />
                                {template.exercises.length} EXERCISES • RPE 8-10 TARGET
                            </div>
                        </div>
                        <div className="w-9 h-9 rounded bg-[#1a1e26] border border-[#262b36] flex items-center justify-center group-hover:bg-[#ccff00] group-hover:text-[#0d0f12] text-[#ccff00] transition-all">
                            <ArrowRight size={16} />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
