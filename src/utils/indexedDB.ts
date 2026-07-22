const DB_NAME = 'bio-stack-offline-db';
const DB_VERSION = 1;
const WORKOUTS_STORE = 'offline_workouts';
const NUTRITION_STORE = 'offline_nutrition';

let memoryWorkouts: any[] = [];
let memoryNutrition: any[] = [];
let dbPromise: Promise<IDBDatabase> | null = null;
let isSyncing = false;

export function isIndexedDBAvailable(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
}

export function getIsSyncing(): boolean {
    return isSyncing;
}

export function setIsSyncing(val: boolean): void {
    isSyncing = val;
}

export function resetDBPromiseForTesting(): void {
    dbPromise = null;
    memoryWorkouts = [];
    memoryNutrition = [];
    isSyncing = false;
}

export function getDB(): Promise<IDBDatabase> {
    if (!isIndexedDBAvailable()) {
        return Promise.reject(new Error('IndexedDB is not available'));
    }
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            try {
                const request = window.indexedDB.open(DB_NAME, DB_VERSION);
                request.onupgradeneeded = () => {
                    const db = request.result;
                    if (!db.objectStoreNames.contains(WORKOUTS_STORE)) {
                        db.createObjectStore(WORKOUTS_STORE, { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains(NUTRITION_STORE)) {
                        db.createObjectStore(NUTRITION_STORE, { keyPath: 'id' });
                    }
                };
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => {
                    dbPromise = null;
                    reject(request.error || new Error('Failed to open IndexedDB'));
                };
            } catch (err) {
                dbPromise = null;
                reject(err);
            }
        });
    }
    return dbPromise;
}

async function saveItem(storeName: string, item: any, memoryList: any[]): Promise<void> {
    try {
        const db = await getDB();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const req = tx.objectStore(storeName).put(item);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } catch {
        const idx = memoryList.findIndex(x => x.id === item.id);
        if (idx >= 0) memoryList[idx] = item;
        else memoryList.push(item);
    }
}

async function getItems(storeName: string, memoryList: any[]): Promise<any[]> {
    try {
        const db = await getDB();
        return await new Promise<any[]>((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const req = tx.objectStore(storeName).getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    } catch {
        return [...memoryList];
    }
}

async function clearItems(storeName: string, memoryList: any[]): Promise<void> {
    memoryList.length = 0;
    try {
        const db = await getDB();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const req = tx.objectStore(storeName).clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } catch {
        // Memory clear completed
    }
}

async function removeItems(storeName: string, ids: string[], memoryList: any[]): Promise<void> {
    const idSet = new Set(ids);
    const filtered = memoryList.filter(x => !idSet.has(x.id));
    memoryList.length = 0;
    memoryList.push(...filtered);
    try {
        const db = await getDB();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            let pending = ids.length;
            if (pending === 0) {
                resolve();
                return;
            }
            let errored = false;
            for (const id of ids) {
                const req = store.delete(id);
                req.onsuccess = () => {
                    pending--;
                    if (pending === 0 && !errored) resolve();
                };
                req.onerror = () => {
                    if (!errored) {
                        errored = true;
                        reject(req.error);
                    }
                };
            }
        });
    } catch {
        // Memory clear completed
    }
}

export async function saveOfflineWorkout(workout: any): Promise<void> {
    const item = {
        id: workout.id || `workout_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: workout.timestamp || new Date().toISOString(),
        ...workout,
    };
    return saveItem(WORKOUTS_STORE, item, memoryWorkouts);
}

export async function getOfflineWorkouts(): Promise<any[]> {
    return getItems(WORKOUTS_STORE, memoryWorkouts);
}

export async function clearOfflineWorkouts(): Promise<void> {
    return clearItems(WORKOUTS_STORE, memoryWorkouts);
}

export async function removeOfflineWorkouts(ids: string[]): Promise<void> {
    return removeItems(WORKOUTS_STORE, ids, memoryWorkouts);
}

export async function saveOfflineNutrition(entry: any): Promise<void> {
    if (isSyncing && entry?.entry && !entry?.id) return;
    const item = {
        id: entry.id || entry.entry?.id || `nutr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        date: entry.date || new Date().toISOString().split('T')[0],
        ...entry,
    };
    return saveItem(NUTRITION_STORE, item, memoryNutrition);
}

export async function getOfflineNutrition(): Promise<any[]> {
    return getItems(NUTRITION_STORE, memoryNutrition);
}

export async function clearOfflineNutrition(): Promise<void> {
    return clearItems(NUTRITION_STORE, memoryNutrition);
}

export async function removeOfflineNutrition(ids: string[]): Promise<void> {
    return removeItems(NUTRITION_STORE, ids, memoryNutrition);
}

export { syncOfflineQueue, syncWorkouts, syncNutrition } from './indexedDBSync';
