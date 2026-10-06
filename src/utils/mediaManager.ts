import type { ExerciseMediaMeta, MediaStorageReport } from '../types';
import { INITIAL_EXERCISES } from '../data/exercises';

export const MEDIA_CACHE_NAME = 'bio-stack-exercise-media-v1';
export const MEDIA_DB_NAME = 'bio-stack-media-db';
export const MEDIA_STORE_NAME = 'media_metadata';

interface ActiveBlobEntry {
    url: string;
    refCount: number;
}

const activeBlobUrls = new Map<string, ActiveBlobEntry>();
const inFlightBlobUrls = new Map<string, Promise<string | null>>();
const memoryMetadata = new Map<string, ExerciseMediaMeta>();
let mediaDbPromise: Promise<IDBDatabase> | null = null;

function notifyCacheUpdated(): void {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('media-cache-updated'));
    }
}

export const isCacheStorageAvailable = (): boolean => typeof window !== 'undefined' && 'caches' in window && !!window.caches;
export const isIndexedDBAvailable = (): boolean => typeof window !== 'undefined' && 'indexedDB' in window && !!window.indexedDB;

export function resetMediaManagerForTesting(): void {
    mediaDbPromise = null;
    memoryMetadata.clear();
    inFlightBlobUrls.clear();
    activeBlobUrls.forEach(e => { try { URL.revokeObjectURL(e.url); } catch {} });
    activeBlobUrls.clear();
}

export function getExerciseMediaUrl(exerciseId: string): string {
    const ex = INITIAL_EXERCISES.find(e => e.id === exerciseId);
    return ex?.image_url || ex?.video_url || `/assets/exercises/${exerciseId}.svg`;
}

function resolveFetchUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null' ? window.location.origin : 'http://localhost';
    return new URL(url, base).href;
}

