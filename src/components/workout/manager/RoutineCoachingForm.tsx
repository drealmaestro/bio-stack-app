import type { WorkoutTemplate } from "../../../types";

interface RoutineCoachingFormProps {
    draft: WorkoutTemplate;
    onUpdateDraft: (updated: WorkoutTemplate) => void;
}

export function RoutineCoachingForm({ draft, onUpdateDraft }: RoutineCoachingFormProps) {
    return (
        <div className="p-4 border-b border-white/5 bg-white/[0.01] space-y-3">
            <p className="text-xs font-bold text-primary uppercase tracking-widest">Plan Coaching & Strategy</p>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Focus Goal</label>
                    <input
                        type="text"
                        value={draft.focus_goal || ""}
                        onChange={(e) => onUpdateDraft({ ...draft, focus_goal: e.target.value })}
                        placeholder="e.g. Strength & Power"
                        className="w-full bg-black/60 border border-white/10 rounded-lg text-white font-bold text-xs px-3 py-2 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Target Duration (min)</label>
                    <input
                        type="number"
                        value={draft.target_duration || ""}
                        onChange={(e) => onUpdateDraft({ ...draft, target_duration: Number(e.target.value) || undefined })}
                        placeholder="e.g. 60"
                        className="w-full bg-black/60 border border-white/10 rounded-lg text-white font-bold text-xs px-3 py-2 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Difficulty</label>
                    <select
                        value={draft.difficulty || ""}
                        onChange={(e) => onUpdateDraft({ ...draft, difficulty: (e.target.value as any) || undefined })}
                        className="w-full bg-black/60 border border-white/10 rounded-lg text-white font-bold text-xs px-3 py-2.5 focus:outline-none focus:border-primary/50 transition-colors"
                    >
                        <option value="">Select Difficulty</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Description</label>
                    <input
                        type="text"
                        value={draft.description || ""}
                        onChange={(e) => onUpdateDraft({ ...draft, description: e.target.value })}
                        placeholder="Brief overview..."
                        className="w-full bg-black/60 border border-white/10 rounded-lg text-white font-bold text-xs px-3 py-2 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
            </div>
            <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Coach's Strategy Notes</label>
                <textarea
                    value={draft.coach_notes || ""}
                    onChange={(e) => onUpdateDraft({ ...draft, coach_notes: e.target.value })}
                    placeholder="Warmup advice, mindset targets, RPE targets..."
                    className="w-full h-16 bg-black/60 border border-white/10 rounded-lg text-white text-xs p-2 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
            </div>
        </div>
    );
}
