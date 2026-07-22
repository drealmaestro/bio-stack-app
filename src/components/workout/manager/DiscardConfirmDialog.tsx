import { Button } from "../../ui/button";
import { AlertTriangle } from "lucide-react";

interface DiscardConfirmDialogProps {
    open: boolean;
    onDiscard: () => void;
    onKeepEditing: () => void;
}

export function DiscardConfirmDialog({ open, onDiscard, onKeepEditing }: DiscardConfirmDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 mx-4 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center">
                        <AlertTriangle size={20} className="text-orange-400" />
                    </div>
                    <div>
                        <h3 className="font-black text-white">Discard Changes?</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">Your unsaved edits will be lost.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={onDiscard}
                        variant="outline"
                        className="flex-1 border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
                    >
                        Discard
                    </Button>
                    <Button
                        onClick={onKeepEditing}
                        className="flex-1 bg-primary text-black"
                    >
                        Keep Editing
                    </Button>
                </div>
            </div>
        </div>
    );
}
