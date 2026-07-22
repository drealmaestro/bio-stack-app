export interface MacroItemProgress {
    consumed: number;
    target: number;
    remaining: number;
    percentage: number;
}

export interface MacroProgress {
    calories: MacroItemProgress;
    protein: MacroItemProgress;
    carbs: MacroItemProgress;
    fat: MacroItemProgress;
}

export interface NutritionLogLike {
    date: string; // YYYY-MM-DD
    entries?: Array<{ calories?: number; protein_g?: number; carbs_g?: number; fat_g?: number }>;
    calories?: number;
    totalCalories?: number;
    goalMet?: boolean;
}

/**
 * Calculates macro progress, percentage reached (0-100%), and remaining target amounts.
 */
export function calculateMacroProgress(
    consumed: { calories: number; protein: number; carbs: number; fat: number },
    target: { calories: number; protein: number; carbs: number; fat: number }
): MacroProgress {
    const calcItem = (c: number, t: number): MacroItemProgress => {
        const safeConsumed = Math.max(0, Math.round(c * 10) / 10);
        const safeTarget = Math.max(0, Math.round(t * 10) / 10);
        const remaining = Math.max(0, Math.round((safeTarget - safeConsumed) * 10) / 10);
        const percentage = safeTarget > 0 ? Math.min(100, Math.round((safeConsumed / safeTarget) * 100)) : 0;
        return {
            consumed: safeConsumed,
            target: safeTarget,
            remaining,
            percentage,
        };
    };

    return {
        calories: calcItem(consumed.calories, target.calories),
        protein: calcItem(consumed.protein, target.protein),
        carbs: calcItem(consumed.carbs, target.carbs),
        fat: calcItem(consumed.fat, target.fat),
    };
}

/**
 * Calculates consecutive days of logged nutrition goals ending today or yesterday.
 * 
 * @param logs Array of nutrition logs or daily entries
 * @param targetCalories Optional calorie target threshold (defaults to requiring >0 calories logged)
 * @param referenceDate Optional ISO date string YYYY-MM-DD for testing (defaults to today)
 * @returns Number of consecutive days logged meeting goal
 */
export function calculateDailyStreak(
    logs: NutritionLogLike[],
    targetCalories?: number,
    referenceDate?: string
): number {
    if (!logs || logs.length === 0) return 0;

    const dateMap = new Map<string, number>();

    logs.forEach(log => {
        let total = 0;
        if (typeof log.calories === 'number') {
            total = log.calories;
        } else if (typeof log.totalCalories === 'number') {
            total = log.totalCalories;
        } else if (Array.isArray(log.entries)) {
            total = log.entries.reduce((sum, e) => sum + (e.calories || 0), 0);
        }
        dateMap.set(log.date, (dateMap.get(log.date) || 0) + total);
    });

    const isGoalMet = (dateStr: string): boolean => {
        const cal = dateMap.get(dateStr);
        if (cal === undefined || cal <= 0) return false;
        if (targetCalories && targetCalories > 0) {
            return cal >= targetCalories * 0.8;
        }
        return true;
    };

    const refDate = referenceDate ? new Date(referenceDate) : new Date();
    
    // YYYY-MM-DD helper
    const formatDate = (d: Date): string => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayStr = formatDate(refDate);

    const yesterdayDate = new Date(refDate);
    yesterdayDate.setDate(refDate.getDate() - 1);
    const yesterdayStr = formatDate(yesterdayDate);

    let startDate: Date;
    if (isGoalMet(todayStr)) {
        startDate = new Date(refDate);
    } else if (isGoalMet(yesterdayStr)) {
        startDate = yesterdayDate;
    } else {
        return 0;
    }

    let streak = 0;
    const checkDate = new Date(startDate);

    while (isGoalMet(formatDate(checkDate))) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
}
