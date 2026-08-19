import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SetLoggingBottomSheet } from './SetLoggingBottomSheet';
import { NumericKeypad } from '../../ui/NumericKeypad';
import { RpeSlider } from '../../ui/RpeSlider';

vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

describe('NumericKeypad Component', () => {
    it('renders quick add pills and updates value', () => {
        const onChange = vi.fn();
        render(<NumericKeypad value={50} onChange={onChange} />);

        expect(screen.getByText('+0.5')).toBeDefined();
        expect(screen.getByText('+5')).toBeDefined();

        fireEvent.click(screen.getByText('+2.5'));
        expect(onChange).toHaveBeenCalledWith(52.5);
    });

    it('handles numeric key presses and backspace', () => {
        const onChange = vi.fn();
        render(<NumericKeypad value={10} onChange={onChange} />);

        fireEvent.click(screen.getByLabelText('Key 5'));
        expect(onChange).toHaveBeenCalledWith(105);

        fireEvent.click(screen.getByLabelText('Delete digit'));
        expect(onChange).toHaveBeenCalledWith(10);
    });
});

describe('RpeSlider Component', () => {
    it('renders RPE rating and effort description', () => {
        const onChange = vi.fn();
        render(<RpeSlider value={8} onChange={onChange} />);

        expect(screen.getByText('@ RPE 8')).toBeDefined();
        expect(screen.getByText('Solid Work (2 RIR remaining)')).toBeDefined();

        fireEvent.click(screen.getByText('9.5'));
        expect(onChange).toHaveBeenCalledWith(9.5);
    });
});

describe('SetLoggingBottomSheet Component', () => {
    it('renders bottom sheet drawer when isOpen is true', () => {
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

        expect(screen.getByText('Bench Press')).toBeDefined();
        expect(screen.getByText('Set 1 of 3')).toBeDefined();
        expect(screen.getByText('COMPLETE & LOG SET')).toBeDefined();
    });

    it('triggers completion and confetti on CTA click', () => {
        const onSave = vi.fn();
        const onToggleComplete = vi.fn();
        const onClose = vi.fn();

        render(
            <SetLoggingBottomSheet
                isOpen={true}
                onClose={onClose}
                exerciseName="Squat"
                setIndex={2}
                totalSets={4}
                weight={100}
                reps={8}
                onSave={onSave}
                onToggleComplete={onToggleComplete}
            />
        );

        fireEvent.click(screen.getByText('COMPLETE & LOG SET'));
        expect(onSave).toHaveBeenCalled();
        expect(onToggleComplete).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    it('renders and applies quick set auto-fill chip from previous set', () => {
        const onSave = vi.fn();
        const onToggleComplete = vi.fn();
        const onClose = vi.fn();

        render(
            <SetLoggingBottomSheet
                isOpen={true}
                onClose={onClose}
                exerciseName="Incline Dumbbell Press"
                setIndex={2}
                totalSets={3}
                weight={0}
                reps={10}
                previousSet={{ weight: 32, reps: 10 }}
                onSave={onSave}
                onToggleComplete={onToggleComplete}
            />
        );

        const copyBtn = screen.getByText(/Copy Set 1/);
        expect(copyBtn).toBeDefined();

        fireEvent.click(copyBtn);
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ weight: 32, reps: 10 }));
    });
});
