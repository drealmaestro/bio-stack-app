import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { calculateDailyReadiness } from '../../utils/readinessMath';
import { Sparkles, Droplet, Moon, Dumbbell, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DailyReadinessCardProps {
    todayStr: string;
    isRestDay: boolean;
    activeMinutesToday: number;
    onLogWater?: (amount: number) => void;
    onOpenSleepModal?: () => void;
}

export function DailyReadinessCard({
    todayStr,
    isRestDay,
    activeMinutesToday,
    onLogWater,
    onOpenSleepModal,
}: DailyReadinessCardProps) {
    const { waterIntake, sleepDuration, logWaterIntake } = useStore();

    const todayWater = waterIntake?.[todayStr] || 0;
    const todaySleep = sleepDuration?.[todayStr] || 0;

    const readiness = useMemo(() => {
        return calculateDailyReadiness({
            sleepMinutes: todaySleep,
            waterMl: todayWater,
            isRestDay,
            activeMinutesToday,
        });
    }, [todaySleep, todayWater, isRestDay, activeMinutesToday]);

    const handleWaterBump = (amount: number) => {
        if (onLogWater) {
            onLogWater(amount);
        } else {
            logWaterIntake(todayStr, amount);
        }
        navigator.vibrate?.(30);
    };

    return (
        <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 border border-white/10 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden backdrop-blur-sm">
            {/* Header & Score Badge */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">Daily Readiness</span>
                        <h4 className="text-base font-black text-white leading-tight">{readiness.label}</h4>
                    </div>
                </div>

                <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border",
                    readiness.badgeColor,
                    readiness.textColor
                )}>
                    <span className="text-sm font-black">{readiness.score}%</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-80">{readiness.level}</span>
                </div>
            </div>

            {/* Coach Insight Summary */}
            <p className="text-xs text-zinc-300 leading-relaxed font-medium bg-black/30 p-3 rounded-2xl border border-white/5">
                {readiness.summary}
            </p>

            {/* Actionable Comparative Context Metrics */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-2.5 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-extrabold text-sleep uppercase">
                        <Moon size={11} /> Sleep
                    </div>
                    <div className="text-xs font-black text-white truncate">
                        {todaySleep > 0 ? `${Math.floor(todaySleep / 60)}h ${todaySleep % 60}m` : '0h'}
                    </div>
                    <span className="text-[9px] text-zinc-500 font-bold block">
                        {readiness.metrics.sleepPct}% target
                    </span>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-2.5 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-extrabold text-sky-400 uppercase">
                        <Droplet size={11} /> Water
                    </div>
                    <div className="text-xs font-black text-white truncate">
                        {todayWater} ml
                    </div>
                    <span className="text-[9px] text-zinc-500 font-bold block">
                        {readiness.metrics.hydrationPct}% target
                    </span>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-2.5 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-extrabold text-primary uppercase">
                        <Dumbbell size={11} /> Status
                    </div>
                    <div className="text-xs font-black text-white truncate">
                        {isRestDay ? 'Rest Day' : `${activeMinutesToday}m act`}
                    </div>
                    <span className="text-[9px] text-zinc-500 font-bold block truncate">
                        {isRestDay ? 'Recovery' : 'Training'}
                    </span>
                </div>
            </div>

            {/* 1-Tap Immediate Quick Actions Bar */}
            <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider shrink-0">1-Tap:</span>
                <button
                    type="button"
                    onClick={() => handleWaterBump(250)}
                    className="flex-1 py-2 px-2 bg-sky-500/10 hover:bg-sky-500/20 active:scale-95 border border-sky-500/20 rounded-xl text-[11px] font-black text-sky-300 flex items-center justify-center gap-1 transition-all cursor-pointer min-h-[44px]"
                    aria-label="Add 250ml water"
                >
                    <Plus size={12} /> +250ml
                </button>
                <button
                    type="button"
                    onClick={() => handleWaterBump(500)}
                    className="flex-1 py-2 px-2 bg-sky-500/15 hover:bg-sky-500/25 active:scale-95 border border-sky-500/30 rounded-xl text-[11px] font-black text-sky-200 flex items-center justify-center gap-1 transition-all cursor-pointer min-h-[44px]"
                    aria-label="Add 500ml water"
                >
                    <Plus size={12} /> +500ml
                </button>
                {onOpenSleepModal && (
                    <button
                        type="button"
                        onClick={onOpenSleepModal}
                        className="py-2 px-3 bg-purple-500/10 hover:bg-purple-500/20 active:scale-95 border border-purple-500/20 rounded-xl text-[11px] font-black text-purple-300 flex items-center justify-center gap-1 transition-all cursor-pointer min-h-[44px]"
                        aria-label="Log sleep"
                    >
                        <Moon size={12} /> Sleep
                    </button>
                )}
            </div>
        </div>
    );
}
