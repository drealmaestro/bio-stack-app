import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Dumbbell } from 'lucide-react';
import { HistoryStatsRow } from '../components/history/HistoryStatsRow';
import { WeeklyVolumeChart } from '../components/history/WeeklyVolumeChart';
import { LiftProgressionChart } from '../components/history/LiftProgressionChart';
import { PersonalRecordsCard } from '../components/history/PersonalRecordsCard';
import { SessionLogsList } from '../components/history/SessionLogsList';
import { MuscleHeatmap } from '../components/analytics/MuscleHeatmap';
import { MuscleDistributionChart } from '../components/analytics/MuscleDistributionChart';
import { TrendChartEMA } from '../components/analytics/TrendChartEMA';
import { TargetMuscleHeatmap } from '../components/analytics/TargetMuscleHeatmap';
import { RestComplianceWidget } from '../components/analytics/RestComplianceWidget';
import { calculate1RM } from '../utils/fitnessMath';

export function HistoryLog() {
    const { logs, templates, exercises } = useStore();

    const getTemplateName = (id: string) =>
        templates.find(t => t.id === id)?.name || 'Unknown Workout';

    const getExerciseName = (id: string) =>
        exercises.find(e => e.id === id)?.name || id;

    // --- WEEKLY VOLUME DATA ---
    const weeklyVolume: Record<string, number> = {};
    logs.forEach(log => {
        const date = new Date(log.timestamp);
        const monday = new Date(date);
        monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
        const weekKey = monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        const vol = log.completed_exercises.reduce(
            (sum, s) => sum + (s.weight_kg * s.reps_completed), 0
        );
        weeklyVolume[weekKey] = (weeklyVolume[weekKey] || 0) + vol;
    });

    const volumeData = Object.entries(weeklyVolume)
        .slice(-8)
        .map(([week, volume]) => ({ week, volume: Math.round(volume) }));

    // --- PR DETECTION ---
    const prMap: Record<string, { weight: number; reps: number; date: string }> = {};
    logs.forEach(log => {
        log.completed_exercises.forEach(set => {
            const existing = prMap[set.exercise_id];
            if (!existing || set.weight_kg > existing.weight) {
                prMap[set.exercise_id] = {
                    weight: set.weight_kg,
                    reps: set.reps_completed,
                    date: log.timestamp
                };
            }
        });
    });

    const topPRs = Object.entries(prMap)
        .sort((a, b) => b[1].weight - a[1].weight)
        .slice(0, 5);

    const totalVolume = logs.reduce((sum, log) =>
        sum + log.completed_exercises.reduce((s, set) => s + (set.weight_kg * set.reps_completed), 0), 0
    );

    const avgDuration = logs.length
        ? Math.round(logs.reduce((sum, l) => sum + l.duration_seconds, 0) / logs.length / 60)
        : 0;

    // --- EXERCISE PROGRESSION SELECTOR & EMA TREND ---
    const loggedExerciseIds = [...new Set(logs.flatMap(log => log.completed_exercises.map(set => set.exercise_id)))];
    const loggedExercises = exercises.filter(e => loggedExerciseIds.includes(e.id));

    const [selectedExerciseId, setSelectedExerciseId] = useState<string>(() => {
        return loggedExerciseIds[0] || '';
    });

    const exerciseProgressData = selectedExerciseId
        ? logs
            .map(log => {
                const sets = log.completed_exercises.filter(s => s.exercise_id === selectedExerciseId);
                if (sets.length === 0) return null;

                let maxWeight = 0;
                let best1RM = 0;

                sets.forEach(set => {
                    const weight = set.weight_kg;
                    const reps = set.reps_completed;
                    if (weight > maxWeight) maxWeight = weight;

                    const oneRepMax = calculate1RM(weight, reps);
                    if (oneRepMax > best1RM) best1RM = oneRepMax;
                });

                return {
                    date: new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    rawDate: new Date(log.timestamp),
                    weight: maxWeight,
                    estimated1RM: Math.round(best1RM * 10) / 10
                };
            })
            .filter((d): d is NonNullable<typeof d> => d !== null)
            .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
        : [];

    const allTimePR = exerciseProgressData.reduce((max, d) => d.weight > max ? d.weight : max, 0);
    const best1RM = exerciseProgressData.reduce((max, d) => d.estimated1RM > max ? d.estimated1RM : max, 0);

    const emaTrendPoints = exerciseProgressData.map(d => ({
        date: d.date,
        value: d.estimated1RM,
    }));

    const recentRestTimes = logs.flatMap(log =>
        log.completed_exercises.map(() => 90)
    ).slice(-10);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-8">
            <h2 className="text-2xl font-bold text-white">Workout History & Analytics</h2>

            {logs.length === 0 ? (
                <div className="text-center text-muted-foreground py-16 border border-dashed border-white/10 rounded-2xl">
                    <Dumbbell size={40} className="mx-auto mb-4 text-zinc-700" />
                    <p className="font-medium">No history yet. Go lift something!</p>
                </div>
            ) : (
                <>
                    <HistoryStatsRow
                        sessionsCount={logs.length}
                        totalVolume={totalVolume}
                        avgDuration={avgDuration}
                    />

                    {/* Requirement R2: Swift-Like Analytics & Moving Average Trend Charts */}
                    {emaTrendPoints.length > 0 && (
                        <TrendChartEMA
                            data={emaTrendPoints}
                            title={`${getExerciseName(selectedExerciseId)} - 1RM Strength Trend (EMA)`}
                            unit="kg"
                            color="#10b981"
                        />
                    )}

                    <TargetMuscleHeatmap logs={logs} exercises={exercises} />

                    <RestComplianceWidget
                        completedRestSeconds={recentRestTimes.length > 0 ? recentRestTimes : [90, 85, 95, 90]}
                        targetRestSeconds={90}
                    />

                    <MuscleHeatmap logs={logs} exercises={exercises} />

                    <MuscleDistributionChart logs={logs} exercises={exercises} />

                    <WeeklyVolumeChart volumeData={volumeData} />

                    <LiftProgressionChart
                        loggedExercises={loggedExercises}
                        selectedExerciseId={selectedExerciseId}
                        onSelectExercise={setSelectedExerciseId}
                        exerciseProgressData={exerciseProgressData}
                        allTimePR={allTimePR}
                        best1RM={best1RM}
                    />

                    <PersonalRecordsCard
                        topPRs={topPRs}
                        exercises={exercises}
                        getExerciseName={getExerciseName}
                    />

                    <SessionLogsList
                        logs={logs}
                        exercises={exercises}
                        getTemplateName={getTemplateName}
                        getExerciseName={getExerciseName}
                    />
                </>
            )}
        </div>
    );
}
