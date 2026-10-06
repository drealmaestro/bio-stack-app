import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MediaStorageWidget } from './MediaStorageWidget';

const mockDownloadLibrary = vi.fn();
const mockPurge = vi.fn();

vi.mock('../../../hooks/useMediaStorage', () => ({
    useMediaStorage: () => ({
        report: {
            cachedCount: 12,
            totalCount: 33,
            usedBytes: 5 * 1024 * 1024,
            usedMb: 5.0,
            isOnline: true,
        },
        isLoading: false,
        isDownloading: false,
        downloadProgress: 0,
        downloadLibrary: mockDownloadLibrary,
        purge: mockPurge,
    }),
}));

describe('MediaStorageWidget Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders cached count, megabytes, and online status badge', () => {
        render(<MediaStorageWidget />);
        expect(screen.getByText('Offline Media Storage')).toBeDefined();
        expect(screen.getByText('12')).toBeDefined();
        expect(screen.getByText(/33 exercises cached/i)).toBeDefined();
        expect(screen.getByText(/5.0 MB/i)).toBeDefined();
        expect(screen.getByText('Wi-Fi Ready')).toBeDefined();
    });

    it('handles download full library action', async () => {
        mockDownloadLibrary.mockResolvedValue({ success: true, downloaded: 21 });
        render(<MediaStorageWidget />);

        const downloadBtn = screen.getByText('Download Full Library');
        expect(downloadBtn).toBeDefined();
        await act(async () => {
            fireEvent.click(downloadBtn);
        });

        expect(mockDownloadLibrary).toHaveBeenCalled();
    });

    it('opens purge dialog and executes purge on confirmation', async () => {
        mockPurge.mockResolvedValue(undefined);
        render(<MediaStorageWidget />);

        const trashBtn = screen.getByLabelText('Purge cached media');
        await act(async () => {
            fireEvent.click(trashBtn);
        });

        expect(screen.getByText('Purge Media Cache?')).toBeDefined();

        const confirmPurgeBtn = screen.getByTestId('confirm-purge-button');
        await act(async () => {
            fireEvent.click(confirmPurgeBtn);
        });

        expect(mockPurge).toHaveBeenCalled();
    });
});
