import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    isCacheStorageAvailable,
    isIndexedDBAvailable,
    getExerciseMediaUrl,
    isMediaCached,
    getExerciseMediaBlob,
    getExerciseMediaBlobUrl,
    releaseExerciseMediaBlobUrl,
    downloadRoutineMedia,
    downloadFullLibrary,
    purgeCachedMedia,
    refreshCachedMedia,
    getMediaStorageReport,
    resetMediaManagerForTesting,
    saveMediaMetadata,
    getAllMediaMetadata,
    getMediaMetadata,
    clearAllMediaMetadata,
    MEDIA_CACHE_NAME,
} from './mediaManager';

describe('mediaManager - CacheStorage & IndexedDB Engine', () => {
    let cacheMap: Map<string, Response>;
    let revokeSpy: ReturnType<typeof vi.fn>;
    let createUrlSpy: ReturnType<typeof vi.fn>;
    let blobCounter = 0;

    beforeEach(() => {
        vi.restoreAllMocks();
        resetMediaManagerForTesting();
        cacheMap = new Map();
        blobCounter = 0;

        const mockCache = {
            match: vi.fn(async (req: string | Request) => {
                const url = typeof req === 'string' ? req : req.url;
                const match = cacheMap.get(url);
                return match ? match.clone() : undefined;
            }),
            put: vi.fn(async (req: string | Request, res: Response) => {
                const url = typeof req === 'string' ? req : req.url;
                cacheMap.set(url, res.clone());
            }),
            delete: vi.fn(async (req: string | Request) => {
                const url = typeof req === 'string' ? req : req.url;
                return cacheMap.delete(url);
            }),
            keys: vi.fn(async () => Array.from(cacheMap.keys()).map(u => new Request(u))),
        };

        const mockCaches = {
            open: vi.fn(async () => mockCache),
            has: vi.fn(async (name: string) => name === MEDIA_CACHE_NAME),
            delete: vi.fn(async () => {
                cacheMap.clear();
                return true;
            }),
            keys: vi.fn(async () => [MEDIA_CACHE_NAME]),
        };

        const mockStorage = {
            estimate: vi.fn(async () => ({
                usage: 2_000_000,
                quota: 100_000_000,
            })),
        };

        createUrlSpy = vi.fn((_blob: Blob) => `blob:http://localhost/mock-blob-${++blobCounter}`);
        revokeSpy = vi.fn();

        vi.stubGlobal('caches', mockCaches);
        Object.defineProperty(window, 'caches', { value: mockCaches, writable: true, configurable: true });
        Object.defineProperty(navigator, 'storage', { value: mockStorage, writable: true, configurable: true });
        Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
        Object.defineProperty(URL, 'createObjectURL', { value: createUrlSpy, writable: true, configurable: true });
        Object.defineProperty(URL, 'revokeObjectURL', { value: revokeSpy, writable: true, configurable: true });

        globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
            const urlStr = String(input);
            if (urlStr.includes('quota-error')) {
                const err = new Error('The quota has been exceeded.');
                err.name = 'QuotaExceededError';
                throw err;
            }
            if (urlStr.includes('network-fail')) {
                return new Response(null, { status: 500, statusText: 'Internal Error' });
            }
            const body = new Uint8Array(200_000);
            return new Response(body, {
                status: 200,
                headers: { 'Content-Type': 'image/webp' },
            });
        }) as any;
    });

    afterEach(() => {
        resetMediaManagerForTesting();
        vi.restoreAllMocks();
    });

    it('detects CacheStorage and IndexedDB support correctly', () => {
        expect(isCacheStorageAvailable()).toBe(true);
        expect(typeof isIndexedDBAvailable()).toBe('boolean');
    });

    it('generates consistent exercise media URLs', () => {
        const url = getExerciseMediaUrl('bench_press');
        expect(url).toBeDefined();
        expect(typeof url).toBe('string');
    });

    it('checks media cache status accurately across CacheStorage and metadata', async () => {
        expect(await isMediaCached('test_ex_1')).toBe(false);

        await saveMediaMetadata({
            exercise_id: 'test_ex_1',
            url: getExerciseMediaUrl('test_ex_1'),
            size_bytes: 120_000,
            mime_type: 'image/webp',
            cached_at: new Date().toISOString(),
            version: 1,
        });

        expect(await isMediaCached('test_ex_1')).toBe(true);
    });

    it('downloads routine media and triggers cache update events', async () => {
        const eventSpy = vi.fn();
        window.addEventListener('media-cache-updated', eventSpy);

        const progressUpdates: number[] = [];
        const result = await downloadRoutineMedia(['bench_press', 'squat'], (pct) => {
            progressUpdates.push(pct);
        });

        expect(result.success).toBe(true);
        expect(result.downloaded).toBe(2);
        expect(progressUpdates.length).toBeGreaterThan(0);
        expect(progressUpdates[progressUpdates.length - 1]).toBe(100);
        expect(eventSpy).toHaveBeenCalled();

        window.removeEventListener('media-cache-updated', eventSpy);
    });

    it('returns 100% progress for empty exercise lists', async () => {
        const progressUpdates: number[] = [];
        const res = await downloadRoutineMedia([], (pct) => progressUpdates.push(pct));
        expect(res.success).toBe(true);
        expect(res.downloaded).toBe(0);
        expect(progressUpdates).toContain(100);
    });

    it('memoizes created blob URLs and revokes them on purge', async () => {
        const targetUrl = getExerciseMediaUrl('bench_press');
        const cache = await window.caches.open(MEDIA_CACHE_NAME);
        await cache.put(targetUrl, new Response(new Uint8Array(50_000), {
            headers: { 'Content-Type': 'image/webp' }
        }));

        const blobUrl1 = await getExerciseMediaBlobUrl('bench_press');
        expect(blobUrl1).toMatch(/^blob:/);
        expect(createUrlSpy).toHaveBeenCalledTimes(1);

        const blobUrl2 = await getExerciseMediaBlobUrl('bench_press');
        expect(blobUrl2).toBe(blobUrl1);
        expect(createUrlSpy).toHaveBeenCalledTimes(1);

        await purgeCachedMedia();
        expect(revokeSpy).toHaveBeenCalledWith(blobUrl1);
        expect(await isMediaCached('bench_press')).toBe(false);
    });

    it('manages reference counting and dispenses fresh unrevoked blob URLs after release', async () => {
        const targetUrl = getExerciseMediaUrl('squat');
        const cache = await window.caches.open(MEDIA_CACHE_NAME);
        await cache.put(targetUrl, new Response(new Uint8Array(50_000), {
            headers: { 'Content-Type': 'image/webp' }
        }));

        const blobUrl1 = await getExerciseMediaBlobUrl('squat');
        expect(blobUrl1).toMatch(/^blob:/);
        expect(createUrlSpy).toHaveBeenCalledTimes(1);

        const blobUrl2 = await getExerciseMediaBlobUrl('squat');
        expect(blobUrl2).toBe(blobUrl1);
        expect(createUrlSpy).toHaveBeenCalledTimes(1);

        releaseExerciseMediaBlobUrl('squat', blobUrl1);
        expect(revokeSpy).not.toHaveBeenCalledWith(blobUrl1);

        releaseExerciseMediaBlobUrl('squat', blobUrl1);
        expect(revokeSpy).toHaveBeenCalledWith(blobUrl1);

        const blobUrl3 = await getExerciseMediaBlobUrl('squat');
        expect(blobUrl3).toMatch(/^blob:/);
        expect(blobUrl3).not.toBe(blobUrl1);
        expect(createUrlSpy).toHaveBeenCalledTimes(2);
    });

    it('retrieves raw blob via getExerciseMediaBlob', async () => {
        const targetUrl = getExerciseMediaUrl('deadlift');
        const cache = await window.caches.open(MEDIA_CACHE_NAME);
        await cache.put(targetUrl, new Response(new Uint8Array(25_000), {
            headers: { 'Content-Type': 'image/webp' }
        }));

        const blob = await getExerciseMediaBlob('deadlift');
        expect(blob).toBeDefined();
        expect(blob?.size).toBe(25_000);
        expect(blob?.type).toBe('image/webp');
    });

    it('handles QuotaExceededError gracefully without unhandled rejection', async () => {
        const res = await downloadRoutineMedia(['quota-error-id']);
        expect(res.success).toBe(false);
        expect(res.error).toBe('Storage quota exceeded');
    });

    it('generates comprehensive storage report with MB metrics', async () => {
        await clearAllMediaMetadata();
        await saveMediaMetadata({
            exercise_id: 'ex_1',
            url: '/assets/ex1.webp',
            size_bytes: 1024 * 1024 * 2,
            mime_type: 'image/webp',
            cached_at: new Date().toISOString(),
            version: 1,
        });

        const report = await getMediaStorageReport();
        expect(report.cachedCount).toBe(1);
        expect(report.usedBytes).toBe(2097152);
        expect(report.usedMb).toBe(2);
        expect(report.isOnline).toBe(true);
        expect(report.quotaBytes).toBe(100_000_000);
    });

    it('downloads full library and refreshes cached media', async () => {
        const libraryResult = await downloadFullLibrary();
        expect(libraryResult.downloaded).toBeGreaterThanOrEqual(0);

        const refreshResult = await refreshCachedMedia();
        expect(refreshResult.refreshed).toBeGreaterThanOrEqual(0);
    });

    it('retrieves single and all metadata records directly', async () => {
        await saveMediaMetadata({
            exercise_id: 'sample_ex',
            url: '/assets/sample.webp',
            size_bytes: 300,
            mime_type: 'image/webp',
            cached_at: new Date().toISOString(),
            version: 1,
        });

        const single = await getMediaMetadata('sample_ex');
        expect(single?.exercise_id).toBe('sample_ex');

        const all = await getAllMediaMetadata();
        expect(all.some(m => m.exercise_id === 'sample_ex')).toBe(true);
    });
});
