import { Zap } from 'lucide-react';

export interface DailyStreakWidgetProps {
    streak: number;
    className?: string;
}

export function DailyStreakWidget({ streak, className }: DailyStreakWidgetProps) {
    if (streak <= 0) {
        return (
            <div className="text-xs text-zinc-500 font-medium">
                No active streak yet
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400/10 border border-amber-400/20 text-amber-400 animate-in fade-in duration-300 ${className || ''}`}>
            <Zap size={12} className="fill-amber-400" />
            <span>{streak} Day Streak</span>
        </div>
    );
}
