import { useState, useEffect, useMemo, useCallback } from "react";
import { useStore } from "../store/useStore";
import { useActiveWorkoutStore } from "../store/useActiveWorkoutStore";
import { nanoid } from "nanoid";
import confetti from "canvas-confetti";
import type { SetLog, TargetMuscle } from "../types";
import { calculateDailyReadiness, type ReadinessEvaluation } from "../utils/readinessMath";
import {
    calculateProgressiveOverload,
    type SmartRecommendation,
    type SetPerformance,
} from "../utils/progressiveOverload";

export function useActiveWorkoutSession() {
    const { templates, exercises, logs, addLog, sleepDuration, waterIntake } = useStore();
    const {
        activeWorkout, startWorkout, cancelWorkout,
        toggleSetComplete, updateSetWeight, updateSetReps, updateSetRpe
    } = useActiveWorkoutStore();

    const [now, setNow] = useState(Date.now());
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [summaryData, setSummaryData] = useState<{ durationSecs: number; sets: number; volume: number; prs: string[] } | null>(null);
    const [showStrategy, setShowStrategy] = useState(true);
    const [expandedTempo, setExpandedTempo] = useState<string | null>(null);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!activeWorkout) return;
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [activeWorkout]);

    const activeTemplate = activeWorkout ? templates.find(t => t.id === activeWorkout.templateId) : null;
    const elapsedSeconds = activeWorkout ? Math.floor((now - activeWorkout.startTime) / 1000) : 0;

    const getExerciseName = useCallback((id: string) => exercises.find(e => e.id === id)?.name || "Unknown", [exercises]);

    // 1. Daily Readiness Integration (Physiological score 0-100)
    const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
    const todaySleep = sleepDuration?.[todayStr] || 0;
    const todayWater = waterIntake?.[todayStr] || 0;

    const dailyReadiness: ReadinessEvaluation = useMemo(() => {
        const activeSecs = logs
            .filter(l => l.timestamp?.startsWith(todayStr))
            .reduce((sum, l) => sum + (l.duration_seconds || 0), 0);
        const activeMinutesToday = Math.round(activeSecs / 60);

        return calculateDailyReadiness({
            sleepMinutes: todaySleep,
            waterMl: todayWater,
            isRestDay: false,
            activeMinutesToday,
        });
    }, [todaySleep, todayWater, logs, todayStr]);

    const todayReadiness = dailyReadiness;

    // 2. Cross-Template Fallback for Exercise History
    const lastSetsByExercise = useMemo(() => {
        if (!activeWorkout || !activeTemplate) return {};

        const sortedLogs = [...logs].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        const templateLogs = sortedLogs.filter(l => l.template_id === activeWorkout.templateId);

        const map: Record<string, SetLog[]> = {};

        activeTemplate.exercises.forEach(ex => {
            const exerciseId = ex.exercise_id;

            // Tier 1: Current template logs
            const inTemplateLog = templateLogs.find(l =>
                l.completed_exercises?.some(s => s.exercise_id === exerciseId && (s.weight_kg > 0 || s.reps_completed > 0))
            );

            if (inTemplateLog) {
                map[exerciseId] = inTemplateLog.completed_exercises.filter(s => s.exercise_id === exerciseId);
                return;
            }

            // Tier 2: Cross-template fallback
            const crossTemplateLog = sortedLogs.find(l =>
                l.completed_exercises?.some(s => s.exercise_id === exerciseId && (s.weight_kg > 0 || s.reps_completed > 0))
            );

            if (crossTemplateLog) {
                map[exerciseId] = crossTemplateLog.completed_exercises.filter(s => s.exercise_id === exerciseId);
            } else {
                map[exerciseId] = [];
            }
        });

        return map;
    }, [activeWorkout?.templateId, activeTemplate, logs]);

    // 3. Synchronized Last Session Data
    const lastSessionData = useMemo(() => {
        if (!activeWorkout) return null;
        const map: Record<string, Record<number, { weight: number; reps: number }>> = {};
        let hasData = false;

        Object.entries(lastSetsByExercise).forEach(([exerciseId, sets]) => {
            if (sets.length > 0) {
                map[exerciseId] = {};
                sets.forEach(set => {
                    map[exerciseId][set.set_number] = {
                        weight: set.weight_kg,
                        reps: set.reps_completed,
                    };
                });
                hasData = true;
            }
        });

        return hasData ? map : null;
    }, [activeWorkout, lastSetsByExercise]);

    // 4. Dynamic Progressive Overload Calculation
    const smartRecommendations = useMemo(() => {
        if (!activeWorkout || !activeTemplate) return {};

        const recs: Record<string, SmartRecommendation> = {};
        const hasLoggedReadiness = (todaySleep > 0) || (todayWater > 0);
        const readinessScore = hasLoggedReadiness ? dailyReadiness.score : undefined;

        activeTemplate.exercises.forEach(ex => {
            const exData = exercises.find(e => e.id === ex.exercise_id);
            const exerciseName = exData?.name || getExerciseName(ex.exercise_id);
            const muscle: TargetMuscle = exData?.target_muscle || "Other";
            const rawSets = lastSetsByExercise[ex.exercise_id] || [];

            const lastSets: SetPerformance[] = rawSets.map(s => ({
                weight_kg: s.weight_kg,
                reps_completed: s.reps_completed,
                rpe: s.rpe,
                set_number: s.set_number,
            }));

            recs[ex.exercise_id] = calculateProgressiveOverload({
                exerciseId: ex.exercise_id,
                exerciseName,
                targetSets: ex.target_sets,
                targetReps: ex.target_reps,
                muscle,
                lastSets,
                readinessScore,
            });
        });

        return recs;
    }, [activeWorkout, activeTemplate, exercises, lastSetsByExercise, dailyReadiness.score, getExerciseName, todaySleep, todayWater]);

    const getRecommendation = useCallback((exerciseId: string): SmartRecommendation | null => {
        return smartRecommendations[exerciseId] ?? null;
    }, [smartRecommendations]);

    // 5. 1-Tap Apply Handler
    const applyRecommendation = useCallback((
        exerciseIndex: number,
        arg2?: number | SmartRecommendation,
        arg3?: number
    ) => {
        if (!activeWorkout || !activeTemplate) return;
        const targetEx = activeTemplate.exercises[exerciseIndex];
        if (!targetEx) return;

        let rec: SmartRecommendation | undefined;
        let setNum: number | undefined;

        if (typeof arg2 === "number") {
            setNum = arg2;
            rec = smartRecommendations[targetEx.exercise_id];
        } else if (arg2 && typeof arg2 === "object") {
            rec = arg2;
            setNum = arg3;
        } else {
            rec = smartRecommendations[targetEx.exercise_id];
            setNum = arg3;
        }

        if (!rec) return;

        if (setNum !== undefined) {
            const key = `${exerciseIndex}-${setNum}`;
            if (!activeWorkout.completedSets.includes(key)) {
                updateSetWeight(exerciseIndex, setNum, rec.suggestedWeightKg);
                updateSetReps(exerciseIndex, setNum, rec.suggestedReps);
                navigator.vibrate?.(30);
            }
        } else {
            for (let i = 1; i <= targetEx.target_sets; i++) {
                const key = `${exerciseIndex}-${i}`;
                if (!activeWorkout.completedSets.includes(key)) {
                    updateSetWeight(exerciseIndex, i, rec.suggestedWeightKg);
                    updateSetReps(exerciseIndex, i, rec.suggestedReps);
                }
            }
            navigator.vibrate?.(30);
        }
    }, [activeWorkout, activeTemplate, smartRecommendations, updateSetWeight, updateSetReps]);

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

        setSummaryData({
            durationSecs: duration,
            sets: completedLog.length,
            volume: Math.round(totalVolume),
            prs: newPRs,
        });
        setShowSummary(true);
        cancelWorkout();

        setTimeout(() => {
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const particleCount = 50;
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);

            setTimeout(() => clearInterval(interval), 1500);
        }, 300);
    };

    return {
        templates,
        exercises,
        activeWorkout,
        activeTemplate,
        elapsedSeconds,
        now,
        showCancelConfirm,
        setShowCancelConfirm,
        showFinishConfirm,
        setShowFinishConfirm,
        showSummary,
        setShowSummary,
        summaryData,
        setSummaryData,
        showStrategy,
        setShowStrategy,
        expandedTempo,
        setExpandedTempo,
        lastSessionData,
        lastSetsByExercise,
        dailyReadiness,
        todayReadiness,
        smartRecommendations,
        getRecommendation,
        applyRecommendation,
        prMap,
        startWorkout,
        cancelWorkout,
        toggleSetComplete,
        updateSetWeight,
        updateSetReps,
        updateSetRpe,
        getExerciseName,
        handleFinish
    };
}