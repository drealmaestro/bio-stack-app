import { Button } from "../../ui/button";
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

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed inset-0 z-60 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300"
        >
            <div className="text-zinc-400 font-bold uppercase tracking-widest mb-8">Resting</div>

            <ProgressRing
                size={200}
                strokeWidth={8}
                progress={restProgress}
                color="#3ccf94"
                trackColor="rgba(255,255,255,0.03)"
            >
                <div className="flex flex-col items-center">
                    <span className="text-5xl font-extrabold text-primary font-mono tabular-nums tracking-tighter">
                        {formatTime(restSecondsRemaining)}
                    </span>
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">remaining</span>
                </div>
            </ProgressRing>

            <div className="flex gap-4 mt-8">
                <Button
                    variant="outline"
                    onClick={() => onAddRestTime(30)}
                    className="rounded-full h-12 px-6 border-white/20 text-white hover:bg-white/10"
                >
                    +30s
                </Button>
                <Button
                    onClick={onSkipRest}
                    className="rounded-full h-12 px-8 bg-white text-black hover:bg-zinc-200 font-bold"
                >
                    SKIP
                </Button>
            </div>
        </div>
    );
}
