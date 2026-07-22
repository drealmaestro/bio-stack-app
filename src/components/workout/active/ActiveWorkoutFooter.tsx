import { Button } from "../../ui/button";
import { CheckCircle } from "lucide-react";

interface ActiveWorkoutFooterProps {
    onFinish: () => void;
}

export function ActiveWorkoutFooter({ onFinish }: ActiveWorkoutFooterProps) {
    return (
        <div className="w-full mt-8 px-1 pb-12 relative z-10">
            <Button
                onClick={onFinish}
                className="w-full h-14 rounded-3xl font-black text-base tracking-wider bg-primary hover:bg-primary/90 text-black hover:scale-[1.01] transition-transform active:scale-95 shadow-lg shadow-primary/20 uppercase"
            >
                <CheckCircle className="mr-2" size={20} /> FINISH WORKOUT
            </Button>
        </div>
    );
}
