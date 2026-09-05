import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SetRow } from "./SetRow";
import { SetLoggingBottomSheet } from "./SetLoggingBottomSheet";
import { RecommendationBadge } from "./RecommendationBadge";
import { SetAutoFillChips } from "./SetAutoFillChips";
import { useStore } from "../../../store/useStore";
import { useActiveWorkoutStore } from "../../../store/useActiveWorkoutStore";
import type { SmartRecommendation } from "../../../utils/progressiveOverload";

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

const mockOverloadRec: SmartRecommendation = {
    action: "increase",
    type: "weight",
    suggestedWeightKg: 82.5,
    suggestedReps: 10,
    deltaWeightKg: 2.5,
    deltaReps: 0,
    reason: "Hit 10 reps @ RPE 7 last week: +2.5 kg suggested",
    shortBadgeText: "+2.5 kg",
    confidence: "high",
    isDeload: false,
    isOverload: true,
    historicalTopWeight: 80,
    historicalMaxRpe: 7.5,
    readinessScore: 85,
};

const mockHoldRec: SmartRecommendation = {
    action: "hold",
    type: "maintain",
    suggestedWeightKg: 80,
    suggestedReps: 10,
    deltaWeightKg: 0,
    deltaReps: 0,
    reason: "Fatigue elevated: Hold weight to consolidate form",
    shortBadgeText: "Hold",
    confidence: "moderate",
    isDeload: false,
    isOverload: false,
    historicalTopWeight: 80,
    historicalMaxRpe: 9.5,
    readinessScore: 55,
};

const mockDeloadRec: SmartRecommendation = {
    action: "deload",
    type: "deload",
    suggestedWeightKg: 72.5,
    suggestedReps: 10,
    deltaWeightKg: -7.5,
    deltaReps: 0,
    reason: "Readiness deficit: 10% deload suggested",
    shortBadgeText: "-10% Deload",
    confidence: "high",
    isDeload: true,
    isOverload: false,
    historicalTopWeight: 80,
    historicalMaxRpe: 9.0,
    readinessScore: 45,
};

