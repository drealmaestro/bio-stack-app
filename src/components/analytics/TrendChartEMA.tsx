import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ResponsiveContainer, CartesianGrid, AreaChart, Area, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { calculateEMA } from '../../utils/analyticsMath';

export interface TrendChartPoint {
    date: string;
    value: number;
    ema?: number;
}

export interface TrendChartEMAProps {
    data: TrendChartPoint[];
    title?: string;
    unit?: string;
    color?: string;
    alpha?: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value?: number; name?: string; color?: string }>;
    label?: string;
    unit?: string;
}

const CustomEMATooltip = ({ active, payload, label, unit = 'kg' }: CustomTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    const rawVal = payload.find(p => p.name === 'Raw Value')?.value ?? payload[0]?.value;
    const emaVal = payload.find(p => p.name === 'EMA Trend')?.value ?? payload[1]?.value;
    const delta = rawVal !== undefined && emaVal !== undefined ? Math.round((rawVal - emaVal) * 10) / 10 : 0;

    return (
        <div className="bg-zinc-950/90 border border-zinc-800 backdrop-blur-xl rounded-xl p-3 shadow-2xl text-xs space-y-1">
            <p className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider">{label}</p>
            {rawVal !== undefined && (
                <div className="flex items-center justify-between gap-4">
                    <span className="text-zinc-400">Actual:</span>
                    <span className="text-white font-bold">{rawVal} {unit}</span>
                </div>
            )}
            {emaVal !== undefined && (
                <div className="flex items-center justify-between gap-4">
                    <span className="text-emerald-400 font-medium">EMA Trend:</span>
                    <span className="text-emerald-400 font-bold">{emaVal} {unit}</span>
                </div>
            )}
            {delta !== 0 && (
                <div className="text-[10px] text-zinc-500 pt-0.5 border-t border-zinc-800/80">
                    Delta vs Trend: <span className={delta > 0 ? 'text-emerald-400' : 'text-rose-400'}>{delta > 0 ? `+${delta}` : delta} {unit}</span>
                </div>
            )}
        </div>
    );
};

export function TrendChartEMA({
    data,
    title = '1RM Strength Trend (EMA)',
    unit = 'kg',
    color = '#10b981',
    alpha = 0.3,
}: TrendChartEMAProps) {
    const processedData = useMemo(() => {
        if (!data || data.length === 0) return [];
        const rawValues = data.map(d => d.value);
        const computedEMA = calculateEMA(rawValues, alpha);

        return data.map((point, idx) => ({
            ...point,
            ema: point.ema ?? computedEMA[idx],
        }));
    }, [data, alpha]);

    const latestVal = processedData.length > 0 ? processedData[processedData.length - 1].value : 0;
    const latestEMA = processedData.length > 0 ? processedData[processedData.length - 1].ema : 0;
    const firstEMA = processedData.length > 0 ? processedData[0].ema : 0;
    const pctChange = firstEMA && latestEMA ? Math.round(((latestEMA - firstEMA) / firstEMA) * 1000) / 10 : 0;

    return (
        <Card className="glass-card overflow-hidden border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl">
            <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Activity size={14} className="text-emerald-400" />
                            {title}
                        </CardTitle>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-black text-white">{latestEMA} <span className="text-sm font-semibold text-zinc-400">{unit}</span></span>
                            {pctChange !== 0 && (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${pctChange >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                    <TrendingUp size={12} className={pctChange < 0 ? 'rotate-180' : ''} />
                                    {pctChange >= 0 ? `+${pctChange}%` : `${pctChange}%`}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right text-xs">
                        <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Latest Session</span>
                        <span className="text-zinc-300 font-bold">{latestVal} {unit}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                {processedData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={190}>
                        <AreaChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="emaColorGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                                </linearGradient>
                            </defs>
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
                            <Tooltip content={<CustomEMATooltip unit={unit} />} />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="rgba(255, 255, 255, 0.35)"
                                strokeWidth={2}
                                strokeDasharray="3 3"
                                dot={{ fill: 'rgba(255, 255, 255, 0.6)', r: 3 }}
                                name="Raw Value"
                            />
                            <Area
                                type="monotone"
                                dataKey="ema"
                                stroke={color}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#emaColorGrad)"
                                name="EMA Trend"
                                dot={false}
                                activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center py-10 text-xs text-zinc-500 font-bold">
                        No trend data recorded yet
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
