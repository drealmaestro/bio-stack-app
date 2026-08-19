import { useState, useEffect } from 'react';
import { Delete } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface NumericKeypadProps {
    value: number;
    onChange: (val: number) => void;
    quickPills?: number[];
    className?: string;
}

export function NumericKeypad({
    value,
    onChange,
    quickPills = [0.5, 1, 2.5, 5],
    className
}: NumericKeypadProps) {
    const [displayStr, setDisplayStr] = useState<string>(value ? String(value) : '');

    useEffect(() => {
        setDisplayStr(value ? String(value) : '');
    }, [value]);

    const handleKeyPress = (key: string) => {
        let nextStr = displayStr;
        if (key === 'delete') {
            nextStr = displayStr.slice(0, -1);
        } else if (key === '.') {
            if (!displayStr.includes('.')) {
                nextStr = displayStr === '' ? '0.' : displayStr + '.';
            }
        } else {
            if (displayStr === '0') {
                nextStr = key;
            } else {
                nextStr = displayStr + key;
            }
        }

        setDisplayStr(nextStr);
        const parsed = parseFloat(nextStr);
        onChange(isNaN(parsed) ? 0 : parsed);
    };

    const handleQuickAdd = (increment: number) => {
        const currentNum = parseFloat(displayStr) || value || 0;
        const nextNum = Math.max(0, Math.round((currentNum + increment) * 100) / 100);
        setDisplayStr(String(nextNum));
        onChange(nextNum);
    };

    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'delete'];

    return (
        <div className={cn("w-full space-y-3", className)}>
            {/* Quick Add Weight Pills */}
            {quickPills.length > 0 && (
                <div className="flex gap-2 w-full">
                    {quickPills.map((pill) => (
                        <button
                            key={pill}
                            type="button"
                            onClick={() => handleQuickAdd(pill)}
                            className="flex-1 min-h-[44px] py-2 px-1 text-xs font-black text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-xl transition-all active:scale-95 tap-active flex items-center justify-center gap-0.5 shadow-sm cursor-pointer"
                        >
                            +{pill} <span className="text-[10px] opacity-75 font-normal">kg</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-2">
                {keys.map((k) => (
                    <button
                        key={k}
                        type="button"
                        onClick={() => handleKeyPress(k)}
                        aria-label={k === 'delete' ? 'Delete digit' : `Key ${k}`}
                        className="h-12 flex items-center justify-center text-lg font-mono font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 active:bg-primary/20 active:border-primary/50 rounded-2xl shadow-sm transition-all tap-active cursor-pointer"
                    >
                        {k === 'delete' ? <Delete className="w-5 h-5 text-zinc-400" /> : k}
                    </button>
                ))}
            </div>
        </div>
    );
}
