import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ResponsiveContainer, CartesianGrid, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { Activity } from "lucide-react";
import type { Exercise } from "../../types";

interface TooltipData {
    active?: boolean;
    payload?: Array<{ value?: number | string }>;
    label?: string | number;
}

const CustomLineTooltip = ({ active, payload, label }: TooltipData) => {
    if (active && payload && payload.length) {
        const weight = payload[0]?.value;
        const oneRepMax = payload[1]?.value;
        return (
            <div className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs">
                <p className="text-zinc-400 mb-1">{String(label ?? '')}</p>
                <p className="text-white font-bold">Max Weight: <span className="text-primary">{weight} kg</span></p>
                <p className="text-white font-bold">Est. 1-Rep Max: <span className="text-carbs">{oneRepMax} kg</span></p>
            </div>
        );
    }
    return null;
};

interface LiftProgressionChartProps {
    loggedExercises: Exercise[];
    selectedExerciseId: string;
    onSelectExercise: (id: string) => void;
    exerciseProgressData: Array<{ date: string; weight: number; estimated1RM: number }>;
    allTimePR: number;
    best1RM: number;
}

export function LiftProgressionChart({
    loggedExercises,
    selectedExerciseId,
    onSelectExercise,
    exerciseProgressData,
    allTimePR,
    best1RM
}: LiftProgressionChartProps) {
    if (loggedExercises.length === 0 || !selectedExerciseId) return null;

    return (
        <Card className="glass-card">
            <CardHeader className="p-4 pb-2">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <CardTitle className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={14} className="text-carbs" /> Lift Progression
                    </CardTitle>
                    <select
                        value={selectedExerciseId}
                        onChange={(e) => onSelectExercise(e.target.value)}
                        className="bg-black/60 border border-white/10 text-white font-bold text-xs py-1.5 px-3 rounded-xl focus:outline-none focus:border-primary/50 cursor-pointer min-w-[160px]"
                    >
                        {loggedExercises.map(e => (
                            <option key={e.id} value={e.id}>
                                {e.name}
                            </option>
                        ))}
                    </select>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="grid grid-cols-2 gap-3 mb-4 bg-white/[0.02] p-3 rounded-2xl border border-white/[0.03]">
                    <div className="text-center">
                        <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-0.5">All-Time PR</div>
                        <div className="text-lg font-black text-white">{allTimePR} kg</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Best Est. 1RM</div>
                        <div className="text-lg font-black text-carbs">{best1RM} kg</div>
                    </div>
                </div>

                {exerciseProgressData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={exerciseProgressData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#71717a', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: '#71717a', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                domain={['dataMin - 5', 'dataMax + 5']}
                            />
                            <Tooltip content={<CustomLineTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="rgba(255, 255, 255, 0.3)"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                dot={{ fill: 'rgba(255,255,255,0.5)', r: 3 }}
                                name="Max Weight"
                            />
                            <Line
                                type="monotone"
                                dataKey="estimated1RM"
                                stroke="#3ccf94"
                                strokeWidth={3}
                                dot={{ fill: '#3ccf94', r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Estimated 1RM"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center py-8 text-xs text-zinc-500 font-bold">
                        No stats yet for this exercise
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
