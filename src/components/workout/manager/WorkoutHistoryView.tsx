import { Dumbbell, Clock, CheckCircle2 } from "lucide-react";
import type { WorkoutLog } from "../../../types";

interface WorkoutHistoryViewProps {
    logs: WorkoutLog[];
    getTemplateName?: (id: string) => string;
}

export function WorkoutHistoryView({ logs, getTemplateName }: WorkoutHistoryViewProps) {
    if (logs.length === 0) {
        return (
            <div className="glass-card p-6 rounded-2xl text-center border border-dashed border-white/10">
                <Dumbbell size={24} className="mx-auto mb-2 text-zinc-700" />
                <p className="text-xs text-zinc-400">No workout history logged yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">Recent Activity</h3>
            {logs.slice(-5).reverse().map((log) => (
                <div key={log.id} className="glass-card p-3 rounded-xl flex justify-between items-center text-xs">
                    <div>
                        <div className="font-bold text-white">
                            {getTemplateName ? getTemplateName(log.template_id) : "Workout Session"}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-2">
                            <span><Clock size={10} className="inline mr-1" />{Math.round(log.duration_seconds / 60)} min</span>
                            <span><CheckCircle2 size={10} className="inline mr-1" />{log.completed_exercises.length} sets</span>
                        </div>
                    </div>
                    <div className="text-[10px] text-zinc-400">
                        {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                </div>
            ))}
        </div>
    );
}
