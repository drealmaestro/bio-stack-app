import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExerciseMediaViewer } from './ExerciseMediaViewer';
import type { Exercise } from '../../../types';

vi.mock('../../../hooks/useExerciseMedia', () => ({
    useExerciseMedia: vi.fn(),
}));

import { useExerciseMedia } from '../../../hooks/useExerciseMedia';

describe('ExerciseMediaViewer Component', () => {
    const mockExercise: Exercise = {
        id: 'bench_press',
        name: 'Barbell Bench Press',
        target_muscle: 'Chest',
        instructions: 'Lower to mid-chest and press up.',
        tempo: '3-0-1-0',
        form_cues: ['Retract scapula', 'Plant feet firmly'],
        video_url: 'https://example.com/bench.webp',
    };

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('renders compact mode with title and offline-ready indicator when cached', () => {
        vi.mocked(useExerciseMedia).mockReturnValue({
            status: 'ready',
            mediaUrl: 'blob:http://localhost/bench.webp',
            isCached: true,
            isOnline: true,
            isFallback: false,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });

        render(<ExerciseMediaViewer exercise={mockExercise} compact={true} />);
        expect(screen.getByText('Barbell Bench Press')).toBeDefined();
        expect(screen.getByText('Offline Ready')).toBeDefined();
    });

    it('renders visual cue fallback in standard mode when status is fallback', () => {
        vi.mocked(useExerciseMedia).mockReturnValue({
            status: 'fallback',
            mediaUrl: null,
            isCached: false,
            isOnline: false,
            isFallback: true,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });

        render(<ExerciseMediaViewer exercise={mockExercise} compact={false} />);
        expect(screen.getByTestId('visual-cue-fallback')).toBeDefined();
    });

    it('renders animated image and play/pause controls when media is ready', () => {
        vi.mocked(useExerciseMedia).mockReturnValue({
            status: 'ready',
            mediaUrl: 'https://example.com/bench.webp',
            isCached: false,
            isOnline: true,
            isFallback: false,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });

        render(<ExerciseMediaViewer exercise={mockExercise} compact={false} />);
        const img = screen.getByAltText('Barbell Bench Press');
        expect(img).toBeDefined();
        expect(screen.getByText('Streaming')).toBeDefined();

        const pauseBtn = screen.getByLabelText('Pause animation');
        expect(pauseBtn).toBeDefined();
        fireEvent.click(pauseBtn);
        expect(screen.getByLabelText('Play animation')).toBeDefined();
    });

    it('opens and closes expanded fullscreen modal', () => {
        vi.mocked(useExerciseMedia).mockReturnValue({
            status: 'ready',
            mediaUrl: 'https://example.com/bench.webp',
            isCached: true,
            isOnline: true,
            isFallback: false,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        });

        render(<ExerciseMediaViewer exercise={mockExercise} compact={false} />);
        const expandBtn = screen.getByLabelText('Fullscreen media preview');
        fireEvent.click(expandBtn);

        expect(screen.getByText('Key Form Cues')).toBeDefined();
        expect(screen.getByText('Plant feet firmly')).toBeDefined();

        const closeBtn = screen.getByLabelText('Close modal');
        fireEvent.click(closeBtn);
        expect(screen.queryByLabelText('Close modal')).toBeNull();
    });
});
