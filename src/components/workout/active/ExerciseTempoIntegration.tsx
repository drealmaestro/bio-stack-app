import { useState } from "react";
import { TempoMetronomePill } from "../tempo/TempoMetronomePill";
import { LiveTempoMetronomeModal } from "../tempo/LiveTempoMetronomeModal";
import { TempoGuideCard } from "./TempoGuideCard";
import type { TargetMuscle } from "../../../types";

export interface ExerciseTempoIntegrationProps {
    tempo?: string;
    coachTips?: string;
    targetMuscle?: TargetMuscle | string;
    exerciseName: string;
    targetReps?: number;
    isExpanded: boolean;
    onToggleTempo: () => void;
    onRepsUpdate?: (reps: number) => void;
}

export function ExerciseTempoIntegration({
    tempo,
    coachTips,
    targetMuscle,
    exerciseName,
    targetReps = 10,
    isExpanded,
    onToggleTempo,
    onRepsUpdate,
}: ExerciseTempoIntegrationProps) {
    const [showMetronomeModal, setShowMetronomeModal] = useState(false);

    if (!tempo && !coachTips) return null;

    return (
        <div className="space-y-1.5 mx-1">
            {tempo && (
                <div className="flex items-center justify-between gap-2">
                    <TempoMetronomePill
                        tempo={tempo}
                        exerciseName={exerciseName}
                        onClick={() => setShowMetronomeModal(true)}
                    />
                </div>
            )}

            <TempoGuideCard
                tempo={tempo}
                coachTips={coachTips}
                targetMuscle={targetMuscle as TargetMuscle}
                isExpanded={isExpanded}
                onToggleTempo={onToggleTempo}
            />

            {tempo && (
                <LiveTempoMetronomeModal
                    isOpen={showMetronomeModal}
                    onClose={() => setShowMetronomeModal(false)}
                    exerciseName={exerciseName}
                    tempo={tempo}
                    targetReps={targetReps}
                    targetMuscle={targetMuscle ? String(targetMuscle) : undefined}
                    onRepsUpdate={onRepsUpdate}
                />
            )}
        </div>
    );
}
