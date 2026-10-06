import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { parseTempo, getPhaseDuration, type TempoPhase, type ParsedTempo } from '../utils/tempoEngine';
import {
  initAudioContext,
  playTickSound,
  playRepCompleteSound,
  playSetCompleteSound,
  triggerPhaseHaptic,
  triggerRepCompleteHaptic,
  setAudioMuted,
} from '../utils/tempoAudio';

const PHASE_SEQUENCE: TempoPhase[] = ['eccentric', 'stretch', 'concentric', 'peak'];

export interface UseRepTempoMetronomeOptions {
  tempo?: string;
  targetReps?: number;
  targetMuscle?: string;
  autoStart?: boolean;
  initialMuted?: boolean;
  initialHaptics?: boolean;
  onPhaseChange?: (phase: TempoPhase, rep: number) => void;
  onRepComplete?: (completedRep: number) => void;
  onSetComplete?: () => void;
}

export interface RepTempoMetronomeReturn {
  isActive: boolean; isPaused: boolean; isMuted: boolean; isHapticsEnabled: boolean;
  currentRep: number; targetReps: number; totalTutSeconds: number;
  currentPhase: TempoPhase; phaseElapsedMs: number; phaseDurationMs: number;
  phaseProgress: number; repProgress: number; parsedTempo: ParsedTempo;
  startMetronome: () => void; pauseMetronome: () => void; resumeMetronome: () => void;
  resetMetronome: () => void; nextRep: () => void; prevRep: () => void;
  toggleMute: () => void; toggleHaptics: () => void;
}

