import { useState } from "react";
import { ChevronDown, ChevronUp, Video } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { Exercise } from "../../../types";
import { ExerciseMediaViewer } from "../media/ExerciseMediaViewer";

export interface ExerciseCardMediaDrawerProps {
    exercise: Exercise;
    initiallyExpanded?: boolean;
    className?: string;
}

export function ExerciseCardMediaDrawer({
    exercise,
    initiallyExpanded = false,
    className,
}: ExerciseCardMediaDrawerProps) {
    const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

    return (
        <div className={cn("mx-1", className)}>
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-2xl border text-xs font-bold transition-all min-h-[44px] cursor-pointer",
                    isExpanded
                        ? "bg-white/[0.04] border-white/10 text-white"
                        : "bg-white/[0.01] border-white/5 text-zinc-400 [&:hover]:text-zinc-200 [&:hover]:bg-white/[0.03] [&:active]:scale-[0.99]"
                )}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? `Hide visual guide for ${exercise.name}` : `Show visual guide for ${exercise.name}`}
            >
                <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Video size={13} />
                    </span>
                    <span className="font-semibold text-zinc-300">Exercise Form & Animation</span>
                    {exercise.form_cues && exercise.form_cues.length > 0 && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                            {exercise.form_cues.length} Cues
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                    <span className="text-[10px] font-medium">{isExpanded ? "Hide" : "View"}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
            </button>

            {isExpanded && (
                <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                    <ExerciseMediaViewer
                        exercise={exercise}
                        autoPlay={true}
                    />
                </div>
            )}
        </div>
    );
}
