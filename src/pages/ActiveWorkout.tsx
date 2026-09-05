import { useActiveWorkoutSession } from "../hooks/useActiveWorkoutSession";
import { useRestTimer } from "../hooks/useRestTimer";
import { ActiveWorkoutHeader } from "../components/workout/active/ActiveWorkoutHeader";
import { CoachStrategyAccordion } from "../components/workout/active/CoachStrategyAccordion";
import { ExerciseCard } from "../components/workout/active/ExerciseCard";
import { ActiveWorkoutFooter } from "../components/workout/active/ActiveWorkoutFooter";
import { CancelWorkoutDialog } from "../components/workout/active/CancelWorkoutDialog";
import { FinishWorkoutDialog } from "../components/workout/active/FinishWorkoutDialog";
import { RestTimerOverlay } from "../components/workout/active/RestTimerOverlay";
import { TemplateSelector } from "../components/workout/active/TemplateSelector";
import { WorkoutSummaryModal } from "../components/workout/active/WorkoutSummaryModal";

export function ActiveWorkout() {
    const {
        templates, exercises, activeWorkout, activeTemplate, elapsedSeconds,
        showCancelConfirm, setShowCancelConfirm, showFinishConfirm, setShowFinishConfirm,
        showSummary, setShowSummary, summaryData, setSummaryData,
        showStrategy, setShowStrategy, expandedTempo, setExpandedTempo,
        lastSessionData, lastSetsByExercise, smartRecommendations,
        startWorkout, cancelWorkout, toggleSetComplete, updateSetWeight, updateSetReps, updateSetRpe,
        getExerciseName, handleFinish
    } = useActiveWorkoutSession();

    const {
        isResting, restSecondsRemaining, restProgress, addRestTime, skipRest
    } = useRestTimer();

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (showSummary && summaryData) {
        return (
            <WorkoutSummaryModal
                summaryData={summaryData}
                formatTime={formatTime}
                onClose={() => { setShowSummary(false); setSummaryData(null); }}
            />
        );
    }

    if (!activeWorkout || !activeTemplate) {
        return (
            <TemplateSelector
                templates={templates}
                onStartWorkout={startWorkout}
            />
        );
    }

    return (
        <div className="animate-in slide-in-from-bottom-10 duration-500 relative pb-32">
            <ActiveWorkoutHeader
                templateName={activeTemplate.name}
                elapsedSeconds={elapsedSeconds}
                formatTime={formatTime}
                onCancel={() => setShowCancelConfirm(true)}
            />

            <CoachStrategyAccordion
                description={activeTemplate.description}
                coachNotes={activeTemplate.coach_notes}
                showStrategy={showStrategy}
                onToggle={() => setShowStrategy(!showStrategy)}
            />

            <div className="space-y-6">
                {activeTemplate.exercises.map((exercise, index) => (
                    <ExerciseCard
                        key={exercise.exercise_id}
                        exercise={exercise}
                        index={index}
                        exercises={exercises}
                        activeWorkout={activeWorkout}
                        lastSessionData={lastSessionData}
                        lastSetsByExercise={lastSetsByExercise}
                        expandedTempo={expandedTempo}
                        smartRecommendation={smartRecommendations?.[exercise.exercise_id]}
                        onToggleTempo={setExpandedTempo}
                        updateSetWeight={updateSetWeight}
                        updateSetReps={updateSetReps}
                        updateSetRpe={updateSetRpe}
                        toggleSetComplete={toggleSetComplete}
                        getExerciseName={getExerciseName}
                    />
                ))}
            </div>

            <ActiveWorkoutFooter onFinish={() => setShowFinishConfirm(true)} />

            <CancelWorkoutDialog
                open={showCancelConfirm}
                elapsedSeconds={elapsedSeconds}
                completedSetsCount={activeWorkout.completedSets.length}
                formatTime={formatTime}
                onClose={() => setShowCancelConfirm(false)}
                onConfirmCancel={() => { setShowCancelConfirm(false); cancelWorkout(); }}
            />

            <FinishWorkoutDialog
                open={showFinishConfirm}
                elapsedSeconds={elapsedSeconds}
                completedSetsCount={activeWorkout.completedSets.length}
                formatTime={formatTime}
                onClose={() => setShowFinishConfirm(false)}
                onConfirmFinish={() => { setShowFinishConfirm(false); handleFinish(); }}
            />

            <RestTimerOverlay
                isResting={isResting}
                restSecondsRemaining={restSecondsRemaining}
                restProgress={restProgress}
                formatTime={formatTime}
                onAddRestTime={addRestTime}
                onSkipRest={skipRest}
            />
        </div>
    );
}
