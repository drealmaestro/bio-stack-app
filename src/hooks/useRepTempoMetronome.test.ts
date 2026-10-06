import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRepTempoMetronome } from './useRepTempoMetronome';
import * as tempoAudio from '../utils/tempoAudio';

vi.mock('../utils/tempoAudio', () => ({
  initAudioContext: vi.fn(),
  playTickSound: vi.fn(),
  playRepCompleteSound: vi.fn(),
  playSetCompleteSound: vi.fn(),
  triggerPhaseHaptic: vi.fn(),
  triggerRepCompleteHaptic: vi.fn(),
  setAudioMuted: vi.fn(),
}));

describe('useRepTempoMetronome Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with inactive state, rep 1, and parsed tempo', () => {
    const { result } = renderHook(() => useRepTempoMetronome({ tempo: '3-0-1-0', targetReps: 10 }));

    expect(result.current.isActive).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.currentRep).toBe(1);
    expect(result.current.targetReps).toBe(10);
    expect(result.current.currentPhase).toBe('eccentric');
    expect(result.current.phaseProgress).toBe(0);
    expect(result.current.repProgress).toBe(0);
    expect(result.current.totalTutSeconds).toBe(0);
  });

  it('starts metronome, triggers audio/haptic cues and calls onPhaseChange', () => {
    const onPhaseChange = vi.fn();
    const { result } = renderHook(() => useRepTempoMetronome({ tempo: '3-0-1-0', onPhaseChange }));

    act(() => {
      result.current.startMetronome();
    });

    expect(result.current.isActive).toBe(true);
    expect(tempoAudio.initAudioContext).toHaveBeenCalled();
    expect(tempoAudio.playTickSound).toHaveBeenCalledWith('eccentric', true);
    expect(tempoAudio.triggerPhaseHaptic).toHaveBeenCalledWith('eccentric', true);
    expect(onPhaseChange).toHaveBeenCalledWith('eccentric', 1);
  });

  it('advances through eccentric seconds and plays pacing ticks', () => {
    const { result } = renderHook(() => useRepTempoMetronome({ tempo: '3-0-1-0' }));

    act(() => {
      result.current.startMetronome();
    });
    vi.clearAllMocks();

    act(() => {
      vi.advanceTimersByTime(1050);
    });

    expect(tempoAudio.playTickSound).toHaveBeenCalledWith('eccentric', false);
    expect(tempoAudio.triggerPhaseHaptic).toHaveBeenCalledWith('eccentric', false);
    expect(result.current.phaseProgress).toBeGreaterThan(0.3);
  });

  it('transitions to concentric phase skipping zero-duration stretch phase', () => {
    const onPhaseChange = vi.fn();
    const { result } = renderHook(() => useRepTempoMetronome({ tempo: '3-0-1-0', onPhaseChange }));

    act(() => {
      result.current.startMetronome();
    });

    act(() => {
      vi.advanceTimersByTime(3050);
    });

    expect(result.current.currentPhase).toBe('concentric');
    expect(onPhaseChange).toHaveBeenCalledWith('concentric', 1);
    expect(tempoAudio.playTickSound).toHaveBeenCalledWith('concentric', true);
  });

  it('increments rep on complete cycle and invokes onRepComplete', () => {
    const onRepComplete = vi.fn();
    const { result } = renderHook(() => useRepTempoMetronome({ tempo: '3-0-1-0', targetReps: 5, onRepComplete }));

    act(() => {
      result.current.startMetronome();
    });

    act(() => {
      vi.advanceTimersByTime(4050);
    });

    expect(result.current.currentRep).toBe(2);
    expect(onRepComplete).toHaveBeenCalledWith(1);
    expect(tempoAudio.playRepCompleteSound).toHaveBeenCalled();
    expect(tempoAudio.triggerRepCompleteHaptic).toHaveBeenCalled();
  });

  it('completes set and halts when targetReps are finished', () => {
    const onSetComplete = vi.fn();
    const { result } = renderHook(() => useRepTempoMetronome({ tempo: '3-0-1-0', targetReps: 1, onSetComplete }));

    act(() => {
      result.current.startMetronome();
    });

    act(() => {
      vi.advanceTimersByTime(4050);
    });

    expect(result.current.isActive).toBe(false);
    expect(onSetComplete).toHaveBeenCalled();
    expect(tempoAudio.playSetCompleteSound).toHaveBeenCalled();
  });

  it('pauses and resumes without drift or time jumping', () => {
    const { result } = renderHook(() => useRepTempoMetronome({ tempo: '3-0-1-0' }));

    act(() => {
      result.current.startMetronome();
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    const elapsedBeforePause = result.current.phaseElapsedMs;
    act(() => {
      result.current.pauseMetronome();
    });
    expect(result.current.isPaused).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.phaseElapsedMs).toBe(elapsedBeforePause);

    act(() => {
      result.current.resumeMetronome();
    });
    expect(result.current.isPaused).toBe(false);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.phaseElapsedMs).toBeGreaterThan(elapsedBeforePause);
  });

  it('handles manual rep adjustments and reset', () => {
    const { result } = renderHook(() => useRepTempoMetronome({ tempo: '3-0-1-0', targetReps: 5 }));

    act(() => {
      result.current.startMetronome();
      result.current.nextRep();
    });
    expect(result.current.currentRep).toBe(2);

    act(() => {
      result.current.prevRep();
    });
    expect(result.current.currentRep).toBe(1);

    act(() => {
      result.current.resetMetronome();
    });
    expect(result.current.isActive).toBe(false);
    expect(result.current.currentRep).toBe(1);
  });

  it('toggles mute and haptics suppressing dispatches', () => {
    const { result } = renderHook(() => useRepTempoMetronome({ tempo: '3-0-1-0' }));

    act(() => {
      result.current.toggleMute();
      result.current.toggleHaptics();
    });
    expect(result.current.isMuted).toBe(true);
    expect(result.current.isHapticsEnabled).toBe(false);

    act(() => {
      result.current.startMetronome();
    });

    expect(tempoAudio.playTickSound).not.toHaveBeenCalled();
    expect(tempoAudio.triggerPhaseHaptic).not.toHaveBeenCalled();
  });

  it('safely cleans up rAF on unmount', () => {
    const cancelRafSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const { result, unmount } = renderHook(() => useRepTempoMetronome({ tempo: '3-0-1-0' }));

    act(() => {
      result.current.startMetronome();
    });

    unmount();
    expect(cancelRafSpy).toHaveBeenCalled();
  });
});
