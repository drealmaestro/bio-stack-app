import { z } from 'zod';

export const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  muscle_group: z.string(),
  type: z.enum(['strength', 'cardio'])
});

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  age: z.number().int().positive().nullable(),
  gender: z.enum(['male', 'female', 'other']).nullable(),
  height: z.number().positive().nullable(),
  height_unit: z.enum(['cm', 'in']),
  weight_unit: z.enum(['kg', 'lbs']),
  stats: z.object({
    weight: z.array(z.object({
      date: z.string(),
      value: z.number()
    })),
    body_fat: z.array(z.object({
      date: z.string(),
      value: z.number()
    }))
  }),
  goals: z.object({
    daily_calories: z.number(),
    daily_protein: z.number(),
    daily_carbs: z.number(),
    daily_fat: z.number()
  })
});

// Infer types if needed: export type ExerciseType = z.infer<typeof ExerciseSchema>;
