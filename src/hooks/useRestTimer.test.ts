import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRestTimer, playChimeTone, sendRestNotification } from './useRestTimer';
import { useStore } from '../store/useStore';

describe('useRestTimer Hook', () => {
    beforeEach(() => {
        useStore.getState().resetStore();
        useStore.getState().seed();
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return isResting false when no workout is active', () => {
        const { result } = renderHook(() => useRestTimer());
        expect(result.current.isResting).toBe(false);
        expect(result.current.restSecondsRemaining).toBe(0);
        expect(result.current.restProgress).toBe(1);
    });

    it('should compute resting state and seconds remaining when rest timer is active', () => {
        useStore.getState().startWorkout('tmpl-1');
        useStore.getState().toggleSetComplete(0, 1, 60);

        const { result } = renderHook(() => useRestTimer());
        expect(result.current.isResting).toBe(true);
        expect(result.current.restSecondsRemaining).toBeGreaterThan(0);
        expect(result.current.restSecondsRemaining).toBeLessThanOrEqual(60);
        expect(result.current.restProgress).toBeGreaterThan(0);
        expect(result.current.restProgress).toBeLessThanOrEqual(1);
    });

    it('should extend rest timer when addRestTime is called', () => {
        useStore.getState().startWorkout('tmpl-1');
        useStore.getState().toggleSetComplete(0, 1, 30);

        const { result } = renderHook(() => useRestTimer());
        const initialSecs = result.current.restSecondsRemaining;

        act(() => {
            result.current.addRestTime(30);
        });

        expect(result.current.restSecondsRemaining).toBeGreaterThanOrEqual(initialSecs + 28);
    });

    it('should clear resting state when skipRest is called', () => {
        useStore.getState().startWorkout('tmpl-1');
        useStore.getState().toggleSetComplete(0, 1, 60);

        const { result } = renderHook(() => useRestTimer());
        expect(result.current.isResting).toBe(true);

        act(() => {
            result.current.skipRest();
        });

        expect(result.current.isResting).toBe(false);
        expect(result.current.restSecondsRemaining).toBe(0);
    });

    it('should execute playChimeTone and sendRestNotification safely', () => {
        // Mock Notification API
        const notificationSpy = vi.fn();
        vi.stubGlobal('Notification', Object.assign(notificationSpy, { permission: 'granted' }));

        // Mock AudioContext
        const mockAudioCtx = {
            currentTime: 0,
            createOscillator: () => ({
                type: 'sine',
                frequency: { setValueAtTime: vi.fn() },
                connect: vi.fn(),
                start: vi.fn(),
                stop: vi.fn(),
            }),
            createGain: () => ({
                gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
                connect: vi.fn(),
            }),
            destination: {},
        };
        vi.stubGlobal('AudioContext', vi.fn(function () { return mockAudioCtx; }));

        expect(() => playChimeTone()).not.toThrow();
        expect(() => sendRestNotification('Done!', 'Next set!')).not.toThrow();
        expect(notificationSpy).toHaveBeenCalledWith('Done!', expect.objectContaining({ body: 'Next set!' }));
    });

    it('should interact with Web Worker when present in environment', () => {
        const postMessageMock = vi.fn();
        const terminateMock = vi.fn();

        class MockWorker {
            onmessage: ((ev: MessageEvent) => void) | null = null;
            postMessage = postMessageMock;
            terminate = terminateMock;
            addEventListener = vi.fn();
            removeEventListener = vi.fn();
            dispatchEvent = vi.fn();
        }

        vi.stubGlobal('Worker', MockWorker);

        useStore.getState().startWorkout('tmpl-1');
        useStore.getState().toggleSetComplete(0, 1, 60);

        const { unmount } = renderHook(() => useRestTimer());
        expect(postMessageMock).toHaveBeenCalledWith(expect.objectContaining({ type: 'START' }));

        unmount();
        expect(terminateMock).toHaveBeenCalled();
    });
});
