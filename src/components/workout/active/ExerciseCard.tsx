import { useState } from "react";
import { suggestNextWeight } from "../../../lib/progression";
import { calculateProgressiveOverload, type SmartRecommendation } from "../../../utils/progressiveOverload";
import { ProgressionCoachBanner } from "./ProgressionCoachBanner";
import { ExerciseCardHeader } from "./ExerciseCardHeader";
import { TactileProtocolCues } from "./TactileProtocolCues";
import { ActiveSetStepperCard } from "./ActiveSetStepperCard";
import { ExerciseTempoIntegration } from "./ExerciseTempoIntegration";
import { ExerciseCardMediaDrawer } from "./ExerciseCardMediaDrawer";
import { SetRow } from "./SetRow";
import { SetLoggingBottomSheet } from "./SetLoggingBottomSheet";
import { WarmUpCalculatorModal } from "./WarmUpCalculatorModal";
import type { Exercise, ExerciseSet, ActiveWorkoutState, SetLog, TargetMuscle } from "../../../types";

export interface ExerciseCardProps {
    exercise: ExerciseSet;
    index: number;
    exercises: Exercise[];
    activeWorkout: ActiveWorkoutState;
    lastSessionData: Record<string, Record<number, { weight: number; reps: number }>> | null;
    lastSetsByExercise: Record<string, SetLog[]>;
    expandedTempo: string | null;
    smartRecommendation?: SmartRecommendation | null;
    onToggleTempo: (id: string | null) => void;
    updateSetWeight: (exerciseIdx: number, setNum: number, weight: number) => void;
    updateSetReps: (exerciseIdx: number, setNum: number, reps: number) => void;
    updateSetRpe: (exerciseIdx: number, setNum: number, rpe: number) => void;
    toggleSetComplete: (exerciseIdx: number, setNum: number, restSeconds: number) => void;
    getExerciseName: (id: string) => string;
}

