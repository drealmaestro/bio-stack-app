import { useState, useEffect, useRef, useCallback } from 'react';
import type { Exercise } from '../types';
import { getExerciseMediaBlobUrl, releaseExerciseMediaBlobUrl } from '../utils/mediaManager';

export type ExerciseMediaStatus = 'idle' | 'loading' | 'ready' | 'fallback' | 'error';
export interface UseExerciseMediaOptions { immediateOfflineFallback?: boolean; preferCache?: boolean; }
export interface UseExerciseMediaResult {
    status: ExerciseMediaStatus; mediaUrl: string | null; isCached: boolean;
    isOnline: boolean; isFallback: boolean; isLoading: boolean;
    error: Error | null; refetch: () => Promise<void>;
}

function getInitialStatus(exerciseId?: string, remoteUrl?: string, isOnline = true, preferCache = true): ExerciseMediaStatus {
    if (!exerciseId || !isOnline) return 'fallback';
    if (!remoteUrl && !preferCache) return 'fallback';
    return 'loading';
}

export function useExerciseMedia(
    exerciseOrId?: Exercise | string | null,
    optionsOrFallback?: UseExerciseMediaOptions | string,
    options?: UseExerciseMediaOptions
): UseExerciseMediaResult {
    const exerciseId = typeof exerciseOrId === 'string' ? exerciseOrId : exerciseOrId?.id;
    const remoteUrl = typeof exerciseOrId === 'string'
        ? (typeof optionsOrFallback === 'string' ? optionsOrFallback : undefined)
        : (exerciseOrId?.video_url || exerciseOrId?.image_url);
    const opts: UseExerciseMediaOptions = typeof optionsOrFallback === 'object' && optionsOrFallback !== null ? optionsOrFallback : (options || {});
    const { preferCache = true } = opts;

    const initialOnline = typeof navigator !== 'undefined' ? (navigator.onLine ?? true) : true;
    const [status, setStatus] = useState<ExerciseMediaStatus>(getInitialStatus(exerciseId, remoteUrl, initialOnline, preferCache));
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [isCached, setIsCached] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [isOnline, setIsOnline] = useState<boolean>(initialOnline);

    const activeBlobUrlRef = useRef<string | null>(null);
    const currentExerciseIdRef = useRef<string | undefined>(exerciseId);
    const isCachedRef = useRef<boolean>(false);
    const isMountedRef = useRef<boolean>(true);
    const requestIdRef = useRef<number>(0);
    const lastTargetKeyRef = useRef<string>('');

    useEffect(() => { currentExerciseIdRef.current = exerciseId; }, [exerciseId]);
    useEffect(() => { isMountedRef.current = true; return () => { isMountedRef.current = false; }; }, []);

    const cleanupBlobUrl = useCallback(() => {
        if (activeBlobUrlRef.current) {
            releaseExerciseMediaBlobUrl(currentExerciseIdRef.current || '', activeBlobUrlRef.current);
            activeBlobUrlRef.current = null;
        }
    }, []);

    const updateIsCached = useCallback((val: boolean) => {
        isCachedRef.current = val;
        setIsCached(val);
    }, []);

    const resolveMedia = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        const targetExerciseId = exerciseId;
        const isCurrent = () => isMountedRef.current && requestId === requestIdRef.current;

        const currentTargetKey = `${targetExerciseId ?? ''}::${remoteUrl ?? ''}`;
        if (currentTargetKey !== lastTargetKeyRef.current) {
            lastTargetKeyRef.current = currentTargetKey;
            cleanupBlobUrl();
            setMediaUrl(null);
            updateIsCached(false);
        }

        if (!targetExerciseId) {
            if (!isCurrent()) return;
            cleanupBlobUrl(); setMediaUrl(null); updateIsCached(false); setStatus('fallback'); return;
        }

        const currentlyOnline = typeof navigator !== 'undefined' ? (navigator.onLine ?? true) : true;
        setIsOnline(currentlyOnline);
        if (!isCurrent()) return;
        if (currentlyOnline) setStatus('loading');
        setError(null);

        let cachedBlobUrl: string | null = null;
        if (preferCache) {
            try { cachedBlobUrl = await getExerciseMediaBlobUrl(targetExerciseId); }
            catch (err: any) { console.warn('[useExerciseMedia] Cache lookup failed:', err); }
        }

        if (!isCurrent()) {
            if (cachedBlobUrl) releaseExerciseMediaBlobUrl(targetExerciseId, cachedBlobUrl);
            return;
        }

        if (cachedBlobUrl) {
            cleanupBlobUrl();
            activeBlobUrlRef.current = cachedBlobUrl;
            setMediaUrl(cachedBlobUrl);
            updateIsCached(true);
            setStatus('ready');
            setError(null);
            return;
        }

        if (!currentlyOnline || !remoteUrl || remoteUrl.trim() === '') {
            cleanupBlobUrl(); setMediaUrl(null); updateIsCached(false); setStatus('fallback'); setError(null); return;
        }

        cleanupBlobUrl();
        setMediaUrl(remoteUrl);
        updateIsCached(false);
        setStatus('ready');
        setError(null);
    }, [exerciseId, remoteUrl, preferCache, cleanupBlobUrl, updateIsCached]);

    const resolveMediaRef = useRef(resolveMedia);
    resolveMediaRef.current = resolveMedia;

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleOnline = () => { setIsOnline(true); if (!isCachedRef.current) resolveMediaRef.current(); };
        const handleOffline = () => {
            setIsOnline(false);
            if (!isCachedRef.current) { cleanupBlobUrl(); setMediaUrl(null); setStatus('fallback'); setError(null); }
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [cleanupBlobUrl]);

    useEffect(() => {
        resolveMedia();
        return () => { requestIdRef.current++; cleanupBlobUrl(); };
    }, [resolveMedia, cleanupBlobUrl]);

    return {
        status, mediaUrl, isCached, isOnline,
        isFallback: status === 'fallback', isLoading: status === 'loading',
        error, refetch: resolveMedia,
    };
}
