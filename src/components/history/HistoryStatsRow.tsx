import { Card, CardContent } from "../ui/card";

interface HistoryStatsRowProps {
    sessionsCount: number;
    totalVolume: number;
    avgDuration: number;
}

export function HistoryStatsRow({ sessionsCount, totalVolume, avgDuration }: HistoryStatsRowProps) {
    return (
        <div className="grid grid-cols-3 gap-3">
            <Card className="glass-card">
                <CardContent className="p-3.5 text-center">
                    <div className="text-3xl font-black text-primary">{sessionsCount}</div>
                    <div className="text-[11px] font-black text-zinc-400 uppercase tracking-wider mt-0.5">Sessions</div>
                </CardContent>
            </Card>
            <Card className="glass-card">
                <CardContent className="p-3.5 text-center">
                    <div className="text-3xl font-black text-white">
                        {totalVolume >= 1000
                            ? `${(totalVolume / 1000).toFixed(1)}t`
                            : `${Math.round(totalVolume)}kg`}
                    </div>
                    <div className="text-[11px] font-black text-zinc-400 uppercase tracking-wider mt-0.5">Total Vol</div>
                </CardContent>
            </Card>
            <Card className="glass-card">
                <CardContent className="p-3.5 text-center">
                    <div className="text-3xl font-black text-white">{avgDuration}m</div>
                    <div className="text-[11px] font-black text-zinc-400 uppercase tracking-wider mt-0.5">Avg Time</div>
                </CardContent>
            </Card>
        </div>
    );
}
