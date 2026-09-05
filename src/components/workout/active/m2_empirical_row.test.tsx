import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SetRow, type SetRowProps } from "./SetRow";
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

const mockBodyweightRec: SmartRecommendation = {
  action: "increase",
  type: "reps",
  suggestedWeightKg: 0,
  suggestedReps: 15,
  deltaWeightKg: 0,
  deltaReps: 2,
  reason: "Bodyweight mastery: +2 reps progression",
  shortBadgeText: "+2 Reps",
  confidence: "high",
  isDeload: false,
  isOverload: true,
  historicalTopWeight: 0,
  historicalMaxRpe: 7.0,
  readinessScore: 90,
};

const mockExtremeRec: SmartRecommendation = {
  action: "increase",
  type: "weight",
  suggestedWeightKg: 450,
  suggestedReps: 100,
  deltaWeightKg: 25,
  deltaReps: 10,
  reason: "Extreme volume overload test",
  shortBadgeText: "+25 kg",
  confidence: "high",
  isDeload: false,
  isOverload: true,
  historicalTopWeight: 425,
  historicalMaxRpe: 8.0,
  readinessScore: 95,
};

const renderSetRow = (props: Partial<SetRowProps> = {}) =>
  render(
    <SetRow
      exerciseName="Barbell Bench Press"
      exerciseIndex={0}
      setNum={1}
      targetReps={10}
      currentWeight={80}
      currentReps={8}
      currentRpe={7}
      isCompleted={false}
      isUpcoming={true}
      hasRepsKey={true}
      onWeightChange={vi.fn()}
      onRepsChange={vi.fn()}
      onRpeChange={vi.fn()}
      onToggleComplete={vi.fn()}
      {...props}
    />
  );