export function useRepTempoMetronome({
  tempo,
  targetReps = 10,
  autoStart = false,
  initialMuted = false,
  initialHaptics = true,
  onPhaseChange,
  onRepComplete,
  onSetComplete,
}: UseRepTempoMetronomeOptions = {}): RepTempoMetronomeReturn {
  const parsedTempo = useMemo(() => parseTempo(tempo), [tempo]);
  const getDurationMs = useCallback((p: TempoPhase) => getPhaseDuration(parsedTempo, p) * 1000, [parsedTempo]);
  const getFirstActivePhase = useCallback(() => PHASE_SEQUENCE.find(p => getDurationMs(p) > 0) || 'eccentric', [getDurationMs]);
  const getNextActivePhase = useCallback((curr: TempoPhase): TempoPhase | null => {
    const idx = PHASE_SEQUENCE.indexOf(curr);
    for (let i = idx + 1; i < PHASE_SEQUENCE.length; i++) {
      if (getDurationMs(PHASE_SEQUENCE[i]) > 0) return PHASE_SEQUENCE[i];
    }
    return null;
  }, [getDurationMs]);

  const [snap, setSnap] = useState(() => ({
    isActive: false, isPaused: false, currentRep: 1, currentPhase: getFirstActivePhase(),
    phaseElapsedMs: 0, totalTutSeconds: 0, isMuted: initialMuted, isHapticsEnabled: initialHaptics,
  }));

  const r = useRef({
    running: false, paused: false, lastTime: 0, rep: 1, phase: getFirstActivePhase(),
    elapsedMs: 0, tickedSec: 0, tutMs: 0, muted: initialMuted, haptics: initialHaptics,
    raf: null as number | null,
  });

  const cbs = useRef({ onPhaseChange, onRepComplete, onSetComplete });
  useEffect(() => { cbs.current = { onPhaseChange, onRepComplete, onSetComplete }; }, [onPhaseChange, onRepComplete, onSetComplete]);

  const step = useCallback((now?: number) => {
    if (!r.current.running || r.current.paused) return;
    const curNow = typeof now === 'number' && Number.isFinite(now) ? now : performance.now();
    const delta = Math.max(0, Math.min(curNow - r.current.lastTime, 250));
    r.current.lastTime = curNow;
    r.current.tutMs += delta;
    r.current.elapsedMs += delta;

    let { phase, rep } = r.current;
    const dur = Math.max(1, getDurationMs(phase));
    const secTicked = Math.floor(r.current.elapsedMs / 1000);

    if (secTicked > r.current.tickedSec && r.current.elapsedMs < dur) {
      r.current.tickedSec = secTicked;
      if (!r.current.muted) playTickSound(phase, false);
      if (r.current.haptics) triggerPhaseHaptic(phase, false);
    }

    if (r.current.elapsedMs >= dur) {
      r.current.elapsedMs -= dur;
      r.current.tickedSec = 0;
      const nextPhase = getNextActivePhase(phase);

      if (nextPhase) {
        phase = nextPhase;
        r.current.phase = phase;
        if (!r.current.muted) playTickSound(phase, true);
        if (r.current.haptics) triggerPhaseHaptic(phase, true);
        cbs.current.onPhaseChange?.(phase, rep);
      } else {
        if (!r.current.muted) playRepCompleteSound();
        if (r.current.haptics) triggerRepCompleteHaptic();
        cbs.current.onRepComplete?.(rep);

        if (rep >= targetReps) {
          if (!r.current.muted) playSetCompleteSound();
          cbs.current.onSetComplete?.();
          r.current.running = false;
          setSnap(s => ({ ...s, isActive: false, isPaused: false, phaseElapsedMs: 0, totalTutSeconds: Math.floor(r.current.tutMs / 1000) }));
          return;
        }
        rep += 1;
        phase = getFirstActivePhase();
        Object.assign(r.current, { rep, phase });
        if (!r.current.muted) playTickSound(phase, true);
        if (r.current.haptics) triggerPhaseHaptic(phase, true);
        cbs.current.onPhaseChange?.(phase, rep);
      }
    }

    setSnap(s => ({ ...s, currentRep: rep, currentPhase: phase, phaseElapsedMs: r.current.elapsedMs, totalTutSeconds: Math.floor(r.current.tutMs / 1000) }));
    r.current.raf = requestAnimationFrame(step);
  }, [getDurationMs, getFirstActivePhase, getNextActivePhase, targetReps]);

  const startMetronome = useCallback(() => {
    initAudioContext();
    const p = getFirstActivePhase();
    Object.assign(r.current, { running: true, paused: false, rep: 1, phase: p, elapsedMs: 0, tickedSec: 0, tutMs: 0, lastTime: performance.now() });
    setSnap(s => ({ ...s, isActive: true, isPaused: false, currentRep: 1, currentPhase: p, phaseElapsedMs: 0, totalTutSeconds: 0 }));
    if (!r.current.muted) playTickSound(p, true);
    if (r.current.haptics) triggerPhaseHaptic(p, true);
    cbs.current.onPhaseChange?.(p, 1);
    if (r.current.raf) cancelAnimationFrame(r.current.raf);
    r.current.raf = requestAnimationFrame(step);
  }, [getFirstActivePhase, step]);

  const pauseMetronome = useCallback(() => {
    r.current.paused = true;
    setSnap(s => ({ ...s, isPaused: true }));
    if (r.current.raf) { cancelAnimationFrame(r.current.raf); r.current.raf = null; }
  }, []);

  const resumeMetronome = useCallback(() => {
    if (!r.current.running || !r.current.paused) return;
    initAudioContext();
    r.current.paused = false;
    r.current.lastTime = performance.now();
    setSnap(s => ({ ...s, isPaused: false }));
    if (r.current.raf) cancelAnimationFrame(r.current.raf);
    r.current.raf = requestAnimationFrame(step);
  }, [step]);

  const resetMetronome = useCallback(() => {
    r.current.running = false;
    r.current.paused = false;
    if (r.current.raf) { cancelAnimationFrame(r.current.raf); r.current.raf = null; }
    const p = getFirstActivePhase();
    Object.assign(r.current, { rep: 1, phase: p, elapsedMs: 0, tickedSec: 0, tutMs: 0 });
    setSnap(s => ({ ...s, isActive: false, isPaused: false, currentRep: 1, currentPhase: p, phaseElapsedMs: 0, totalTutSeconds: 0 }));
  }, [getFirstActivePhase]);

  const nextRep = useCallback(() => {
    const next = r.current.rep + 1;
    if (next > targetReps) { resetMetronome(); cbs.current.onSetComplete?.(); return; }
    const p = getFirstActivePhase();
    Object.assign(r.current, { rep: next, phase: p, elapsedMs: 0, tickedSec: 0 });
    setSnap(s => ({ ...s, currentRep: next, currentPhase: p, phaseElapsedMs: 0 }));
    if (r.current.running && !r.current.paused) {
      if (!r.current.muted) playTickSound(p, true);
      if (r.current.haptics) triggerPhaseHaptic(p, true);
      cbs.current.onPhaseChange?.(p, next);
    }
  }, [getFirstActivePhase, resetMetronome, targetReps]);

  const prevRep = useCallback(() => {
    const prev = Math.max(1, r.current.rep - 1);
    const p = getFirstActivePhase();
    Object.assign(r.current, { rep: prev, phase: p, elapsedMs: 0, tickedSec: 0 });
    setSnap(s => ({ ...s, currentRep: prev, currentPhase: p, phaseElapsedMs: 0 }));
  }, [getFirstActivePhase]);

  const toggleMute = useCallback(() => {
    setSnap(s => {
      const next = !s.isMuted;
      r.current.muted = next;
      setAudioMuted(next);
      return { ...s, isMuted: next };
    });
  }, []);

  const toggleHaptics = useCallback(() => {
    setSnap(s => {
      const next = !s.isHapticsEnabled;
      r.current.haptics = next;
      return { ...s, isHapticsEnabled: next };
    });
  }, []);
  useEffect(() => { if (autoStart) startMetronome(); }, [autoStart, startMetronome]);
  useEffect(() => () => {
    r.current.running = false;
    if (r.current.raf) cancelAnimationFrame(r.current.raf);
  }, []);
  const phaseDurationMs = getDurationMs(snap.currentPhase);
  const phaseProgress = phaseDurationMs > 0 ? Math.min(1, Math.max(0, snap.phaseElapsedMs / phaseDurationMs)) : 0;
  const repTotalMs = parsedTempo.totalSecondsPerRep * 1000;
  const repElapsedMs = useMemo(() => {
    const prev = PHASE_SEQUENCE.slice(0, PHASE_SEQUENCE.indexOf(snap.currentPhase));
    return prev.reduce((acc, p) => acc + getDurationMs(p), 0) + snap.phaseElapsedMs;
  }, [getDurationMs, snap.currentPhase, snap.phaseElapsedMs]);
  const repProgress = repTotalMs > 0 ? Math.min(1, Math.max(0, repElapsedMs / repTotalMs)) : 0;

  return {
    ...snap, targetReps, phaseDurationMs, phaseProgress, repProgress, parsedTempo,
    startMetronome, pauseMetronome, resumeMetronome, resetMetronome,
    nextRep, prevRep, toggleMute, toggleHaptics,
  };
}
