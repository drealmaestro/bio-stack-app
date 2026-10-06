import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { RoutineMediaDownloadButton } from './RoutineMediaDownloadButton';
import * as mediaManager from '../../../utils/mediaManager';

const mockDownloadRoutine = vi.fn();

vi.mock('../../../hooks/useMediaStorage', () => ({
    useMediaStorage: () => ({
        report: { isOnline: true },
        isDownloading: false,
        downloadProgress: 0,
        downloadRoutine: mockDownloadRoutine,
    }),
}));

describe('RoutineMediaDownloadButton Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders download button with estimated megabytes', async () => {
        vi.spyOn(mediaManager, 'isMediaCached').mockResolvedValue(false);

        await act(async () => {
            render(<RoutineMediaDownloadButton exerciseIds={['ex1', 'ex2', 'ex3']} />);
        });

        const btn = screen.getByRole('button', { name: /Download routine media/i });
        expect(btn).toBeDefined();
        expect(screen.getByText(/Download Media/i)).toBeDefined();

        await act(async () => {
            fireEvent.click(btn);
        });
        expect(mockDownloadRoutine).toHaveBeenCalledWith(['ex1', 'ex2', 'ex3']);
    });

    it('displays Offline Ready badge when all exercises are cached', async () => {
        vi.spyOn(mediaManager, 'isMediaCached').mockResolvedValue(true);

        await act(async () => {
            render(<RoutineMediaDownloadButton exerciseIds={['ex1', 'ex2']} />);
        });

        expect(screen.getByText('Offline Ready')).toBeDefined();
    });
});
