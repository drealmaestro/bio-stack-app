import { Dumbbell, Shield, Footprints, Flame, Zap, User, Activity } from "lucide-react";
import type { TargetMuscle } from "../types";

export function getMuscleIcon(muscle: TargetMuscle, size = 14, className = "") {
    switch (muscle) {
        case 'Chest':
            return <Shield size={size} className={className} />;
        case 'Back':
            return <User size={size} className={className} />;
        case 'Legs':
            return <Footprints size={size} className={className} />;
        case 'Biceps':
        case 'Triceps':
        case 'Forearms':
            return <Dumbbell size={size} className={className} />;
        case 'Shoulders':
            return <Activity size={size} className={className} />;
        case 'Core':
            return <Flame size={size} className={className} />;
        default:
            return <Zap size={size} className={className} />;
    }
}
