import { Button } from "../../ui/button";

interface ActiveWorkoutHeaderProps {
    templateName: string;
    elapsedSeconds: number;
    formatTime: (secs: number) => string;
    onCancel: () => void;
}

export function ActiveWorkoutHeader({
    templateName,
    elapsedSeconds,
    formatTime,
    onCancel
}: ActiveWorkoutHeaderProps) {
    return (
        <div className="bg-card border border-white/5 rounded-3xl p-5 mb-6 flex justify-between items-center shadow-md relative z-10">
            <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-0.5">{templateName}</span>
                <div className="text-3xl font-extrabold text-white font-mono tracking-tighter tabular-nums leading-none">
                    {formatTime(elapsedSeconds)}
                </div>
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-destructive h-auto py-1.5 px-3.5 bg-destructive/10 hover:bg-destructive/20 rounded-full text-xs font-extrabold uppercase tracking-widest border border-destructive/10"
            >
                Cancel
            </Button>
        </div>
    );
}