export function ExerciseCard({
    exercise, index, exercises, activeWorkout, lastSessionData, lastSetsByExercise,
    expandedTempo, smartRecommendation, onToggleTempo, updateSetWeight, updateSetReps,
    updateSetRpe, toggleSetComplete, getExerciseName
}: ExerciseCardProps) {
    const [showWarmUpModal, setShowWarmUpModal] = useState(false);
    const [activeSheetSetNum, setActiveSheetSetNum] = useState<number | null>(null);

    const lastExData = lastSessionData?.[exercise.exercise_id];
    const exData = exercises.find(e => e.id === exercise.exercise_id);
    const muscle = exData?.target_muscle || "Other";
    const intensity = exData?.intensity_level;
    const rawSets = lastSetsByExercise[exercise.exercise_id] ?? [];
    const suggestion = suggestNextWeight({
        targetSets: exercise.target_sets,
        targetReps: exercise.target_reps,
        lastSets: rawSets,
        muscle,
    });

    const exerciseName = getExerciseName(exercise.exercise_id);
    const smartRec = smartRecommendation !== undefined ? smartRecommendation : calculateProgressiveOverload({
        exerciseId: exercise.exercise_id,
        exerciseName,
        targetSets: exercise.target_sets,
        targetReps: exercise.target_reps,
        muscle,
        lastSets: rawSets.map(s => ({ weight_kg: s.weight_kg, reps_completed: s.reps_completed, rpe: s.rpe, set_number: s.set_number })),
    });

    const firstSetKey = `${index}-1`;
    const currentSet1Weight = activeWorkout.setWeights[firstSetKey] || smartRec?.suggestedWeightKg || suggestion?.weightKg || 60;
    const activeSetKey = activeSheetSetNum ? `${index}-${activeSheetSetNum}` : null;
    const prevSetWeight = activeSheetSetNum && activeSheetSetNum > 1
        ? (activeWorkout.setWeights[`${index}-${activeSheetSetNum - 1}`] || lastExData?.[activeSheetSetNum - 1]?.weight) : null;

    const activeSheetWeight = activeSetKey
        ? (activeWorkout.setWeights[activeSetKey] || prevSetWeight || lastExData?.[activeSheetSetNum!]?.weight || smartRec?.suggestedWeightKg || suggestion?.weightKg || 0) : 0;
    const activeSheetReps = activeSetKey ? (activeWorkout.setReps?.[activeSetKey] ?? exercise.target_reps) : exercise.target_reps;
    const activeSheetRpe = activeSetKey ? (activeWorkout.setRpes?.[activeSetKey] || 7) : 7;
    const activeSheetCompleted = activeSetKey ? activeWorkout.completedSets.includes(activeSetKey) : false;

    const previousSetInfo = activeSheetSetNum && activeSheetSetNum > 1 ? {
        weight: activeWorkout.setWeights[`${index}-${activeSheetSetNum - 1}`] || lastExData?.[activeSheetSetNum - 1]?.weight || 0,
        reps: activeWorkout.setReps?.[`${index}-${activeSheetSetNum - 1}`] ?? exercise.target_reps,
    } : undefined;

    const firstUncompletedSetNum = Array.from({ length: exercise.target_sets })
        .map((_, i) => i + 1).find(num => !activeWorkout.completedSets.includes(`${index}-${num}`)) || 1;

    const currentExercise: Exercise = exData || {
        id: exercise.exercise_id,
        name: exerciseName,
        target_muscle: (muscle as TargetMuscle) || "Other",
        instructions: "",
    };

    const activeSetCurrentWeight = activeWorkout.setWeights[`${index}-${firstUncompletedSetNum}`] || currentSet1Weight || 38;
    const activeSetCurrentReps = activeWorkout.setReps?.[`${index}-${firstUncompletedSetNum}`] ?? exercise.target_reps;

    return (
        <div className="space-y-2.5">
            <ExerciseCardHeader
                exerciseName={exerciseName}
                muscle={muscle}
                intensity={intensity}
                restSeconds={exercise.rest_seconds}
                onOpenWarmUp={() => setShowWarmUpModal(true)}
                exerciseIndex={index}
                totalExercises={exercises.length}
            />

            {/* Tactile Cue & Weak-Side Bias Protocol */}
            <TactileProtocolCues
                tactileCue={exData?.coach_tips || "Retract scapulae, 30° bench incline, 3s eccentric cadence."}
            />

            {/* Progression Coach */}
            <ProgressionCoachBanner
                suggestion={suggestion}
                onApply={() => {
                    const weightToApply = smartRec?.suggestedWeightKg || suggestion?.weightKg || 0;
                    const repsToApply = smartRec?.suggestedReps || exercise.target_reps;
                    if (weightToApply > 0 || repsToApply > 0) {
                        for (let setNum = 1; setNum <= exercise.target_sets; setNum++) {
                            const key = `${index}-${setNum}`;
                            if (!activeWorkout.completedSets.includes(key)) {
                                if (weightToApply > 0) updateSetWeight(index, setNum, weightToApply);
                                updateSetReps(index, setNum, repsToApply);
                            }
                        }
                        navigator.vibrate?.(30);
                    }
                }}
            />

            <ExerciseTempoIntegration
                tempo={exData?.tempo}
                coachTips={exData?.coach_tips}
                targetMuscle={muscle}
                exerciseName={exerciseName}
                targetReps={exercise.target_reps}
                isExpanded={expandedTempo === exercise.exercise_id}
                onToggleTempo={() => onToggleTempo(expandedTempo === exercise.exercise_id ? null : exercise.exercise_id)}
                onRepsUpdate={(reps) => updateSetReps(index, firstUncompletedSetNum, reps)}
            />

            <ExerciseCardMediaDrawer exercise={currentExercise} />

            {/* Set Table */}
            <div className="stitch-card-2 border-[#343b4a] rounded overflow-hidden">
                <div className="grid grid-cols-[2.5rem_1.1fr_1.1fr_1.1fr_3rem] gap-1.5 px-3 py-2 bg-[#14171d] text-[10px] items-center text-[#8e95a5] font-mono font-bold uppercase tracking-wider text-center border-b border-[#262b36]">
                    <div>SET</div>
                    <div>PREV</div>
                    <div>LOAD</div>
                    <div>REPS</div>
                    <div>STATUS</div>
                </div>

                {Array.from({ length: exercise.target_sets }).map((_, setIdx) => {
                    const setNum = setIdx + 1;
                    const key = `${index}-${setNum}`;
                    const isCompleted = activeWorkout.completedSets.includes(key);
                    const lastSet = lastExData?.[setNum];
                    const prevWeight = setNum > 1 ? (activeWorkout.setWeights[`${index}-${setNum - 1}`] || lastExData?.[setNum - 1]?.weight) : 0;
                    const currentWeight = activeWorkout.setWeights[key] || (prevWeight && !isCompleted ? prevWeight : 0);
                    const currentReps = activeWorkout.setReps?.[key] ?? exercise.target_reps;
                    const currentRpe = activeWorkout.setRpes?.[key] || 0;
                    const hasRepsKey = key in (activeWorkout.setReps || {});

                    return (
                        <SetRow
                            key={setNum}
                            exerciseName={exerciseName}
                            exerciseIndex={index}
                            setNum={setNum}
                            targetReps={exercise.target_reps}
                            currentWeight={currentWeight}
                            currentReps={currentReps}
                            currentRpe={currentRpe}
                            isCompleted={isCompleted}
                            lastSet={lastSet}
                            hasRepsKey={hasRepsKey}
                            recommendation={smartRec}
                            isUpcoming={setNum === firstUncompletedSetNum}
                            onWeightChange={(w) => updateSetWeight(index, setNum, w)}
                            onRepsChange={(r) => updateSetReps(index, setNum, r)}
                            onRpeChange={(rpe) => updateSetRpe(index, setNum, rpe)}
                            onToggleComplete={() => toggleSetComplete(index, setNum, exercise.rest_seconds)}
                            onOpenSheet={() => setActiveSheetSetNum(setNum)}
                        />
                    );
                })}
            </div>

            {/* In-Line Stepper Card for the Active Set */}
            {firstUncompletedSetNum <= exercise.target_sets && (
                <ActiveSetStepperCard
                    setNum={firstUncompletedSetNum}
                    weight={activeSetCurrentWeight}
                    reps={activeSetCurrentReps}
                    onWeightChange={(w) => updateSetWeight(index, firstUncompletedSetNum, w)}
                    onRepsChange={(r) => updateSetReps(index, firstUncompletedSetNum, r)}
                    onLogSet={() => toggleSetComplete(index, firstUncompletedSetNum, exercise.rest_seconds)}
                />
            )}

            {/* Bottom Sheet Drawer */}
            {activeSheetSetNum !== null && (
                <SetLoggingBottomSheet
                    isOpen={activeSheetSetNum !== null}
                    onClose={() => setActiveSheetSetNum(null)}
                    exerciseName={exerciseName}
                    setIndex={activeSheetSetNum}
                    totalSets={exercise.target_sets}
                    targetReps={exercise.target_reps}
                    weight={activeSheetWeight}
                    reps={activeSheetReps}
                    rpe={activeSheetRpe}
                    isCompleted={activeSheetCompleted}
                    lastSet={lastExData?.[activeSheetSetNum]}
                    previousSet={previousSetInfo}
                    recommendation={smartRec}
                    tempo={exData?.tempo}
                    targetMuscle={muscle as TargetMuscle}
                    exercise={currentExercise}
                    onSave={({ weight, reps, rpe }) => {
                        updateSetWeight(index, activeSheetSetNum, weight);
                        updateSetReps(index, activeSheetSetNum, reps);
                        if (rpe !== undefined) updateSetRpe(index, activeSheetSetNum, rpe);
                    }}
                    onToggleComplete={() => toggleSetComplete(index, activeSheetSetNum, exercise.rest_seconds)}
                />
            )}

            <WarmUpCalculatorModal
                open={showWarmUpModal}
                onClose={() => setShowWarmUpModal(false)}
                initialWeight={currentSet1Weight}
                exerciseName={exerciseName}
                targetReps={exercise.target_reps}
            />
        </div>
    );
}