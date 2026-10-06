import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExerciseMedia } from './useExerciseMedia';
import * as mediaManager from '../utils/mediaManager';
import type { Exercise } from '../types';

describe('useExerciseMedia Hook', () => {
    const mockExercise: Exercise = {
        id: 'ex_bench_press',
        name: 'Barbell Bench Press',
        target_muscle: 'Chest',
        instructions: 'Lower bar to chest and press.',
        tempo: '3-0-1-0',
        form_cues: ['Retract scapula', 'Leg drive'],
        video_url: 'https://example.com/bench.webp',
    };

    beforeEach(() => {
        vi.restoreAllMocks();
        Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns 0ms zero-latency fallback immediately when offline and uncached', async () => {
        Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
        vi.spyOn(mediaManager, 'getExerciseMediaBlobUrl').mockResolvedValue(null);

        const { result } = renderHook(() => useExerciseMedia(mockExercise));

        expect(result.current.isOnline).toBe(false);
        await act(async () => {});
        expect(result.current.status).toBe('fallback');
        expect(result.current.isFallback).toBe(true);
        expect(result.current.mediaUrl).toBeNull();
    });

    it('returns cached blob URL when media is cached locally even when offline', async () => {
        Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
        const mockBlobUrl = 'blob:http://localhost/cached-bench.webp';
        vi.spyOn(mediaManager, 'getExerciseMediaBlobUrl').mockResolvedValue(mockBlobUrl);

        const { result } = renderHook(() => useExerciseMedia(mockExercise));

        await act(async () => {});
        expect(result.current.status).toBe('ready');
        expect(result.current.isCached).toBe(true);
        expect(result.current.mediaUrl).toBe(mockBlobUrl);
    });

    it('cleans up active blob URL on unmount using URL.revokeObjectURL', async () => {
        const mockBlobUrl = 'blob:http://localhost/cached-bench.webp';
        vi.spyOn(mediaManager, 'getExerciseMediaBlobUrl').mockResolvedValue(mockBlobUrl);
        const revokeSpy = vi.fn();
        Object.defineProperty(URL, 'revokeObjectURL', { value: revokeSpy, writable: true, configurable: true });

        const { unmount } = renderHook(() => useExerciseMedia(mockExercise));
        await act(async () => {});

        unmount();
        expect(revokeSpy).toHaveBeenCalledWith(mockBlobUrl);
    });

    it('reacts dynamically to window offline and online events', async () => {
        vi.spyOn(mediaManager, 'getExerciseMediaBlobUrl').mockResolvedValue(null);
        const { result } = renderHook(() => useExerciseMedia(mockExercise));
        await act(async () => {});

        expect(result.current.isOnline).toBe(true);

        await act(async () => {
            Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
            window.dispatchEvent(new Event('offline'));
        });

        expect(result.current.isOnline).toBe(false);
    });

    it('resolves remote media when online and uncached', async () => {
        vi.spyOn(mediaManager, 'getExerciseMediaBlobUrl').mockResolvedValue(null);
        const { result } = renderHook(() => useExerciseMedia(mockExercise));

        await act(async () => {});
        expect(result.current.status).toBe('ready');
        expect(result.current.mediaUrl).toBe('https://example.com/bench.webp');
        expect(result.current.isCached).toBe(false);
    });

    it('dispenses fresh unrevoked blob URLs across mount/unmount/remount cycles without poisoning', async () => {
        let blobCounter = 0;
        const revokeSpy = vi.fn();
        Object.defineProperty(URL, 'revokeObjectURL', { value: revokeSpy, writable: true, configurable: true });

        vi.spyOn(mediaManager, 'getExerciseMediaBlobUrl').mockImplementation(async () => {
            return `blob:http://localhost/alloc-${++blobCounter}`;
        });

        const hook1 = renderHook(() => useExerciseMedia(mockExercise));
        await act(async () => {});
        const url1 = hook1.result.current.mediaUrl!;
        expect(url1).toBe('blob:http://localhost/alloc-1');

        hook1.unmount();
        expect(revokeSpy).toHaveBeenCalledWith('blob:http://localhost/alloc-1');

        const hook2 = renderHook(() => useExerciseMedia(mockExercise));
        await act(async () => {});
        const url2 = hook2.result.current.mediaUrl!;
        expect(url2).toBe('blob:http://localhost/alloc-2');
        expect(url2).not.toBe(url1);
    });

    it('prevents stale async fetch race condition from overwriting active exercise and revokes orphaned blob', async () => {
        let resolveSlow: (url: string) => void;
        let resolveFast: (url: string) => void;
        const revokeSpy = vi.fn();
        Object.defineProperty(URL, 'revokeObjectURL', { value: revokeSpy, writable: true, configurable: true });

        vi.spyOn(mediaManager, 'getExerciseMediaBlobUrl').mockImplementation((id: string) => {
            if (id === 'ex_SLOW') return new Promise<string>(res => { resolveSlow = res; });
            if (id === 'ex_FAST') return new Promise<string>(res => { resolveFast = res; });
            return Promise.resolve(null);
        });

        const { result, rerender } = renderHook(({ id }) => useExerciseMedia(id), {
            initialProps: { id: 'ex_SLOW' },
        });

        rerender({ id: 'ex_FAST' });
        await act(async () => { resolveFast('blob:http://localhost/fast.webp'); });
        expect(result.current.mediaUrl).toBe('blob:http://localhost/fast.webp');
        expect(result.current.status).toBe('ready');

        await act(async () => { resolveSlow('blob:http://localhost/slow.webp'); });
        expect(result.current.mediaUrl).toBe('blob:http://localhost/fast.webp');
        expect(revokeSpy).toHaveBeenCalledWith('blob:http://localhost/slow.webp');
    });

    it('immediately revokes orphaned blob URL if cache lookup resolves after unmount', async () => {
        let resolveFetch: (url: string) => void;
        vi.spyOn(mediaManager, 'getExerciseMediaBlobUrl').mockImplementation(() => {
            return new Promise<string>(res => { resolveFetch = res; });
        });
        const revokeSpy = vi.fn();
        Object.defineProperty(URL, 'revokeObjectURL', { value: revokeSpy, writable: true, configurable: true });

        const { unmount } = renderHook(() => useExerciseMedia('ex_slow'));
        unmount();

        await act(async () => { resolveFetch('blob:http://localhost/orphaned.webp'); });
        expect(revokeSpy).toHaveBeenCalledWith('blob:http://localhost/orphaned.webp');
    });

    it('dynamically transitions uncached media to fallback on offline event and recovers on online event', async () => {
        vi.spyOn(mediaManager, 'getExerciseMediaBlobUrl').mockResolvedValue(null);
        const { result } = renderHook(() => useExerciseMedia(mockExercise));
        await act(async () => {});

        expect(result.current.status).toBe('ready');
        expect(result.current.mediaUrl).toBe('https://example.com/bench.webp');

        await act(async () => {
            Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
            window.dispatchEvent(new Event('offline'));
        });

        expect(result.current.isOnline).toBe(false);
        expect(result.current.status).toBe('fallback');
        expect(result.current.isFallback).toBe(true);
        expect(result.current.mediaUrl).toBeNull();

        await act(async () => {
            Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
            window.dispatchEvent(new Event('online'));
        });

        expect(result.current.isOnline).toBe(true);
        expect(result.current.status).toBe('ready');
        expect(result.current.mediaUrl).toBe('https://example.com/bench.webp');
    });

    it('preserves cached media playback on offline event without falling back', async () => {
        const mockBlobUrl = 'blob:http://localhost/cached-bench.webp';
        vi.spyOn(mediaManager, 'getExerciseMediaBlobUrl').mockResolvedValue(mockBlobUrl);

        const { result } = renderHook(() => useExerciseMedia(mockExercise));
        await act(async () => {});

        expect(result.current.status).toBe('ready');
        expect(result.current.isCached).toBe(true);
        expect(result.current.mediaUrl).toBe(mockBlobUrl);

        await act(async () => {
            Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
            window.dispatchEvent(new Event('offline'));
        });

        expect(result.current.isOnline).toBe(false);
        expect(result.current.status).toBe('ready');
        expect(result.current.isFallback).toBe(false);
        expect(result.current.mediaUrl).toBe(mockBlobUrl);
    });

    it('synchronously initializes to fallback on Frame 0 when offline, and loading when online', async () => {
        Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
        vi.spyOn(mediaManager, 'getExerciseMediaBlobUrl').mockResolvedValue(null);

        const offlineHook = renderHook(() => useExerciseMedia(mockExercise));
        expect(offlineHook.result.current.status).toBe('fallback');
        expect(offlineHook.result.current.isFallback).toBe(true);
        expect(offlineHook.result.current.isLoading).toBe(false);
        expect(offlineHook.result.current.mediaUrl).toBeNull();
        await act(async () => {});

        Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
        let resolveOnlineBlob: (url: string) => void;
        vi.spyOn(mediaManager, 'getExerciseMediaBlobUrl').mockReturnValue(
            new Promise<string>(res => { resolveOnlineBlob = res; }) as any
        );

        const onlineHook = renderHook(() => useExerciseMedia(mockExercise));
        expect(onlineHook.result.current.status).toBe('loading');
        expect(onlineHook.result.current.isLoading).toBe(true);
        expect(onlineHook.result.current.isFallback).toBe(false);

        await act(async () => {
            resolveOnlineBlob!('blob:http://localhost/bench.webp');
        });

        expect(onlineHook.result.current.status).toBe('ready');
        expect(onlineHook.result.current.isLoading).toBe(false);
        expect(onlineHook.result.current.mediaUrl).toBe('blob:http://localhost/bench.webp');
    });
});
