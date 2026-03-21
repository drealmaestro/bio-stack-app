import { useStore } from "../store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid
} from "recharts";
import { Trophy, Clock, Dumbbell, TrendingUp, Award } from "lucide-react";

function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    return `${m}min`;
}

// M6: explicit interface instead of `any` — avoids Recharts version type conflicts
interface TooltipData {
    active?: boolean;
    payload?: Array<{ value?: number | string }>;
    label?: string | number;
}
const CustomTooltip = ({ active, payload, label }: TooltipData) => {
    if (active && payload && payload.length) {
        const value = payload[0]?.value;
        return (
            <div className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs">
                <p className="text-zinc-400 mb-1">{String(label ?? '')}</p>
                <p className="text-primary font-bold">{typeof value === 'number' ? value.toLocaleString() : value} kg total</p>
            </div>
        );
    }
    return null;
};

export function HistoryLog() {
    const { logs, templates, exercises } = useStore();

    const getTemplateName = (id: string) =>
        templates.find(t => t.id === id)?.name || "Unknown Workout";

    const getExerciseName = (id: string) =>
        exercises.find(e => e.id === id)?.name || id;

    // --- WEEKLY VOLUME DATA ---
    const weeklyVolume: Record<string, number> = {};
    logs.forEach(log => {
        const date = new Date(log.timestamp);
        // Get Monday of that week
        const monday = new Date(date);
        monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
        const weekKey = monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        const vol = log.completed_exercises.reduce(
            (sum, s) => sum + (s.weight_kg * s.reps_completed), 0
        );
        weeklyVolume[weekKey] = (weeklyVolume[weekKey] || 0) + vol;
    });

    const volumeData = Object.entries(weeklyVolume)
        .slice(-8) // Last 8 weeks
        .map(([week, volume]) => ({ week, volume: Math.round(volume) }));

    // --- PR DETECTION ---
    // Find max weight per exercise across all logs
    const prMap: Record<string, { weight: number; reps: number; date: string }> = {};
    logs.forEach(log => {
        log.completed_exercises.forEach(set => {
            const existing = prMap[set.exercise_id];
            if (!existing || set.weight_kg > existing.weight) {
                prMap[set.exercise_id] = {
                    weight: set.weight_kg,
                    reps: set.reps_completed,
                    date: log.timestamp
                };
            }
        });
    });

    const topPRs = Object.entries(prMap)
        .sort((a, b) => b[1].weight - a[1].weight)
        .slice(0, 5);

    const totalVolume = logs.reduce((sum, log) =>
        sum + log.completed_exercises.reduce((s, set) => s + (set.weight_kg * set.reps_completed), 0), 0
    );

    const avgDuration = logs.length
        ? Math.round(logs.reduce((sum, l) => sum + l.duration_seconds, 0) / logs.length / 60)
        : 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-8">
            <h2 className="text-2xl font-bold text-white">Workout History</h2>

            {logs.length === 0 ? (
                <div className="text-center text-muted-foreground py-16 border border-dashed border-white/10 rounded-2xl">
                    <Dumbbell size={40} className="mx-auto mb-4 text-zinc-700" />
                    <p className="font-medium">No history yet. Go lift something!</p>
                </div>
            ) : (
                <>
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                        <Card className="glass-card">
                            <CardContent className="p-3 text-center">
                                <div className="text-2xl font-black text-primary">{logs.length}</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Sessions</div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card">
                            <CardContent className="p-3 text-center">
                                <div className="text-2xl font-black text-white">
                                    {totalVolume >= 1000
                                        ? `${(totalVolume / 1000).toFixed(1)}t`
                                        : `${Math.round(totalVolume)}kg`}
                                </div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Total Vol</div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card">
                            <CardContent className="p-3 text-center">
                                <div className="text-2xl font-black text-white">{avgDuration}m</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Avg Time</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Weekly Volume Chart */}
                    {volumeData.length > 1 && (
                        <Card className="glass-card">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp size={14} className="text-primary" /> Weekly Volume
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <ResponsiveContainer width="100%" height={160}>
                                    <BarChart data={volumeData} barSize={20}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis
                                            dataKey="week"
                                            tick={{ fill: '#71717a', fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fill: '#71717a', fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                        <Bar dataKey="volume" fill="hsl(51 100% 50%)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}

                    {/* Personal Records */}
                    {topPRs.length > 0 && (
                        <Card className="glass-card border-primary/20 bg-primary/5">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                    <Trophy size={14} className="text-primary" /> Personal Records
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-2">
                                {topPRs.map(([exId, pr]) => (
                                    <div key={exId} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                                        <div>
                                            <div className="text-sm font-bold text-white">{getExerciseName(exId)}</div>
                                            <div className="text-[10px] text-zinc-500">
                                                {new Date(pr.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Award size={14} className="text-primary" />
                                            <span className="text-primary font-black text-sm">
                                                {pr.weight}kg × {pr.reps}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Session Logs */}
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
                                                {log.completed_exercises.map((set, idx) => (
                                                    <div key={idx} className="flex justify-between text-xs border-b border-white/5 py-1 last:border-0">
                                                        <span className="text-zinc-400">
                                                            {getExerciseName(set.exercise_id)} · Set {set.set_number}
                                                        </span>
                                                        <span className="text-primary font-bold">
                                                            {set.weight_kg}kg × {set.reps_completed}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
