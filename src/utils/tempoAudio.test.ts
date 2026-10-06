import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getAudioContext, initAudioContext, closeAudioContext, setAudioMuted, isAudioMuted,
  playTickSound, playRepCompleteSound, playSetCompleteSound,
  triggerPhaseHaptic, triggerRepCompleteHaptic, triggerSetCompleteHaptic, PHASE_PITCHES,
} from './tempoAudio';
import { playChimeTone } from '../hooks/useRestTimer';

let contextInstanceCount = 0;
let lastCreatedOscillators: MockOscillator[] = [];

class MockGain {
  gain = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
  connect = vi.fn();
}

class MockOscillator {
  type: OscillatorType = 'sine';
  frequency = { setValueAtTime: vi.fn() };
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class MockAudioContext {
  state: AudioContextState = 'suspended';
  currentTime = 10;
  destination = {};
  constructor() { contextInstanceCount++; }
  createOscillator = vi.fn(() => {
    const osc = new MockOscillator();
    lastCreatedOscillators.push(osc);
    return osc;
  });
  createGain = vi.fn(() => new MockGain());
  resume = vi.fn(async () => { this.state = 'running'; });
  close = vi.fn(async () => { this.state = 'closed'; });
}

describe('tempoAudio Web Audio API & Haptics Engine', () => {
  let vibrateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    contextInstanceCount = 0;
    lastCreatedOscillators = [];
    setAudioMuted(false);
    closeAudioContext();
    vi.stubGlobal('AudioContext', MockAudioContext);
    vibrateSpy = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'vibrate', { value: vibrateSpy, writable: true, configurable: true });
  });

  afterEach(() => {
    closeAudioContext();
    vi.restoreAllMocks();
  });

  it('manages AudioContext as a singleton and avoids browser context exhaustion', () => {
    expect(contextInstanceCount).toBe(0);
    const ctx1 = getAudioContext();
    expect(contextInstanceCount).toBe(1);
    for (let i = 0; i < 20; i++) playTickSound('eccentric', false);
    expect(contextInstanceCount).toBe(1);
    expect(getAudioContext()).toBe(ctx1);
  });

  it('handles autoplay policy by resuming suspended context via initAudioContext', async () => {
    const ctx = getAudioContext();
    expect(ctx?.state).toBe('suspended');
    initAudioContext();
    expect(ctx?.resume).toHaveBeenCalled();
  });

  it('toggles audio mute and prevents oscillator creation when muted', () => {
    expect(isAudioMuted()).toBe(false);
    setAudioMuted(true);
    expect(isAudioMuted()).toBe(true);
    lastCreatedOscillators = [];
    playTickSound('concentric', true);
    playRepCompleteSound();
    playSetCompleteSound();
    expect(lastCreatedOscillators).toHaveLength(0);
    setAudioMuted(false);
    playTickSound('concentric', true);
    expect(lastCreatedOscillators.length).toBeGreaterThan(0);
  });

  it('synthesizes 750 Hz triangle wave for pacing ticks and pitch-coded cues for phase transitions', () => {
    lastCreatedOscillators = [];
    playTickSound('eccentric', false);
    expect(lastCreatedOscillators[0].type).toBe('triangle');
    expect(lastCreatedOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(750, 10);

    const phases: Array<keyof typeof PHASE_PITCHES> = ['eccentric', 'stretch', 'concentric', 'peak'];
    phases.forEach((phase) => {
      lastCreatedOscillators = [];
      playTickSound(phase, true);
      expect(lastCreatedOscillators[0].type).toBe('sine');
      expect(lastCreatedOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(PHASE_PITCHES[phase], 10);
    });
  });

  it('synthesizes multi-tone chimes for rep and set completion', () => {
    lastCreatedOscillators = [];
    playRepCompleteSound();
    expect(lastCreatedOscillators).toHaveLength(2);
    expect(lastCreatedOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(880, 10);
    expect(lastCreatedOscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(1175, 10.06);

    lastCreatedOscillators = [];
    playSetCompleteSound();
    expect(lastCreatedOscillators).toHaveLength(3);
    expect(lastCreatedOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(523, 10);
    expect(lastCreatedOscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(659, 10.08);
    expect(lastCreatedOscillators[2].frequency.setValueAtTime).toHaveBeenCalledWith(1046, 10.16);
  });

  it('dispatches haptic vibration patterns and degrades gracefully without errors', () => {
    triggerPhaseHaptic('eccentric', false);
    expect(vibrateSpy).toHaveBeenCalledWith(15);
    triggerPhaseHaptic('stretch', true);
    expect(vibrateSpy).toHaveBeenCalledWith([30, 40]);
    triggerRepCompleteHaptic();
    expect(vibrateSpy).toHaveBeenCalledWith([40, 30, 40]);
    triggerSetCompleteHaptic();
    expect(vibrateSpy).toHaveBeenCalledWith([80, 40, 80, 40, 150]);

    Object.defineProperty(navigator, 'vibrate', { value: undefined, writable: true, configurable: true });
    expect(() => triggerPhaseHaptic('eccentric', true)).not.toThrow();

    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(() => { throw new Error('NotAllowedError'); }),
      writable: true,
      configurable: true,
    });
    expect(() => triggerRepCompleteHaptic()).not.toThrow();
  });

  it('operates concurrently with useRestTimer playChimeTone without collision', () => {
    expect(() => {
      playTickSound('concentric', true);
      playChimeTone();
      playRepCompleteSound();
    }).not.toThrow();
    setAudioMuted(true);
    expect(() => playChimeTone()).not.toThrow();
  });
});
