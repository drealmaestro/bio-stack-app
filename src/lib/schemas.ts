import { z } from 'zod';

const TargetMuscleSchema = z.enum([
    'Triceps', 'Biceps', 'Chest', 'Legs', 'Back',
    'Shoulders', 'Core', 'Forearms', 'Other'
]);

export const ExerciseSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'Name is required').max(120),
    target_muscle: TargetMuscleSchema,
    video_url: z.string().url().optional(),
    image_url: z.string().url().optional(),
    instructions: z.string().max(2000),
    form_cues: z.array(z.string().max(300)).max(20).optional(),
    common_mistakes: z.array(z.string().max(300)).max(20).optional(),
}).strict();

export const ExerciseSetSchema = z.object({
    exercise_id: z.string(),
    target_sets: z.number().int().min(1).max(10),
    target_reps: z.number().int().min(1).max(100),
    rest_seconds: z.number().int().min(0).max(600),
}).strict();

export const WorkoutTemplateSchema = z.object({
    id: z.string(),
    name: z.string().min(1).max(120),
    exercises: z.array(ExerciseSetSchema).max(100),
    scheduled_days: z.array(z.number().int().min(0).max(6)).optional(),
}).strict();

export const SetLogSchema = z.object({
    exercise_id: z.string(),
    set_number: z.number().int().min(1).max(100),
    reps_completed: z.number().int().min(0).max(1000),
    weight_kg: z.number().min(0).max(1000),
}).strict();

export const WorkoutLogSchema = z.object({
    id: z.string(),
    template_id: z.string(),
    timestamp: z.string().datetime(),
    duration_seconds: z.number().min(0).max(86400),
    completed_exercises: z.array(SetLogSchema).max(300),
}).strict();

const StatEntrySchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    value: z.number().min(0).max(1000),
}).strict();

export const UserProfileSchema = z.object({
    name: z.string().max(120),
    age: z.number().int().min(0).max(130),
    birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    goals: z.array(z.string().max(80)).max(20),
    experience_level: z.string().max(80),
    stats: z.object({
        weight: z.array(StatEntrySchema).max(5000),
        body_fat: z.array(StatEntrySchema).max(5000),
    }).strict(),
    nutrition_goals: z.object({
        calories: z.number().int().min(0).max(20000),
        protein_g: z.number().min(0).max(2000),
        carbs_g: z.number().min(0).max(3000),
        fat_g: z.number().min(0).max(2000),
    }).strict().optional(),
}).strict();

export const NutritionEntrySchema = z.object({
    id: z.string(),
    food_item_id: z.string(),
    food_name: z.string().min(1).max(160),
    servings: z.number().min(0).max(100),
    calories: z.number().min(0).max(20000),
    protein_g: z.number().min(0).max(2000),
    carbs_g: z.number().min(0).max(3000),
    fat_g: z.number().min(0).max(2000),
    logged_at: z.string().datetime(),
}).strict();

export const NutritionLogSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    entries: z.array(NutritionEntrySchema).max(200),
}).strict();

export const DailyInsightsSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    steps: z.number().int().min(0).max(200000),
    calories_burned: z.number().min(0).max(20000),
    heart_rate_avg: z.number().min(0).max(250),
    distance_km: z.number().min(0).max(1000),
}).strict();

export const CURRENT_SCHEMA_VERSION = 1;

// Top-level Firestore document for users/{uid}. Tolerant on read (missing fields → defaults).
export const UserDocSchema = z.object({
    user: UserProfileSchema.nullable().optional(),
    templates: z.array(WorkoutTemplateSchema).max(500).optional(),
    logs: z.array(WorkoutLogSchema).max(10000).optional(),
    exercises: z.array(ExerciseSchema).max(2000).optional(),
    nutritionLogs: z.array(NutritionLogSchema).max(5000).optional(),
    dailyInsights: z.array(DailyInsightsSchema).max(5000).optional(),
    seeded: z.boolean().optional(),
    schemaVersion: z.number().int().optional(),
    updatedAt: z.unknown().optional(),
}).strict();

export type UserDoc = z.infer<typeof UserDocSchema>;
