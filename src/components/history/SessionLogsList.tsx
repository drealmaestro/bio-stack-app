import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Clock, TrendingUp } from "lucide-react";
import { getMuscleIcon } from "../../lib/muscleIcons";
import type { WorkoutLog, Exercise } from "../../types";

function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    return `${m}min`;
}

interface SessionLogsListProps {
    logs: WorkoutLog[];
    exercises: Exercise[];
    getTemplateName: (id: string) => string;
    getExerciseName: (id: string) => string;
}

export function SessionLogsList({ logs, exercises, getTemplateName, getExerciseName }: SessionLogsListProps) {
    return (
        <div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-3">All Sessions</h3>
            <div className="space-y-3">
                {[...logs].reverse().map((log) => {
                    const volKg = log.completed_exercises.reduce(
                        (s, set) => s + (set.weight_kg * set.reps_completed), 0
                    );
                    return (
                        <Card key={log.id} className="bg-secondary/30 border-white/5">
                            <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-base font-bold text-white">
                                        {getTemplateName(log.template_id)}
                                    </CardTitle>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(log.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="flex gap-4 text-xs text-zinc-500 mb-3">
                                    <span className="flex items-center gap-1">
                                        <Clock size={11} /> {formatDuration(log.duration_seconds)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <TrendingUp size={11} /> {Math.round(volKg).toLocaleString()}kg vol
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {log.completed_exercises.map((set, idx) => {
                                        const exData = exercises.find(e => e.id === set.exercise_id);
                                        const muscle = exData?.target_muscle || 'Other';
                                        return (
                                            <div key={idx} className="flex justify-between items-center text-xs border-b border-white/5 py-1.5 last:border-0">
                                                <span className="text-zinc-400 flex items-center gap-2">
                                                    <span className="text-zinc-600 shrink-0">
                                                        {getMuscleIcon(muscle, 11)}
                                                    </span>
                                                    <span>
                                                        {getExerciseName(set.exercise_id)} · Set {set.set_number}
                                                    </span>
                                                </span>
                                                <span className="text-primary font-bold flex items-center gap-1.5">
                                                    <span>{set.weight_kg}kg × {set.reps_completed}</span>
                                                    {set.rpe && (
                                                        <span className="text-[10px] font-black bg-white/5 text-zinc-400 border border-white/10 px-1.5 py-0.5 rounded uppercase">
                                                            @ RPE {set.rpe}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
