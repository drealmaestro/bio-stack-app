# Project: Bio-Stack Offline Animation Engine & Real-Time Tempo Metronome

## Architecture
- **Media & Offline Storage Layer**:
  - `src/types.ts`: Extended with `ExerciseMediaMeta`, `MediaStorageReport`, and `TempoConfig`.
  - `src/utils/mediaManager.ts`: Direct `CacheStorage` (`bio-stack-exercise-media-v1`) + IndexedDB (`media_metadata`) for O(1) query of cached count, bytes, quota, purge, routine download (~1.5–3 MB), and full catalog download (~15–25 MB).
  - `src/hooks/useExerciseMedia.ts` & `src/hooks/useMediaStorage.ts`: Offline-aware hooks providing 0ms zero-latency fallback (`navigator.onLine === false`).
  - `src/components/workout/media/`: Modular UI (`ExerciseMediaViewer.tsx`, `VisualCueFallback.tsx`, `MediaStorageWidget.tsx`, `RoutineMediaDownloadButton.tsx`).
- **Real-Time Tempo & Metronome Layer**:
  - `src/utils/tempoEngine.ts`: Poliquin notation parser (`3-0-1-0`, `3-1-1-2`, `Static`, `Controlled`, explosive `X`), phase timing, Time Under Tension (TUT) calculation.
  - `src/utils/tempoAudio.ts`: Singleton Web Audio API synthesizer (750 Hz wood-block ticks, pitch-coded phase transition chimes, fanfare) + synchronized `navigator.vibrate` haptics.
  - `src/hooks/useRepTempoMetronome.ts`: Real-time state machine for active set tempo pacing with millisecond precision, pause/resume, mute, and rep tracking.
  - `src/components/workout/tempo/`: Modular UI (`TempoRadialVisualizer.tsx`, `TempoPhaseBar.tsx`, `LiveTempoMetronomeModal.tsx`, `TempoMetronomePill.tsx`).
- **UI & Workout Integration Layer**:
  - `src/components/workout/active/ExerciseCard.tsx`: Integrates collapsible media viewer and tempo metronome launcher within line count budget.
  - `src/components/workout/active/SetLoggingBottomSheet.tsx`: Integrates live tempo metronome toggle and compact visual cue without interrupting set inputs or rest timer.
  - `src/components/workout/manager/RoutineCard.tsx`: Adds 1-tap "Download Routine Media" badge.
  - `src/pages/Profile.tsx`: Adds `MediaStorageWidget` for cache usage metrics, full library download, and purge.
  - Viewport containment: Strictly locked to `h-[100dvh] max-h-[100dvh] overflow-hidden` with `overflow-y-auto` internal scrolling.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Exercise Media Meta Types | Define `ExerciseMediaMeta` and `MediaStorageReport` in `src/types.ts` | M1 | ORIGINAL_REQUEST R1 |
| 2 | CacheStorage & IndexedDB Media Engine | `mediaManager.ts` managing binary media cache, metadata index, quota, routine download (~1.5-3MB), and full library download (~15-25MB) | M1 | ORIGINAL_REQUEST R1 |
| 3 | Offline Detection & Zero-Latency Fallback | `useExerciseMedia.ts` resolving cached media instantly, or returning 0ms vector fallback when offline | M1 | ORIGINAL_REQUEST R1 |
| 4 | Visual Cue Vector Fallback Component | High-fidelity SVG anatomical muscle highlighting, movement trajectory arrows, tempo badges, and form cue checklist | M1 | ORIGINAL_REQUEST R1 |
| 5 | Media Storage Status & Purge Widget | UI widget showing cached count, storage MB used, download full library, and purge cache | M1 | ORIGINAL_REQUEST R1 |
| 6 | Routine Media Download Button | 1-tap download chip for routine exercises with progress feedback | M1 | ORIGINAL_REQUEST R1 |
| 7 | Tempo Data Parsing & TUT Math | `tempoEngine.ts` parsing 4-digit notation, explosive 'X', 'Static', 'Controlled', TUT per rep/set | M2 | ORIGINAL_REQUEST R2 |
| 8 | Web Audio API Synth & Haptic Engine | `tempoAudio.ts` singleton AudioContext with 750Hz ticks, pitch-coded phase cues, and `navigator.vibrate` patterns | M2 | ORIGINAL_REQUEST R2 |
| 9 | Rep Tempo Metronome Hook | `useRepTempoMetronome.ts` real-time state machine for active set pacing, rep counting, and phase tracking | M2 | ORIGINAL_REQUEST R2 |
| 10 | Radial Ring & Linear Phase Visualizer | SVG radial progress ring with phase color-coding + 4-pill linear phase progress bar | M2 | ORIGINAL_REQUEST R2 |
| 11 | Live Tempo Modal & Drawer Integration | Floating/modal tempo coach for active sets without disrupting set logger or rest timer | M2 | ORIGINAL_REQUEST R2 |
| 12 | ExerciseCard & RoutineCard UI Integration | Embed media player, tempo button, and routine download chip | M3 | ORIGINAL_REQUEST R1/R2 |
| 13 | SetLoggingBottomSheet UI Integration | Compact tempo pacing and animation cue inside set logging bottom sheet | M3 | ORIGINAL_REQUEST R1/R2 |
| 14 | Profile Screen Storage Management | Embed `MediaStorageWidget` in user profile | M3 | ORIGINAL_REQUEST R1 |
| 15 | Viewport Containment & Tailwind Nesting Audit | Ensure `h-[100dvh]` lock, `overflow-y-auto`, and nested pseudo-classes across all new UI | M3 | ORIGINAL_REQUEST R3 |
| 16 | Comprehensive Automated Test Suites | Unit tests for mediaManager, tempoEngine, useRepTempoMetronome, and component integration tests | M4 | ORIGINAL_REQUEST R3 |
| 17 | Zero Lint, Build & Line Count Verification | `npm run lint` (0 errors), `npm run test` (100% pass), `npm run build` (0 errors), all files <= 350 lines, components <= 250 lines | M4 | ORIGINAL_REQUEST R3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Offline Media Storage & Animation Engine | Features 1-6: Types, `mediaManager.ts`, `useExerciseMedia.ts`, `VisualCueFallback.tsx`, `MediaStorageWidget.tsx`, `RoutineMediaDownloadButton.tsx` | none | DONE |
| 2 | Live Rep Tempo Visualizer & Metronome Engine | Features 7-11: `tempoEngine.ts`, `tempoAudio.ts`, `useRepTempoMetronome.ts`, `TempoRadialVisualizer.tsx`, `TempoPhaseBar.tsx`, `LiveTempoMetronomeModal.tsx` | none | DONE |
| 3 | Active Workout & UI Integration | Features 12-15: Integrate into `ExerciseCard`, `SetLoggingBottomSheet`, `RoutineCard`, and `Profile.tsx` while strictly preserving line count limits | M1, M2 | PLANNED |
| 4 | Final Verification & E2E Testing | Features 16-17: 100% Vitest pass across existing 37 + new test suites, 0 tsc errors, 0 lint warnings, line count test passes, production build succeeds | M3 | PLANNED |

