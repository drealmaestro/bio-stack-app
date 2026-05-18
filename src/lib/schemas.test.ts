import { describe, it, expect } from 'vitest';
import {
    ExerciseSchema,
    UserProfileSchema,
    WorkoutLogSchema,
    UserDocSchema,
} from './schemas';

describe('Zod Schema Validation', () => {
    it('validates a correct exercise object', () => {
        const validExercise = {
            id: 'ex-123',
            name: 'Bench Press',
            target_muscle: 'Chest',
            instructions: 'Lie on bench, press the bar.',
        };
        const result = ExerciseSchema.safeParse(validExercise);
        expect(result.success).toBe(true);
    });

    it('rejects an exercise with an empty name', () => {
        const invalidExercise = {
            id: 'ex-123',
            name: '',
            target_muscle: 'Chest',
            instructions: 'x',
        };
        const result = ExerciseSchema.safeParse(invalidExercise);
        expect(result.success).toBe(false);
    });

    it('rejects an exercise with an unknown target_muscle', () => {
        const invalidExercise = {
            id: 'ex-123',
            name: 'Bench',
            target_muscle: 'Pecs', // not in enum
            instructions: 'x',
        };
        const result = ExerciseSchema.safeParse(invalidExercise);
        expect(result.success).toBe(false);
    });

    it('validates a basic user profile', () => {
        const validProfile = {
            name: 'John Doe',
            age: 30,
            birthday: '1995-06-15',
            goals: ['Muscle Gain'],
            experience_level: 'Intermediate',
            stats: {
                weight: [{ date: '2026-01-01', value: 80 }],
                body_fat: [],
            },
            nutrition_goals: {
                calories: 2500,
                protein_g: 150,
                carbs_g: 250,
                fat_g: 70,
            },
        };
        const result = UserProfileSchema.safeParse(validProfile);
        expect(result.success).toBe(true);
    });

    it('validates a workout log', () => {
        const validLog = {
            id: 'log-1',
            template_id: 't-1',
            timestamp: '2026-05-18T12:00:00Z',
            duration_seconds: 3600,
            completed_exercises: [
                { exercise_id: 'ex-1', set_number: 1, reps_completed: 10, weight_kg: 60 },
            ],
        };
        const result = WorkoutLogSchema.safeParse(validLog);
        expect(result.success).toBe(true);
    });

    it('accepts a minimal user doc (all top-level fields optional)', () => {
        const result = UserDocSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it('rejects a user doc with a malformed log entry', () => {
        const doc = {
            logs: [{ id: 'log-1' }], // missing required fields
        };
        const result = UserDocSchema.safeParse(doc);
        expect(result.success).toBe(false);
    });
});
