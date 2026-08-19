import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MacroProgressBar } from './MacroProgressBar';
import { MealPresetCard } from './MealPresetCard';
import { DailyStreakWidget } from './DailyStreakWidget';
import { NutrientTargetCard } from './NutrientTargetCard';
import { ProteinHeroCard } from './ProteinHeroCard';
import { FoodDiarySection } from './FoodDiarySection';
import { MEAL_PRESETS } from '../../data/nutrition';

describe('Nutrition DOM Components', () => {
    const mockTotals = { calories: 1500, protein_g: 120, carbs_g: 150, fat_g: 50 };
    const mockGoals = { calories: 2000, protein_g: 160, carbs_g: 200, fat_g: 65 };

    describe('MacroProgressBar', () => {
        it('renders label, current vs goal numbers, and percentage achieved', () => {
            render(
                <MacroProgressBar
                    label="Protein"
                    current={120}
                    goal={160}
                    color="bg-[#a78bfa]"
                />
            );

            expect(screen.getByText('Protein')).toBeDefined();
            expect(screen.getByText('120g')).toBeDefined();
            expect(screen.getByText('/ 160g')).toBeDefined();
            expect(screen.getByText('75% achieved')).toBeDefined();
            expect(screen.getByText('40g left')).toBeDefined();
        });

        it('handles zero goal safely without division by zero errors', () => {
            render(
                <MacroProgressBar
                    label="Carbs"
                    current={50}
                    goal={0}
                    color="bg-[#36b4ff]"
                />
            );

            expect(screen.getByText('0% achieved')).toBeDefined();
        });
    });

    describe('MealPresetCard', () => {
        it('renders meal preset details and handles click selection', () => {
            const onSelect = vi.fn();
            const preset = MEAL_PRESETS[0]; // High Protein Shake

            render(
                <MealPresetCard
                    preset={preset}
                    onSelect={onSelect}
                />
            );

            expect(screen.getByText(preset.name)).toBeDefined();
            expect(screen.getByText(`${preset.calories} kcal`)).toBeDefined();
            expect(screen.getByText(`P${preset.protein_g}g C${preset.carbs_g}g F${preset.fat_g}g`)).toBeDefined();

            const cardBtn = screen.getByText(preset.name).closest('button')!;
            fireEvent.click(cardBtn);
            expect(onSelect).toHaveBeenCalledWith(preset);
        });
    });

    describe('DailyStreakWidget', () => {
        it('renders streak badge with Zap icon when streak is positive', () => {
            render(<DailyStreakWidget streak={5} />);

            expect(screen.getByText('5 Day Streak')).toBeDefined();
        });

        it('renders empty streak message when streak is 0 or negative', () => {
            render(<DailyStreakWidget streak={0} />);

            expect(screen.getByText('No active streak yet')).toBeDefined();
        });
    });

    describe('NutrientTargetCard', () => {
        it('renders nutrient targets, macro progress bars, and streak badge', () => {
            render(
                <NutrientTargetCard
                    totals={mockTotals}
                    goals={mockGoals}
                    streak={3}
                />
            );

            expect(screen.getByText('Nutrient target')).toBeDefined();
            expect(screen.getByText('3 Day Streak')).toBeDefined();
            expect(screen.getByText('Protein')).toBeDefined();
            expect(screen.getByText('Carbohydrates')).toBeDefined();
            expect(screen.getByText('Fat')).toBeDefined();
            expect(screen.getByText('1500 kcal')).toBeDefined();
        });
    });

    describe('ProteinHeroCard', () => {
        it('renders protein hero progress ring, remaining grams, and calorie balance', () => {
            render(
                <ProteinHeroCard
                    totals={mockTotals}
                    goals={mockGoals}
                    proteinSource="bodyweight"
                />
            );

            expect(screen.getByText('120')).toBeDefined();
            expect(screen.getByText('/ 160 g')).toBeDefined();
            expect(screen.getByText('40 g')).toBeDefined();
            expect(screen.getByText('Protein first')).toBeDefined();
            expect(screen.getByText('target = 1.8 g × your logged body weight')).toBeDefined();
            expect(screen.getByText('500 kcal under')).toBeDefined();
        });
    });

    describe('FoodDiarySection', () => {
        it('renders 1-tap meal presets and handles instant logging', () => {
            const onOpenAddModal = vi.fn();
            const onDeleteEntry = vi.fn();
            const onAddEntry = vi.fn();

            render(
                <FoodDiarySection
                    today="2026-08-19"
                    onOpenAddModal={onOpenAddModal}
                    onDeleteEntry={onDeleteEntry}
                    onAddEntry={onAddEntry}
                />
            );

            expect(screen.getByText('1-Tap Meal Presets')).toBeDefined();
            const presetBtn = screen.getByText('High Protein Shake');
            fireEvent.click(presetBtn);

            expect(onAddEntry).toHaveBeenCalledWith(expect.objectContaining({
                food_name: 'High Protein Shake',
                protein_g: 40,
                calories: 350,
            }));
        });
    });
});
