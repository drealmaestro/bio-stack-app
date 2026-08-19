import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useStore } from '../store/useStore';
import { MEAL_PRESETS } from '../data/nutrition';
import {
    saveOfflineNutrition,
    getOfflineNutrition,
    clearOfflineNutrition,
    syncOfflineQueue,
    resetDBPromiseForTesting,
} from './indexedDB';
import { playChimeTone, sendRestNotification } from '../hooks/useRestTimer';

describe('Adversarial Nutrition Concurrency & Offline Sync Verification', () => {
    const today = '2026-08-19';

    beforeEach(async () => {
        resetDBPromiseForTesting();
        await clearOfflineNutrition();
        useStore.getState().resetStore();
    });

    afterEach(async () => {
        await clearOfflineNutrition();
        vi.restoreAllMocks();
    });

    it('handles rapid concurrent 1-tap meal preset additions without race conditions', async () => {
        const store = useStore.getState();

        // Simulate 8 rapid consecutive / concurrent preset clicks (e.g., fast tapping by athlete)
        const preset = MEAL_PRESETS[0]; // High Protein Shake (350 kcal, 40g protein)
        const concurrentPromises = Array.from({ length: 8 }).map(async () => {
            store.addNutritionEntry(today, {
                food_item_id: preset.id,
                food_name: preset.name,
                servings: 1,
                calories: preset.calories,
                protein_g: preset.protein_g,
                carbs_g: preset.carbs_g,
                fat_g: preset.fat_g,
            });
        });

        await Promise.all(concurrentPromises);

        // Verify Zustand store log has exactly 8 entries
        const currentLog = useStore.getState().getNutritionLog(today);
        expect(currentLog).toBeDefined();
        expect(currentLog?.entries).toHaveLength(8);

        // Verify total calories and protein match 8 * single preset
        const totalCalories = currentLog?.entries.reduce((sum, e) => sum + e.calories, 0);
        const totalProtein = currentLog?.entries.reduce((sum, e) => sum + e.protein_g, 0);

        expect(totalCalories).toBe(350 * 8);
        expect(totalProtein).toBe(40 * 8);
    });

    it('persists and syncs concurrent offline meal entries without transaction collision', async () => {
        // Simulate offline logging across multiple presets concurrently
        const presetsToLog = [
            MEAL_PRESETS[0], // Shake
            MEAL_PRESETS[1], // Chicken & Rice
            MEAL_PRESETS[2], // Greek Yogurt & Berries
            MEAL_PRESETS[3], // Egg & Avocado Toast
        ];

        const savePromises = presetsToLog.map((preset, idx) =>
            saveOfflineNutrition({
                id: `offline_preset_${idx}`,
                date: today,
                entry: {
                    food_item_id: preset.id,
                    food_name: preset.name,
                    servings: 1,
                    calories: preset.calories,
                    protein_g: preset.protein_g,
                    carbs_g: preset.carbs_g,
                    fat_g: preset.fat_g,
                },
            })
        );

        await Promise.all(savePromises);

        // Verify offline storage captured all items
        const offlineEntries = await getOfflineNutrition();
        expect(offlineEntries).toHaveLength(4);

        // Trigger queue synchronization
        const syncResult = await syncOfflineQueue();
        expect(syncResult.nutritionSynced).toBe(4);

        // Confirm offline storage is drained
        const remainingOffline = await getOfflineNutrition();
        expect(remainingOffline).toHaveLength(0);

        // Confirm Zustand store now contains all 4 synced entries
        const log = useStore.getState().getNutritionLog(today);
        expect(log?.entries).toHaveLength(4);
        expect(log?.entries.map(e => e.food_name)).toEqual(
            expect.arrayContaining(['High Protein Shake', 'Chicken & Rice Bowl', 'Eggs & Avocado Toast', 'Greek Yogurt Parfait'])
        );
    });

    it('playChimeTone and sendRestNotification degrade gracefully when Web Audio / Notifications are restricted', () => {
        // Mock restricted environment
        const originalAudioContext = window.AudioContext;
        const originalNotification = window.Notification;

        try {
            // Test 1: Window AudioContext throws or is suspended
            (window as any).AudioContext = vi.fn().mockImplementation(() => {
                return {
                    state: 'suspended',
                    resume: vi.fn().mockRejectedValue(new Error('Autoplay prevented')),
                    currentTime: 0,
                    createOscillator: vi.fn().mockReturnValue({
                        type: '',
                        frequency: { setValueAtTime: vi.fn() },
                        connect: vi.fn(),
                        start: vi.fn(),
                        stop: vi.fn(),
                    }),
                    createGain: vi.fn().mockReturnValue({
                        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
                        connect: vi.fn(),
                    }),
                    destination: {},
                };
            });

            expect(() => playChimeTone()).not.toThrow();

            // Test 2: Notification is denied
            (window as any).Notification = {
                permission: 'denied',
                requestPermission: vi.fn().mockRejectedValue(new Error('Permission denied')),
            };

            expect(() => sendRestNotification('Test', 'Body')).not.toThrow();
        } finally {
            (window as any).AudioContext = originalAudioContext;
            (window as any).Notification = originalNotification;
        }
    });
});
