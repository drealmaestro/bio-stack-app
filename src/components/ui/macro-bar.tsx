import { cn } from '../../lib/utils';

interface MacroBarProps {
    label: string;
    current: number;
    goal: number;
    unit?: string;
    color: string; // Tailwind bg class e.g. 'bg-[#a78bfa]'
    className?: string;
}

export function MacroBar({ label, current, goal, unit = 'g', color, className }: MacroBarProps) {
    const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
    const remaining = Math.max(goal - current, 0);

    // Map color classes to premium hex tones
    const getColorClass = (bgClass: string) => {
        if (bgClass.includes('protein')) return 'bg-[#a78bfa]';
        if (bgClass.includes('carbs')) return 'bg-[#36b4ff]';
        if (bgClass.includes('fat')) return 'bg-fat';
        return bgClass;
    };

    const parsedColor = getColorClass(color);

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex justify-between items-baseline">
                <span className="text-xs font-black text-zinc-300 uppercase tracking-wider">{label}</span>
                <div className="flex items-baseline gap-1 text-xs">
                    <span className="text-base font-black text-white">{Math.round(current)}{unit}</span>
                    <span className="text-zinc-400 font-bold">/ {goal}{unit}</span>
                </div>
            </div>
            <div className="h-3 w-full rounded-full bg-[#24252a] overflow-hidden border border-white/5">
                <div
                    className={cn('h-full rounded-full transition-all duration-700', parsedColor)}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="flex justify-between text-[11px] font-bold text-zinc-400">
                <span>{Math.round(pct)}% achieved</span>
                <span>{Math.round(remaining)}{unit} left</span>
            </div>
        </div>
    );
}
