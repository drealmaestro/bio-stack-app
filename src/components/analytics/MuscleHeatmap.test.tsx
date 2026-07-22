import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MuscleHeatmap } from './MuscleHeatmap';
import type { MuscleVolumeRow } from '../../lib/volume';

describe('MuscleHeatmap Component', () => {
    const mockVolumeRows: MuscleVolumeRow[] = [
        { muscle: 'Chest', sets: 14, target: { min: 12, max: 16 }, status: 'on' },
        { muscle: 'Biceps', sets: 6, target: { min: 10, max: 14 }, status: 'low' },
        { muscle: 'Triceps', sets: 18, target: { min: 10, max: 14 }, status: 'high' },
        { muscle: 'Legs', sets: 0, target: { min: 10, max: 16 }, status: 'low' },
    ];

    it('renders heading and silhouette labels', () => {
        render(<MuscleHeatmap volumeRows={mockVolumeRows} />);
        expect(screen.getByText('Interactive Heatmap')).toBeDefined();
        expect(screen.getByText('FRONT')).toBeDefined();
        expect(screen.getByText('BACK')).toBeDefined();
    });

    it('displays selected muscle details when clicked', () => {
        render(<MuscleHeatmap volumeRows={mockVolumeRows} />);
        expect(screen.getByText('Chest')).toBeDefined();
        expect(screen.getByText('14 / 12–16 sets completed')).toBeDefined();

        // Click on Biceps muscle SVG path
        const bicepsPath = screen.getByTestId('muscle-Biceps');
        fireEvent.click(bicepsPath);
        expect(screen.getByText('6 / 10–14 sets completed')).toBeDefined();
    });

    it('calls onSelectMuscle callback when muscle is clicked', () => {
        let selected = '';
        render(
            <MuscleHeatmap
                volumeRows={mockVolumeRows}
                onSelectMuscle={(m) => { selected = m; }}
            />
        );

        const legsPath = screen.getByTestId('muscle-Legs');
        fireEvent.click(legsPath);
        expect(selected).toBe('Legs');
    });

    it('renders safely with default props and calculates volume from empty logs', () => {
        render(<MuscleHeatmap />);
        expect(screen.getByText('Interactive Heatmap')).toBeDefined();
        expect(screen.getByText('Chest')).toBeDefined();
    });

    it('allows selecting Back and Triceps muscles on the BACK silhouette', () => {
        render(<MuscleHeatmap volumeRows={mockVolumeRows} />);
        const tricepsPath = screen.getByTestId('muscle-Triceps');
        fireEvent.click(tricepsPath);
        expect(screen.getByText('Triceps')).toBeDefined();
        expect(screen.getByText('18 / 10–14 sets completed')).toBeDefined();

        const backPath = screen.getByTestId('muscle-Back');
        fireEvent.click(backPath);
        expect(screen.getByText('Back')).toBeDefined();
    });
});

