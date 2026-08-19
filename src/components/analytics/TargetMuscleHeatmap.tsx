import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Target, Scale, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { WorkoutLog, Exercise } from '../../types';
import { WEEKLY_SET_TARGETS, getTrainingWeekStart } from '../../lib/volume';
import { calculateMuscleBalance } from '../../utils/analyticsMath';

export interface TargetMuscleHeatmapProps {
    muscleVolumeMap?: Record<string, number>;
    logs?: WorkoutLog[];
    exercises?: Exercise[];
}

export function TargetMuscleHeatmap({
    muscleVolumeMap: externalMap,
    logs = [],
    exercises = [],
}: TargetMuscleHeatmapProps) {
    const computedVolumeMap = useMemo(() => {
        if (externalMap) return externalMap;

        const weekStart = getTrainingWeekStart(new Date());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const muscleByExercise = new Map(exercises.map(e => [e.id, e.target_muscle]));
        const counts: Record<string, number> = {};

        logs.forEach(log => {
            const ts = new Date(log.timestamp);
            if (ts < weekStart || ts >= weekEnd) return;
            log.completed_exercises.forEach(set => {
                if (set.reps_completed <= 0) return;
                const muscle = muscleByExercise.get(set.exercise_id);
                if (muscle) {
                    counts[muscle] = (counts[muscle] || 0) + 1;
                }
            });
        });

        return counts;
    }, [externalMap, logs, exercises]);

    const balanceMetrics = useMemo(() => {
        return calculateMuscleBalance(computedVolumeMap);
    }, [computedVolumeMap]);

    const muscleGroups = Object.keys(WEEKLY_SET_TARGETS) as Array<keyof typeof WEEKLY_SET_TARGETS>;

    return (
        <Card className="glass-card border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl overflow-hidden">
            <CardHeader className="p-4 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Target size={14} className="text-primary" />
                        Target Muscle Group Heatmap
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-zinc-700/50">
                            <Scale size={12} className="text-primary" />
                            Push/Pull Ratio: <span className="text-white">{balanceMetrics.pushPullRatio}</span>
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                            balanceMetrics.status === 'Optimal Balance'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                            {balanceMetrics.status === 'Optimal Balance' ? <CheckCircle2 size={12} /> : <ShieldAlert size={12} />}
                            {balanceMetrics.status}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
                {/* Balance Score Banner */}
                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Weekly Muscle Balance Score</div>
                        <div className="text-xl font-black text-white flex items-baseline gap-1">
                            {balanceMetrics.balanceScore}
                            <span className="text-xs text-zinc-400 font-normal">/ 100</span>
                        </div>
                    </div>
                    <div className="w-32 bg-zinc-800 rounded-full h-2 overflow-hidden border border-zinc-700/50">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                balanceMetrics.balanceScore >= 80 ? 'bg-emerald-500' : balanceMetrics.balanceScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${balanceMetrics.balanceScore}%` }}
                        />
                    </div>
                </div>

                {/* Heatmap Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {muscleGroups.map(muscle => {
                        const target = WEEKLY_SET_TARGETS[muscle] ?? { min: 8, max: 12 };
                        const count = computedVolumeMap[muscle] ?? 0;
                        const pct = Math.min(100, Math.round((count / target.max) * 100));

                        let statusColor = 'text-zinc-400 bg-zinc-800/50 border-zinc-700/40';
                        let barColor = 'bg-zinc-600';
                        if (count >= target.min && count <= target.max) {
                            statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                            barColor = 'bg-emerald-500';
                        } else if (count > target.max) {
                            statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
                            barColor = 'bg-amber-500';
                        } else if (count > 0) {
                            statusColor = 'text-sky-400 bg-sky-500/10 border-sky-500/30';
                            barColor = 'bg-sky-500';
                        }

                        return (
                            <div key={muscle} className="bg-zinc-950/40 border border-zinc-800/60 rounded-xl p-2.5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-zinc-200">{muscle}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${statusColor}`}>
                                        {count} / {target.max}s
                                    </span>
                                </div>
                                <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
