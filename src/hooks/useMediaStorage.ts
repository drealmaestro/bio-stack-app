import { useState, useEffect, useCallback } from 'react';
import type { MediaStorageReport } from '../types';
import {
    getMediaStorageReport,
    downloadRoutineMedia,
    downloadFullLibrary,
    purgeCachedMedia,
} from '../utils/mediaManager';

export interface UseMediaStorageResult {
    report: MediaStorageReport | null;
    isLoadingReport: boolean;
    isLoading: boolean;
    isOnline: boolean;
    isDownloading: boolean;
    isDownloadingRoutine: boolean;
    routineProgress: number;
    isDownloadingLibrary: boolean;
    libraryProgress: number;
    downloadProgress: number;
    isPurging: boolean;
    downloadRoutine: (exerciseIds: string[]) => Promise<{ success: boolean; downloaded: number; error?: string }>;
    downloadLibrary: () => Promise<{ success: boolean; downloaded: number; error?: string }>;
    purge: () => Promise<void>;
    refreshReport: () => Promise<void>;
    refresh: () => Promise<void>;
}

export function useMediaStorage(): UseMediaStorageResult {
    const [report, setReport] = useState<MediaStorageReport | null>(null);
    const [isLoadingReport, setIsLoadingReport] = useState<boolean>(true);
    const [isDownloadingRoutine, setIsDownloadingRoutine] = useState<boolean>(false);
    const [routineProgress, setRoutineProgress] = useState<number>(0);
    const [isDownloadingLibrary, setIsDownloadingLibrary] = useState<boolean>(false);
    const [libraryProgress, setLibraryProgress] = useState<number>(0);
    const [isPurging, setIsPurging] = useState<boolean>(false);
    const [isOnline, setIsOnline] = useState<boolean>(
        typeof navigator !== 'undefined' ? (navigator.onLine ?? true) : true
    );

    const refreshReport = useCallback(async () => {
        setIsLoadingReport(true);
        try {
            const rep = await getMediaStorageReport();
            setReport(rep);
            setIsOnline(rep.isOnline);
        } catch (err) {
            console.warn('[useMediaStorage] Failed to fetch report:', err);
        } finally {
            setIsLoadingReport(false);
        }
    }, []);

    useEffect(() => {
        refreshReport();
        if (typeof window === 'undefined') return;

        const handleOnline = () => { setIsOnline(true); refreshReport(); };
        const handleOffline = () => { setIsOnline(false); refreshReport(); };
        const handleCacheUpdate = () => { refreshReport(); };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('media-cache-updated', handleCacheUpdate);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('media-cache-updated', handleCacheUpdate);
        };
    }, [refreshReport]);

    const downloadRoutine = useCallback(async (exerciseIds: string[]) => {
        setIsDownloadingRoutine(true);
        setRoutineProgress(0);
        try {
            const result = await downloadRoutineMedia(exerciseIds, (pct) => setRoutineProgress(pct));
            await refreshReport();
            return result;
        } finally {
            setIsDownloadingRoutine(false);
            setRoutineProgress(100);
        }
    }, [refreshReport]);

    const downloadLibrary = useCallback(async () => {
        setIsDownloadingLibrary(true);
        setLibraryProgress(0);
        try {
            const result = await downloadFullLibrary((pct) => setLibraryProgress(pct));
            await refreshReport();
            return result;
        } finally {
            setIsDownloadingLibrary(false);
            setLibraryProgress(100);
        }
    }, [refreshReport]);

    const purge = useCallback(async () => {
        setIsPurging(true);
        try {
            await purgeCachedMedia();
            await refreshReport();
        } finally {
            setIsPurging(false);
        }
    }, [refreshReport]);

    const isDownloading = isDownloadingRoutine || isDownloadingLibrary;
    const downloadProgress = isDownloadingLibrary ? libraryProgress : routineProgress;

    return {
        report,
        isLoadingReport,
        isLoading: isLoadingReport,
        isOnline,
        isDownloading,
        isDownloadingRoutine,
        routineProgress,
        isDownloadingLibrary,
        libraryProgress,
        downloadProgress,
        isPurging,
        downloadRoutine,
        downloadLibrary,
        purge,
        refreshReport,
        refresh: refreshReport,
    };
}
