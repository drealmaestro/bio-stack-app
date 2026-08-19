import { MacroBar } from '../ui/macro-bar';

export interface MacroProgressBarProps {
    label: string;
    current: number;
    goal: number;
    unit?: string;
    color: string;
    className?: string;
}

export function MacroProgressBar({ label, current, goal, unit = 'g', color, className }: MacroProgressBarProps) {
    return (
        <MacroBar
            label={label}
            current={current}
            goal={goal}
            unit={unit}
            color={color}
            className={className}
        />
    );
}
