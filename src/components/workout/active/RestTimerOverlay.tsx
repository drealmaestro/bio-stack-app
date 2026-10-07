import { ProgressRing } from "../../ui/progress-ring";

interface RestTimerOverlayProps {
    isResting: boolean;
    restSecondsRemaining: number;
    restProgress: number;
    formatTime: (secs: number) => string;
    onAddRestTime: (seconds: number) => void;
    onSkipRest: () => void;
}

export function RestTimerOverlay({
    isResting,
    restSecondsRemaining,
    restProgress,
    formatTime,
    onAddRestTime,
    onSkipRest
}: RestTimerOverlayProps) {
    if (!isResting) return null;

    const isOvertime = restSecondsRemaining <= 0;

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed inset-0 z-60 bg-[#0d0f12]/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-200"
        >
            <div className="flex items-center gap-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping" />
                <span className="text-[#8e95a5] font-mono font-bold text-xs uppercase tracking-widest">
                    {isOvertime ? "Rest Overrun" : "Resting"}
                </span>
            </div>

            <ProgressRing
                size={220}
                strokeWidth={10}
                progress={restProgress}
                color={isOvertime ? "#ff3b30" : "#ccff00"}
                trackColor="#1a1e26"
            >
                <div className="flex flex-col items-center">
                    <span className="text-6xl font-display font-black text-white tabular-nums tracking-tight">
                        {formatTime(restSecondsRemaining)}
                    </span>
                    <span className="text-[10px] font-mono text-[#8e95a5] uppercase tracking-wider mt-1">
                        RECOVERY TELEMETRY
                    </span>
                </div>
            </ProgressRing>

            <div className="flex gap-3 mt-8">
                <button
                    onClick={() => onAddRestTime(30)}
                    className="stitch-btn-ghost px-6 py-3 text-sm min-h-[48px]"
                >
                    +30S REST
                </button>
                <button
                    onClick={onSkipRest}
                    className="stitch-btn-primary px-8 py-3 text-sm min-h-[48px] shadow-[0_0_15px_rgba(204,255,0,0.25)]"
                >
                    RESUME SET
                </button>
            </div>
        </div>
    );
}
