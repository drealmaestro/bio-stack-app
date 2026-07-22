import type { StateCreator } from 'zustand';
import type { UserProfile } from '../../types';

export interface UserSlice {
    user: UserProfile | null;
    waterIntake: Record<string, number>;
    sleepDuration: Record<string, number>;
    setUser: (user: UserProfile) => void;
    updateUserStats: (type: 'weight' | 'body_fat', entry: { date: string; value: number }) => void;
    logWaterIntake: (date: string, deltaMl: number) => void;
    resetWater: (date: string) => void;
    logSleep: (date: string, minutes: number) => void;
}

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (set) => ({
    user: null,
    waterIntake: {},
    sleepDuration: {},

    setUser: (user) => set({ user }),

    updateUserStats: (type, entry) => set((state) => {
        if (!state.user) return state;
        return {
            user: {
                ...state.user,
                stats: {
                    ...state.user.stats,
                    [type]: [...state.user.stats[type], entry]
                }
            }
        };
    }),

    logWaterIntake: (date, deltaMl) => set((state) => ({
        waterIntake: {
            ...state.waterIntake,
            [date]: Math.max((state.waterIntake[date] || 0) + deltaMl, 0)
        }
    })),

    resetWater: (date) => set((state) => ({
        waterIntake: {
            ...state.waterIntake,
            [date]: 0
        }
    })),

    logSleep: (date, minutes) => set((state) => ({
        sleepDuration: {
            ...state.sleepDuration,
            [date]: minutes
        }
    }))
});
