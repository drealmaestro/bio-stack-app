import { Dialog } from "../../ui/dialog";
import { ShieldAlert } from "lucide-react";

interface CancelWorkoutDialogProps {
    open: boolean;
    elapsedSeconds: number;
    completedSetsCount: number;
    formatTime: (secs: number) => string;
    onClose: () => void;
    onConfirmCancel: () => void;
}

export function CancelWorkoutDialog({
    open,
    elapsedSeconds,
    completedSetsCount,
    formatTime,
    onClose,
    onConfirmCancel
}: CancelWorkoutDialogProps) {
    return (
        <Dialog
            open={open}
            title="Cancel today's protocol"
            onClose={onClose}
            panelClassName="border-destructive/30 space-y-5"
        >
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center">
                    <ShieldAlert size={24} className="text-destructive" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-white">Cancel Today's Protocol?</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">All progress in this session will be lost.</p>
                </div>
            </div>
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3">
                <p className="text-xs text-zinc-300 leading-relaxed">
                    You've been training for <span className="text-white font-bold">{formatTime(elapsedSeconds)}</span> with{' '}
                    <span className="text-white font-bold">{completedSetsCount}</span> sets completed.
                    This data will not be saved.
                </p>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-primary text-black text-sm font-black hover:bg-primary/90 transition-colors"
                >
                    Keep Training
                </button>
                <button
                    onClick={onConfirmCancel}
                    className="flex-1 py-3 rounded-xl border border-destructive/40 text-destructive text-sm font-bold hover:bg-destructive/10 transition-colors"
                >
                    Cancel Session
                </button>
            </div>
        </Dialog>
    );
}
