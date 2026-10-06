import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExerciseCardHeader } from "./ExerciseCardHeader";
import { ExerciseTempoIntegration } from "./ExerciseTempoIntegration";
import { ExerciseCardMediaDrawer } from "./ExerciseCardMediaDrawer";
import { SetLoggingValueTabs } from "./SetLoggingValueTabs";
import { SetLoggingPacerBar } from "./SetLoggingPacerBar";
import { SetLoggingBottomSheet } from "./SetLoggingBottomSheet";
import type { Exercise } from "../../../types";

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

describe("Milestone 3 UI Integration Test Suite", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("1. ExerciseCardHeader", () => {
        it("renders title, muscle icon, intensity, rest time, and handles warm-up trigger", () => {
            const onOpenWarmUp = vi.fn();
            render(
                <ExerciseCardHeader
                    exerciseName="Barbell Incline Bench"
                    muscle="Chest"
                    intensity="Heavy"
                    restSeconds={90}
                    onOpenWarmUp={onOpenWarmUp}
                />
            );

            expect(screen.getByText("Barbell Incline Bench")).toBeDefined();
            expect(screen.getByText("Heavy")).toBeDefined();
            expect(screen.getByText("90s Rest")).toBeDefined();

            const warmUpBtn = screen.getByRole("button", { name: /Open warm-up calculator/i });
            fireEvent.click(warmUpBtn);
            expect(onOpenWarmUp).toHaveBeenCalledTimes(1);
        });
    });

    describe("2. ExerciseTempoIntegration", () => {
        it("returns null when no tempo or tips are provided", () => {
            const { container } = render(
                <ExerciseTempoIntegration
                    exerciseName="Push Up"
                    isExpanded={false}
                    onToggleTempo={vi.fn()}
                />
            );
            expect(container.firstChild).toBeNull();
        });

        it("renders TempoMetronomePill and opens LiveTempoMetronomeModal on click", () => {
            const onRepsUpdate = vi.fn();
            render(
                <ExerciseTempoIntegration
                    tempo="3-1-1-0"
                    coachTips="Control the descent"
                    targetMuscle="Chest"
                    exerciseName="Dumbbell Press"
                    targetReps={10}
                    isExpanded={false}
                    onToggleTempo={vi.fn()}
                    onRepsUpdate={onRepsUpdate}
                />
            );

            expect(screen.getAllByText("3-1-1-0").length).toBeGreaterThanOrEqual(1);
            expect(screen.getByText("Pacer")).toBeDefined();

            const pacerBtn = screen.getByLabelText(/Open live tempo coach for cadence 3-1-1-0/i);
            fireEvent.click(pacerBtn);

            expect(screen.getByRole("button", { name: /Close metronome modal/i })).toBeDefined();
            expect(screen.getByText("START PACING")).toBeDefined();
        });
    });

    describe("3. ExerciseCardMediaDrawer", () => {
        const mockExercise: Exercise = {
            id: "ex-bench",
            name: "Barbell Bench Press",
            target_muscle: "Chest",
            instructions: "Keep shoulder blades retracted",
            form_cues: ["Retract scapula", "Plant feet firmly"],
        };

        it("toggles collapsible media drawer and shows cue count badge", () => {
            render(<ExerciseCardMediaDrawer exercise={mockExercise} />);

            expect(screen.getByText("Exercise Form & Animation")).toBeDefined();
            expect(screen.getByText("2 Cues")).toBeDefined();
            expect(screen.getByText("View")).toBeDefined();

            const triggerBtn = screen.getByRole("button", { name: /Show visual guide for Barbell Bench Press/i });
            fireEvent.click(triggerBtn);

            expect(screen.getByText("Hide")).toBeDefined();
            expect(screen.getByTestId("visual-cue-fallback")).toBeDefined();

            fireEvent.click(triggerBtn);
            expect(screen.getByText("View")).toBeDefined();
        });
    });

    describe("4. SetLoggingValueTabs", () => {
        it("renders active tab styles and dispatches tab selections", () => {
            const onSelectTab = vi.fn();
            render(
                <SetLoggingValueTabs
                    activeTab="weight"
                    onSelectTab={onSelectTab}
                    weight={80}
                    reps={10}
                />
            );

            expect(screen.getByText("80")).toBeDefined();
            expect(screen.getByText("10")).toBeDefined();

            const repsTab = screen.getByText("Reps").closest("button")!;
            fireEvent.click(repsTab);
            expect(onSelectTab).toHaveBeenCalledWith("reps");
        });
    });

    describe("5. SetLoggingPacerBar", () => {
        it("renders tempo pacer pill and toggles visual cue fallback", () => {
            render(
                <SetLoggingPacerBar
                    exerciseName="Lat Pulldown"
                    tempo="3-0-1-0"
                    targetMuscle="Back"
                />
            );

            expect(screen.getByText("3-0-1-0")).toBeDefined();
            expect(screen.getByText("Pacer")).toBeDefined();

            const cueToggle = screen.getByRole("button", { name: /Show exercise visual cues/i });
            fireEvent.click(cueToggle);

            expect(screen.getByTestId("visual-cue-fallback")).toBeDefined();
            expect(screen.getByTestId("target-muscle-highlight")).toBeDefined();
            expect(screen.getByText("Hide Cue")).toBeDefined();

            fireEvent.click(cueToggle);
            expect(screen.queryByTestId("visual-cue-fallback")).toBeNull();
        });
    });

    describe("6. SetLoggingBottomSheet Pacing Integration & Non-Interference", () => {
        it("renders bottom sheet with pacer bar and tabs, saving inputs without interfering with rest trigger", () => {
            const onSave = vi.fn();
            const onToggleComplete = vi.fn();
            const onClose = vi.fn();

            render(
                <SetLoggingBottomSheet
                    isOpen={true}
                    onClose={onClose}
                    exerciseName="Barbell Squat"
                    setIndex={1}
                    totalSets={3}
                    weight={100}
                    reps={8}
                    rpe={8}
                    tempo="4-0-1-0"
                    onSave={onSave}
                    onToggleComplete={onToggleComplete}
                />
            );

            expect(screen.getByText("4-0-1-0")).toBeDefined();
            expect(screen.getByText("Weight (kg)")).toBeDefined();
            expect(screen.getByText("Reps")).toBeDefined();

            // Click complete CTA
            const completeBtn = screen.getByText("COMPLETE & LOG SET");
            fireEvent.click(completeBtn);

            expect(onSave).toHaveBeenCalledWith({ weight: 100, reps: 8, rpe: 8 });
            expect(onToggleComplete).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("when isCompleted is false, clicking 'COMPLETE & LOG SET' calls onSave and onToggleComplete", () => {
            const onSave = vi.fn();
            const onToggleComplete = vi.fn();
            const onClose = vi.fn();

            render(
                <SetLoggingBottomSheet
                    isOpen={true}
                    onClose={onClose}
                    exerciseName="Barbell Squat"
                    setIndex={1}
                    totalSets={3}
                    weight={100}
                    reps={8}
                    rpe={8}
                    isCompleted={false}
                    onSave={onSave}
                    onToggleComplete={onToggleComplete}
                />
            );

            const completeBtn = screen.getByText("COMPLETE & LOG SET");
            fireEvent.click(completeBtn);

            expect(onSave).toHaveBeenCalledWith({ weight: 100, reps: 8, rpe: 8 });
            expect(onToggleComplete).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("when isCompleted is true, clicking 'SET COMPLETED — TAP TO UPDATE' calls onSave and does NOT call onToggleComplete", () => {
            const onSave = vi.fn();
            const onToggleComplete = vi.fn();
            const onClose = vi.fn();

            render(
                <SetLoggingBottomSheet
                    isOpen={true}
                    onClose={onClose}
                    exerciseName="Barbell Squat"
                    setIndex={1}
                    totalSets={3}
                    weight={105}
                    reps={10}
                    rpe={9}
                    isCompleted={true}
                    onSave={onSave}
                    onToggleComplete={onToggleComplete}
                />
            );

            const updateBtn = screen.getByText("SET COMPLETED — TAP TO UPDATE");
            fireEvent.click(updateBtn);

            expect(onSave).toHaveBeenCalledWith({ weight: 105, reps: 10, rpe: 9 });
            expect(onToggleComplete).not.toHaveBeenCalled();
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
