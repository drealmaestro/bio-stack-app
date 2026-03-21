import type { FoodItem } from '../types';

export const COMMON_FOODS: FoodItem[] = [
    { id: 'food_chicken_breast', name: 'Chicken Breast', serving_label: '100g', calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6 },
    { id: 'food_white_rice', name: 'White Rice (cooked)', serving_label: '1 cup', calories: 206, protein_g: 4.3, carbs_g: 44.5, fat_g: 0.4 },
    { id: 'food_brown_rice', name: 'Brown Rice (cooked)', serving_label: '1 cup', calories: 216, protein_g: 4.5, carbs_g: 44.8, fat_g: 1.8 },
    { id: 'food_eggs', name: 'Whole Egg', serving_label: '1 large', calories: 72, protein_g: 6.3, carbs_g: 0.4, fat_g: 4.8 },
    { id: 'food_egg_whites', name: 'Egg Whites', serving_label: '1 large', calories: 17, protein_g: 3.6, carbs_g: 0.2, fat_g: 0.1 },
    { id: 'food_whey', name: 'Whey Protein', serving_label: '1 scoop (30g)', calories: 120, protein_g: 24, carbs_g: 3, fat_g: 1.5 },
    { id: 'food_oats', name: 'Rolled Oats', serving_label: '100g dry', calories: 389, protein_g: 16.9, carbs_g: 66.3, fat_g: 6.9 },
    { id: 'food_sweet_potato', name: 'Sweet Potato', serving_label: '1 medium (150g)', calories: 129, protein_g: 2.3, carbs_g: 30, fat_g: 0.1 },
    { id: 'food_broccoli', name: 'Broccoli', serving_label: '1 cup', calories: 31, protein_g: 2.6, carbs_g: 6, fat_g: 0.3 },
    { id: 'food_spinach', name: 'Spinach', serving_label: '1 cup', calories: 7, protein_g: 0.9, carbs_g: 1.1, fat_g: 0.1 },
    { id: 'food_salmon', name: 'Salmon', serving_label: '100g', calories: 208, protein_g: 20, carbs_g: 0, fat_g: 13 },
    { id: 'food_tuna', name: 'Canned Tuna', serving_label: '100g', calories: 116, protein_g: 25.5, carbs_g: 0, fat_g: 1 },
    { id: 'food_greek_yogurt', name: 'Greek Yogurt (0%)', serving_label: '150g', calories: 88, protein_g: 15, carbs_g: 5.1, fat_g: 0.5 },
    { id: 'food_cottage_cheese', name: 'Cottage Cheese', serving_label: '100g', calories: 98, protein_g: 11, carbs_g: 3.4, fat_g: 4.3 },
    { id: 'food_banana', name: 'Banana', serving_label: '1 medium', calories: 89, protein_g: 1.1, carbs_g: 23, fat_g: 0.3 },
    { id: 'food_apple', name: 'Apple', serving_label: '1 medium', calories: 52, protein_g: 0.3, carbs_g: 14, fat_g: 0.2 },
    { id: 'food_almonds', name: 'Almonds', serving_label: '30g', calories: 173, protein_g: 6.3, carbs_g: 6, fat_g: 15 },
    { id: 'food_olive_oil', name: 'Olive Oil', serving_label: '1 tbsp', calories: 119, protein_g: 0, carbs_g: 0, fat_g: 13.5 },
    { id: 'food_beef_mince', name: 'Lean Beef Mince (5%)', serving_label: '100g', calories: 137, protein_g: 21, carbs_g: 0, fat_g: 5.5 },
    { id: 'food_pasta', name: 'Pasta (cooked)', serving_label: '100g', calories: 131, protein_g: 5, carbs_g: 25, fat_g: 1.1 },
];

export const DEFAULT_NUTRITION_GOALS = {
    calories: 2500,
    protein_g: 180,
    carbs_g: 250,
    fat_g: 70,
};
