import { Target } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface MuscleVolumeCardProps {
    barChartData: Array<{ name: string; sets: number }>;
}

const COLORS = ['#00D4FF', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

export function MuscleVolumeCard({ barChartData }: MuscleVolumeCardProps) {
    return (
        <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
                <Target size={16} className="text-purple-400" />
                <h3 className="text-base font-bold text-white">Muscle Volume (Sets)</h3>
            </div>

            {barChartData.length > 0 ? (
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#71717a', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: '#71717a', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <RechartsTooltip
                                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                                contentStyle={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
                                formatter={(v: number | undefined) => [`${v ?? 0} Sets`, 'Volume']}
                            />
                            <Bar dataKey="sets" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                {barChartData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-24 flex items-center justify-center text-sm text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                    Log workouts to see your volume stats
                </div>
            )}
        </div>
    );
}
