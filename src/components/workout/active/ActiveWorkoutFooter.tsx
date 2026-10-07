import { CheckCircle } from "lucide-react";

interface ActiveWorkoutFooterProps {
    onFinish: () => void;
}

export function ActiveWorkoutFooter({ onFinish }: ActiveWorkoutFooterProps) {
    return (
        <div className="w-full mt-6 pb-10 relative z-10">
            <button
                onClick={onFinish}
                className="w-full h-14 stitch-btn-primary text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.25)]"
            >
                <CheckCircle size={22} fill="#0d0f12" className="text-[#ccff00]" />
                <span>COMPLETE & LOG SESSION</span>
            </button>
        </div>
    );
}
