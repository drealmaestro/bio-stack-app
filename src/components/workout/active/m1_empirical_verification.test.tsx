import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NumericKeypad } from '../../ui/NumericKeypad';
import { RpeSlider } from '../../ui/RpeSlider';
import { SetLoggingBottomSheet } from './SetLoggingBottomSheet';
import { useStore } from '../../../store/useStore';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

describe('Milestone 1 Empirical Verification Test Suite', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset store
        useStore.setState({ activeWorkout: null });
        // Setup navigator.vibrate if not present
        if (!('vibrate' in navigator)) {
            Object.defineProperty(navigator, 'vibrate', {
                value: vi.fn(),
                writable: true,
                configurable: true,
            });
        }
    });

    describe('NumericKeypad Edge Cases & Boundaries', () => {
        it('prevents negative values when using quick pills from 0', () => {
            const onChange = vi.fn();
            render(<NumericKeypad value={0} onChange={onChange} />);

            const pillPlus25 = screen.getByText(/\+2.5/i);
            fireEvent.click(pillPlus25);

            expect(onChange).toHaveBeenCalledWith(2.5);
        });

        it('maintains exact decimal precision when adding quick pills to decimal weights', () => {
            const onChange = vi.fn();
            render(<NumericKeypad value={12.25} onChange={onChange} />);

            const pillPlus25 = screen.getByText(/\+2.5/i);
            fireEvent.click(pillPlus25);

            // Should be 14.75, not 14.750000000000002
            expect(onChange).toHaveBeenCalledWith(14.75);
        });

        it('prevents double decimal points when typed on keypad', () => {
            const onChange = vi.fn();
            render(<NumericKeypad value={0} onChange={onChange} />);

            const key1 = screen.getByLabelText('Key 1');
            const keyDot = screen.getByLabelText('Key .');
            const key2 = screen.getByLabelText('Key 2');

            fireEvent.click(key1);
            fireEvent.click(keyDot);
            fireEvent.click(keyDot); // Second dot attempt
            fireEvent.click(key2);

            expect(onChange).toHaveBeenLastCalledWith(1.2);
        });

        it('handles backspace delete down to empty string cleanly without NaN', () => {
            const onChange = vi.fn();
            render(<NumericKeypad value={5} onChange={onChange} />);

            const deleteKey = screen.getByLabelText('Delete digit');
            fireEvent.click(deleteKey);

            expect(onChange).toHaveBeenLastCalledWith(0);
        });
    });

    describe('RpeSlider Range & Pill Selection', () => {
        it('renders range 5.0 to 10.0 and defaults correctly', () => {
            const onChange = vi.fn();
            render(<RpeSlider value={7.5} onChange={onChange} />);

            expect(screen.getByText(/@ RPE 7.5/i)).toBeTruthy();
            expect(screen.getByText(/Moderate \(2–3 RIR remaining\)/i)).toBeTruthy();

            const slider = screen.getByRole('slider');
            expect(slider.getAttribute('min')).toBe('5');
            expect(slider.getAttribute('max')).toBe('10');
            expect(slider.getAttribute('step')).toBe('0.5');
        });

        it('updates value correctly on tapping quick RPE pills', () => {
            const onChange = vi.fn();
            render(<RpeSlider value={7} onChange={onChange} />);

            const pill95 = screen.getByRole('button', { name: '9.5' });
            fireEvent.click(pill95);

            expect(onChange).toHaveBeenCalledWith(9.5);
        });
    });

    describe('SetLoggingBottomSheet & Haptics / Micro-animations / Timer', () => {
        it('triggers haptics and confetti on set completion without throwing', () => {
            const vibrateSpy = vi.spyOn(navigator, 'vibrate').mockImplementation(() => true);
            const onSave = vi.fn();
            const onToggleComplete = vi.fn();
            const onClose = vi.fn();

            render(
                <SetLoggingBottomSheet
                    isOpen={true}
                    onClose={onClose}
                    exerciseName="Bench Press"
                    setIndex={1}
                    totalSets={3}
                    weight={80}
                    reps={10}
                    rpe={8}
                    onSave={onSave}
                    onToggleComplete={onToggleComplete}
                />
            );

            const completeBtn = screen.getByRole('button', { name: /COMPLETE & LOG SET/i });
            fireEvent.click(completeBtn);

            expect(onSave).toHaveBeenCalledWith({ weight: 80, reps: 10, rpe: 8 });
            expect(onToggleComplete).toHaveBeenCalled();
            expect(vibrateSpy).toHaveBeenCalledWith([30, 50]);
            expect(onClose).toHaveBeenCalled();
        });

        it('preserves rest timer state when completing a set', () => {
            const store = useStore.getState();
            store.startWorkout('routine-1');
            
            // Trigger completion of set 1 with 90 seconds rest
            useStore.getState().toggleSetComplete(0, 1, 90);

            const activeWorkout = useStore.getState().activeWorkout;
            expect(activeWorkout).not.toBeNull();
            expect(activeWorkout?.completedSets).toContain('0-1');
            expect(activeWorkout?.restEndTime).toBeGreaterThan(Date.now());
            expect(activeWorkout?.originalRestDuration).toBe(90);

            // Log set 2 without breaking rest timer state
            useStore.getState().updateSetWeight(0, 2, 85);
            const updatedWorkout = useStore.getState().activeWorkout;
            expect(updatedWorkout?.restEndTime).not.toBeNull();
            expect(updatedWorkout?.completedSets).toContain('0-1');
        });
    });
});
