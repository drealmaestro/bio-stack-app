import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VisualCueFallback } from './VisualCueFallback';
import type { Exercise } from '../../../types';

describe('VisualCueFallback Component', () => {
    const mockExercise: Exercise = {
        id: 'ex_pullup',
        name: 'Weighted Pull-Up',
        target_muscle: 'Back',
        instructions: 'Pull chest to bar with strict form.',
        tempo: '3-1-1-1',
        form_cues: ['Full stretch at bottom', 'Drive elbows down'],
        coach_tips: 'Avoid swinging legs.',
    };

    it('renders target muscle, exercise name, and tempo badge', () => {
        render(<VisualCueFallback exercise={mockExercise} />);

        expect(screen.getByTestId('visual-cue-fallback')).toBeDefined();
        expect(screen.getByText(/Weighted Pull-Up/i)).toBeDefined();
        expect(screen.getByText('Back')).toBeDefined();
        expect(screen.getByTestId('tempo-badge')).toBeDefined();
        expect(screen.getByText('3-1-1-1')).toBeDefined();
    });

    it('renders vector anatomical silhouette and motion arrows', () => {
        render(<VisualCueFallback exercise={mockExercise} />);

        expect(screen.getByTestId('target-muscle-highlight')).toBeDefined();
        expect(screen.getByTestId('motion-arrow-eccentric')).toBeDefined();
        expect(screen.getByTestId('motion-arrow-concentric')).toBeDefined();
        expect(screen.getByText(/Eccentric \(3s\)/i)).toBeDefined();
        expect(screen.getByText(/Concentric \(1s\)/i)).toBeDefined();
    });

    it('renders interactive form cue checklist and allows toggling cues', () => {
        render(<VisualCueFallback exercise={mockExercise} />);

        expect(screen.getByTestId('form-cue-checklist')).toBeDefined();
        const cueButton = screen.getByText('Full stretch at bottom');
        expect(cueButton).toBeDefined();

        fireEvent.click(cueButton);
        expect(cueButton.closest('button')?.className).toContain('line-through');
    });

    it('renders compact mode without crashing', () => {
        render(<VisualCueFallback exercise={mockExercise} compact={true} />);
        expect(screen.getByTestId('visual-cue-fallback')).toBeDefined();
    });
});
