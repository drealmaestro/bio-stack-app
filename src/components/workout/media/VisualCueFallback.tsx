import { useState } from 'react';
import type { Exercise, TargetMuscle } from '../../../types';
import { cn } from '../../../lib/utils';
import { ArrowDown, ArrowUp, CheckCircle2, Circle, Clock, Flame, Lightbulb, ShieldCheck } from 'lucide-react';

export interface VisualCueFallbackProps {
    exercise?: Exercise | null;
    targetMuscle?: TargetMuscle;
    compact?: boolean;
    className?: string;
    showChecklist?: boolean;
}

export function VisualCueFallback({
    exercise,
    targetMuscle: propMuscle,
    compact = false,
    className,
    showChecklist = true,
}: VisualCueFallbackProps) {
    const targetMuscle: TargetMuscle = (propMuscle || exercise?.target_muscle || 'Chest');
    const [checkedCues, setCheckedCues] = useState<Record<number, boolean>>({});

    const toggleCue = (idx: number) => {
        setCheckedCues(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const isTarget = (muscle: TargetMuscle) => targetMuscle === muscle;

    const getMuscleStyle = (muscle: TargetMuscle) => {
        const active = isTarget(muscle);
        return {
            fill: active ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
            stroke: active ? '#ffffff' : 'rgba(255, 255, 255, 0.15)',
            strokeWidth: active ? 2 : 1,
            filter: active ? 'drop-shadow(0px 0px 6px #10b981)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        };
    };

    const isPush = ['Chest', 'Shoulders', 'Triceps', 'Legs'].includes(targetMuscle);
    const tempoParts = exercise?.tempo ? exercise.tempo.split('-') : null;
    const eccSec = tempoParts && tempoParts.length === 4 ? `${tempoParts[0]}s` : '3s';
    const conSec = tempoParts && tempoParts.length === 4 ? `${tempoParts[2]}s` : '1s';

    return (
        <div
            data-testid="visual-cue-fallback"
            className={cn(
                "w-full bg-zinc-950/80 rounded-2xl border border-white/10 flex flex-col backdrop-blur-md",
                compact ? "p-2.5 gap-2" : "p-4 gap-3.5",
                className
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-black text-white tracking-wide uppercase flex items-center gap-1.5">
                        <Flame size={13} className="text-emerald-400" />
                        {exercise?.name || 'Exercise'} • <span className="text-emerald-400">{targetMuscle}</span>
                    </span>
                </div>
                {exercise?.tempo && (
                    <div
                        data-testid="tempo-badge"
                        className="flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full"
                    >
                        <Clock size={11} /> {exercise.tempo}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center bg-black/40 border border-white/5 rounded-xl p-2.5">
                <div className="flex justify-center w-full">
                    <svg
                        viewBox="0 0 320 185"
                        data-testid="target-muscle-highlight"
                        className={cn("w-full h-auto select-none overflow-visible", compact ? "max-w-[220px]" : "max-w-[280px]")}
                    >
                        <defs>
                            <linearGradient id="bodyBaseCue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1e1e24" />
                                <stop offset="100%" stopColor="#121216" />
                            </linearGradient>
                        </defs>
                        <text x="80" y="14" textAnchor="middle" fill="#71717a" fontSize="7" fontWeight="800" letterSpacing="1">FRONT</text>
                        <text x="240" y="14" textAnchor="middle" fill="#71717a" fontSize="7" fontWeight="800" letterSpacing="1">BACK</text>

                        <g id="cue-front">
                            <circle cx="80" cy="27" r="9" fill="url(#bodyBaseCue)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                            <rect x="77" y="36" width="6" height="5" fill="url(#bodyBaseCue)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                            <path d="M 62 42 C 60 46, 60 50, 65 53 L 69 43 Z" style={getMuscleStyle('Shoulders')} />
                            <path d="M 98 42 C 100 46, 100 50, 95 53 L 91 43 Z" style={getMuscleStyle('Shoulders')} />
                            <path d="M 69 43 L 79 43 L 79 57 L 69 53 Z" style={getMuscleStyle('Chest')} />
                            <path d="M 81 43 L 91 43 L 91 53 L 81 57 Z" style={getMuscleStyle('Chest')} />
                            <path d="M 57 52 C 55 58, 57 64, 62 66 L 65 54 Z" style={getMuscleStyle('Biceps')} />
                            <path d="M 103 52 C 105 58, 103 64, 98 66 L 95 54 Z" style={getMuscleStyle('Biceps')} />
                            <path d="M 53 68 C 50 76, 52 84, 56 90 L 60 69 Z" style={getMuscleStyle('Forearms')} />
                            <path d="M 107 68 C 110 76, 108 84, 104 90 L 100 69 Z" style={getMuscleStyle('Forearms')} />
                            <path d="M 70 59 L 90 59 L 87 86 L 73 86 Z" style={getMuscleStyle('Core')} />
                            <path d="M 68 90 L 78 90 L 76 134 L 66 134 Z" style={getMuscleStyle('Legs')} />
                            <path d="M 82 90 L 92 90 L 94 134 L 84 134 Z" style={getMuscleStyle('Legs')} />
                            <path d="M 65 138 L 74 138 L 72 174 L 67 174 Z" style={getMuscleStyle('Legs')} />
                            <path d="M 86 138 L 95 138 L 93 174 L 88 174 Z" style={getMuscleStyle('Legs')} />
                        </g>

                        <g id="cue-back">
                            <circle cx="240" cy="27" r="9" fill="url(#bodyBaseCue)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                            <rect x="237" y="36" width="6" height="5" fill="url(#bodyBaseCue)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                            <path d="M 226 42 L 254 42 L 250 78 L 230 78 Z" style={getMuscleStyle('Back')} />
                            <path d="M 222 42 C 220 46, 220 50, 225 53 L 226 42 Z" style={getMuscleStyle('Shoulders')} />
                            <path d="M 258 42 C 260 46, 260 50, 255 53 L 254 42 Z" style={getMuscleStyle('Shoulders')} />
                            <path d="M 216 52 C 214 59, 216 65, 221 67 L 224 53 Z" style={getMuscleStyle('Triceps')} />
                            <path d="M 264 52 C 266 59, 264 65, 259 67 L 256 53 Z" style={getMuscleStyle('Triceps')} />
                            <path d="M 212 69 C 209 77, 211 85, 215 91 L 219 70 Z" style={getMuscleStyle('Forearms')} />
                            <path d="M 268 69 C 271 77, 269 85, 265 91 L 261 70 Z" style={getMuscleStyle('Forearms')} />
                            <path d="M 228 81 L 252 81 L 250 102 L 230 102 Z" style={getMuscleStyle('Legs')} />
                            <path d="M 228 105 L 238 105 L 236 134 L 226 134 Z" style={getMuscleStyle('Legs')} />
                            <path d="M 242 105 L 252 105 L 254 134 L 244 134 Z" style={getMuscleStyle('Legs')} />
                            <path d="M 225 138 L 234 138 L 232 174 L 227 174 Z" style={getMuscleStyle('Legs')} />
                            <path d="M 246 138 L 255 138 L 253 174 L 248 174 Z" style={getMuscleStyle('Legs')} />
                        </g>
                    </svg>
                </div>

                <div className="flex sm:flex-col gap-2 justify-center shrink-0">
                    <div
                        data-testid="motion-arrow-eccentric"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400"
                    >
                        <ArrowDown size={14} className="animate-bounce" />
                        <div className="text-[10px]">
                            <span className="font-bold uppercase tracking-wider block">Eccentric ({eccSec})</span>
                            <span className="text-[9px] text-zinc-400">{isPush ? 'Control Descent' : 'Controlled Release'}</span>
                        </div>
                    </div>
                    <div
                        data-testid="motion-arrow-concentric"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    >
                        <ArrowUp size={14} className="animate-bounce" />
                        <div className="text-[10px]">
                            <span className="font-bold uppercase tracking-wider block">Concentric ({conSec})</span>
                            <span className="text-[9px] text-zinc-400">{isPush ? 'Explosive Drive' : 'Squeeze / Pull'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {showChecklist && exercise?.form_cues && exercise.form_cues.length > 0 && (
                <div data-testid="form-cue-checklist" className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        <ShieldCheck size={12} className="text-emerald-400" /> Form Cues
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                        {exercise.form_cues.slice(0, 3).map((cue, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => toggleCue(idx)}
                                className={cn(
                                    "flex items-center gap-2 p-1.5 rounded-lg text-left text-[11px] transition-all cursor-pointer border",
                                    checkedCues[idx]
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-zinc-200 line-through opacity-80"
                                        : "bg-white/[0.02] border-white/5 text-zinc-300 hover:border-white/10"
                                )}
                            >
                                {checkedCues[idx] ? (
                                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                                ) : (
                                    <Circle size={13} className="text-zinc-500 shrink-0" />
                                )}
                                <span className="truncate">{cue}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {exercise?.coach_tips && !compact && (
                <div className="text-[11px] text-zinc-300 font-medium bg-amber-500/5 border border-amber-500/15 rounded-xl p-2.5 flex items-start gap-2">
                    <Lightbulb size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    <span><strong className="text-amber-400">Coach Cue:</strong> {exercise.coach_tips}</span>
                </div>
            )}
        </div>
    );
}