describe("Milestone 2 SetRow Interaction & Safety Empirical Challenge", () => {
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

  describe("1. SetRow 1-Tap Apply & Store Synchronization", () => {
    it("updates setWeights and setReps directly in useActiveWorkoutStore on 1-tap Apply", () => {
      useActiveWorkoutStore.getState().startWorkout("test-template");
      useActiveWorkoutStore.getState().updateSetWeight(0, 1, 80);
      useActiveWorkoutStore.getState().updateSetReps(0, 1, 8);

      renderSetRow({
        recommendation: mockOverloadRec,
        onWeightChange: (w) =>
          useActiveWorkoutStore.getState().updateSetWeight(0, 1, w),
        onRepsChange: (r) =>
          useActiveWorkoutStore.getState().updateSetReps(0, 1, r),
      });

      fireEvent.click(screen.getByRole("button", { name: /apply/i }));
      const active = useActiveWorkoutStore.getState().activeWorkout;
      expect(active?.setWeights["0-1"]).toBe(82.5);
      expect(active?.setReps["0-1"]).toBe(10);
    });

    it("dispatches custom onApplyRecommendation when supplied without calling separate handlers", () => {
      const customSpy = vi.fn();
      const weightSpy = vi.fn();
      const repsSpy = vi.fn();
      renderSetRow({
        recommendation: mockOverloadRec,
        onApplyRecommendation: customSpy,
        onWeightChange: weightSpy,
        onRepsChange: repsSpy,
      });

      fireEvent.click(screen.getByRole("button", { name: /apply/i }));
      expect(customSpy).toHaveBeenCalledWith(82.5, 10);
      expect(weightSpy).not.toHaveBeenCalled();
      expect(repsSpy).not.toHaveBeenCalled();
    });
  });

  describe("2. Event Bubbling & e.stopPropagation() Safety", () => {
    it("stops event propagation so onOpenSheet and parent container do NOT fire when clicking Apply", () => {
      const sheetSpy = vi.fn();
      const parentSpy = vi.fn();

      render(
        <div onClick={parentSpy} data-testid="outer-wrapper">
          <SetRow
            exerciseName="Barbell Squat"
            exerciseIndex={0}
            setNum={1}
            targetReps={10}
            currentWeight={100}
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
            onOpenSheet={sheetSpy}
          />
        </div>
      );

      fireEvent.click(screen.getByRole("button", { name: /apply/i }));
      expect(sheetSpy).not.toHaveBeenCalled();
      expect(parentSpy).not.toHaveBeenCalled();

      fireEvent.click(screen.getByText("100 kg"));
      expect(sheetSpy).toHaveBeenCalledTimes(1);
      expect(parentSpy).toHaveBeenCalledTimes(1);
    });

    it("stops event propagation on toggle complete button so onOpenSheet does NOT fire", () => {
      const sheetSpy = vi.fn();
      const toggleSpy = vi.fn();
      renderSetRow({ onToggleComplete: toggleSpy, onOpenSheet: sheetSpy });

      fireEvent.click(screen.getByRole("button", { name: /mark complete/i }));
      expect(toggleSpy).toHaveBeenCalledTimes(1);
      expect(sheetSpy).not.toHaveBeenCalled();
    });
  });

  describe("3. Completed Set Immutability & Badge Isolation", () => {
    it("never renders recommendation badge or Apply button when set is completed", () => {
      renderSetRow({
        isCompleted: true,
        isUpcoming: false,
        recommendation: mockOverloadRec,
        currentWeight: 50,
      });
      expect(screen.queryByRole("button", { name: /apply/i })).toBeNull();
      expect(screen.queryByText("+2.5 kg")).toBeNull();
      expect(screen.getByText("50 kg")).toBeDefined();
    });

    it("never renders badge on uncompleted set that is NOT upcoming (isUpcoming = false)", () => {
      renderSetRow({
        isCompleted: false,
        isUpcoming: false,
        recommendation: mockOverloadRec,
      });
      expect(screen.queryByRole("button", { name: /apply/i })).toBeNull();
      expect(screen.queryByText("+2.5 kg")).toBeNull();
    });
  });

  describe("4. Edge Cases: Bodyweight, Rapid Clicks, Extreme Reps & Isolation", () => {
    it("handles bodyweight exercises (0kg) cleanly: badge shows reps only, Apply sets weight=0 and reps=15", () => {
      useActiveWorkoutStore.getState().startWorkout("bw-tmpl");
      renderSetRow({
        exerciseName: "Pull-Ups",
        currentWeight: 0,
        currentReps: 12,
        recommendation: mockBodyweightRec,
        onWeightChange: (w) =>
          useActiveWorkoutStore.getState().updateSetWeight(0, 1, w),
        onRepsChange: (r) =>
          useActiveWorkoutStore.getState().updateSetReps(0, 1, r),
      });

      expect(screen.getByText("(15 reps)")).toBeDefined();
      expect(screen.queryByText(/0kg ×/i)).toBeNull();

      fireEvent.click(screen.getByRole("button", { name: /apply/i }));
      const active = useActiveWorkoutStore.getState().activeWorkout;
      expect(active?.setWeights["0-1"]).toBe(0);
      expect(active?.setReps["0-1"]).toBe(15);
    });

    it("survives 25 rapid consecutive clicks on Apply idempotently without state corruption", () => {
      useActiveWorkoutStore.getState().startWorkout("rapid-click-test");
      renderSetRow({
        recommendation: mockOverloadRec,
        onWeightChange: (w) =>
          useActiveWorkoutStore.getState().updateSetWeight(0, 1, w),
        onRepsChange: (r) =>
          useActiveWorkoutStore.getState().updateSetReps(0, 1, r),
      });

      const applyBtn = screen.getByRole("button", { name: /apply/i });
      for (let i = 0; i < 25; i++) {
        fireEvent.click(applyBtn);
      }

      const state = useActiveWorkoutStore.getState().activeWorkout;
      expect(state?.setWeights["0-1"]).toBe(82.5);
      expect(state?.setReps["0-1"]).toBe(10);
      expect(Object.keys(state?.setWeights || {}).length).toBe(1);
    });

    it("handles extreme rep counts (100 reps) and heavy weight (450kg) accurately", () => {
      useActiveWorkoutStore.getState().startWorkout("extreme-tmpl");
      renderSetRow({
        exerciseName: "Leg Press",
        setNum: 2,
        currentWeight: 300,
        currentReps: 20,
        recommendation: mockExtremeRec,
        onWeightChange: (w) =>
          useActiveWorkoutStore.getState().updateSetWeight(0, 2, w),
        onRepsChange: (r) =>
          useActiveWorkoutStore.getState().updateSetReps(0, 2, r),
      });

      expect(screen.getByText("(450kg × 100 reps)")).toBeDefined();
      fireEvent.click(screen.getByRole("button", { name: /apply/i }));

      const state = useActiveWorkoutStore.getState().activeWorkout;
      expect(state?.setWeights["0-2"]).toBe(450);
      expect(state?.setReps["0-2"]).toBe(100);
    });

    it("preserves cross-set isolation when applying recommendation to an upcoming set", () => {
      useActiveWorkoutStore.getState().startWorkout("isolation-tmpl");
      const store = useActiveWorkoutStore.getState();
      store.updateSetWeight(0, 1, 100);
      store.updateSetReps(0, 1, 10);
      store.toggleSetComplete(0, 1, 0); // Set 1 completed
      store.updateSetWeight(0, 3, 70);
      store.updateSetReps(0, 3, 12); // Set 3 prefilled

      renderSetRow({
        setNum: 2,
        currentWeight: 100,
        currentReps: 10,
        recommendation: mockOverloadRec,
        onWeightChange: (w) =>
          useActiveWorkoutStore.getState().updateSetWeight(0, 2, w),
        onRepsChange: (r) =>
          useActiveWorkoutStore.getState().updateSetReps(0, 2, r),
      });

      fireEvent.click(screen.getByRole("button", { name: /apply/i }));
      const state = useActiveWorkoutStore.getState().activeWorkout;

      // Set 1 (completed) untouched:
      expect(state?.setWeights["0-1"]).toBe(100);
      expect(state?.setReps["0-1"]).toBe(10);
      expect(state?.completedSets).toContain("0-1");

      // Set 2 (upcoming) updated to recommendation:
      expect(state?.setWeights["0-2"]).toBe(82.5);
      expect(state?.setReps["0-2"]).toBe(10);
      expect(state?.completedSets).not.toContain("0-2");

      // Set 3 untouched:
      expect(state?.setWeights["0-3"]).toBe(70);
      expect(state?.setReps["0-3"]).toBe(12);
    });
  });
});
