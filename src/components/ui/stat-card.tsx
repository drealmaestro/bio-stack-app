import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

interface StatCardProps {
    icon: ReactNode;
    value: string | number;
    unit?: string;
    label: string;
    color?: string;
    onClick?: () => void;
    className?: string;
}

export function StatCard({ icon, value, unit, label, color = 'text-primary', onClick, className }: StatCardProps) {
    // Dynamic styling helper to map visual status colors to background circles
    const getColors = (colorClass: string) => {
        if (colorClass.includes('emerald') || colorClass.includes('steps')) {
            return { bg: 'bg-[#3ccf94]/10', text: 'text-[#3ccf94]' };
        }
        if (colorClass.includes('orange') || colorClass.includes('fat') || colorClass.includes('warning')) {
            return { bg: 'bg-[#ff793f]/10', text: 'text-[#ff793f]' };
        }
        if (colorClass.includes('rose') || colorClass.includes('calories') || colorClass.includes('destructive')) {
            return { bg: 'bg-[#ff5975]/10', text: 'text-[#ff5975]' };
        }
        if (colorClass.includes('violet') || colorClass.includes('sleep') || colorClass.includes('purple')) {
            return { bg: 'bg-[#a78bfa]/10', text: 'text-[#a78bfa]' };
        }
        if (colorClass.includes('blue') || colorClass.includes('active') || colorClass.includes('carbs')) {
            return { bg: 'bg-[#36b4ff]/10', text: 'text-[#36b4ff]' };
        }
        return { bg: 'bg-primary/10', text: 'text-primary' };
    };

    const visual = getColors(color);

    return (
        <div
            onClick={onClick}
            className={cn(
                'bg-card border border-white/5 rounded-3xl p-5 flex flex-col justify-between min-h-[125px] transition-all duration-300 shadow-md',
                onClick ? 'cursor-pointer active:scale-95 hover:border-white/10 hover:bg-zinc-900/90' : '',
                className
            )}
        >
            <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', visual.bg, visual.text)}>
                    {icon}
                </div>
            </div>
            
            <div className="flex items-baseline gap-1 mt-4 leading-none">
                <span className={cn('text-2xl font-extrabold tracking-tight', visual.text)}>{value}</span>
                {unit && <span className="text-sm font-semibold text-zinc-500 lowercase">{unit}</span>}
            </div>
        </div>
    );
}
