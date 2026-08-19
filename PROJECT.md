# Project: Bio-Stack App (2026-08-07 Update)

## Architecture & Code Layout Rules
- **Stack**: React 19, Vite, TypeScript, Tailwind CSS v4, Zustand, IndexedDB, Firebase/Firestore, Vitest/Jest test framework.
- **Strict File Limit**: Maximum 350 lines of code per component file (target <250 lines). All sub-components must be single-responsibility and modular.
- **Viewport Containment**: Main outer container MUST be locked with `h-[100dvh] max-h-[100dvh] overflow-hidden`. Internal page scrolling happens exclusively inside inner `<main className="overflow-y-auto">` container.
- **Tailwind v4 Styling**: Custom `@utility` definitions must use standard CSS nesting (e.g. `&:hover`, `&:active`) rather than direct pseudo-class appending (`@utility card:hover` is FORBIDDEN).
- **Integrity**: 0 TypeScript compilation errors, 0 lint warnings, 100% passing tests, genuine implementations without hardcoded test mocks or dummy facades.

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | iOS Set Logging Bottom Sheet | Spring-animated `h-[80vh]` max drawer with drag-to-dismiss handle for active workout set entry | M1 | R1 | DONE |
| 2 | Tactile Numeric Keypad & RPE Slider | Custom touch keypad with quick-add weight pills and touch RPE slider (5.0–10.0) with effort badges | M1 | R1 | DONE |
| 3 | Micro-Animations & Non-Interrupting Rest Timer | Tactile haptics & micro confetti on set completion without resetting or interrupting floating rest timer | M1 | R1 | DONE |
| 4 | Locked Viewport Ergonomics | Locked `h-[100dvh] max-h-[100dvh] overflow-hidden` container with `backdrop-blur-2xl` nav bar | M1 | R1 | DONE |
| 5 | Moving Average (EMA) Trend Charts | Exponential moving average calculations for 1RM and volume load in Recharts/Canvas | M2 | R2 | DONE |
| 6 | Target Muscle Balance Heatmap | Dynamic muscle group distribution heatmap & volume balance visualizers | M2 | R2 | DONE |
| 7 | Rest-Period Compliance Metrics | Analytics widget for rest-period compliance tracking and historical trend analysis | M2 | R2 | DONE |
| 8 | Decoupled Active Workout Zustand State | Dedicated Zustand store slice (`useActiveWorkoutStore`) decoupled from monolithic AppState | M3 | R3 | DONE |
| 9 | Lightweight Backend & Offline API Routes | Modular API routes (<60-80 lines each) for Firebase/Firestore syncing and IndexedDB offline fallback | M3 | R3 | DONE |
| 10 | Component File Size Enforcement | Modular refactoring to guarantee all component files remain strictly under 250-350 lines | M3 | R3 | DONE |
| 11 | Math & Analytics Utilities Unit Tests | 100% test coverage on `fitnessMath.ts`, `progression.ts`, `volume.ts`, `nutritionMath.ts`, `nutritionGoals.ts` | M4 | R4 | PLANNED |
| 12 | Vitest Component Test Suites | Complete DOM Vitest component tests across Active Workout, Routine Management, and Nutrition Logging | M4 | R4 | PLANNED |
| 13 | E2E Simulator Verification & Forensic Audit | Verification of 0 tsc errors, 0 lint warnings, 100% pass on npm test & build, clean Forensic Auditor verdict | M5 | R4 | PLANNED |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Native-Feeling Set Logging & Ergonomics | `SetLoggingBottomSheet`, `NumericKeypad`, `RpeSlider`, set completion haptics/confetti, viewport containment | None | DONE |
| 2 | M2: Swift-Like Analytics & EMA Trend Charts | `analyticsMath` EMA functions, `TrendChartEMA`, `TargetMuscleHeatmap`, `RestComplianceWidget` | M1 | DONE |
| 3 | M3: Modular Architecture & Backend API Routes | Decoupled `useActiveWorkoutStore`, lightweight API routes (<60-80 lines) `syncFirestore.ts` & `syncIndexedDB.ts` | M2 | DONE |
| 4 | M4: Math & Component Test Suite Hardening | 100% test coverage on math utilities, Vitest component test suites for workout/routine/nutrition | M3 | PLANNED |
| 5 | M5: E2E Verification & Forensic Integrity Gate | Full suite execution (lint, build, test, line counts, viewport lock) & Forensic Auditor clean verdict | M4 | PLANNED |

