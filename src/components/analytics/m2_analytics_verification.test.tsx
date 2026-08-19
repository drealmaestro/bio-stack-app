import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { calculateEMA, calculateMuscleBalance, calculateRestCompliance } from '../../utils/analyticsMath';
import { TrendChartEMA } from './TrendChartEMA';
import { TargetMuscleHeatmap } from './TargetMuscleHeatmap';
import { RestComplianceWidget } from './RestComplianceWidget';

describe('Milestone 2 Empirical Verification Suite', () => {
    describe('Math Formula Edge Cases', () => {
        it('calculateEMA: handles empty array, single element, zero values, extreme outliers', () => {
            // Empty array
            expect(calculateEMA([])).toEqual([]);

            // Single element
            expect(calculateEMA([42.5])).toEqual([42.5]);

            // Zero values
            expect(calculateEMA([0, 0, 0])).toEqual([0, 0, 0]);

            // Extreme outliers & large numbers
            const outliers = [100, 10000, 50, 5000];
            const ema = calculateEMA(outliers, 0.3);
            expect(ema.length).toBe(4);
            expect(ema[0]).toBe(100);
            // EMA[1] = 0.3*10000 + 0.7*100 = 3000 + 70 = 3070
            expect(ema[1]).toBe(3070);
            // EMA[2] = 0.3*50 + 0.7*3070 = 15 + 2149 = 2164
            expect(ema[2]).toBe(2164);
        });

        it('calculateMuscleBalance: handles empty map, zero total volume, push/pull dominance, missing legs', () => {
            // Empty object
            expect(calculateMuscleBalance({})).toEqual({
                pushPullRatio: 1.0,
                balanceScore: 100,
                status: 'Balanced',
            });

            // Zero total volume map
            expect(calculateMuscleBalance({ Chest: 0, Back: 0, Legs: 0 })).toEqual({
                pushPullRatio: 1.0,
                balanceScore: 100,
                status: 'Balanced',
            });

            // Only Push
            const pushOnly = calculateMuscleBalance({ Chest: 100 });
            expect(pushOnly.pushPullRatio).toBe(2.0);
            expect(pushOnly.status).toBe('Push Dominant');
            expect(pushOnly.balanceScore).toBe(30); // 100 - 50 - 20 (legs penalty)

            // Only Pull
            const pullOnly = calculateMuscleBalance({ Back: 100 });
            expect(pullOnly.pushPullRatio).toBe(0);
            expect(pullOnly.status).toBe('Pull Dominant');

            // Balanced with legs
            const balanced = calculateMuscleBalance({ Chest: 50, Back: 50, Legs: 40 });
            expect(balanced.pushPullRatio).toBe(1.0);
            expect(balanced.balanceScore).toBe(100);
            expect(balanced.status).toBe('Optimal Balance');
        });

        it('calculateRestCompliance: handles zero targets, empty completed rests, extreme rest times', () => {
            // Empty completed rests
            expect(calculateRestCompliance([], 90)).toEqual({
                compliancePct: 100,
                averageRestSec: 0,
            });

            // Target rest <= 0
            expect(calculateRestCompliance([60, 120], 0)).toEqual({
                compliancePct: 100,
                averageRestSec: 90,
            });

            // Extreme over-rest
            const overRest = calculateRestCompliance([600], 60);
            expect(overRest.compliancePct).toBe(0);
            expect(overRest.averageRestSec).toBe(600);

            // Exact compliance
            const exact = calculateRestCompliance([120, 120], 120);
            expect(exact.compliancePct).toBe(100);
            expect(exact.averageRestSec).toBe(120);
        });
    });

    describe('UI Component Rendering & Props Verification', () => {
        it('renders TrendChartEMA with valid data and fallback when empty', () => {
            const { unmount } = render(
                <TrendChartEMA
                    data={[
                        { date: 'May 1', value: 80 },
                        { date: 'May 8', value: 85 },
                        { date: 'May 15', value: 90 },
                    ]}
                    title="Bench Press EMA"
                    unit="kg"
                />
            );
            expect(screen.getByText('Bench Press EMA')).toBeDefined();
            expect(screen.getByText('Latest Session')).toBeDefined();
            expect(screen.getByText('90 kg')).toBeDefined();
            unmount();

            // Empty data render
            render(<TrendChartEMA data={[]} title="Empty Chart" />);
            expect(screen.getByText('No trend data recorded yet')).toBeDefined();
        });

        it('renders TargetMuscleHeatmap with calculated and external muscleVolumeMap', () => {
            const { unmount } = render(
                <TargetMuscleHeatmap
                    muscleVolumeMap={{
                        Chest: 10,
                        Back: 10,
                        Legs: 10,
                    }}
                />
            );
            expect(screen.getByText('Target Muscle Group Heatmap')).toBeDefined();
            expect(screen.getByText('Push/Pull Ratio:')).toBeDefined();
            expect(screen.getByText('Optimal Balance')).toBeDefined();
            expect(screen.getByText('Weekly Muscle Balance Score')).toBeDefined();
            unmount();

            // Unbalanced map (Push Dominant)
            render(
                <TargetMuscleHeatmap
                    muscleVolumeMap={{
                        Chest: 18,
                        Back: 10,
                    }}
                />
            );
            expect(screen.getByText('Push Dominant')).toBeDefined();
        });

        it('renders RestComplianceWidget with custom rests and fallback', () => {
            render(
                <RestComplianceWidget
                    completedRestSeconds={[90, 85, 95]}
                    targetRestSeconds={90}
                />
            );
            expect(screen.getByText('Rest-Period Compliance')).toBeDefined();
            expect(screen.getByText('Optimal Rest Adherence')).toBeDefined();
            expect(screen.getByText('Avg Rest')).toBeDefined();
            expect(screen.getByText('Target Rest')).toBeDefined();
            expect(screen.getAllByText(/90s/).length).toBeGreaterThan(0);
        });
    });
});