function getMediaDB(): Promise<IDBDatabase> {
    if (!isIndexedDBAvailable()) return Promise.reject(new Error('IndexedDB unavailable'));
    if (!mediaDbPromise) {
        mediaDbPromise = new Promise((resolve, reject) => {
            try {
                const req = window.indexedDB.open(MEDIA_DB_NAME, 1);
                req.onupgradeneeded = () => {
                    if (!req.result.objectStoreNames.contains(MEDIA_STORE_NAME)) req.result.createObjectStore(MEDIA_STORE_NAME, { keyPath: 'exercise_id' });
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => { mediaDbPromise = null; reject(req.error); };
            } catch (err) { mediaDbPromise = null; reject(err); }
        });
    }
    return mediaDbPromise;
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await getMediaDB();
    return new Promise((resolve, reject) => {
        const req = fn(db.transaction(MEDIA_STORE_NAME, mode).objectStore(MEDIA_STORE_NAME));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function saveMediaMetadata(meta: ExerciseMediaMeta): Promise<void> {
    try { await withStore('readwrite', s => s.put(meta)); } catch { memoryMetadata.set(meta.exercise_id, meta); }
}

export async function getAllMediaMetadata(): Promise<ExerciseMediaMeta[]> {
    try { return (await withStore<ExerciseMediaMeta[]>('readonly', s => s.getAll())) || []; }
    catch { return Array.from(memoryMetadata.values()); }
}

export async function getMediaMetadata(exerciseId: string): Promise<ExerciseMediaMeta | null> {
    try { return (await withStore<ExerciseMediaMeta | undefined>('readonly', s => s.get(exerciseId))) || null; }
    catch { return memoryMetadata.get(exerciseId) || null; }
}

export async function clearAllMediaMetadata(): Promise<void> {
    memoryMetadata.clear();
    try { await withStore('readwrite', s => s.clear()); } catch {}
}

export async function isMediaCached(exerciseId: string): Promise<boolean> {
    if (isCacheStorageAvailable()) {
        try {
            const cache = await window.caches.open(MEDIA_CACHE_NAME);
            if (await cache.match(getExerciseMediaUrl(exerciseId))) return true;
        } catch {}
    }
    return !!(await getMediaMetadata(exerciseId));
}

export async function getExerciseMediaBlob(exerciseId: string): Promise<Blob | null> {
    if (!isCacheStorageAvailable()) return null;
    try {
        const cache = await window.caches.open(MEDIA_CACHE_NAME);
        const match = await cache.match(getExerciseMediaUrl(exerciseId));
        return match ? await match.blob() : null;
    } catch { return null; }
}

export async function getExerciseMediaBlobUrl(exerciseId: string): Promise<string | null> {
    const existing = activeBlobUrls.get(exerciseId);
    if (existing) { existing.refCount++; return existing.url; }
    if (inFlightBlobUrls.has(exerciseId)) {
        const url = await inFlightBlobUrls.get(exerciseId)!;
        if (url) { const cur = activeBlobUrls.get(exerciseId); if (cur) cur.refCount++; }
        return url;
    }
    const fetchPromise = (async () => {
        const blob = await getExerciseMediaBlob(exerciseId);
        if (!blob) return null;
        try {
            const blobUrl = URL.createObjectURL(blob);
            activeBlobUrls.set(exerciseId, { url: blobUrl, refCount: 1 });
            return blobUrl;
        } catch { return null; }
    })().finally(() => { inFlightBlobUrls.delete(exerciseId); });
    inFlightBlobUrls.set(exerciseId, fetchPromise);
    return fetchPromise;
}

export function releaseExerciseMediaBlobUrl(exerciseId: string, blobUrl?: string | null): void {
    const record = activeBlobUrls.get(exerciseId);
    if (record && (!blobUrl || record.url === blobUrl)) {
        record.refCount--;
        if (record.refCount <= 0) {
            try { URL.revokeObjectURL(record.url); } catch {}
            activeBlobUrls.delete(exerciseId);
        }
    } else if (blobUrl && blobUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(blobUrl); } catch {}
    }
}

export const revokeExerciseMediaBlobUrl = releaseExerciseMediaBlobUrl;

export async function downloadRoutineMedia(
    exerciseIds: string[],
    onProgress?: (pct: number) => void
): Promise<{ success: boolean; downloaded: number; error?: string }> {
    if (exerciseIds.length === 0) { onProgress?.(100); return { success: true, downloaded: 0 }; }
    let downloaded = 0;
    let failed = 0;
    const total = exerciseIds.length;
    for (let i = 0; i < total; i++) {
        const id = exerciseIds[i];
        try {
            if (!(await isMediaCached(id))) {
                const url = getExerciseMediaUrl(id);
                const res = await fetch(resolveFetchUrl(url));
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const blob = await res.blob();
                if (isCacheStorageAvailable()) {
                    const cache = await window.caches.open(MEDIA_CACHE_NAME);
                    await cache.put(url, new Response(blob, { headers: { 'Content-Type': blob.type || 'image/webp' } }));
                }
                await saveMediaMetadata({
                    exercise_id: id, url, size_bytes: blob.size,
                    mime_type: (blob.type as any) || 'image/webp',
                    cached_at: new Date().toISOString(), version: 1,
                });
                downloaded++;
            }
        } catch (err: any) {
            failed++;
            if (err?.name === 'QuotaExceededError' || err?.code === 22) {
                notifyCacheUpdated();
                return { success: false, downloaded, error: 'Storage quota exceeded' };
            }
        }
        onProgress?.(Math.round(((i + 1) / total) * 100));
    }
    notifyCacheUpdated();
    return { success: failed === 0, downloaded };
}

export async function downloadFullLibrary(onProgress?: (pct: number) => void) {
    return downloadRoutineMedia(INITIAL_EXERCISES.map(e => e.id), onProgress);
}

export async function purgeCachedMedia(): Promise<void> {
    inFlightBlobUrls.clear();
    activeBlobUrls.forEach(e => { try { URL.revokeObjectURL(e.url); } catch {} });
    activeBlobUrls.clear();
    if (isCacheStorageAvailable()) {
        try { await window.caches.delete(MEDIA_CACHE_NAME); } catch {}
    }
    await clearAllMediaMetadata();
    notifyCacheUpdated();
}

export async function refreshCachedMedia(): Promise<{ refreshed: number }> {
    const metas = await getAllMediaMetadata();
    if (metas.length === 0) return { refreshed: 0 };
    let refreshed = 0;
    for (const meta of metas) {
        try {
            const res = await fetch(resolveFetchUrl(meta.url), { cache: 'reload' });
            if (res.ok) {
                const blob = await res.blob();
                if (isCacheStorageAvailable()) {
                    const cache = await window.caches.open(MEDIA_CACHE_NAME);
                    await cache.put(meta.url, new Response(blob, { headers: { 'Content-Type': blob.type || 'image/webp' } }));
                }
                await saveMediaMetadata({ ...meta, size_bytes: blob.size, cached_at: new Date().toISOString(), version: meta.version + 1 });
                if (activeBlobUrls.has(meta.exercise_id)) {
                    const entry = activeBlobUrls.get(meta.exercise_id);
                    if (entry) { try { URL.revokeObjectURL(entry.url); } catch {} activeBlobUrls.delete(meta.exercise_id); }
                }
                refreshed++;
            }
        } catch {}
    }
    notifyCacheUpdated();
    return { refreshed };
}

export async function getMediaStorageReport(): Promise<MediaStorageReport> {
    const metas = await getAllMediaMetadata();
    const usedBytes = metas.reduce((sum, m) => sum + (m.size_bytes || 0), 0);
    const isOnline = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
    let quotaBytes: number | undefined;
    if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
        try { quotaBytes = (await navigator.storage.estimate()).quota; } catch {}
    }
    return {
        cachedCount: metas.length,
        totalCount: INITIAL_EXERCISES.length,
        usedBytes,
        usedMb: Number((usedBytes / (1024 * 1024)).toFixed(1)),
        quotaBytes,
        isOnline,
    };
}