## Interface Contracts
### `src/utils/mediaManager.ts` ↔ UI Components
```ts
export interface ExerciseMediaMeta {
    exercise_id: string;
    url: string;
    size_bytes: number;
    mime_type: 'image/webp' | 'image/avif' | 'image/svg+xml';
    cached_at: string;
    version: number;
}

export interface MediaStorageReport {
    cachedCount: number;
    totalCount: number;
    usedBytes: number;
    usedMb: number;
    quotaBytes?: number;
    isOnline: boolean;
}

export async function isMediaCached(exerciseId: string): Promise<boolean>;
export async function getExerciseMediaBlobUrl(exerciseId: string): Promise<string | null>;
export async function downloadRoutineMedia(exerciseIds: string[], onProgress?: (pct: number) => void): Promise<{ success: boolean; downloaded: number }>;
export async function downloadFullLibrary(onProgress?: (pct: number) => void): Promise<{ success: boolean; downloaded: number }>;
export async function purgeCachedMedia(): Promise<void>;
export async function refreshCachedMedia(): Promise<{ refreshed: number }>;
export async function getMediaStorageReport(): Promise<MediaStorageReport>;
```

### `src/utils/tempoEngine.ts` ↔ Metronome Hook & UI
```ts
export type TempoPhase = 'eccentric' | 'stretch' | 'concentric' | 'peak';

export interface ParsedTempo {
    eccentric: number;
    stretch: number;
    concentric: number;
    peak: number;
    totalSecondsPerRep: number;
    isStatic: boolean;
    isControlled: boolean;
    displayString: string;
}

export function parseTempo(tempo?: string): ParsedTempo;
export function calculateTut(tempo: string, reps: number): number;
export function getPhaseActionLabel(phase: TempoPhase, targetMuscle?: string): string;
export function getPhaseColor(phase: TempoPhase): { text: string; bg: string; stroke: string; glow: string };
```

### `src/utils/tempoAudio.ts` ↔ `useRepTempoMetronome.ts`
```ts
export function initAudioContext(): void;
export function playTickSound(phase: TempoPhase, isTransition: boolean): void;
export function playRepCompleteSound(): void;
export function playSetCompleteSound(): void;
export function triggerPhaseHaptic(phase: TempoPhase, isTransition: boolean): void;
export function triggerRepCompleteHaptic(): void;
```

## Code Layout
```
src/
├── types.ts                                 # Extended media and tempo types
├── utils/
│   ├── mediaManager.ts                      # CacheStorage + IndexedDB media caching (<250 lines)
│   ├── mediaManager.test.ts                 # Tests for media caching (<250 lines)
│   ├── tempoEngine.ts                       # Tempo parsing, TUT math (<200 lines)
│   ├── tempoEngine.test.ts                  # Tests for tempo math (<200 lines)
│   ├── tempoAudio.ts                        # Web Audio synth + haptics (<200 lines)
│   └── tempoAudio.test.ts                   # Tests for audio/haptics (<150 lines)
├── hooks/
│   ├── useExerciseMedia.ts                  # Media resolver with 0ms fallback (<120 lines)
│   ├── useMediaStorage.ts                   # Media storage status and download hook (<130 lines)
│   ├── useRepTempoMetronome.ts              # Tempo pacing state machine (<220 lines)
│   └── useRepTempoMetronome.test.ts         # Hook test suite (<200 lines)
├── components/workout/media/
│   ├── ExerciseMediaViewer.tsx              # Animated player + fallback container (<180 lines)
│   ├── VisualCueFallback.tsx                # SVG anatomical cue fallback (<220 lines)
│   ├── MediaStorageWidget.tsx               # Storage status and purge widget (<220 lines)
│   └── RoutineMediaDownloadButton.tsx       # 1-tap routine downloader chip (<100 lines)
├── components/workout/tempo/
│   ├── TempoRadialVisualizer.tsx            # SVG radial ring countdown (<180 lines)
│   ├── TempoPhaseBar.tsx                    # 4-pill linear phase bar (<120 lines)
│   ├── LiveTempoMetronomeModal.tsx          # Real-time interactive metronome sheet (<240 lines)
│   └── TempoMetronomePill.tsx               # Compact trigger chip for active cards (<100 lines)
```
