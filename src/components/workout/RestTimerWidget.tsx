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
                "absolute bottom-20 left-3 right-3 z-50 bg-[#1a1e26] border border-[#ccff00] shadow-[0_8px_32px_rgba(0,0,0,0.8),inset_0_0_12px_rgba(204,255,0,0.12)] rounded p-3 flex items-center justify-between cursor-pointer group transition-all duration-200 animate-in slide-in-from-bottom-2",
                className
            )}
        >
            {/* Left Section: Timer & Progress */}
            <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-10 h-10 rounded bg-[#14171d] border border-[#262b36] text-[#ccff00]">
                    <Timer size={18} className="animate-pulse" />
                    {/* Ring progress border effect */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#14171d"
                            strokeWidth="3"
                        />
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#ccff00"
                            strokeWidth="3"
                            strokeDasharray={`${restProgress * 100}, 100`}
                            className="transition-all duration-500"
                        />
                    </svg>
                </div>

                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#ccff00]">Resting</span>
                        <span className="text-[9px] text-[#8e95a5] font-mono flex items-center gap-0.5">
                            TAP TO VIEW <ArrowRight size={9} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                    </div>
                    <div className="text-xl font-display font-black text-white tabular-nums tracking-tight leading-none mt-0.5">
                        {formatTime(restSecondsRemaining)}
                    </div>
                </div>
            </div>

            {/* Right Section: Action Controls */}
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        addRestTime(30);
                    }}
                    className="stitch-btn-ghost px-2.5 py-1.5 text-[11px] min-h-[38px] flex items-center gap-1"
                    title="Add 30 seconds"
                    aria-label="Add 30 seconds to rest timer"
                >
                    <Plus size={11} />
                    <span>30s</span>
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        skipRest();
                    }}
                    className="stitch-btn-primary px-3 py-1.5 text-[11px] min-h-[38px] flex items-center gap-1 shadow-[0_0_10px_rgba(204,255,0,0.2)]"
                    title="Skip rest timer"
                    aria-label="Skip rest timer"
                >
                    <SkipForward size={11} />
                    <span>Skip</span>
                </button>
            </div>
        </div>
    );
}
