import { useState, useEffect, useRef, useMemo } from "react";
import { useStore } from "../store/useStore";
import { Button } from "../components/ui/button";
import { getMuscleIcon } from "../lib/muscleIcons";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ProgressRing } from "../components/ui/progress-ring";
import { Dialog } from "../components/ui/dialog";
import { Play, CheckCircle, Check, ShieldAlert, Trophy, Clock, TrendingUp } from "lucide-react";
import { nanoid } from "nanoid";
import confetti from "canvas-confetti";
import type { SetLog } from "../types";
import { cn, getTempoBreakdown } from "../lib/utils";

// Helper component for counting animation
function AnimatedNumber({ value, formatter }: { value: number, formatter?: (val: number) => string | number }) {
    const [display, setDisplay] = useState(0);
    
    useEffect(() => {
        let startTime: number;
        const duration = 1500;
        
        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            // Ease out quart
            const easeOut = 1 - Math.pow(1 - progress, 4);
            setDisplay(value * easeOut);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setDisplay(value);
            }
        };
        
        requestAnimationFrame(animate);
    }, [value]);
    
    return <>{formatter ? formatter(display) : Math.round(display)}</>;
}

export function ActiveWorkout() {
    const {
        templates, exercises, logs, addLog,
        activeWorkout, startWorkout, cancelWorkout,
        toggleSetComplete, updateSetWeight, updateSetReps, updateSetRpe,
        addRestTime, skipRest
    } = useStore();

    // Local tick state for UI updates only
    const [now, setNow] = useState(Date.now());
    // H2: Cancel session confirmation state
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    // Finish workout confirmation state
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);
    // Post-workout summary state
    const [showSummary, setShowSummary] = useState(false);
    const [summaryData, setSummaryData] = useState<{ durationSecs: number; sets: number; volume: number; prs: string[] } | null>(null);
    // H3: Store original rest duration so we can compute ring progress
    const originalRestRef = useRef<number>(0);
    // Coach strategy collapsible state
    const [showStrategy, setShowStrategy] = useState(true);
    const [expandedTempo, setExpandedTempo] = useState<string | null>(null);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Warn before closing tab/browser during active session
    useEffect(() => {
        if (!activeWorkout) return;
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [activeWorkout]);

    const activeTemplate = activeWorkout ? templates.find(t => t.id === activeWorkout.templateId) : null;
    const elapsedSeconds = activeWorkout ? Math.floor((now - activeWorkout.startTime) / 1000) : 0;

    // Derived Rest State
    const isResting = activeWorkout?.restEndTime ? activeWorkout.restEndTime > now : false;
    const restSecondsRemaining = isResting && activeWorkout?.restEndTime
        ? Math.ceil((activeWorkout.restEndTime - now) / 1000)
        : 0;

    // Track original rest duration when rest timer starts
    useEffect(() => {
        if (isResting && activeWorkout?.restEndTime) {
            // Only reset when a new rest period starts or duration increased
            if (restSecondsRemaining > originalRestRef.current || originalRestRef.current === 0) {
                originalRestRef.current = restSecondsRemaining;
            }
        } else {
            originalRestRef.current = 0;
        }
    }, [isResting, activeWorkout?.restEndTime]);

    const restProgress = originalRestRef.current > 0
        ? restSecondsRemaining / originalRestRef.current
        : 1;

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getExerciseName = (id: string) => exercises.find(e => e.id === id)?.name || "Unknown";

    // LAST SESSION CARRY-FORWARD: lookup previous data for this template
    const lastSessionData = useMemo(() => {
        if (!activeWorkout) return null;
        const previousLogs = logs
            .filter(l => l.template_id === activeWorkout.templateId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (!previousLogs.length) return null;
        const lastLog = previousLogs[0];
        // Build a map: exercise_id -> { setNumber -> { weight, reps } }
        const map: Record<string, Record<number, { weight: number; reps: number }>> = {};
        lastLog.completed_exercises.forEach(set => {
            if (!map[set.exercise_id]) map[set.exercise_id] = {};
            map[set.exercise_id][set.set_number] = { weight: set.weight_kg, reps: set.reps_completed };
        });
        return map;
    }, [activeWorkout?.templateId, logs]);

    // PR map: best weight per exercise across all history
    const prMap = useMemo(() => {
        const map: Record<string, number> = {};
        logs.forEach(log => {
            log.completed_exercises.forEach(set => {
                if (!map[set.exercise_id] || set.weight_kg > map[set.exercise_id]) {
                    map[set.exercise_id] = set.weight_kg;
                }
            });
        });
        return map;
    }, [logs]);

    const handleFinish = () => {
        if (!activeWorkout || !activeTemplate) return;

        const duration = (Date.now() - activeWorkout.startTime) / 1000;

        const completedLog: SetLog[] = [];
        activeTemplate.exercises.forEach((ex, exIdx) => {
            for (let i = 1; i <= ex.target_sets; i++) {
                const key = `${exIdx}-${i}`;
                const isCompleted = activeWorkout.completedSets.includes(key);
                const weight = activeWorkout.setWeights[key] || 0;
                const reps = activeWorkout.setReps[key] ?? ex.target_reps;

                if (isCompleted || weight > 0) {
                    const rpe = activeWorkout.setRpes?.[key];
                    completedLog.push({
                        exercise_id: ex.exercise_id,
                        set_number: i,
                        reps_completed: reps,
                        weight_kg: weight,
                        rpe: rpe || undefined
                    });
                }
            }
        });

        // Detect new PRs
        const newPRs: string[] = [];
        completedLog.forEach(set => {
            const prevBest = prMap[set.exercise_id] ?? 0;
            if (set.weight_kg > prevBest && set.weight_kg > 0) {
                const name = getExerciseName(set.exercise_id);
                const prLabel = `${name}: ${set.weight_kg}kg x ${set.reps_completed}`;
                if (!newPRs.includes(prLabel)) newPRs.push(prLabel);
            }
        });

        const totalVolume = completedLog.reduce((sum, s) => sum + (s.weight_kg * s.reps_completed), 0);

        addLog({
            id: nanoid(),
            template_id: activeWorkout.templateId,
            timestamp: new Date().toISOString(),
            duration_seconds: duration,
            completed_exercises: completedLog
        });

        // Show summary before clearing workout
        setSummaryData({
            durationSecs: duration,
            sets: completedLog.length,
            volume: Math.round(totalVolume),
            prs: newPRs,
        });
        setShowSummary(true);
        cancelWorkout();
        
        // Trigger confetti
        setTimeout(() => {
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
            
            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
            
            const interval = setInterval(function() {
                const particleCount = 50;
                // since particles fall down, start a bit higher than random
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);
            
            setTimeout(() => clearInterval(interval), 1500);
        }, 300);
    };

    // --- POST-WORKOUT SUMMARY SCREEN ---
    if (showSummary && summaryData) {
        return (
            <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 ring-2 ring-primary/30">
                    <Trophy size={40} className="text-primary" />
                </div>
                <h2 className="text-3xl font-black text-white mb-1">Workout Complete!</h2>
                <p className="text-zinc-400 mb-8">Great session. Here's how you did.</p>

                <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-6">
                    <div className="glass-card p-4 rounded-2xl text-center">
                        <Clock size={18} className="mx-auto text-primary mb-1" />
                        <div className="text-xl font-black text-white">
                            <AnimatedNumber 
                                value={summaryData.durationSecs} 
                                formatter={(val) => formatTime(Math.floor(val))} 
                            />
                        </div>
                        <div className="text-xs text-zinc-400">Duration</div>
                    </div>
                    <div className="glass-card p-4 rounded-2xl text-center">
                        <Check size={18} className="mx-auto text-primary mb-1" />
                        <div className="text-xl font-black text-white">
                            <AnimatedNumber value={summaryData.sets} />
                        </div>
                        <div className="text-xs text-zinc-400">Sets</div>
                    </div>
                    <div className="glass-card p-4 rounded-2xl text-center">
                        <TrendingUp size={18} className="mx-auto text-primary mb-1" />
                        <div className="text-xl font-black text-white">
                            <AnimatedNumber 
                                value={summaryData.volume} 
                                formatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}t` : `${Math.round(val)}kg`} 
                            />
                        </div>
                        <div className="text-xs text-zinc-400">Volume</div>
                    </div>
                </div>

                {summaryData.prs.length > 0 && (
                    <div className="w-full max-w-sm glass-card p-4 rounded-2xl border border-primary/30 bg-primary/5 mb-6">
                        <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center justify-center gap-1">
                            <Trophy size={12} /> New Personal Records
                        </div>
                        {summaryData.prs.map((pr, i) => (
                            <div key={i} className="text-sm text-white font-bold py-1">
                                {pr}
                            </div>
                        ))}
                    </div>
                )}

                <Button
                    onClick={() => { setShowSummary(false); setSummaryData(null); }}
                    className="w-full max-w-sm h-14 rounded-2xl font-black text-lg bg-primary text-black"
                >
                    Done
                </Button>
            </div>
        );
    }

    // --- TEMPLATE SELECTION SCREEN ---
    if (!activeWorkout || !activeTemplate) {
        return (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
                <div className="text-center py-8">
                    <div className="w-24 h-24 bg-linear-to-br from-primary/20 to-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse ring-1 ring-primary/30">
                        <Play size={48} className="text-primary ml-1" fill="currentColor" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">Ready to Train?</h2>
                    <p className="text-zinc-400 font-medium">Select a routine to start tracking.</p>
                </div>

                <div className="space-y-3">
                    {templates.length === 0 ? (
                        <div className="glass-card p-6 rounded-2xl text-center border border-dashed border-white/10">
                            <p className="text-sm text-zinc-400 mb-4">No routines available yet.</p>
                            <Button className="bg-primary text-black font-black" onClick={() => window.location.assign('/workouts')}>
                                Create Routine
                            </Button>
                        </div>
                    ) : templates.map(template => (
                        <button
                            key={template.id}
                            onClick={() => startWorkout(template.id)}
                            className="w-full text-left glass-card p-4 rounded-xl flex justify-between items-center cursor-pointer group active:scale-95 transition-all"
                        >
                            <div>
                                <div className="font-bold text-lg text-white group-hover:text-primary transition-colors">{template.name}</div>
                                <div className="text-xs text-zinc-400 font-medium">{template.exercises.length} Exercises</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                                <Play size={20} fill="currentColor" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // --- ACTIVE WORKOUT SCREEN ---
    return (
        <div className="animate-in slide-in-from-bottom-10 duration-500 relative pb-32">
            {/* Header / Timer */}
            <div className="bg-card border border-white/5 rounded-3xl p-5 mb-6 flex justify-between items-center shadow-md relative z-10">
                <div>
                    <span className="text-[10px] font-black text-[#3ccf94] uppercase tracking-widest block mb-0.5">{activeTemplate.name}</span>
                    <div className="text-3xl font-extrabold text-white font-mono tracking-tighter tabular-nums leading-none">
                        {formatTime(elapsedSeconds)}
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-[#ff3b30] h-auto py-1.5 px-3.5 bg-[#ff3b30]/10 hover:bg-[#ff3b30]/20 rounded-full text-xs font-extrabold uppercase tracking-widest border border-[#ff3b30]/10"
                >
                    Cancel
                </Button>
            </div>

            {/* Coach's Day Strategy */}
            {(activeTemplate.description || activeTemplate.coach_notes) && (
                <div className="bg-[#3ccf94]/5 border border-[#3ccf94]/10 rounded-3xl p-4.5 mb-5 space-y-2 animate-in slide-in-from-top-3 duration-300">
                    <button 
                        onClick={() => setShowStrategy(!showStrategy)}
                        className="w-full flex justify-between items-center text-left"
                    >
                        <span className="text-[10px] font-black text-[#3ccf94] uppercase tracking-widest flex items-center gap-1.5">
                            💡 Coach's Strategy
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors">
                            {showStrategy ? "Hide Strategy" : "Show Strategy"}
                        </span>
                    </button>
                    {showStrategy && (
                        <div className="space-y-2 animate-in fade-in duration-200">
                            {activeTemplate.description && (
                                <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                                    {activeTemplate.description}
                                </p>
                            )}
                            {activeTemplate.coach_notes && (
                                <p className="text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-2">
                                    {activeTemplate.coach_notes}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-6">
                {activeTemplate.exercises.map((exercise, index) => {
                    const lastExData = lastSessionData?.[exercise.exercise_id];
                    const exData = exercises.find(e => e.id === exercise.exercise_id);
                    const muscle = exData?.target_muscle || 'Other';
                    const intensity = exData?.intensity_level;

                    return (
                    <div key={exercise.exercise_id} className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                                <span className="text-[#3ccf94] bg-[#3ccf94]/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                                    {getMuscleIcon(muscle, 12)}
                                </span>
                                <span className="truncate">{getExerciseName(exercise.exercise_id)}</span>
                                {intensity && (
                                    <span className={cn(
                                        "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0",
                                        intensity === 'Heavy' ? "bg-red-500/10 text-red-400 border border-red-500/15" :
                                        intensity === 'Moderate' ? "bg-blue-500/10 text-blue-400 border border-blue-500/15" :
                                        "bg-green-500/10 text-green-400 border border-green-500/15"
                                    )}>
                                        {intensity}
                                    </span>
                                )}
                            </h3>
                            <span className="text-[10px] font-bold text-[#3ccf94] bg-[#3ccf94]/10 px-2 py-0.5 rounded-full">
                                {exercise.rest_seconds}s Rest
                            </span>
                        </div>

                        {/* Coach Tip / Tempo Row */}
                        {(exData?.tempo || exData?.coach_tips) && (
                            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3 flex flex-col gap-1.5 text-[11px] mx-1">
                                {exData.tempo && (() => {
                                    const isTempoExpanded = expandedTempo === exercise.exercise_id;
                                    const breakdown = getTempoBreakdown(exData.tempo, muscle);
                                    return (
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => setExpandedTempo(isTempoExpanded ? null : exercise.exercise_id)}
                                                className="text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                                            >
                                                <span className="font-bold text-zinc-400 uppercase tracking-wider">Tempo:</span> 
                                                <span className="font-mono underline decoration-dashed decoration-zinc-600 underline-offset-2">{exData.tempo}</span>
                                                <span className="text-[8px] text-[#3ccf94] bg-[#3ccf94]/10 px-1 py-0.2 rounded font-black scale-90 ml-0.5">Guide</span>
                                            </button>
                                            {isTempoExpanded && breakdown && (
                                                <div className="mt-1.5 p-2 bg-black/60 border border-white/5 rounded-xl space-y-0.5 text-[9px] text-zinc-400 animate-in slide-in-from-top-1 duration-150">
                                                    {breakdown.map((b, i) => (
                                                        <div key={i} className="flex justify-between items-center py-0.5 border-b border-white/5 last:border-0 last:pb-0">
                                                            <span className="font-semibold text-zinc-500">{b.label}</span>
                                                            <span className="text-right text-zinc-300">
                                                                <span className="font-mono font-bold text-primary mr-1">{b.sec}s</span>
                                                                <span className="text-zinc-500">({b.desc})</span>
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                                {exData.coach_tips && (
                                    <div className="text-zinc-300 font-medium">
                                        <span className="text-[#3ccf94] font-bold">💡 Tip:</span> {exData.coach_tips}
                                    </div>
                                )}
                            </div>
                        )}

                        <Card className="bg-card border border-white/5 rounded-3xl overflow-hidden shadow-sm">
                            <CardContent className="p-0">
                                 {/* Header Row */}
                                <div className="grid grid-cols-[2.5rem_1.1fr_1.1fr_1.1fr_3rem] gap-1.5 px-3 py-3 bg-white/[0.02] text-[10px] items-center text-zinc-500 font-extrabold uppercase tracking-widest text-center border-b border-white/5">
                                    <div>Set</div>
                                    <div>kg</div>
                                    <div>Reps</div>
                                    <div>RPE</div>
                                    <div>Done</div>
                                </div>

                                {Array.from({ length: exercise.target_sets }).map((_, setIdx) => {
                                    const setNum = setIdx + 1;
                                    const key = `${index}-${setNum}`;
                                    const isCompleted = activeWorkout.completedSets.includes(key);
                                    const lastSet = lastExData?.[setNum];
                                    const currentWeight = activeWorkout.setWeights[key] || 0;
                                    const currentReps = activeWorkout.setReps?.[key] ?? exercise.target_reps;
                                    const currentRpe = activeWorkout.setRpes?.[key] || 0;
                                    const weightPlaceholder = lastSet ? String(lastSet.weight) : '0';

                                    return (
                                        <div key={setNum} className={cn(
                                            "grid grid-cols-[2.5rem_1.1fr_1.1fr_1.1fr_3rem] gap-1.5 px-3 py-2 items-center border-t border-white/5 transition-colors",
                                            isCompleted ? "bg-[#3ccf94]/5" : ""
                                        )}>
                                            {/* Set number */}
                                            <div className="flex flex-col items-center">
                                                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-xs font-bold text-zinc-400">
                                                    {setNum}
                                                </div>
                                                {lastSet && (
                                                    <span className="text-[8px] text-zinc-600 mt-0.5 leading-none">
                                                        {lastSet.weight}x{lastSet.reps}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Weight */}
                                            <div>
                                                <Input
                                                    type="number"
                                                    inputMode="decimal"
                                                    aria-label={`${getExerciseName(exercise.exercise_id)} set ${setNum} weight in kilograms`}
                                                    placeholder={weightPlaceholder}
                                                    min={0}
                                                    step={0.5}
                                                    value={currentWeight || ''}
                                                    className="h-11 text-center bg-black/30 border-white/5 focus:border-[#3ccf94] text-white font-mono text-sm font-bold rounded-xl"
                                                    onChange={(e) => updateSetWeight(index, setNum, Math.max(0, parseFloat(e.target.value) || 0))}
                                                />
                                            </div>

                                            {/* Reps */}
                                            <div>
                                                <Input
                                                    type="number"
                                                    inputMode="numeric"
                                                    aria-label={`${getExerciseName(exercise.exercise_id)} set ${setNum} reps`}
                                                    placeholder={String(exercise.target_reps)}
                                                    min={0}
                                                    max={999}
                                                    value={currentReps === exercise.target_reps && !(key in (activeWorkout.setReps || {})) ? '' : currentReps}
                                                    className="h-11 text-center bg-black/30 border-white/5 focus:border-[#3ccf94] text-white font-mono text-sm font-bold rounded-xl"
                                                    onChange={(e) => updateSetReps(index, setNum, Math.max(0, parseInt(e.target.value) || exercise.target_reps))}
                                                />
                                            </div>

                                            {/* RPE */}
                                            <div>
                                                <select
                                                    aria-label={`${getExerciseName(exercise.exercise_id)} set ${setNum} RPE`}
                                                    value={currentRpe || ''}
                                                    onChange={(e) => updateSetRpe(index, setNum, parseFloat(e.target.value) || 0)}
                                                    className="w-full h-11 text-center bg-black/30 border border-white/5 focus:border-[#3ccf94] text-white font-mono text-xs font-bold rounded-xl outline-none transition-colors cursor-pointer appearance-none px-1"
                                                >
                                                    <option value="" className="bg-[#18181c] text-zinc-500">-</option>
                                                    <option value="10" className="bg-[#18181c] text-red-400 font-bold">10</option>
                                                    <option value="9.5" className="bg-[#18181c] text-orange-400">9.5</option>
                                                    <option value="9" className="bg-[#18181c] text-orange-400">9</option>
                                                    <option value="8.5" className="bg-[#18181c] text-yellow-400">8.5</option>
                                                    <option value="8" className="bg-[#18181c] text-yellow-400">8</option>
                                                    <option value="7.5" className="bg-[#18181c] text-blue-400">7.5</option>
                                                    <option value="7" className="bg-[#18181c] text-blue-400">7</option>
                                                    <option value="6.5" className="bg-[#18181c] text-zinc-400">6.5</option>
                                                    <option value="6" className="bg-[#18181c] text-zinc-400">6</option>
                                                    <option value="5" className="bg-[#18181c] text-zinc-500">5</option>
                                                </select>
                                            </div>

                                            {/* Done toggle */}
                                            <div className="flex justify-center">
                                                <button
                                                    aria-label={`${isCompleted ? 'Mark incomplete' : 'Mark complete'} ${getExerciseName(exercise.exercise_id)} set ${setNum}`}
                                                    onClick={() => {
                                                        toggleSetComplete(index, setNum, exercise.rest_seconds);
                                                        if (!isCompleted) navigator.vibrate?.(50);
                                                    }}
                                                    className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95",
                                                        isCompleted
                                                            ? "bg-[#3ccf94] text-black shadow-md shadow-[#3ccf94]/20 scale-105"
                                                            : "bg-white/5 border border-white/5 text-zinc-600 hover:bg-white/10"
                                                    )}
                                                >
                                                    <Check size={18} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>
                    );
                })}
            </div>

            {/* Finish Button */}
            <div className="w-full mt-8 px-1 pb-12 relative z-10">
                <Button onClick={() => setShowFinishConfirm(true)} className="w-full h-14 rounded-3xl font-black text-base tracking-wider bg-[#3ccf94] hover:bg-[#3ccf94]/90 text-black hover:scale-[1.01] transition-transform active:scale-95 shadow-lg shadow-[#3ccf94]/20 uppercase">
                    <CheckCircle className="mr-2" size={20} /> FINISH WORKOUT
                </Button>
            </div>

            {/* Cancel Today's Protocol — full modal warning */}
            <Dialog
                open={showCancelConfirm}
                title="Cancel today's protocol"
                onClose={() => setShowCancelConfirm(false)}
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
                                <span className="text-white font-bold">{activeWorkout.completedSets.length}</span> sets completed.
                                This data will not be saved.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="flex-1 py-3 rounded-xl bg-primary text-black text-sm font-black hover:bg-primary/90 transition-colors"
                            >
                                Keep Training
                            </button>
                            <button
                                onClick={() => { setShowCancelConfirm(false); cancelWorkout(); }}
                                className="flex-1 py-3 rounded-xl border border-destructive/40 text-destructive text-sm font-bold hover:bg-destructive/10 transition-colors"
                            >
                                Cancel Session
                            </button>
                        </div>
            </Dialog>

            {/* Finish Workout Confirmation */}
            <Dialog
                open={showFinishConfirm}
                title="Finish workout"
                onClose={() => setShowFinishConfirm(false)}
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
                                <span className="text-white font-bold">{activeWorkout.completedSets.length}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFinishConfirm(false)}
                                className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-300 text-sm font-bold hover:bg-white/5 transition-colors"
                            >
                                Keep Going
                            </button>
                            <button
                                onClick={() => { setShowFinishConfirm(false); handleFinish(); }}
                                className="flex-1 py-3 rounded-xl bg-primary text-black text-sm font-black hover:bg-primary/90 transition-colors"
                            >
                                Finish & Save
                            </button>
                        </div>
            </Dialog>

            {/* H3: Rest Timer Overlay with ProgressRing */}
            {isResting && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed inset-0 z-60 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300"
                >
                    <div className="text-zinc-400 font-bold uppercase tracking-widest mb-8">Resting</div>

                    <ProgressRing
                        size={200}
                        strokeWidth={8}
                        progress={restProgress}
                        color="#3ccf94"
                        trackColor="rgba(255,255,255,0.03)"
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-5xl font-extrabold text-[#3ccf94] font-mono tabular-nums tracking-tighter">
                                {formatTime(restSecondsRemaining)}
                            </span>
                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">remaining</span>
                        </div>
                    </ProgressRing>

                    <div className="flex gap-4 mt-8">
                        <Button
                            variant="outline"
                            onClick={() => addRestTime(30)}
                            className="rounded-full h-12 px-6 border-white/20 text-white hover:bg-white/10"
                        >
                            +30s
                        </Button>
                        <Button
                            onClick={skipRest}
                            className="rounded-full h-12 px-8 bg-white text-black hover:bg-zinc-200 font-bold"
                        >
                            SKIP
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
