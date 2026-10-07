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
        <div className="stitch-card-2 p-4 mb-4 flex justify-between items-center border-[#343b4a] relative z-10">
            <div>
                <span className="text-[10px] font-mono font-bold text-[#ccff00] uppercase tracking-widest block mb-0.5">
                    {templateName}
                </span>
                <div className="text-4xl font-display font-black text-white tracking-tight tabular-nums leading-none">
                    {formatTime(elapsedSeconds)}
                </div>
            </div>

            <button
                type="button"
                onClick={onCancel}
                className="stitch-btn-ghost text-xs py-1.5 px-3 text-[#ff3b30] border-[#ff3b30]/30 hover:border-[#ff3b30] hover:text-[#ff3b30]"
            >
                ABORT
            </button>
        </div>
    );
}
