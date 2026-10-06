import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, renderHook } from "@testing-library/react";
import { ExerciseCard } from "./ExerciseCard";
import { SetLoggingBottomSheet } from "./SetLoggingBottomSheet";
import { ExerciseTempoIntegration } from "./ExerciseTempoIntegration";
import { SetLoggingPacerBar } from "./SetLoggingPacerBar";
import { ExerciseCardMediaDrawer } from "./ExerciseCardMediaDrawer";
import { LiveTempoMetronomeModal } from "../tempo/LiveTempoMetronomeModal";
import { useActiveWorkoutStore } from "../../../store/useActiveWorkoutStore";
import { useRestTimer } from "../../../hooks/useRestTimer";
import { parseTempo } from "../../../utils/tempoEngine";
import type { Exercise, ActiveWorkoutState } from "../../../types";

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

describe("Milestone 3 Empirical Challenger Stress Test Suite", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useActiveWorkoutStore.setState({ activeWorkout: null, activeDrawerSet: null });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("1. Concurrency & Non-Interference", () => {
        const mockExercise: Exercise = {
            id: "ex-bench",
            name: "Barbell Bench Press",
            target_muscle: "Chest",
            instructions: "Lie on bench and press",
            tempo: "3-1-1-0",
            form_cues: ["Retract scapulae", "Leg drive"],
        };

        it("verifies floating rest timer does not freeze/reset when drawer is opened/closed", () => {
            const initialWorkout: ActiveWorkoutState = {
                templateId: "tmpl-test",
                startTime: Date.now() - 30000,
                completedSets: ["0-1"],
                setWeights: { "0-1": 80 },
                setReps: { "0-1": 10 },
                setRpes: { "0-1": 8 },
                restEndTime: Date.now() + 60000,
                originalRestDuration: 60,
            };
            useActiveWorkoutStore.setState({ activeWorkout: initialWorkout });
            const { result: restResult } = renderHook(() => useRestTimer());
            expect(restResult.current.isResting).toBe(true);
            expect(restResult.current.restSecondsRemaining).toBeGreaterThanOrEqual(58);

            const { unmount } = render(<ExerciseCardMediaDrawer exercise={mockExercise} />);
            const triggerBtn = screen.getByRole("button", { name: /Show visual guide for Barbell Bench Press/i });
            fireEvent.click(triggerBtn);
            expect(screen.getByText("Hide")).toBeDefined();
            expect(useActiveWorkoutStore.getState().activeWorkout?.restEndTime).toBe(initialWorkout.restEndTime);

            fireEvent.click(triggerBtn);
            expect(screen.getByText("View")).toBeDefined();
            expect(useActiveWorkoutStore.getState().activeWorkout?.restEndTime).toBe(initialWorkout.restEndTime);
            unmount();
        });

        it("verifies rest timer persists when LiveTempoMetronomeModal is opened", () => {
            const initialWorkout: ActiveWorkoutState = {
                templateId: "tmpl-test",
                startTime: Date.now() - 10000,
                completedSets: ["0-1"],
                setWeights: {},
                setReps: {},
                setRpes: {},
                restEndTime: Date.now() + 45000,
                originalRestDuration: 45,
            };
            useActiveWorkoutStore.setState({ activeWorkout: initialWorkout });
            const onClose = vi.fn();
            const { unmount } = render(
                <LiveTempoMetronomeModal isOpen={true} onClose={onClose} exerciseName="Barbell Bench Press" tempo="3-1-1-0" targetReps={10} />
            );
            expect(screen.getByText(/Resting: \d+s left/i)).toBeDefined();
            expect(useActiveWorkoutStore.getState().activeWorkout?.restEndTime).toBe(initialWorkout.restEndTime);
            fireEvent.click(screen.getByRole("button", { name: /Close metronome modal/i }));
            expect(onClose).toHaveBeenCalled();
            expect(useActiveWorkoutStore.getState().activeWorkout?.restEndTime).toBe(initialWorkout.restEndTime);
            unmount();
        });

        it("verifies starting metronome pacing intentionally skips rest cleanly", () => {
            const initialWorkout: ActiveWorkoutState = {
                templateId: "tmpl-test",
                startTime: Date.now() - 10000,
                completedSets: ["0-1"],
                setWeights: {},
                setReps: {},
                setRpes: {},
                restEndTime: Date.now() + 45000,
                originalRestDuration: 45,
            };
            useActiveWorkoutStore.setState({ activeWorkout: initialWorkout });
            render(<LiveTempoMetronomeModal isOpen={true} onClose={vi.fn()} exerciseName="Barbell Bench Press" tempo="3-1-1-0" targetReps={10} />);
            fireEvent.click(screen.getByRole("button", { name: /START PACING/i }));
            expect(useActiveWorkoutStore.getState().activeWorkout?.restEndTime).toBeNull();
        });

        it("verifies keypad input and RPE buttons remain fully responsive while tempo bar is mounted", () => {
            const onSave = vi.fn();
            render(
                <SetLoggingBottomSheet
                    isOpen={true}
                    onClose={vi.fn()}
                    exerciseName="Barbell Squat"
                    setIndex={1}
                    totalSets={3}
                    weight={100}
                    reps={8}
                    rpe={7}
                    tempo="4-0-1-0"
                    onSave={onSave}
                    onToggleComplete={vi.fn()}
                />
            );
            fireEvent.click(screen.getByRole("button", { name: "Key 5" }));
            expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({ weight: 1005 }));
            fireEvent.click(screen.getByRole("button", { name: /\+2\.5/i }));
            expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({ weight: 1007.5 }));

            fireEvent.click(screen.getByText("Reps").closest("button")!);
            fireEvent.click(screen.getByRole("button", { name: "Key 9" }));
            expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({ reps: 89 }));

            fireEvent.click(screen.getByRole("button", { name: "9" }));
            expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({ rpe: 9 }));
        });
    });

    describe("2. Rapid State Transitions & Stress Cycling", () => {
        it("handles 50 rapid toggles between Weight and Reps tabs without desync", () => {
            const onSave = vi.fn();
            render(
                <SetLoggingBottomSheet
                    isOpen={true}
                    onClose={vi.fn()}
                    exerciseName="Deadlift"
                    setIndex={2}
                    totalSets={4}
                    weight={140}
                    reps={5}
                    rpe={8}
                    onSave={onSave}
                    onToggleComplete={vi.fn()}
                />
            );
            const weightTab = screen.getByText("Weight (kg)").closest("button")!;
            const repsTab = screen.getByText("Reps").closest("button")!;
            for (let i = 0; i < 50; i++) {
                fireEvent.click(i % 2 === 0 ? repsTab : weightTab);
            }
            fireEvent.click(screen.getByRole("button", { name: "Key 2" }));
            expect(onSave).toHaveBeenLastCalledWith({ weight: 1402, reps: 5, rpe: 8 });
        });

        it("handles 50 rapid open/close cycles of ExerciseCardMediaDrawer without crash", () => {
            const mockExercise: Exercise = {
                id: "ex-press",
                name: "Overhead Press",
                target_muscle: "Shoulders",
                instructions: "Press bar overhead",
                form_cues: ["Core tight", "Lockout at top"],
            };
            render(<ExerciseCardMediaDrawer exercise={mockExercise} />);
            const triggerBtn = screen.getByRole("button", { name: /Show visual guide for Overhead Press/i });
            for (let i = 0; i < 50; i++) fireEvent.click(triggerBtn);
            expect(screen.getByText("View")).toBeDefined();
            expect(screen.queryByTestId("visual-cue-fallback")).toBeNull();
        });

        it("handles 20 rapid open and close mounting of LiveTempoMetronomeModal cleanly", () => {
            for (let i = 0; i < 20; i++) {
                const { unmount } = render(
                    <LiveTempoMetronomeModal isOpen={true} onClose={vi.fn()} exerciseName="Cable Fly" tempo="3-0-1-0" targetReps={12} />
                );
                unmount();
            }
            expect(true).toBe(true);
        });
    });

    describe("3. Edge Cases: Missing & Unrecognized Tempo Formats", () => {
        it("handles missing tempo gracefully in ExerciseTempoIntegration", () => {
            const { container } = render(
                <ExerciseTempoIntegration tempo={undefined} coachTips="Squeeze peak" exerciseName="Curl" isExpanded={false} onToggleTempo={vi.fn()} />
            );
            expect(screen.getByText(/Squeeze peak/i)).toBeDefined();
            expect(screen.queryByText("Pacer")).toBeNull();
            expect(container.firstChild).not.toBeNull();
        });

        it("falls back to default 3-0-1-0 when SetLoggingPacerBar receives empty tempo", () => {
            render(<SetLoggingPacerBar exerciseName="Leg Ext" tempo="" targetReps={15} />);
            expect(screen.getByText("3-0-1-0")).toBeDefined();
            expect(screen.getByText("Pacer")).toBeDefined();
        });

        it("tempoEngine parseTempo provides robust fallbacks for all invalid inputs", () => {
            expect(parseTempo(undefined).displayString).toBe("3-0-1-0");
            expect(parseTempo("").displayString).toBe("3-0-1-0");
            expect(parseTempo("   ").displayString).toBe("3-0-1-0");
            expect(parseTempo("invalid").displayString).toBe("3-0-1-0");
            expect(parseTempo("3-1-1").displayString).toBe("3-0-1-0");
            expect(parseTempo("3-1-1-0-1").displayString).toBe("3-0-1-0");
            expect(parseTempo("abc-def").displayString).toBe("3-0-1-0");
            expect(parseTempo("-1-2-3-4").displayString).toBe("3-0-1-0");
            expect(parseTempo("0-0-0-0").displayString).toBe("3-0-1-0");
            expect(parseTempo("controlled").isControlled).toBe(true);
            expect(parseTempo("Static 45s").isStatic).toBe(true);
            expect(parseTempo("3-1-X-0").concentric).toBe(1);
        });

        it("SetLoggingBottomSheet gracefully handles undefined RPE, 0 weight, and 0 reps", () => {
            const onSave = vi.fn();
            const onToggleComplete = vi.fn();
            render(
                <SetLoggingBottomSheet
                    isOpen={true}
                    onClose={vi.fn()}
                    exerciseName="Calf Raise"
                    setIndex={1}
                    totalSets={1}
                    weight={0}
                    reps={0}
                    rpe={undefined}
                    onSave={onSave}
                    onToggleComplete={onToggleComplete}
                />
            );
            expect(screen.getByText("@ RPE 7")).toBeDefined();
            fireEvent.click(screen.getByText("COMPLETE & LOG SET"));
            expect(onSave).toHaveBeenCalledWith({ weight: 0, reps: 0, rpe: 7 });
            expect(onToggleComplete).toHaveBeenCalledTimes(1);
        });
    });

    describe("4. ExerciseCard Full Integration with Pacing & Logging", () => {
        it("opens SetLoggingBottomSheet from ExerciseCard, edits values, and saves to parent handlers", () => {
            const updateSetWeight = vi.fn();
            const toggleSetComplete = vi.fn();
            const mockWorkout: ActiveWorkoutState = {
                templateId: "tmpl-1",
                startTime: Date.now() - 60000,
                completedSets: [],
                setWeights: { "0-1": 60 },
                setReps: { "0-1": 10 },
                setRpes: { "0-1": 7 },
                restEndTime: null,
                originalRestDuration: 0,
            };
            const mockExerciseSet = { exercise_id: "ex-1", target_sets: 2, target_reps: 10, rest_seconds: 90 };
            const mockExercises: Exercise[] = [{
                id: "ex-1",
                name: "Incline Dumbbell Press",
                target_muscle: "Chest",
                instructions: "Press up",
                tempo: "3-1-1-0",
            }];

            render(
                <ExerciseCard
                    exercise={mockExerciseSet}
                    index={0}
                    exercises={mockExercises}
                    activeWorkout={mockWorkout}
                    lastSessionData={null}
                    lastSetsByExercise={{}}
                    expandedTempo={null}
                    onToggleTempo={vi.fn()}
                    updateSetWeight={updateSetWeight}
                    updateSetReps={vi.fn()}
                    updateSetRpe={vi.fn()}
                    toggleSetComplete={toggleSetComplete}
                    getExerciseName={() => "Incline Dumbbell Press"}
                />
            );

            fireEvent.click(screen.getAllByText("60 kg")[0]);
            expect(screen.getByText("Set 1 of 2")).toBeDefined();
            fireEvent.click(screen.getByRole("button", { name: "Key 5" }));
            expect(updateSetWeight).toHaveBeenCalledWith(0, 1, 605);
            fireEvent.click(screen.getByText("COMPLETE & LOG SET"));
            expect(toggleSetComplete).toHaveBeenCalledWith(0, 1, 90);
        });

        it("verifies clicking 'SET COMPLETED — TAP TO UPDATE' on an already completed set", () => {
            const toggleSetComplete = vi.fn();
            const onSave = vi.fn();
            render(
                <SetLoggingBottomSheet
                    isOpen={true}
                    onClose={vi.fn()}
                    exerciseName="Barbell Squat"
                    setIndex={1}
                    totalSets={3}
                    weight={100}
                    reps={8}
                    rpe={8}
                    isCompleted={true}
                    onSave={onSave}
                    onToggleComplete={toggleSetComplete}
                />
            );
            const updateBtn = screen.getByText("SET COMPLETED — TAP TO UPDATE");
            expect(updateBtn).toBeDefined();
            fireEvent.click(updateBtn);
            expect(onSave).toHaveBeenCalledWith({ weight: 100, reps: 8, rpe: 8 });
            expect(toggleSetComplete).not.toHaveBeenCalled();
        });
    });
});
