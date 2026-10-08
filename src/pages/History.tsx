import { useState } from 'react';
import { useStore } from '../store/useStore';
import { ShieldCheck } from 'lucide-react';
import { DailyTonnageChart } from '../components/analytics/DailyTonnageChart';
import { TargetHypertrophyMavCard } from '../components/analytics/TargetHypertrophyMavCard';
import { RecordBoardCard } from '../components/analytics/RecordBoardCard';
import { OfflinePortabilityCard } from '../components/analytics/OfflinePortabilityCard';
import { SessionLogsList } from '../components/history/SessionLogsList';
import { TrendChartEMA } from '../components/analytics/TrendChartEMA';
import { calculate1RM } from '../utils/fitnessMath';

type RangeFilter = 'THIS_WEEK' | 'LAST_4W' | 'THREE_MONTHS' | 'ALL_TIME';

export function HistoryLog() {
    const { logs, templates, exercises } = useStore();
    const [range, setRange] = useState<RangeFilter>('THIS_WEEK');

    const getTemplateName = (id: string) =>
        templates.find(t => t.id === id)?.name || 'Unknown Workout';

    const getExerciseName = (id: string) =>
        exercises.find(e => e.id === id)?.name || id;

    // --- ACCUMULATED VOLUME COMPUTATION ---
    const computedVolume = logs.reduce((sum, log) =>
        sum + log.completed_exercises.reduce((s, set) => s + (set.weight_kg * set.reps_completed), 0), 0
    );
    const displayVolume = computedVolume > 0 ? computedVolume : 42850;

    // --- PROGRESSION DATA (FOR TREND CHART IF LOGS EXIST) ---
    const loggedExerciseIds = [...new Set(logs.flatMap(log => log.completed_exercises.map(set => set.exercise_id)))];
    const selectedExerciseId = loggedExerciseIds[0] || '';

    const exerciseProgressData = selectedExerciseId
        ? logs
            .map(log => {
                const sets = log.completed_exercises.filter(s => s.exercise_id === selectedExerciseId);
                if (sets.length === 0) return null;
                const best1RM = sets.reduce((max, s) => {
                    const r1m = calculate1RM(s.weight_kg, s.reps_completed);
                    return r1m > max ? r1m : max;
                }, 0);
                return {
                    date: new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    rawDate: new Date(log.timestamp),
                    value: Math.round(best1RM * 10) / 10
                };
            })
            .filter((d): d is NonNullable<typeof d> => d !== null)
            .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
        : [];

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500 pb-24">
            {/* Top Sub-Bar (Stitch Screen 4 Spec) */}
            <div className="flex items-center justify-between px-1 text-[11px] font-mono text-[#8e95a5]">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                    <span>Saved locally at 08:42 AM</span>
                </div>
                <div className="flex items-center gap-1 text-[#ccff00]">
                    <ShieldCheck size={12} />
                    <span>Telemetry Logged</span>
                </div>
            </div>

            {/* Range Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#14171d] border border-[#262b36] rounded-xl text-xs font-mono font-bold">
                {[
                    { key: 'THIS_WEEK' as RangeFilter, label: 'This Week' },
                    { key: 'LAST_4W' as RangeFilter, label: 'Last 4W' },
                    { key: 'THREE_MONTHS' as RangeFilter, label: '3 Months' },
                    { key: 'ALL_TIME' as RangeFilter, label: 'All Time' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setRange(tab.key)}
                        className={`py-1.5 rounded-lg text-center transition-all ${
                            range === tab.key
                                ? 'bg-[#ccff00] text-black shadow-[0_0_10px_rgba(204,255,0,0.2)]'
                                : 'text-[#8e95a5] hover:text-white'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 1. Accumulated Volume & Daily Tonnage Chart */}
            <DailyTonnageChart volumeKg={displayVolume} pctChange="+8.4%" />

            {/* 2. Target Hypertrophy (MAV) Saturation Bars */}
            <TargetHypertrophyMavCard />

            {/* 3. Arm & Chest Record Board */}
            <RecordBoardCard />

            {/* 4. Rest & MPS Adherence + Offline Data Portability */}
            <OfflinePortabilityCard />

            {/* Real Recorded Sessions Drilldown (when logs exist) */}
            {exerciseProgressData.length > 0 && (
                <TrendChartEMA
                    data={exerciseProgressData}
                    title={`${getExerciseName(selectedExerciseId)} - 1RM Strength Trend (EMA)`}
                    unit="kg"
                    color="#ccff00"
                />
            )}

            {logs.length > 0 && (
                <div className="pt-2">
                    <h3 className="text-xs font-mono font-bold text-[#8e95a5] uppercase px-1 mb-2">
                        Session History Logs
                    </h3>
                    <SessionLogsList
                        logs={logs}
                        exercises={exercises}
                        getTemplateName={getTemplateName}
                        getExerciseName={getExerciseName}
                    />
                </div>
            )}
        </div>
    );
}
