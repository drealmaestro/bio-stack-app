import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
// @ts-expect-error Node built-in in vitest runtime
import fs from "node:fs";
// @ts-expect-error Node built-in in vitest runtime
import path from "node:path";
import { RoutineCard } from "../manager/RoutineCard";
import type { WorkoutTemplate, ActiveWorkoutState } from "../../../types";

declare const process: { cwd: () => string };

describe("Milestone 3 Challenger 2: Adversarial Boundary & Containment Verification", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("1. Strict Line Limit Verification Oracle", () => {
        const fileLimits: Record<string, number> = {
            "src/components/workout/active/ExerciseCard.tsx": 250,
            "src/components/workout/active/ExerciseCardHeader.tsx": 250,
            "src/components/workout/active/ExerciseTempoIntegration.tsx": 250,
            "src/components/workout/active/ExerciseCardMediaDrawer.tsx": 250,
            "src/components/workout/active/SetLoggingBottomSheet.tsx": 250,
            "src/components/workout/active/SetLoggingValueTabs.tsx": 250,
            "src/components/workout/active/SetLoggingPacerBar.tsx": 250,
            "src/components/workout/active/m3_active_workout_integration.test.tsx": 350,
            "src/components/workout/manager/RoutineCard.tsx": 250,
            "src/pages/Profile.tsx": 250,
        };

        for (const [filePath, maxLimit] of Object.entries(fileLimits)) {
            it(`verifies ${path.basename(filePath)} has <= ${maxLimit} lines`, () => {
                const fullPath = path.resolve(process.cwd(), filePath);
                expect(fs.existsSync(fullPath)).toBe(true);
                const content = fs.readFileSync(fullPath, "utf-8");
                const lineCount = content.split("\n").length;
                expect(lineCount).toBeLessThanOrEqual(maxLimit);
            });
        }
    });

    describe("2. Viewport Containment & CSS Architecture Oracle", () => {
        it("verifies index.css locks viewport with h-[100dvh] max-h-[100dvh] overflow-hidden", () => {
            const cssPath = path.resolve(process.cwd(), "src/index.css");
            const cssContent = fs.readFileSync(cssPath, "utf-8");
            expect(cssContent).toContain("h-[100dvh]");
            expect(cssContent).toContain("max-h-[100dvh]");
            expect(cssContent).toContain("overflow-hidden");
        });

        it("verifies Layout.tsx main container has h-[100dvh] max-h-[100dvh] overflow-hidden and inner overflow-y-auto", () => {
            const layoutPath = path.resolve(process.cwd(), "src/components/Layout.tsx");
            const layoutContent = fs.readFileSync(layoutPath, "utf-8");
            expect(layoutContent).toContain("h-[100dvh] max-h-[100dvh] overflow-hidden");
            expect(layoutContent).toContain("overflow-y-auto");
        });

        it("verifies Tailwind v4 custom utilities do not append pseudo-classes directly to utility names", () => {
            const cssPath = path.resolve(process.cwd(), "src/index.css");
            const cssContent = fs.readFileSync(cssPath, "utf-8");
            const utilityLines = cssContent
                .split("\n")
                .filter((line: string) => line.trim().startsWith("@utility"));

            for (const line of utilityLines) {
                // Must not have :hover, :active, :focus directly after @utility
                expect(line).not.toMatch(/@utility\s+[a-zA-Z0-9_-]+:(hover|active|focus)/);
            }
        });
    });

    describe("3. RoutineCard Download Trigger & Session Boundary", () => {
        const mockTemplate: WorkoutTemplate = {
            id: "tmpl-hypertrophy-push",
            name: "Hypertrophy Push",
            description: "High volume push day",
            difficulty: "Intermediate",
            focus_goal: "Hypertrophy",
            target_duration: 60,
            exercises: [
                { exercise_id: "bench_press", target_sets: 4, target_reps: 8, rest_seconds: 90 },
                { exercise_id: "incline_db_press", target_sets: 3, target_reps: 10, rest_seconds: 60 },
            ],
        };

        it("renders media download trigger button and allows routine start when no active workout", async () => {
            const onStartWorkout = vi.fn();
            const onToggleEditor = vi.fn();

            await act(async () => {
                render(
                    <MemoryRouter>
                        <RoutineCard
                            template={mockTemplate}
                            isOpen={false}
                            sessionCount={5}
                            lastSessionDate="2026-10-01"
                            muscleGroups={["Chest", "Shoulders", "Triceps"]}
                            activeWorkout={null}
                            onStartWorkout={onStartWorkout}
                            onToggleEditor={onToggleEditor}
                        />
                    </MemoryRouter>
                );
            });

            expect(screen.getByText("Hypertrophy Push")).toBeDefined();
            expect(screen.getByRole("button", { name: /Download routine media/i })).toBeDefined();

            const startBtn = screen.getByRole("link", { name: /Start Hypertrophy Push/i });
            await act(async () => {
                fireEvent.click(startBtn);
            });
            expect(onStartWorkout).toHaveBeenCalledWith("tmpl-hypertrophy-push");

            const editBtn = screen.getByRole("button", { name: /Edit Hypertrophy Push exercises/i });
            await act(async () => {
                fireEvent.click(editBtn);
            });
            expect(onToggleEditor).toHaveBeenCalledTimes(1);
        });

        it("disables start workout trigger and prevents navigation when active session is running", async () => {
            const onStartWorkout = vi.fn();
            const activeSession: ActiveWorkoutState = {
                templateId: "running-template",
                startTime: Date.now() - 10000,
                completedSets: [],
                setWeights: {},
                setReps: {},
                setRpes: {},
                restEndTime: null,
                originalRestDuration: 0,
            };

            await act(async () => {
                render(
                    <MemoryRouter>
                        <RoutineCard
                            template={mockTemplate}
                            isOpen={false}
                            sessionCount={5}
                            lastSessionDate="2026-10-01"
                            muscleGroups={["Chest"]}
                            activeWorkout={activeSession}
                            onStartWorkout={onStartWorkout}
                            onToggleEditor={vi.fn()}
                        />
                    </MemoryRouter>
                );
            });

            const startBtn = screen.getByRole("link", { name: /Start Hypertrophy Push/i });
            expect(startBtn.className).toContain("cursor-not-allowed");

            await act(async () => {
                fireEvent.click(startBtn);
            });
            expect(onStartWorkout).not.toHaveBeenCalled();
        });
    });
});
