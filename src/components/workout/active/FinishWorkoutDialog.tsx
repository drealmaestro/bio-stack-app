import { Dialog } from "../../ui/dialog";
import { CheckCircle } from "lucide-react";

interface FinishWorkoutDialogProps {
    open: boolean;
    elapsedSeconds: number;
    completedSetsCount: number;
    formatTime: (secs: number) => string;
    onClose: () => void;
    onConfirmFinish: () => void;
}

export function FinishWorkoutDialog({
    open,
    elapsedSeconds,
    completedSetsCount,
    formatTime,
    onClose,
    onConfirmFinish
}: FinishWorkoutDialogProps) {
    return (
        <Dialog
            open={open}
            title="Finish workout"
            onClose={onClose}
            panelClassName="border-primary/30 space-y-5"
        >
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                    <CheckCircle size={24} className="text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-white">Finish Workout?</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Save this session to your history.</p>
                </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-1">
                <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Duration</span>
                    <span className="text-white font-bold">{formatTime(elapsedSeconds)}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Sets Completed</span>
                    <span className="text-white font-bold">{completedSetsCount}</span>
                </div>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-300 text-sm font-bold hover:bg-white/5 transition-colors"
                >
                    Keep Going
                </button>
                <button
                    onClick={onConfirmFinish}
                    className="flex-1 py-3 rounded-xl bg-primary text-black text-sm font-black hover:bg-primary/90 transition-colors"
                >
                    Finish & Save
                </button>
            </div>
        </Dialog>
    );
}
