/**
 * src/utils/tempoAudio.ts
 *
 * Singleton Web Audio API Synthesizer & Haptics Engine for Bio-Stack Rep Tempo Metronome.
 * Provides crisp wood-block ticks, pitch-coded phase transition chimes, fanfare audio,
 * and synchronized haptic vibration pulses with safe degradation on iOS/desktop.
 */

export type TempoPhase = 'eccentric' | 'stretch' | 'concentric' | 'peak';

export const PHASE_PITCHES: Record<TempoPhase, number> = {
  eccentric: 440,   // A4: Controlled descent
  stretch: 523,     // C5: Bottom stretch pause
  concentric: 880,  // A5: Explosive drive cue
  peak: 659,        // E5: Peak contraction / top reset
};

export const HAPTIC_PATTERNS = {
  tick: 15,
  transition: [30, 40] as const,
  repComplete: [40, 30, 40] as const,
  setComplete: [80, 40, 80, 40, 150] as const,
};

let sharedAudioCtx: AudioContext | null = null;
let isMuted = false;

/**
 * Returns singleton AudioContext, lazily instantiating only once.
 * Prevents browser audio context exhaustion / memory leaks.
 */
export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    try {
      sharedAudioCtx = new AudioCtx();
    } catch {
      return null;
    }
  }
  return sharedAudioCtx;
}

/**
 * Resumes suspended AudioContext on first user interaction (touch/click).
 * Complies with W3C browser autoplay policies.
 */
export function initAudioContext(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

/**
 * Closes and resets singleton AudioContext (used for cleanup and testing).
 */
export function closeAudioContext(): void {
  if (sharedAudioCtx) {
    try {
      sharedAudioCtx.close().catch(() => {});
    } catch {
      // Safe fallback
    }
    sharedAudioCtx = null;
  }
}

export function setAudioMuted(muted: boolean): void {
  isMuted = muted;
}

export function isAudioMuted(): boolean {
  return isMuted;
}

/**
 * Internal tone synthesizer using exponential gain envelope.
 */
function playTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  peakGain = 0.2
): void {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(peakGain, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch {
    // Graceful error fallback
  }
}

/**
 * Plays pacing tick or pitch-coded phase transition chime.
 */
export function playTickSound(phase: TempoPhase, isTransition: boolean): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  if (isTransition) {
    const freq = PHASE_PITCHES[phase] ?? 750;
    const duration = phase === 'concentric' ? 0.1 : 0.08;
    playTone(ctx, freq, now, duration, 'sine', 0.25);
  } else {
    // Crisp 750 Hz wood-block click
    playTone(ctx, 750, now, 0.035, 'triangle', 0.18);
  }
}

/**
 * Plays bright 2-tone chime upon completing a rep (880 Hz -> 1175 Hz).
 */
export function playRepCompleteSound(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  playTone(ctx, 880, now, 0.06, 'sine', 0.22);
  playTone(ctx, 1175, now + 0.06, 0.09, 'sine', 0.25);
}

/**
 * Plays 3-tone victory fanfare upon completing a set (523 Hz -> 659 Hz -> 1046 Hz).
 */
export function playSetCompleteSound(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  playTone(ctx, 523, now, 0.08, 'sine', 0.22);
  playTone(ctx, 659, now + 0.08, 0.08, 'sine', 0.22);
  playTone(ctx, 1046, now + 0.16, 0.15, 'sine', 0.28);
}

/**
 * Triggers subtle micro-tick (15ms) or distinct phase transition double-pulse ([30, 40]ms).
 */
export function triggerPhaseHaptic(_phase: TempoPhase, isTransition: boolean): void {
  try {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.vibrate) {
      return;
    }
    navigator.vibrate(isTransition ? [30, 40] : 15);
  } catch {
    // Safe degradation for iOS Safari and restricted environments
  }
}

/**
 * Triggers distinct triple-pulse haptic upon rep completion ([40, 30, 40]ms).
 */
export function triggerRepCompleteHaptic(): void {
  try {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.vibrate) {
      return;
    }
    navigator.vibrate([40, 30, 40]);
  } catch {
    // Safe degradation
  }
}

/**
 * Triggers extended victory haptic pattern upon set completion.
 */
export function triggerSetCompleteHaptic(): void {
  try {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.vibrate) {
      return;
    }
    navigator.vibrate([80, 40, 80, 40, 150]);
  } catch {
    // Safe degradation
  }
}
