import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RestTimerWidget } from './RestTimerWidget';
import { useStore } from '../../store/useStore';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('RestTimerWidget Component', () => {
    beforeEach(() => {
        useStore.getState().resetStore();
        useStore.getState().seed();
        mockNavigate.mockReset();
    });

    it('renders null when no rest timer is active', () => {
        const { container } = render(
            <MemoryRouter>
                <RestTimerWidget />
            </MemoryRouter>
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders timer widget when rest timer is active', () => {
        useStore.getState().startWorkout('tmpl-1');
        useStore.getState().toggleSetComplete(0, 1, 60);

        render(
            <MemoryRouter>
                <RestTimerWidget />
            </MemoryRouter>
        );

        expect(screen.getByText('Resting')).toBeDefined();
        expect(screen.getByText('30s')).toBeDefined();
        expect(screen.getByText('Skip')).toBeDefined();
    });

    it('adds rest time when +30s button is clicked', () => {
        useStore.getState().startWorkout('tmpl-1');
        useStore.getState().toggleSetComplete(0, 1, 30);

        render(
            <MemoryRouter>
                <RestTimerWidget />
            </MemoryRouter>
        );

        const addBtn = screen.getByText('30s');
        fireEvent.click(addBtn);

        const activeWorkout = useStore.getState().activeWorkout;
        expect(activeWorkout?.restEndTime).toBeDefined();
    });

    it('skips rest when Skip button is clicked', () => {
        useStore.getState().startWorkout('tmpl-1');
        useStore.getState().toggleSetComplete(0, 1, 60);

        render(
            <MemoryRouter>
                <RestTimerWidget />
            </MemoryRouter>
        );

        const skipBtn = screen.getByText('Skip');
        fireEvent.click(skipBtn);

        const activeWorkout = useStore.getState().activeWorkout;
        expect(activeWorkout?.restEndTime).toBeNull();
    });

    it('navigates to /active when widget body is clicked', () => {
        useStore.getState().startWorkout('tmpl-1');
        useStore.getState().toggleSetComplete(0, 1, 60);

        render(
            <MemoryRouter>
                <RestTimerWidget />
            </MemoryRouter>
        );

        const widget = screen.getByText('Resting').closest('[role="button"]')!;
        fireEvent.click(widget);
        expect(mockNavigate).toHaveBeenCalledWith('/active');
    });

    it('accurately recalculates remaining rest time after background tab elapsed time', () => {
        vi.useFakeTimers();
        try {
            useStore.getState().startWorkout('tmpl-1');
            useStore.getState().toggleSetComplete(0, 1, 60);

            render(
                <MemoryRouter>
                    <RestTimerWidget />
                </MemoryRouter>
            );

            expect(screen.getByText('01:00')).toBeDefined();

            // Simulate 40 seconds passing while in background tab
            act(() => {
                vi.advanceTimersByTime(40000);
            });

            expect(screen.getByText('00:20')).toBeDefined();
        } finally {
            vi.useRealTimers();
        }
    });
});



