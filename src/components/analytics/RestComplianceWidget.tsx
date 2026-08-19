import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Timer, Zap, Clock } from 'lucide-react';
import { calculateRestCompliance } from '../../utils/analyticsMath';

export interface RestComplianceLog {
    date: string;
    restSec: number;
    targetSec: number;
}

export interface RestComplianceWidgetProps {
    logs?: RestComplianceLog[];
    completedRestSeconds?: number[];
    targetRestSeconds?: number;
}

export function RestComplianceWidget({
    logs = [],
    completedRestSeconds: externalRests,
    targetRestSeconds: externalTarget = 90,
}: RestComplianceWidgetProps) {
    const { rests, targetSec } = useMemo(() => {
        if (externalRests && externalRests.length > 0) {
            return { rests: externalRests, targetSec: externalTarget };
        }
        if (logs && logs.length > 0) {
            const restArray = logs.map(l => l.restSec);
            const avgTarget = Math.round(logs.reduce((sum, l) => sum + l.targetSec, 0) / logs.length);
            return { rests: restArray, targetSec: avgTarget };
        }
        // Mock / fallback sample data if no history exists yet
        return { rests: [85, 92, 90, 88, 95], targetSec: 90 };
    }, [logs, externalRests, externalTarget]);

    const { compliancePct, averageRestSec } = useMemo(() => {
        return calculateRestCompliance(rests, targetSec);
    }, [rests, targetSec]);

    // Circle parameters for SVG gauge
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (compliancePct / 100) * circumference;

    let statusLabel = 'Optimal Rest Adherence';
    let statusBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

    if (compliancePct < 70) {
        statusLabel = averageRestSec < targetSec ? 'Rushed Rests' : 'Excessive Rest Time';
        statusBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }

    return (
        <Card className="glass-card border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl overflow-hidden">
            <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Timer size={14} className="text-sky-400" />
                        Rest-Period Compliance
                    </CardTitle>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusBadgeColor}`}>
                        {statusLabel}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Radial Gauge */}
                    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 90 90">
                            <circle
                                cx="45"
                                cy="45"
                                r={radius}
                                className="stroke-zinc-800"
                                strokeWidth="8"
                                fill="transparent"
                            />
                            <circle
                                cx="45"
                                cy="45"
                                r={radius}
                                className="stroke-sky-400 transition-all duration-700 ease-out"
                                strokeWidth="8"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                fill="transparent"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                            <span className="text-lg font-black text-white">{compliancePct}%</span>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">Match</span>
                        </div>
                    </div>

                    {/* Breakdown Stats */}
                    <div className="flex-1 w-full space-y-2">
                        <div className="grid grid-cols-2 gap-2 bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800/60 text-xs">
                            <div>
                                <span className="text-zinc-500 text-[10px] uppercase font-bold block flex items-center gap-1">
                                    <Clock size={10} className="text-sky-400" /> Avg Rest
                                </span>
                                <span className="text-white font-bold text-sm">{averageRestSec}s</span>
                            </div>
                            <div>
                                <span className="text-zinc-500 text-[10px] uppercase font-bold block flex items-center gap-1">
                                    <Zap size={10} className="text-amber-400" /> Target Rest
                                </span>
                                <span className="text-zinc-300 font-bold text-sm">{targetSec}s</span>
                            </div>
                        </div>

                        {/* Recent Rest Intervals */}
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                                <span>Recent Sets</span>
                                <span>Target: {targetSec}s</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {rests.slice(-6).map((sec, idx) => {
                                    const match = Math.abs(sec - targetSec) <= 15;
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex-1 py-1 px-1 text-center rounded text-[10px] font-bold border ${
                                                match
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                            }`}
                                        >
                                            {sec}s
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
