import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DailyReadinessCard } from './DailyReadinessCard';
import { BoxBreathingPacer } from './BoxBreathingPacer';
import { WeightBodyFatCard } from './WeightBodyFatCard';
import { FoodSearchModal } from './FoodSearchModal';
import { useStore } from '../../store/useStore';

describe('Home DOM Components', () => {
    beforeEach(() => {
        useStore.getState().resetStore();
        useStore.getState().seed();
    });

    describe('DailyReadinessCard', () => {
        it('renders daily readiness score, metrics and triggers water bumps', () => {
            const onLogWater = vi.fn();
            const onOpenSleepModal = vi.fn();

            render(
                <DailyReadinessCard
                    todayStr="2026-08-19"
                    isRestDay={false}
                    activeMinutesToday={45}
                    onLogWater={onLogWater}
                    onOpenSleepModal={onOpenSleepModal}
                />
            );

            expect(screen.getByText('Daily Readiness')).toBeDefined();
            expect(screen.getByText('+250ml')).toBeDefined();
            expect(screen.getByText('+500ml')).toBeDefined();

            fireEvent.click(screen.getByLabelText('Add 250ml water'));
            expect(onLogWater).toHaveBeenCalledWith(250);

            fireEvent.click(screen.getByLabelText('Log sleep'));
            expect(onOpenSleepModal).toHaveBeenCalled();
        });
    });

    describe('BoxBreathingPacer', () => {
        it('renders box breathing guide and toggles pacer state', () => {
            render(<BoxBreathingPacer />);

            expect(screen.getByText('Box Breathing Pacer')).toBeDefined();
            const toggleBtn = screen.getByText('Begin Pacer');
            fireEvent.click(toggleBtn);

            expect(screen.getByText('Stop')).toBeDefined();
        });
    });

    describe('WeightBodyFatCard', () => {
        it('renders weight and body fat logger with quick pills', () => {
            render(<WeightBodyFatCard todayStr="2026-08-19" />);

            expect(screen.getByText('Weight')).toBeDefined();
            expect(screen.getByText('Body Fat')).toBeDefined();

            const logBtns = screen.getAllByText('Log');
            expect(logBtns.length).toBe(2);
        });
    });

    describe('FoodSearchModal', () => {
        it('renders search input, filters common foods, and selects a food item', () => {
            const onClose = vi.fn();
            const onLogFood = vi.fn();

            render(
                <FoodSearchModal
                    open={true}
                    onClose={onClose}
                    onLogFood={onLogFood}
                />
            );

            expect(screen.getAllByText('Search Food Item').length).toBeGreaterThanOrEqual(1);
            const input = screen.getByPlaceholderText(/Type food name/);
            expect(input).toBeDefined();

            // Search for chicken
            fireEvent.change(input, { target: { value: 'Chicken' } });
            const chickenBtn = screen.getByText('Chicken Breast');
            expect(chickenBtn).toBeDefined();

            fireEvent.click(chickenBtn);
            expect(onLogFood).toHaveBeenCalledWith(expect.objectContaining({ name: 'Chicken Breast' }));

            // Test close button
            fireEvent.click(screen.getByLabelText('Close food search'));
            expect(onClose).toHaveBeenCalled();
        });
    });
});

