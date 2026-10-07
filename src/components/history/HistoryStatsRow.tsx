interface HistoryStatsRowProps {
    sessionsCount: number;
    totalVolume: number;
    avgDuration: number;
}

export function HistoryStatsRow({ sessionsCount, totalVolume, avgDuration }: HistoryStatsRowProps) {
    return (
        <div className="grid grid-cols-3 gap-2">
            <div className="stitch-card-1 p-3 text-center">
                <div className="text-3xl font-display font-black text-[#ccff00] tabular-nums tracking-tight">
                    {sessionsCount}
                </div>
                <div className="text-[10px] font-mono font-bold text-[#8e95a5] uppercase tracking-wider mt-0.5">
                    SESSIONS
                </div>
            </div>
            <div className="stitch-card-1 p-3 text-center">
                <div className="text-3xl font-display font-black text-white tabular-nums tracking-tight">
                    {totalVolume >= 1000
                        ? `${(totalVolume / 1000).toFixed(1)}t`
                        : `${Math.round(totalVolume)}kg`}
                </div>
                <div className="text-[10px] font-mono font-bold text-[#8e95a5] uppercase tracking-wider mt-0.5">
                    TOTAL LOAD
                </div>
            </div>
            <div className="stitch-card-1 p-3 text-center">
                <div className="text-3xl font-display font-black text-white tabular-nums tracking-tight">
                    {avgDuration}m
                </div>
                <div className="text-[10px] font-mono font-bold text-[#8e95a5] uppercase tracking-wider mt-0.5">
                    AVG DURATION
                </div>
            </div>
        </div>
    );
}
