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
        <div className="stitch-card-1 p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-[#262b36] pb-2">
                <Trophy size={14} className="text-[#ccff00]" />
                <span className="text-xs font-display font-black text-white uppercase tracking-wider">
                    PERSONAL RECORDS BREAKTHROUGHS
                </span>
            </div>
            <div className="space-y-2">
                {topPRs.map(([exId, pr]) => {
                    const exData = exercises.find(e => e.id === exId);
                    const muscle = exData?.target_muscle || 'Other';
                    return (
                        <div key={exId} className="flex justify-between items-center py-2 border-b border-[#262b36]/60 last:border-0">
                            <div className="flex items-center gap-2.5">
                                <span className="text-[#ccff00] bg-[#1a1e26] border border-[#262b36] w-7 h-7 rounded flex items-center justify-center shrink-0">
                                    {getMuscleIcon(muscle, 12)}
                                </span>
                                <div>
                                    <div className="text-xs font-display font-black text-white uppercase tracking-tight leading-tight">
                                        {getExerciseName(exId)}
                                    </div>
                                    <div className="text-[9px] font-mono text-[#8e95a5] mt-0.5">
                                        {new Date(pr.date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#1a1e26] border border-[#262b36]">
                                <Award size={13} className="text-[#ccff00]" />
                                <span className="text-[#ccff00] font-display font-black text-xs tabular-nums">
                                    {pr.weight} kg × {pr.reps}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
