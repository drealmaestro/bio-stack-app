import { useState, useEffect, useMemo } from "react";
import { useStore } from "../store/useStore";
import { useActiveWorkoutStore } from "../store/useActiveWorkoutStore";
import { nanoid } from "nanoid";
import confetti from "canvas-confetti";
import type { SetLog } from "../types";

export function useActiveWorkoutSession() {
    const { templates, exercises, logs, addLog } = useStore();
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
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [activeWorkout]);

    const activeTemplate = activeWorkout ? templates.find(t => t.id === activeWorkout.templateId) : null;
    const elapsedSeconds = activeWorkout ? Math.floor((now - activeWorkout.startTime) / 1000) : 0;

    const getExerciseName = (id: string) => exercises.find(e => e.id === id)?.name || "Unknown";

    const lastSessionData = useMemo(() => {
        if (!activeWorkout) return null;
        const previousLogs = logs
            .filter(l => l.template_id === activeWorkout.templateId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (!previousLogs.length) return null;
        const lastLog = previousLogs[0];
        const map: Record<string, Record<number, { weight: number; reps: number }>> = {};
        lastLog.completed_exercises.forEach(set => {
            if (!map[set.exercise_id]) map[set.exercise_id] = {};
            map[set.exercise_id][set.set_number] = { weight: set.weight_kg, reps: set.reps_completed };
        });
        return map;
    }, [activeWorkout?.templateId, logs]);

    const lastSetsByExercise = useMemo(() => {
        if (!activeWorkout) return {};
        const previousLogs = logs
            .filter(l => l.template_id === activeWorkout.templateId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (!previousLogs.length) return {};
        const map: Record<string, SetLog[]> = {};
        previousLogs[0].completed_exercises.forEach(set => {
            (map[set.exercise_id] ??= []).push(set);
        });
        return map;
    }, [activeWorkout?.templateId, logs]);

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
