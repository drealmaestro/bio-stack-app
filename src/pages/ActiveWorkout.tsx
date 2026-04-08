import { useState, useEffect, useRef, useMemo } from "react";
import { useStore } from "../store/useStore";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ProgressRing } from "../components/ui/progress-ring";
import { Play, CheckCircle, Check, ShieldAlert, Trophy, Clock, TrendingUp } from "lucide-react";
import { nanoid } from "nanoid";
import type { SetLog } from "../types";
import { cn } from "../lib/utils";
export function ActiveWorkout() {
    const {
        templates, exercises, logs, addLog,
        activeWorkout, startWorkout, cancelWorkout,
        toggleSetComplete, updateSetWeight, updateSetReps,
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
    const [summaryData, setSummaryData] = useState<{ duration: string; sets: number; volume: number; prs: string[] } | null>(null);
    // H3: Store original rest duration so we can compute ring progress
    const originalRestRef = useRef<number>(0);

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
                    completedLog.push({
                        exercise_id: ex.exercise_id,
                        set_number: i,
                        reps_completed: reps,
                        weight_kg: weight
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
            duration: formatTime(Math.floor(duration)),
            sets: completedLog.length,
            volume: Math.round(totalVolume),
            prs: newPRs,
        });
        setShowSummary(true);
        cancelWorkout();
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
                        <div className="text-xl font-black text-white">{summaryData.duration}</div>
                        <div className="text-xs text-zinc-400">Duration</div>
                    </div>
                    <div className="glass-card p-4 rounded-2xl text-center">
                        <Check size={18} className="mx-auto text-primary mb-1" />
                        <div className="text-xl font-black text-white">{summaryData.sets}</div>
                        <div className="text-xs text-zinc-400">Sets</div>
                    </div>
                    <div className="glass-card p-4 rounded-2xl text-center">
                        <TrendingUp size={18} className="mx-auto text-primary mb-1" />
                        <div className="text-xl font-black text-white">
                            {summaryData.volume >= 1000 ? `${(summaryData.volume / 1000).toFixed(1)}t` : `${summaryData.volume}kg`}
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
                    {templates.map(template => (
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
            <div className="glass sticky top-16 z-40 -mx-4 px-4 py-4 mb-6 flex justify-between items-center border-y border-white/5">
                <div>
                    <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{activeTemplate.name}</h2>
                    <div className="text-4xl font-black text-white font-mono tracking-tighter tabular-nums">
                        {formatTime(elapsedSeconds)}
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCancelConfirm(true)}
                    className="text-destructive h-auto py-1 px-3 bg-destructive/10 hover:bg-destructive/20 rounded-full text-xs font-bold uppercase tracking-wider"
                >
                    Cancel
                </Button>
            </div>

            <div className="space-y-6">
                {activeTemplate.exercises.map((exercise, index) => {
                    const lastExData = lastSessionData?.[exercise.exercise_id];
                    return (
                    <div key={exercise.exercise_id} className="space-y-2">
                        <div className="flex justify-between items-baseline px-1">
                            <h3 className="text-lg font-bold text-white tracking-tight">
                                {getExerciseName(exercise.exercise_id)}
                            </h3>
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                {exercise.rest_seconds}s Rest
                            </span>
                        </div>

                        <Card className="glass-card overflow-hidden">
                            <CardContent className="p-0">
                                {/* Header Row — wider columns for bigger touch targets */}
                                <div className="grid grid-cols-[2.5rem_1fr_1fr_3rem] gap-1.5 px-3 py-2 bg-white/5 text-xs items-center text-zinc-400 font-bold uppercase tracking-widest text-center">
                                    <div>Set</div>
                                    <div>kg</div>
                                    <div>Reps</div>
                                    <div>Done</div>
                                </div>

                                {Array.from({ length: exercise.target_sets }).map((_, setIdx) => {
                                    const setNum = setIdx + 1;
                                    const key = `${index}-${setNum}`;
                                    const isCompleted = activeWorkout.completedSets.includes(key);
                                    const lastSet = lastExData?.[setNum];
                                    const currentWeight = activeWorkout.setWeights[key] || 0;
                                    const currentReps = activeWorkout.setReps?.[key] ?? exercise.target_reps;
                                    const weightPlaceholder = lastSet ? String(lastSet.weight) : '0';

                                    return (
                                        <div key={setNum} className={cn(
                                            "grid grid-cols-[2.5rem_1fr_1fr_3rem] gap-1.5 px-3 py-1.5 items-center border-t border-white/5 transition-colors",
                                            isCompleted ? "bg-primary/5" : ""
                                        )}>
                                            {/* Set number + last session hint */}
                                            <div className="flex flex-col items-center">
                                                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-zinc-400">
                                                    {setNum}
                                                </div>
                                                {lastSet && (
                                                    <span className="text-[9px] text-zinc-600 mt-0.5 leading-none">
                                                        {lastSet.weight}x{lastSet.reps}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Weight — 48px touch target */}
                                            <div>
                                                <Input
                                                    type="number"
                                                    inputMode="decimal"
                                                    placeholder={weightPlaceholder}
                                                    min={0}
                                                    step={0.5}
                                                    value={currentWeight || ''}
                                                    className="h-12 text-center bg-black/40 border-white/10 focus:border-primary text-white font-mono text-base font-bold rounded-xl"
                                                    onChange={(e) => updateSetWeight(index, setNum, Math.max(0, parseFloat(e.target.value) || 0))}
                                                />
                                            </div>

                                            {/* Reps — 48px touch target */}
                                            <div>
                                                <Input
                                                    type="number"
                                                    inputMode="numeric"
                                                    placeholder={String(exercise.target_reps)}
                                                    min={0}
                                                    max={999}
                                                    value={currentReps === exercise.target_reps && !(key in (activeWorkout.setReps || {})) ? '' : currentReps}
                                                    className="h-12 text-center bg-black/40 border-white/10 focus:border-primary text-white font-mono text-base font-bold rounded-xl"
                                                    onChange={(e) => updateSetReps(index, setNum, Math.max(0, parseInt(e.target.value) || exercise.target_reps))}
                                                />
                                            </div>

                                            {/* Done toggle — 48px touch target + haptic */}
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => {
                                                        toggleSetComplete(index, setNum, exercise.rest_seconds);
                                                        if (!isCompleted) navigator.vibrate?.(50);
                                                    }}
                                                    className={cn(
                                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                                                        isCompleted
                                                            ? "bg-primary text-black shadow-[0_0_12px_rgba(0,212,255,0.4)] scale-105"
                                                            : "bg-white/10 text-zinc-600 hover:bg-white/20"
                                                    )}
                                                >
                                                    <Check size={20} strokeWidth={3} />
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
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-linear-to-t from-black via-black/90 to-transparent z-50">
                <Button onClick={() => setShowFinishConfirm(true)} className="w-full h-14 rounded-2xl font-black text-lg shadow-2xl shadow-primary/20 bg-primary text-black hover:scale-[1.02] transition-transform active:scale-95">
                    <CheckCircle className="mr-2" size={24} /> FINISH WORKOUT
                </Button>
            </div>

            {/* Cancel Today's Protocol — full modal warning */}
            {showCancelConfirm && (
                <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/85 backdrop-blur-sm px-6 animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-destructive/30 rounded-2xl p-6 w-full max-w-sm space-y-5 animate-in zoom-in-95 duration-200">
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
                    </div>
                </div>
            )}

            {/* Finish Workout Confirmation */}
            {showFinishConfirm && (
                <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/85 backdrop-blur-sm px-6 animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-primary/30 rounded-2xl p-6 w-full max-w-sm space-y-5 animate-in zoom-in-95 duration-200">
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
                    </div>
                </div>
            )}

            {/* H3: Rest Timer Overlay with ProgressRing */}
            {isResting && (
                <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="text-zinc-400 font-bold uppercase tracking-widest mb-8">Resting</div>

                    <ProgressRing
                        size={200}
                        strokeWidth={8}
                        progress={restProgress}
                        color="#00D4FF"
                        trackColor="rgba(255,255,255,0.05)"
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-5xl font-black text-primary font-mono tabular-nums tracking-tighter">
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
