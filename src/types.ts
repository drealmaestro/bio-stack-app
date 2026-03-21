export type TargetMuscle =
    | 'Triceps'
    | 'Biceps'
    | 'Chest'
    | 'Legs'
    | 'Back'
    | 'Shoulders'
    | 'Core'
    | 'Forearms'
    | 'Other';

export interface Exercise {
    id: string;
    name: string;
    target_muscle: TargetMuscle;
    video_url?: string;
    image_url?: string;
    instructions: string;
    form_cues?: string[];
    common_mistakes?: string[];
}

export interface ExerciseSet {
    exercise_id: string;
    target_sets: number;
    target_reps: number;
    rest_seconds: number;
}

export interface WorkoutTemplate {
    id: string;
    name: string;
    exercises: ExerciseSet[];
}

export interface SetLog {
    exercise_id: string;
    set_number: number;
    reps_completed: number;
    weight_kg: number;
}

export interface WorkoutLog {
    id: string;
    template_id: string;
    timestamp: string;
    duration_seconds: number;
    completed_exercises: SetLog[];
}

export interface StatEntry {
    date: string;
    value: number;
}

export interface UserProfile {
    name: string;
    age: number;
    birthday?: string;
    goals: string[];
    experience_level: string;
    stats: {
        weight: StatEntry[];
        body_fat: StatEntry[];
    };
    nutrition_goals?: {
        calories: number;
        protein_g: number;
        carbs_g: number;
        fat_g: number;
    };
}

export interface ActiveWorkoutState {
    templateId: string;
    startTime: number;
    completedSets: string[];
    setWeights: Record<string, number>;
    setReps: Record<string, number>;
    restEndTime: number | null;
    originalRestDuration: number;
}

// --- Nutrition ---

export interface FoodItem {
    id: string;
    name: string;
    serving_label: string; // e.g. "100g", "1 cup", "1 scoop"
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
}

export interface NutritionEntry {
    id: string;
    food_item_id: string;
    food_name: string;
    servings: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    logged_at: string; // ISO DateTime
}

export interface NutritionLog {
    date: string; // YYYY-MM-DD
    entries: NutritionEntry[];
}

// --- Daily Insights ---

export interface DailyInsights {
    date: string; // YYYY-MM-DD
    steps: number;
    calories_burned: number;
    heart_rate_avg: number;
    distance_km: number;
}
