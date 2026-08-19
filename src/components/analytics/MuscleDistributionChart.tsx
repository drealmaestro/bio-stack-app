import { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import type { WorkoutLog, Exercise, TargetMuscle } from '../../types';
import { Dumbbell, BarChart3, PieChart as PieIcon } from 'lucide-react';

interface MuscleDistributionChartProps {
    logs: WorkoutLog[];
    exercises: Exercise[];
}

const MUSCLE_COLORS: Record<string, string> = {
    Chest: '#3ccf94',
    Back: '#60a5fa',
    Legs: '#f59e0b',
    Shoulders: '#a855f7',
    Biceps: '#ec4899',
    Triceps: '#06b6d4',
    Core: '#10b981',
    Forearms: '#84cc16',
    Other: '#71717a',
};

export function MuscleDistributionChart({ logs, exercises }: MuscleDistributionChartProps) {
    const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

    const exerciseMuscleMap = useMemo(() => {
        const map = new Map<string, TargetMuscle>();
        exercises.forEach((ex) => {
            map.set(ex.id, ex.target_muscle || 'Other');
        });
        return map;
    }, [exercises]);

    const muscleData = useMemo(() => {
        const volumeByMuscle: Record<string, number> = {};

        logs.forEach((log) => {
            log.completed_exercises.forEach((set) => {
                const muscle = exerciseMuscleMap.get(set.exercise_id) || 'Other';
                const setVolume = set.weight_kg * set.reps_completed;
                volumeByMuscle[muscle] = (volumeByMuscle[muscle] || 0) + setVolume;
            });
        });

        const totalVolume = Object.values(volumeByMuscle).reduce((sum, v) => sum + v, 0);

        return Object.entries(volumeByMuscle)
            .map(([muscle, volume]) => ({
                muscle,
                volume: Math.round(volume),
                percentage: totalVolume > 0 ? Math.round((volume / totalVolume) * 100) : 0,
                color: MUSCLE_COLORS[muscle] || MUSCLE_COLORS.Other,
            }))
            .sort((a, b) => b.volume - a.volume);
    }, [logs, exerciseMuscleMap]);

    if (logs.length === 0 || muscleData.length === 0) {
        return (
            <div className="bg-card border border-white/5 p-6 rounded-3xl text-center space-y-2">
                <Dumbbell className="mx-auto text-zinc-600" size={32} />
                <h4 className="text-sm font-bold text-zinc-400">No Volume Data</h4>
                <p className="text-xs text-zinc-500">Log workout sessions to analyze target muscle distribution.</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-white/5 p-5 rounded-3xl space-y-4 shadow-md">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Volume Analytics</span>
                    <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                        <Dumbbell size={16} className="text-primary" /> Target Muscle Volume
                    </h4>
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setChartType('bar')}
                        className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            chartType === 'bar' ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'
                        }`}
                        title="Bar Chart"
                        aria-label="View bar chart"
                    >
                        <BarChart3 size={16} />
                    </button>
                    <button
                        onClick={() => setChartType('pie')}
                        className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            chartType === 'pie' ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'
                        }`}
                        title="Pie Chart"
                        aria-label="View pie chart"
                    >
                        <PieIcon size={16} />
                    </button>
                </div>
            </div>

            {/* Chart Area */}
            <div className="w-full h-56 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                        <BarChart data={muscleData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                            <XAxis
                                dataKey="muscle"
                                stroke="#71717a"
                                fontSize={10}
                                tickLine={false}
                                interval={0}
                                angle={-30}
                                textAnchor="end"
                            />
                            <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-xs space-y-1 shadow-xl">
                                                <div className="font-black text-white">{data.muscle}</div>
                                                <div className="text-primary font-bold">{data.volume.toLocaleString()} kg</div>
                                                <div className="text-zinc-400 text-[10px]">{data.percentage}% of total volume</div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                                {muscleData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={muscleData}
                                dataKey="volume"
                                nameKey="muscle"
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={80}
                                paddingAngle={3}
                            >
                                {muscleData.map((entry, index) => (
                                    <Cell key={`pie-cell-${index}`} fill={entry.color} stroke="#121216" strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-xs space-y-1 shadow-xl">
                                                <div className="font-black text-white">{data.muscle}</div>
                                                <div className="text-primary font-bold">{data.volume.toLocaleString()} kg ({data.percentage}%)</div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>

            {/* Muscle Breakdown Pills */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                {muscleData.map((m) => (
                    <div
                        key={m.muscle}
                        className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                    >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                        <span className="text-zinc-300">{m.muscle}</span>
                        <span className="text-white font-black">{m.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
