import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

interface StatCardProps {
    icon: ReactNode;
    value: string | number;
    unit?: string;
    label: string;
    color?: string; // Tailwind text color class e.g. 'text-[#00D4FF]'
    onClick?: () => void;
    className?: string;
}

export function StatCard({ icon, value, unit, label, color = 'text-primary', onClick, className }: StatCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'insight-card cursor-pointer active:scale-95 transition-transform',
                onClick && 'hover:border-primary/30',
                className
            )}
        >
            <div className={cn('mb-1', color)}>{icon}</div>
            <div className="flex items-baseline gap-0.5 leading-none">
                <span className={cn('text-2xl font-black', color)}>{value}</span>
                {unit && <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>}
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</span>
        </div>
    );
}
