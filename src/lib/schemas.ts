import { z } from 'zod';

const TargetMuscleSchema = z.enum([
    'Triceps', 'Biceps', 'Chest', 'Legs', 'Back',
    'Shoulders', 'Core', 'Forearms', 'Other'
]);

export const ExerciseSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'Name is required'),
    target_muscle: TargetMuscleSchema,
    video_url: z.string().optional(),
    image_url: z.string().optional(),
    instructions: z.string(),
    form_cues: z.array(z.string()).optional(),
    common_mistakes: z.array(z.string()).optional(),
});

export const ExerciseSetSchema = z.object({
    exercise_id: z.string(),
    target_sets: z.number(),
    target_reps: z.number(),
    rest_seconds: z.number(),
});

export const WorkoutTemplateSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    exercises: z.array(ExerciseSetSchema),
    scheduled_days: z.array(z.number().int().min(0).max(6)).optional(),
});

export const SetLogSchema = z.object({
    exercise_id: z.string(),
    set_number: z.number(),
    reps_completed: z.number(),
    weight_kg: z.number(),
});

export const WorkoutLogSchema = z.object({
    id: z.string(),
    template_id: z.string(),
    timestamp: z.string(),
    duration_seconds: z.number(),
    completed_exercises: z.array(SetLogSchema),
});

const StatEntrySchema = z.object({
    date: z.string(),
    value: z.number(),
});

export const UserProfileSchema = z.object({
    name: z.string(),
    age: z.number(),
    birthday: z.string().optional(),
    goals: z.array(z.string()),
    experience_level: z.string(),
    stats: z.object({
        weight: z.array(StatEntrySchema),
        body_fat: z.array(StatEntrySchema),
    }),
    nutrition_goals: z.object({
        calories: z.number(),
        protein_g: z.number(),
        carbs_g: z.number(),
        fat_g: z.number(),
    }).optional(),
});

export const NutritionEntrySchema = z.object({
    id: z.string(),
    food_item_id: z.string(),
    food_name: z.string(),
    servings: z.number(),
    calories: z.number(),
    protein_g: z.number(),
    carbs_g: z.number(),
    fat_g: z.number(),
    logged_at: z.string(),
});

export const NutritionLogSchema = z.object({
    date: z.string(),
    entries: z.array(NutritionEntrySchema),
});

export const DailyInsightsSchema = z.object({
    date: z.string(),
    steps: z.number(),
    calories_burned: z.number(),
    heart_rate_avg: z.number(),
    distance_km: z.number(),
});

export const CURRENT_SCHEMA_VERSION = 1;

// Top-level Firestore document for users/{uid}. Tolerant on read (missing fields → defaults).
export const UserDocSchema = z.object({
    user: UserProfileSchema.nullable().optional(),
    templates: z.array(WorkoutTemplateSchema).optional(),
    logs: z.array(WorkoutLogSchema).optional(),
    exercises: z.array(ExerciseSchema).optional(),
    nutritionLogs: z.array(NutritionLogSchema).optional(),
    dailyInsights: z.array(DailyInsightsSchema).optional(),
    seeded: z.boolean().optional(),
    schemaVersion: z.number().int().optional(),
    updatedAt: z.any().optional(),
});

export type UserDoc = z.infer<typeof UserDocSchema>;
