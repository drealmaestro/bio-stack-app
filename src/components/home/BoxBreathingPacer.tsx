import { useEffect, useState } from "react";
import { Brain } from "lucide-react";
import { cn } from "../../lib/utils";

type BreathPhase = "Idle" | "Inhale" | "Hold" | "Exhale" | "Hold Ex";

export function BoxBreathingPacer() {
    const [isBreathing, setIsBreathing] = useState(false);
    const [breathPhase, setBreathPhase] = useState<BreathPhase>("Idle");
    const [breathSeconds, setBreathSeconds] = useState(0);

    useEffect(() => {
        if (!isBreathing) {
            setBreathPhase("Idle");
            return;
        }
        setBreathPhase("Inhale");
        setBreathSeconds(4);

        let currentSeconds = 4;
        let currentPhase: BreathPhase = "Inhale";

        const interval = setInterval(() => {
            currentSeconds--;
            if (currentSeconds <= 0) {
                currentPhase =
                    currentPhase === "Inhale" ? "Hold" :
                    currentPhase === "Hold" ? "Exhale" :
                    currentPhase === "Exhale" ? "Hold Ex" : "Inhale";
                currentSeconds = 4;
                setBreathPhase(currentPhase);
                navigator.vibrate?.(40);
            }
            setBreathSeconds(currentSeconds);
        }, 1000);

        return () => clearInterval(interval);
    }, [isBreathing]);

    const getPhaseInstruction = () => {
        switch (breathPhase) {
            case "Inhale": return "Breathe in deeply through your nose...";
            case "Hold": return "Hold your breath gently at the top...";
            case "Exhale": return "Release slowly through your mouth...";
            case "Hold Ex": return "Hold empty lungs before the next breath...";
            default: return "A simple 4-4-4-4 cycle to reset your autonomic nervous system.";
        }
    };

    return (
        <div className="bg-card border border-white/5 p-5 rounded-3xl space-y-4 shadow-md">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Brain size={16} />
                    </div>
                    <span className="text-xs font-black text-white">Box Breathing Pacer</span>
                </div>
                {isBreathing && (
                    <span className="text-[10px] font-black text-primary animate-pulse bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        {breathPhase} ({breathSeconds}s)
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between bg-black/25 p-4 rounded-2xl border border-white/5 gap-3">
                <div className="space-y-1 flex-1">
                    <p className="text-xs font-bold text-white leading-snug">
                        {getPhaseInstruction()}
                    </p>
                    <span className="text-[10px] text-zinc-500 font-medium block">
                        4s Inhale · 4s Hold · 4s Exhale · 4s Hold
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setIsBreathing(!isBreathing);
                        navigator.vibrate?.(30);
                    }}
                    className={cn(
                        "px-5 py-2.5 text-xs font-black rounded-xl transition-all tap-active cursor-pointer shrink-0 min-h-[44px]",
                        isBreathing
                            ? "bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25"
                            : "bg-primary text-black hover:bg-primary/90 shadow-md shadow-primary/15"
                    )}
                >
                    {isBreathing ? "Stop" : "Begin Pacer"}
                </button>
            </div>
        </div>
    );
}
