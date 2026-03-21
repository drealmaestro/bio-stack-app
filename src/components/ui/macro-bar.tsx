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

    return (
        <div className={cn('space-y-1.5', className)}>
            <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-white uppercase tracking-wider">{label}</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-sm font-black text-white">{Math.round(current)}</span>
                    <span className="text-xs text-muted-foreground">/ {goal}{unit}</span>
                </div>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                    className={cn('h-full rounded-full transition-all duration-700', color)}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="text-[10px] text-muted-foreground">{Math.round(remaining)}{unit} remaining</div>
        </div>
    );
}
