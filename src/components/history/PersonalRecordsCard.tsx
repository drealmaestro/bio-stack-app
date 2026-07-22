import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Trophy, Award } from "lucide-react";
import { getMuscleIcon } from "../../lib/muscleIcons";
import type { Exercise } from "../../types";

interface PersonalRecordsCardProps {
    topPRs: Array<[string, { weight: number; reps: number; date: string }]>;
    exercises: Exercise[];
    getExerciseName: (id: string) => string;
}

export function PersonalRecordsCard({ topPRs, exercises, getExerciseName }: PersonalRecordsCardProps) {
    if (topPRs.length === 0) return null;

    return (
        <Card className="glass-card border-primary/20 bg-primary/5">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Trophy size={14} className="text-primary" /> Personal Records
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
                {topPRs.map(([exId, pr]) => {
                    const exData = exercises.find(e => e.id === exId);
                    const muscle = exData?.target_muscle || 'Other';
                    return (
                        <div key={exId} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                            <div className="flex items-center gap-2">
                                <span className="text-primary bg-primary/10 w-6.5 h-6.5 rounded-full flex items-center justify-center shrink-0">
                                    {getMuscleIcon(muscle, 11)}
                                </span>
                                <div>
                                    <div className="text-sm font-bold text-white leading-tight">{getExerciseName(exId)}</div>
                                    <div className="text-[10px] text-zinc-500 font-bold mt-0.5">
                                        {new Date(pr.date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award size={14} className="text-primary" />
                                <span className="text-primary font-black text-sm">
                                    {pr.weight}kg × {pr.reps}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
