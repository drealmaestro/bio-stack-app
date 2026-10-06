import { useState } from "react";
import { Maximize2, Play, Pause, HardDrive, Wifi, Sparkles, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { Exercise } from "../../../types";
import { useExerciseMedia } from "../../../hooks/useExerciseMedia";
import { VisualCueFallback } from "./VisualCueFallback";

export interface ExerciseMediaViewerProps {
    exercise: Exercise;
    compact?: boolean;
    autoPlay?: boolean;
    className?: string;
}

export function ExerciseMediaViewer({
    exercise,
    compact = false,
    autoPlay = true,
    className,
}: ExerciseMediaViewerProps) {
    const { mediaUrl, isCached, status } = useExerciseMedia(
        exercise.id,
        exercise.image_url || exercise.video_url
    );
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [imgError, setImgError] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const hasMedia = !!mediaUrl && !imgError && status !== "fallback";

    if (compact) {
        return (
            <div className={cn("flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5", className)}>
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center">
                        {hasMedia ? (
                            <img src={mediaUrl!} alt={exercise.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
                        ) : (
                            <Sparkles size={16} className="text-primary animate-pulse" />
                        )}
                    </div>
                    <div className="truncate">
                        <div className="text-xs font-black text-white truncate">{exercise.name}</div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-1 font-bold">
                            {isCached ? (
                                <span className="text-emerald-400 flex items-center gap-0.5"><HardDrive size={10} /> Offline Ready</span>
                            ) : (
                                <span className="text-zinc-500">Visual Cue</span>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    aria-label={`Expand media view for ${exercise.name}`}
                >
                    <Maximize2 size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className={cn("space-y-2", className)}>
            <div className="relative rounded-2xl overflow-hidden bg-zinc-950/80 border border-white/10 aspect-video shadow-md group">
                {hasMedia ? (
                    <>
                        <img
                            src={mediaUrl!}
                            alt={exercise.name}
                            className={cn("w-full h-full object-cover transition-opacity duration-300", !isPlaying && "opacity-70")}
                            onError={() => setImgError(true)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            {isCached ? (
                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 backdrop-blur-md">
                                    <HardDrive size={9} /> Cached
                                </span>
                            ) : (
                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1 backdrop-blur-md">
                                    <Wifi size={9} /> Streaming
                                </span>
                            )}
                        </div>
                        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-transform active:scale-95 cursor-pointer"
                                aria-label={isPlaying ? "Pause animation" : "Play animation"}
                            >
                                {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsExpanded(true)}
                                className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-transform active:scale-95 cursor-pointer"
                                aria-label="Fullscreen media preview"
                            >
                                <Maximize2 size={14} />
                            </button>
                        </div>
                    </>
                ) : (
                    <VisualCueFallback exercise={exercise} compact={false} />
                )}
            </div>

            {isExpanded && (
                <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                            <div>
                                <h3 className="text-lg font-black text-white">{exercise.name}</h3>
                                <div className="text-xs text-primary font-bold">{exercise.target_muscle} {exercise.tempo ? `• Tempo ${exercise.tempo}` : ""}</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsExpanded(false)}
                                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="rounded-2xl overflow-hidden aspect-video bg-black/60 border border-white/5 relative">
                            {hasMedia ? (
                                <img src={mediaUrl!} alt={exercise.name} className="w-full h-full object-cover" />
                            ) : (
                                <VisualCueFallback exercise={exercise} compact={false} />
                            )}
                        </div>
                        {exercise.instructions && (
                            <p className="text-xs text-zinc-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">{exercise.instructions}</p>
                        )}
                        {exercise.form_cues && exercise.form_cues.length > 0 && (
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Key Form Cues</span>
                                <div className="space-y-1">
                                    {exercise.form_cues.map((cue, i) => (
                                        <div key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                                            <span className="text-primary font-black">•</span>
                                            <span>{cue}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
