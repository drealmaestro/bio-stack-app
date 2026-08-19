import { Scale, Plus, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface WeightTrackerCardProps {
    latestWeight?: number;
    weightDelta: string | null;
    showAddWeight: boolean;
    newWeight: string;
    weightHistory: Array<{ date: string; value: number }>;
    onToggleAddWeight: () => void;
    onWeightChange: (val: string) => void;
    onAddWeight: () => void;
}

export function WeightTrackerCard({
    latestWeight,
    weightDelta,
    showAddWeight,
    newWeight,
    weightHistory,
    onToggleAddWeight,
    onWeightChange,
    onAddWeight
}: WeightTrackerCardProps) {
    return (
        <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Scale size={16} className="text-primary" />
                    <h3 className="text-base font-bold text-white">Weight Tracker</h3>
                </div>
                <button
                    onClick={onToggleAddWeight}
                    className="min-h-[44px] flex items-center gap-1 text-xs text-primary font-bold hover:text-primary/80 transition-colors cursor-pointer"
                >
                    <Plus size={14} /> Log Weight
                </button>
            </div>

            <div className="flex gap-4">
                <div>
                    <div className="text-2xl font-black text-white">
                        {latestWeight ? `${latestWeight}` : "—"}
                        <span className="text-sm font-normal text-zinc-500 ml-1">kg</span>
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-widest">Current</div>
                </div>
                {weightDelta !== null && (
                    <div>
                        <div className={cn("text-2xl font-black", parseFloat(weightDelta) < 0 ? "text-emerald-400" : "text-orange-400")}>
                            {parseFloat(weightDelta) > 0 ? "+" : ""}{weightDelta}
                            <span className="text-sm font-normal text-zinc-500 ml-1">kg</span>
                        </div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                            <TrendingDown size={10} /> 30-day change
                        </div>
                    </div>
                )}
            </div>

            {showAddWeight && (
                <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                    <Input
                        type="number"
                        value={newWeight}
                        onChange={e => onWeightChange(e.target.value)}
                        placeholder="e.g. 82.5"
                        className="bg-white/5 border-white/10 text-white"
                        step="0.1"
                    />
                    <Button onClick={onAddWeight} className="shrink-0 bg-primary text-black font-bold hover:bg-primary/80">
                        Save
                    </Button>
                </div>
            )}

            {weightHistory.length >= 2 ? (
                <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weightHistory} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#71717a', fontSize: 9 }}
                                tickFormatter={d => d.slice(5)}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fill: '#71717a', fontSize: 9 }}
                                domain={['auto', 'auto']}
                                width={30}
                            />
                            <RechartsTooltip
                                contentStyle={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
                                labelStyle={{ color: '#a1a1aa' }}
                                formatter={(v: number | undefined) => [`${v ?? '—'} kg`, 'Weight'] as [string, string]}
                                cursor={{ stroke: '#ffffff', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.1 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#00D4FF"
                                strokeWidth={2}
                                dot={{ fill: '#00D4FF', r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-24 flex items-center justify-center text-sm text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                    Log at least 2 weight entries to see your chart
                </div>
            )}
        </div>
    );
}