describe("SmartRecommendation Component & Integration Suite", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useStore.getState().resetStore();
        useActiveWorkoutStore.getState().cancelWorkout();

        if (!("vibrate" in navigator)) {
            Object.defineProperty(navigator, "vibrate", {
                value: vi.fn(),
                writable: true,
                configurable: true,
            });
        }
    });

    describe("RecommendationBadge Component", () => {
        it("renders overload action badge, target weight, reps, and coach rationale tooltip", () => {
            const onApply = vi.fn();
            render(<RecommendationBadge recommendation={mockOverloadRec} onApply={onApply} />);

            expect(screen.getByText("+2.5 kg")).toBeDefined();
            expect(screen.getByText(/82.5\s*kg/i)).toBeDefined();
            expect(screen.getByText(/10 reps/i)).toBeDefined();
            expect(screen.getByTitle(/Hit 10 reps @ RPE 7 last week/i)).toBeDefined();
        });

        it("renders hold and deload action text correctly", () => {
            const onApply = vi.fn();
            const { rerender } = render(<RecommendationBadge recommendation={mockHoldRec} onApply={onApply} />);
            expect(screen.getByText("Hold")).toBeDefined();

            rerender(<RecommendationBadge recommendation={mockDeloadRec} onApply={onApply} />);
            expect(screen.getByText("-10% Deload")).toBeDefined();
            expect(screen.getByText(/72.5\s*kg/i)).toBeDefined();
        });

        it("dispatches suggested values on 1-tap Apply click with haptic vibration", () => {
            const onApply = vi.fn();
            const vibrateSpy = vi.spyOn(navigator, "vibrate");
            render(<RecommendationBadge recommendation={mockOverloadRec} onApply={onApply} />);

            const applyBtn = screen.getByRole("button", { name: /apply/i });
            fireEvent.click(applyBtn);

            expect(onApply).toHaveBeenCalledWith(82.5, 10);
            expect(vibrateSpy).toHaveBeenCalledWith(30);
        });

        it("provides accessible 44x44px minimum touch target on Apply button", () => {
            render(<RecommendationBadge recommendation={mockOverloadRec} onApply={vi.fn()} />);
            const applyBtn = screen.getByRole("button", { name: /apply/i });
            expect(applyBtn.className).toContain("min-h-[44px]");
            expect(applyBtn.className).toContain("min-w-[44px]");
        });
    });

    describe("SetRow Component Integration", () => {
        it("renders recommendation badge on upcoming uncompleted set", () => {
            render(
                <SetRow
                    exerciseName="Bench Press"
                    exerciseIndex={0}
                    setNum={1}
                    targetReps={10}
                    currentWeight={80}
                    currentReps={10}
                    currentRpe={8}
                    isCompleted={false}
                    isUpcoming={true}
                    hasRepsKey={true}
                    recommendation={mockOverloadRec}
                    onWeightChange={vi.fn()}
                    onRepsChange={vi.fn()}
                    onRpeChange={vi.fn()}
                    onToggleComplete={vi.fn()}
                />
            );

            expect(screen.getByText("+2.5 kg")).toBeDefined();
            expect(screen.getByText(/82.5/)).toBeDefined();
            expect(screen.getByText(/Hit 10 reps @ RPE 7 last week/i)).toBeDefined();
        });

        it("populates inputs when 1-tap Apply is clicked on SetRow", () => {
            const onWeightChange = vi.fn();
            const onRepsChange = vi.fn();

            render(
                <SetRow
                    exerciseName="Bench Press"
                    exerciseIndex={0}
                    setNum={1}
                    targetReps={10}
                    currentWeight={80}
                    currentReps={10}
                    currentRpe={8}
                    isCompleted={false}
                    isUpcoming={true}
                    hasRepsKey={true}
                    recommendation={mockOverloadRec}
                    onWeightChange={onWeightChange}
                    onRepsChange={onRepsChange}
                    onRpeChange={vi.fn()}
                    onToggleComplete={vi.fn()}
                />
            );

            const applyBtn = screen.getByRole("button", { name: /apply/i });
            fireEvent.click(applyBtn);

            expect(onWeightChange).toHaveBeenCalledWith(82.5);
            expect(onRepsChange).toHaveBeenCalledWith(10);
        });

        it("does NOT render recommendation badge on completed set", () => {
            const onWeightChange = vi.fn();

            render(
                <SetRow
                    exerciseName="Bench Press"
                    exerciseIndex={0}
                    setNum={1}
                    targetReps={10}
                    currentWeight={80}
                    currentReps={10}
                    currentRpe={8}
                    isCompleted={true}
                    isUpcoming={false}
                    hasRepsKey={true}
                    recommendation={mockOverloadRec}
                    onWeightChange={onWeightChange}
                    onRepsChange={vi.fn()}
                    onRpeChange={vi.fn()}
                    onToggleComplete={vi.fn()}
                />
            );

            expect(screen.queryByText("+2.5 kg")).toBeNull();
            expect(screen.queryByRole("button", { name: /apply/i })).toBeNull();
            expect(onWeightChange).not.toHaveBeenCalled();
            expect(screen.getByText("80 kg")).toBeDefined();
        });
    });

    describe("SetAutoFillChips & SetLoggingBottomSheet Integration", () => {
        it("renders smart recommendation chip in SetAutoFillChips and handles 1-tap apply", () => {
            const onApply = vi.fn();
            render(
                <SetAutoFillChips
                    recommendation={mockOverloadRec}
                    previousSet={{ weight: 80, reps: 10 }}
                    previousSetIndex={1}
                    onApply={onApply}
                />
            );

            expect(screen.getByText(/Smart Rec/i)).toBeDefined();
            expect(screen.getByText(/82.5kg × 10/i)).toBeDefined();
            expect(screen.getByText(/Copy Set 1/i)).toBeDefined();

            fireEvent.click(screen.getByText(/Smart Rec/i));
            expect(onApply).toHaveBeenCalledWith(82.5, 10);
        });

        it("auto-fills weight and reps inputs when smart recommendation chip is tapped in sheet", () => {
            const onSave = vi.fn();

            render(
                <SetLoggingBottomSheet
                    isOpen={true}
                    onClose={vi.fn()}
                    exerciseName="Incline Dumbbell Press"
                    setIndex={2}
                    totalSets={3}
                    weight={30}
                    reps={10}
                    recommendation={mockOverloadRec}
                    onSave={onSave}
                    onToggleComplete={vi.fn()}
                />
            );

            const smartChip = screen.getByText(/Smart Rec/i);
            fireEvent.click(smartChip);

            expect(onSave).toHaveBeenCalledWith(
                expect.objectContaining({ weight: 82.5, reps: 10 })
            );
        });
    });

    describe("ActiveWorkoutStore Synchronization", () => {
        it("updates active workout store weights and reps on recommendation apply", () => {
            useActiveWorkoutStore.getState().startWorkout("tmpl-1");

            const onWeightChange = (w: number) => {
                useActiveWorkoutStore.getState().updateSetWeight(0, 1, w);
            };
            const onRepsChange = (r: number) => {
                useActiveWorkoutStore.getState().updateSetReps(0, 1, r);
            };

            render(
                <SetRow
                    exerciseName="Squat"
                    exerciseIndex={0}
                    setNum={1}
                    targetReps={8}
                    currentWeight={100}
                    currentReps={8}
                    currentRpe={8}
                    isCompleted={false}
                    isUpcoming={true}
                    hasRepsKey={true}
                    recommendation={{
                        ...mockOverloadRec,
                        suggestedWeightKg: 105,
                        suggestedReps: 8,
                        deltaWeightKg: 5,
                    }}
                    onWeightChange={onWeightChange}
                    onRepsChange={onRepsChange}
                    onRpeChange={vi.fn()}
                    onToggleComplete={vi.fn()}
                />
            );

            const applyBtn = screen.getByRole("button", { name: /apply/i });
            fireEvent.click(applyBtn);

            const storeState = useActiveWorkoutStore.getState().activeWorkout;
            expect(storeState?.setWeights["0-1"]).toBe(105);
            expect(storeState?.setReps["0-1"]).toBe(8);
        });
    });
});