## Interface Contracts

### M1 Interface Contracts: Set Logging & Ergonomics (VERIFIED & PASSED)
- `SetLoggingBottomSheet.tsx`, `NumericKeypad.tsx`, `RpeSlider.tsx`, `SetRow.tsx`, `ExerciseCard.tsx`.

### M2 Interface Contracts: Analytics & EMA Trend Charts (VERIFIED & PASSED)
- `src/utils/analyticsMath.ts`, `TrendChartEMA.tsx`, `TargetMuscleHeatmap.tsx`, `RestComplianceWidget.tsx`.

### M3 Interface Contracts: Architecture & API Routes (VERIFIED & PASSED)
- `useActiveWorkoutStore.ts` (162 lines): Standalone Zustand store for active session state, rest timer, set completions.
- `src/api/syncFirestore.ts` (38 lines): Firestore sync API route.
- `src/api/syncIndexedDB.ts` (56 lines): Offline IndexedDB sync API route.

### M4 Interface Contracts: Math & Component Test Suite Hardening
- Complete Vitest DOM component coverage for:
  - Active Workout (`SetLoggingBottomSheet.test.tsx`, `ActiveWorkout.test.tsx`)
  - Routine Management (`RoutineEditor.test.tsx`, `WorkoutManager.test.tsx`)
  - Nutrition Logging (`nutritionComponents.test.tsx`, `nutritionGoals.test.ts`)
- 100% test coverage on all math/progression utilities (`fitnessMath.ts`, `progression.ts`, `volume.ts`, `nutritionMath.ts`, `nutritionGoals.ts`, `analyticsMath.ts`).

## Code Layout
```
src/
├── api/
│   ├── syncFirestore.ts           [M3: Lightweight Firestore sync route 38 lines - DONE]
│   ├── syncIndexedDB.ts           [M3: Lightweight IndexedDB offline route 56 lines - DONE]
│   └── apiRoutes.test.ts          [M3: Unit tests for API routes - DONE]
├── components/
│   ├── analytics/
│   │   ├── RestComplianceWidget.tsx [M2: Rest-period compliance analytics - DONE]
│   │   ├── TargetMuscleHeatmap.tsx  [M2: Target muscle distribution heatmap - DONE]
│   │   └── TrendChartEMA.tsx        [M2: Swift-like Recharts EMA trend chart - DONE]
│   ├── ui/
│   │   ├── NumericKeypad.tsx        [M1: Tactile numeric touch keypad - DONE]
│   │   └── RpeSlider.tsx            [M1: Touch RPE slider with effort labels - DONE]
│   └── workout/
│       ├── active/
│       │   ├── SetLoggingBottomSheet.tsx [M1: iOS dynamic bottom sheet drawer - DONE]
│       │   ├── SetRow.tsx           [M1: Summary set row with drawer trigger - DONE]
│       │   └── ExerciseCard.tsx     [M1: Refactored exercise card container - DONE]
│       └── RestTimerWidget.tsx      [M1: Floating persistent rest timer - DONE]
├── store/
│   └── useActiveWorkoutStore.ts    [M3: Decoupled Zustand active workout store 162 lines - DONE]
└── utils/
    ├── analyticsMath.ts             [M2: EMA, muscle balance & rest compliance - DONE]
    ├── fitnessMath.ts               [M2: 1RM & Warmup calculation helpers - DONE]
    ├── nutritionGoals.test.ts       [M4: Unit tests for nutrition goals]
    └── volume.ts                    [M2: Muscle volume calculations - DONE]
```
