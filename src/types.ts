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
    image_url?: string; // Local SVG/Image path
    instructions: string;
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
    timestamp: string; // ISO DateTime
    duration_seconds: number;
    completed_exercises: SetLog[];
}

export interface StatEntry {
    date: string;
    value: number;
}

export interface UserProfile {
    name: string;
    age: number; // Deprecated, derived from birthday
    birthday?: string; // ISO Date String (YYYY-MM-DD)
    goals: string[];
    experience_level: string;
    stats: {
        weight: StatEntry[];
        body_fat: StatEntry[];
    };
}

export interface ActiveWorkoutState {
    templateId: string;
    startTime: number; // Timestamp
    completedSets: string[]; // ["0-1", "1-2"]
    setWeights: Record<string, number>; // { "0-1": 60 }

    // Rest Timer (Timestamp based)
    restEndTime: number | null; // Timestamp when rest ends
    originalRestDuration: number; // To calculate progress if needed
}
