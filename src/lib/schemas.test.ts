import { describe, it, expect } from 'vitest';
import { ExerciseSchema, UserProfileSchema } from './schemas';

describe('Zod Schema Validation', () => {
    it('validates a correct exercise object', () => {
        const validExercise = {
            id: 'ex-123',
            name: 'Bench Press',
            muscle_group: 'Chest',
            type: 'strength',
        };

        const result = ExerciseSchema.safeParse(validExercise);
        expect(result.success).toBe(true);
    });

    it('rejects an exercise with an empty name', () => {
        const invalidExercise = {
            id: 'ex-123',
            name: '',
            muscle_group: 'Chest',
            type: 'strength',
        };

        const result = ExerciseSchema.safeParse(invalidExercise);
        expect(result.success).toBe(false);
    });

    it('validates a basic user profile', () => {
        const validProfile = {
            id: 'u-123',
            name: 'John Doe',
            age: 30,
            gender: 'male',
            height: 180,
            height_unit: 'cm',
            weight_unit: 'kg',
            stats: {
                weight: [{ date: '2023-10-01', value: 80 }],
                body_fat: []
            },
            goals: {
                daily_calories: 2500,
                daily_protein: 150,
                daily_carbs: 250,
                daily_fat: 70
            }
        };

        const result = UserProfileSchema.safeParse(validProfile);
        expect(result.success).toBe(true);
    });
});
