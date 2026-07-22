import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";

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

interface WeeklyVolumeChartProps {
    volumeData: Array<{ week: string; volume: number }>;
}

export function WeeklyVolumeChart({ volumeData }: WeeklyVolumeChartProps) {
    if (volumeData.length <= 1) return null;

    return (
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
    );
}
