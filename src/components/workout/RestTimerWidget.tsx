import { useNavigate } from 'react-router-dom';
import { useRestTimer } from '../../hooks/useRestTimer';
import { Timer, Plus, SkipForward, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RestTimerWidgetProps {
    className?: string;
}

export function RestTimerWidget({ className }: RestTimerWidgetProps) {
    const { isResting, restSecondsRemaining, restProgress, addRestTime, skipRest } = useRestTimer();
    const navigate = useNavigate();

    if (!isResting || restSecondsRemaining <= 0) {
        return null;
    }

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleWidgetClick = () => {
        navigate('/active');
    };

    return (
        <div
            onClick={handleWidgetClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleWidgetClick(); }}
            className={cn(
                "absolute bottom-24 left-4 right-4 z-50 bg-slate-900/90 backdrop-blur-xl border border-primary/30 shadow-[0_12px_40px_rgba(0,0,0,0.8)] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer group hover:border-primary/50 transition-all duration-300 animate-in slide-in-from-bottom-4",
                className
            )}
        >
            {/* Left Section: Timer & Progress */}
            <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 text-primary group-hover:scale-105 transition-transform">
                    <Timer size={20} className="animate-pulse" />
                    {/* Ring progress border effect */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="rgba(60,207,148,0.2)"
                            strokeWidth="3"
                        />
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#3ccf94"
                            strokeWidth="3"
                            strokeDasharray={`${restProgress * 100}, 100`}
                            className="transition-all duration-500"
                        />
                    </svg>
                </div>

                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary">Resting</span>
                        <span className="text-[9px] text-zinc-400 font-bold flex items-center gap-0.5">
                            Tap for workout <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                    </div>
                    <div className="text-lg font-black text-white font-mono tracking-tight leading-none mt-0.5">
                        {formatTime(restSecondsRemaining)}
                    </div>
                </div>
            </div>

            {/* Right Section: Action Controls */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        addRestTime(30);
                    }}
                    className="flex items-center justify-center gap-1 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-black text-xs px-3 py-2 rounded-xl border border-white/10 transition-all min-h-[44px] min-w-[44px] cursor-pointer"
                    title="Add 30 seconds"
                    aria-label="Add 30 seconds to rest timer"
                >
                    <Plus size={12} />
                    <span>30s</span>
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        skipRest();
                    }}
                    className="flex items-center justify-center gap-1 bg-primary/20 hover:bg-primary/30 active:scale-95 text-primary font-black text-xs px-3.5 py-2 rounded-xl border border-primary/30 transition-all min-h-[44px] min-w-[44px] cursor-pointer"
                    title="Skip rest timer"
                    aria-label="Skip rest timer"
                >
                    <SkipForward size={12} />
                    <span>Skip</span>
                </button>
            </div>
        </div>
    );
}
