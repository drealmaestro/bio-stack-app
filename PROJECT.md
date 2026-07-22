# Project: Bio-Stack App Enhancement

## Architecture & Code Layout Rules
- **Stack**: React 19, Vite, TypeScript, Tailwind CSS v4, Zustand, IndexedDB, Firebase/Firestore, Vitest/Jest test framework.
- **Strict File Limit**: Maximum 350 lines of code per component file (target <300 lines). Monoliths (`ActiveWorkout.tsx`, `WorkoutManager.tsx`) MUST be split into modular sub-components.
- **Viewport Containment**: Main outer container MUST be locked with `h-[100dvh] max-h-[100dvh] overflow-hidden`. Page scrolling happens exclusively inside inner `overflow-y-auto` containers.
- **Tailwind v4 Styling**: Custom `@utility` definitions must use standard CSS nesting (e.g. `&:hover`, `&:active`) rather than direct pseudo-class appending (`@utility card:hover` is FORBIDDEN).
- **Integrity**: 0 TypeScript compilation errors, 0 lint warnings, 100% passing tests, genuine implementations without hardcoded test mocks or dummy facades.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Baseline | Code discovery, line counts, test suite audit, dev server status | None | DONE |
| 2 | R1: Refactoring Monoliths | Split ActiveWorkout.tsx & WorkoutManager.tsx, custom hooks & Zustand slices | M1 | DONE |
| 3 | R2: UI/UX & PWA Ergonomics | 100dvh viewport lock, floating persistent rest timer across tabs, dark mode glassmorphism, muscle heatmap | M2 | DONE |
| 4 | R3: Fitness & Nutrition Intelligence | Warm-up calculator, 1RM formulas (Epley/Brzycki) + tests, macro progress bars, meal presets, streaks, volume analytics | M3 | DONE |
| 5 | R4: Performance & Offline Reliability | Optimistic updates, IndexedDB fallback, Web Worker / background audio timer alerts | M4 | DONE |
| 6 | E2E, Unit Tests & Forensic Audit | Verification of all tests, line counts, dev server, and Forensic Auditor clean verdict | M5 | DONE |

## Interface Contracts
### ActiveWorkout Module Sub-Components & Hooks
- `useActiveWorkoutStore`: Zustand slice managing active workout session state, elapsed rest timer, set completion.
- `useRestTimer`: Custom hook handling rest timer countdown, persistent storage, audio/web worker alerts.
- Sub-components in `src/components/workout/active/`: `ActiveWorkoutHeader.tsx`, `ExerciseCard.tsx`, `SetRow.tsx`, `RestTimerWidget.tsx`, `WarmUpCalculatorModal.tsx`.

### WorkoutManager Module Sub-Components
- `src/components/workout/manager/`: `RoutineList.tsx`, `RoutineEditor.tsx`, `ExerciseSelectorModal.tsx`, `WorkoutHistoryView.tsx`.

### Fitness & Nutrition Math & Analytics
- `src/utils/fitnessMath.ts`: `calculate1RM(weight, reps, formula)`, `calculateWarmUpSets(workingWeight, reps)`.
- `src/utils/nutritionMath.ts`: `calculateMacroProgress(consumed, target)`, `calculateDailyStreak(logs)`.
