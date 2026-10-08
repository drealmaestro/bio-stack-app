import { TrendingUp } from "lucide-react";

interface DailyTonnageChartProps {
    volumeKg?: number;
    pctChange?: string;
}

export function DailyTonnageChart({ volumeKg = 42850, pctChange = "+8.4%" }: DailyTonnageChartProps) {
    const days = [
        { label: "M", val: 6.2, height: "65%", isRest: false, isPeak: false },
        { label: "T", val: 8.4, height: "100%", isRest: false, isPeak: true },
        { label: "W", val: 0, height: "10%", isRest: true, isPeak: false },
        { label: "T", val: 7.1, height: "78%", isRest: false, isPeak: false },
        { label: "F", val: 8.0, height: "92%", isRest: false, isPeak: false },
        { label: "S", val: 0, height: "10%", isRest: true, isPeak: false },
        { label: "S", val: 5.1, height: "55%", isRest: false, isPeak: false },
    ];

    return (
        <section className="stitch-card-1 p-4 border border-[#262b36] bg-[#14171d] rounded-xl space-y-4">
            <div className="flex items-start justify-between">
                <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#8e95a5] uppercase">
                        Accumulated Volume
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-black font-display text-white tracking-tight">
                            {volumeKg.toLocaleString()} KG
                        </span>
                        <span className="flex items-center gap-0.5 text-xs font-mono font-bold text-[#ccff00] bg-[#ccff00]/10 px-1.5 py-0.5 rounded">
                            <TrendingUp size={12} /> {pctChange}
                        </span>
                    </div>
                </div>
                <span className="stitch-badge-target font-mono text-[10px]">
                    This Week
                </span>
            </div>

            <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8e95a5]">
                    <span className="uppercase">Daily Tonnage Flow</span>
                    <span className="text-[#ccff00]">Peak: 8,420 KG</span>
                </div>

                {/* 7-Day Bar Chart */}
                <div className="h-32 pt-4 pb-2 px-2 bg-[#0d0f12] border border-[#262b36] rounded-lg flex items-end justify-between gap-2">
                    {days.map((day, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                            {day.isPeak && (
                                <span className="text-[9px] font-mono font-bold text-[#ccff00] -mb-1 animate-pulse">
                                    8.4k
                                </span>
                            )}
                            {day.isRest ? (
                                <div className="w-full max-w-[28px] h-2 rounded bg-[#1e232d] border border-dashed border-[#8e95a5]/30" />
                            ) : (
                                <div
                                    style={{ height: day.height }}
                                    className={`w-full max-w-[28px] rounded-t transition-all duration-500 ${
                                        day.isPeak
                                            ? "bg-[#ccff00] shadow-[0_0_12px_rgba(204,255,0,0.35)]"
                                            : "bg-[#2a3140] hover:bg-[#343d50]"
                                    }`}
                                />
                            )}
                            <span className={`text-[10px] font-mono font-bold ${
                                day.isPeak ? "text-[#ccff00]" : day.isRest ? "text-[#8e95a5]/40" : "text-[#8e95a5]"
                            }`}>
                                {day.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
