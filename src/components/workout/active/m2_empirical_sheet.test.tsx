import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SetLoggingBottomSheet } from "./SetLoggingBottomSheet";
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

const mockHoldRec: SmartRecommendation = {
  action: "hold",
  type: "maintain",
  suggestedWeightKg: 80,
  suggestedReps: 8,
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
  suggestedReps: 8,
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

describe("Milestone 2 SetLoggingBottomSheet & Chips Empirical Challenge", () => {
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

  describe("1. Smart Recommendation & AutoFill Chips in Bottom Sheet", () => {
    it("tapping Smart Rec chip populates both weight and reps into sheet state and onSave", () => {
      const onSaveSpy = vi.fn();
      render(
        <SetLoggingBottomSheet
          isOpen={true}
          onClose={vi.fn()}
          exerciseName="Barbell Row"
          setIndex={1}
          totalSets={4}
          weight={60}
          reps={8}
          targetReps={10}
          recommendation={mockOverloadRec}
          onSave={onSaveSpy}
          onToggleComplete={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText(/Smart Rec/i));
      expect(onSaveSpy).toHaveBeenCalledWith({ weight: 82.5, reps: 10, rpe: 7 });
      expect(screen.getByText("82.5")).toBeDefined();
      expect(screen.getByText(/10\s*reps/i)).toBeDefined();
    });

    it("renders Copy Previous Set chip and applies values accurately on click", () => {
      const onSaveSpy = vi.fn();
      render(
        <SetLoggingBottomSheet
          isOpen={true}
          onClose={vi.fn()}
          exerciseName="Incline Dumbbell Press"
          setIndex={2}
          totalSets={3}
          weight={24}
          reps={8}
          previousSet={{ weight: 28, reps: 10 }}
          onSave={onSaveSpy}
          onToggleComplete={vi.fn()}
        />
      );

      const copyBtn = screen.getByText(/Copy Set 1/i);
      expect(copyBtn).toBeDefined();
      fireEvent.click(copyBtn);
      expect(onSaveSpy).toHaveBeenCalledWith(expect.objectContaining({ weight: 28, reps: 10 }));
    });

    it("renders Last Session Set chip and applies historical values on click", () => {
      const onSaveSpy = vi.fn();
      render(
        <SetLoggingBottomSheet
          isOpen={true}
          onClose={vi.fn()}
          exerciseName="Overhead Press"
          setIndex={1}
          totalSets={3}
          weight={40}
          reps={8}
          lastSet={{ weight: 50, reps: 6 }}
          onSave={onSaveSpy}
          onToggleComplete={vi.fn()}
        />
      );

      const lastBtn = screen.getByText(/Last Session/i);
      expect(lastBtn).toBeDefined();
      fireEvent.click(lastBtn);
      expect(onSaveSpy).toHaveBeenCalledWith(expect.objectContaining({ weight: 50, reps: 6 }));
    });
  });

  describe("2. SetAutoFillChips Standalone Direct Verification", () => {
    it("returns null when no recommendation, previous set, or last session set exist", () => {
      const { container } = render(
        <SetAutoFillChips
          recommendation={null}
          previousSet={null}
          lastSessionSet={null}
          onApply={vi.fn()}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it("formats hold and deload recommendations properly in chips", () => {
      const onApply = vi.fn();
      const { rerender } = render(
        <SetAutoFillChips recommendation={mockHoldRec} onApply={onApply} />
      );
      expect(screen.getByText(/Hold/i)).toBeDefined();

      rerender(<SetAutoFillChips recommendation={mockDeloadRec} onApply={onApply} />);
      expect(screen.getByText(/-10% Deload/i)).toBeDefined();
    });
  });

  describe("3. Sheet Edge Cases & Resilience", () => {
    it("populates bodyweight 0kg in SetLoggingBottomSheet without NaN or crashing", () => {
      const onSaveSpy = vi.fn();
      render(
        <SetLoggingBottomSheet
          isOpen={true}
          onClose={vi.fn()}
          exerciseName="Dips"
          setIndex={1}
          totalSets={3}
          weight={10}
          reps={10}
          recommendation={mockBodyweightRec}
          onSave={onSaveSpy}
          onToggleComplete={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText(/Smart Rec/i));
      expect(onSaveSpy).toHaveBeenCalledWith(expect.objectContaining({ weight: 0, reps: 15 }));
    });

    it("survives 20 rapid consecutive clicks on Smart Rec chip idempotently", () => {
      const onSaveSpy = vi.fn();
      render(
        <SetLoggingBottomSheet
          isOpen={true}
          onClose={vi.fn()}
          exerciseName="Bench Press"
          setIndex={1}
          totalSets={3}
          weight={60}
          reps={8}
          recommendation={mockOverloadRec}
          onSave={onSaveSpy}
          onToggleComplete={vi.fn()}
        />
      );

      const chip = screen.getByText(/Smart Rec/i);
      for (let i = 0; i < 20; i++) {
        fireEvent.click(chip);
      }
      expect(onSaveSpy).toHaveBeenCalledTimes(20);
      expect(onSaveSpy).toHaveBeenLastCalledWith(expect.objectContaining({ weight: 82.5, reps: 10 }));
    });

    it("handles extreme values without UI distortion or NaN crashes", () => {
      const onSaveSpy = vi.fn();
      render(
        <SetLoggingBottomSheet
          isOpen={true}
          onClose={vi.fn()}
          exerciseName="Leg Press"
          setIndex={3}
          totalSets={3}
          weight={500}
          reps={150}
          rpe={10}
          onSave={onSaveSpy}
          onToggleComplete={vi.fn()}
        />
      );

      expect(screen.getByText("500")).toBeDefined();
      expect(screen.getByText("150")).toBeDefined();
    });
  });
});
