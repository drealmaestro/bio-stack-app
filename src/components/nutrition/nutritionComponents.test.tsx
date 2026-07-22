import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProteinHeroCard } from './ProteinHeroCard';
import { NutrientTargetCard } from './NutrientTargetCard';
import { FoodDiarySection } from './FoodDiarySection';
import { AddFoodModal } from './AddFoodModal';
import type { NutritionLog } from '../../types';

describe('Nutrition Sub-components', () => {
    const mockTotals = { calories: 1500, protein_g: 120, carbs_g: 150, fat_g: 50 };
    const mockGoals = { calories: 2000, protein_g: 160, carbs_g: 200, fat_g: 65 };

    describe('ProteinHeroCard', () => {
        it('renders protein totals, remaining protein, and goals', () => {
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
        });
    });

    describe('NutrientTargetCard', () => {
        it('renders macro bars and summary pills', () => {
            render(
                <NutrientTargetCard
                    totals={mockTotals}
                    goals={mockGoals}
                />
            );

            expect(screen.getByText('Nutrient target')).toBeDefined();
            expect(screen.getAllByText('120g').length).toBeGreaterThan(0);
            expect(screen.getAllByText('150g').length).toBeGreaterThan(0);
            expect(screen.getAllByText('50g').length).toBeGreaterThan(0);
            expect(screen.getByText('1500 kcal')).toBeDefined();
        });
    });

    describe('FoodDiarySection', () => {
        it('renders empty state when log has no entries', () => {
            const onOpenAddModal = vi.fn();
            render(
                <FoodDiarySection
                    today="2026-07-21"
                    todayLog={{ date: '2026-07-21', entries: [] }}
                    onOpenAddModal={onOpenAddModal}
                    onDeleteEntry={vi.fn()}
                />
            );

            expect(screen.getByText('Tap to record your first meal')).toBeDefined();
            fireEvent.click(screen.getByText('Tap to record your first meal'));
            expect(onOpenAddModal).toHaveBeenCalledTimes(1);
        });

        it('renders log entries and triggers delete', () => {
            const onDeleteEntry = vi.fn();
            const log: NutritionLog = {
                date: '2026-07-21',
                entries: [
                    {
                        id: 'entry-1',
                        food_item_id: 'food_chicken_breast',
                        food_name: 'Chicken Breast',
                        servings: 2,
                        calories: 330,
                        protein_g: 62,
                        carbs_g: 0,
                        fat_g: 7.2,
                        logged_at: new Date().toISOString(),
                    },
                ],
            };

            render(
                <FoodDiarySection
                    today="2026-07-21"
                    todayLog={log}
                    onOpenAddModal={vi.fn()}
                    onDeleteEntry={onDeleteEntry}
                />
            );

            expect(screen.getByText('Chicken Breast')).toBeDefined();
            expect(screen.getByText('330')).toBeDefined();
            expect(screen.getByText('2x')).toBeDefined();

            const deleteBtn = screen.getByLabelText('Delete Chicken Breast');
            fireEvent.click(deleteBtn);
            expect(onDeleteEntry).toHaveBeenCalledWith('2026-07-21', 'entry-1');
        });
    });

    describe('AddFoodModal', () => {
        it('renders modal when open and handles food selection and submission', () => {
            const onClose = vi.fn();
            const onAddEntry = vi.fn();

            render(
                <AddFoodModal
                    open={true}
                    onClose={onClose}
                    onAddEntry={onAddEntry}
                />
            );

            expect(screen.getByPlaceholderText('Search foods...')).toBeDefined();
            const chickenBtn = screen.getByText('Chicken Breast');
            fireEvent.click(chickenBtn);

            expect(screen.getByText('Log Food')).toBeDefined();
            fireEvent.click(screen.getByText('Log Food'));

            expect(onAddEntry).toHaveBeenCalledWith(
                expect.objectContaining({
                    food_item_id: 'food_chicken_breast',
                    food_name: 'Chicken Breast',
                    servings: 1,
                    calories: 165,
                })
            );
            expect(onClose).toHaveBeenCalled();
        });
    });
});
