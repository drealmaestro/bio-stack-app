import { useState, useMemo } from 'react';
import type { TargetMuscle, WorkoutLog, Exercise } from '../../types';
import { weeklyMuscleVolume, getTrainingWeekStart, type MuscleVolumeRow } from '../../lib/volume';
import { cn } from '../../lib/utils';
import { Activity, Flame } from 'lucide-react';

interface MuscleHeatmapProps {
    volumeRows?: MuscleVolumeRow[];
    logs?: WorkoutLog[];
    exercises?: Exercise[];
    onSelectMuscle?: (muscle: TargetMuscle) => void;
    className?: string;
}

const MUSCLE_COLORS: Record<string, { fill: string; stroke: string; label: string; bgClass: string }> = {
    none: { fill: 'rgba(255, 255, 255, 0.06)', stroke: 'rgba(255, 255, 255, 0.15)', label: 'No Data', bgClass: 'bg-zinc-800' },
    low: { fill: 'rgba(54, 180, 255, 0.35)', stroke: '#36b4ff', label: 'Below Target', bgClass: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
    on: { fill: 'rgba(60, 207, 148, 0.45)', stroke: '#3ccf94', label: 'On Target', bgClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    high: { fill: 'rgba(255, 159, 10, 0.45)', stroke: '#ff9f0a', label: 'High Volume', bgClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
};

export function MuscleHeatmap({ volumeRows: propRows, logs = [], exercises = [], onSelectMuscle, className }: MuscleHeatmapProps) {
    const [selectedMuscle, setSelectedMuscle] = useState<TargetMuscle>('Chest');

    const volumeRows = useMemo(() => {
        if (propRows && propRows.length > 0) return propRows;
        return weeklyMuscleVolume(logs, exercises, getTrainingWeekStart(new Date()));
    }, [propRows, logs, exercises]);

    const rowMap = useMemo(() => {
        const map = new Map<TargetMuscle, MuscleVolumeRow>();
        volumeRows.forEach(r => map.set(r.muscle, r));
        return map;
    }, [volumeRows]);

    const getMuscleStatus = (muscle: TargetMuscle) => {
        const row = rowMap.get(muscle);
        if (!row || row.sets === 0) return 'none';
        return row.status;
    };

    const handleMuscleClick = (muscle: TargetMuscle) => {
        setSelectedMuscle(muscle);
        if (onSelectMuscle) onSelectMuscle(muscle);
    };

    const activeRow = rowMap.get(selectedMuscle);
    const activeStatus = getMuscleStatus(selectedMuscle);

    const getStyle = (muscle: TargetMuscle) => {
        const status = getMuscleStatus(muscle);
        const config = MUSCLE_COLORS[status];
        const isSelected = selectedMuscle === muscle;
        return {
            fill: isSelected ? config.stroke : config.fill,
            stroke: isSelected ? '#ffffff' : config.stroke,
            strokeWidth: isSelected ? 2.5 : 1.2,
            filter: isSelected ? 'drop-shadow(0px 0px 8px rgba(255,255,255,0.6))' : status !== 'none' ? `drop-shadow(0px 0px 4px ${config.stroke})` : 'none',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        };
    };

    return (
        <div className={cn("glass-card p-5 rounded-3xl space-y-4 relative overflow-hidden border border-white/10 shadow-xl", className)}>
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Interactive Heatmap</span>
                    <h3 className="text-base font-black text-white flex items-center gap-2 mt-0.5">
                        <Flame size={16} className="text-primary animate-pulse" /> Muscle Group Load
                    </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
                    <Activity size={12} className="text-primary" />
                    <span>This Week</span>
                </div>
            </div>

            {/* SVG Silhouette Container */}
            <div className="relative w-full bg-zinc-950/60 backdrop-blur-md rounded-2xl border border-white/5 p-3 flex flex-col items-center justify-center">
                <svg viewBox="0 0 320 200" className="w-full max-w-[320px] h-auto overflow-visible select-none">
                    <defs>
                        <linearGradient id="bodyBase" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1e1e24" />
                            <stop offset="100%" stopColor="#121216" />
                        </linearGradient>
                    </defs>

                    {/* FRONT SILHOUETTE LABEL */}
                    <text x="80" y="16" textAnchor="middle" fill="#71717a" fontSize="8" fontWeight="800" letterSpacing="1">FRONT</text>

                    {/* BACK SILHOUETTE LABEL */}
                    <text x="240" y="16" textAnchor="middle" fill="#71717a" fontSize="8" fontWeight="800" letterSpacing="1">BACK</text>

                    {/* FRONT FIGURE */}
                    <g id="front-figure">
                        {/* Head & Neck */}
                        <circle cx="80" cy="30" r="10" fill="url(#bodyBase)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                        <rect x="77" y="40" width="6" height="6" fill="url(#bodyBase)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

                        {/* Shoulders (Deltoids) */}
                        <path data-testid="muscle-Shoulders" aria-label="Shoulders" d="M 62 46 C 60 50, 60 54, 65 57 L 69 47 Z" style={getStyle('Shoulders')} onClick={() => handleMuscleClick('Shoulders')} />
                        <path data-testid="muscle-Shoulders-r" aria-label="Shoulders" d="M 98 46 C 100 50, 100 54, 95 57 L 91 47 Z" style={getStyle('Shoulders')} onClick={() => handleMuscleClick('Shoulders')} />

                        {/* Chest */}
                        <path data-testid="muscle-Chest" aria-label="Chest" d="M 69 47 L 79 47 L 79 61 L 69 57 Z" style={getStyle('Chest')} onClick={() => handleMuscleClick('Chest')} />
                        <path data-testid="muscle-Chest-r" aria-label="Chest" d="M 81 47 L 91 47 L 91 57 L 81 61 Z" style={getStyle('Chest')} onClick={() => handleMuscleClick('Chest')} />

                        {/* Biceps */}
                        <path data-testid="muscle-Biceps" aria-label="Biceps" d="M 57 56 C 55 62, 57 68, 62 70 L 65 58 Z" style={getStyle('Biceps')} onClick={() => handleMuscleClick('Biceps')} />
                        <path data-testid="muscle-Biceps-r" aria-label="Biceps" d="M 103 56 C 105 62, 103 68, 98 70 L 95 58 Z" style={getStyle('Biceps')} onClick={() => handleMuscleClick('Biceps')} />

                        {/* Forearms */}
                        <path data-testid="muscle-Forearms" aria-label="Forearms" d="M 53 72 C 50 80, 52 88, 56 94 L 60 73 Z" style={getStyle('Forearms')} onClick={() => handleMuscleClick('Forearms')} />
                        <path data-testid="muscle-Forearms-r" aria-label="Forearms" d="M 107 72 C 110 80, 108 88, 104 94 L 100 73 Z" style={getStyle('Forearms')} onClick={() => handleMuscleClick('Forearms')} />

                        {/* Core (Abs) */}
                        <path data-testid="muscle-Core" aria-label="Core" d="M 70 63 L 90 63 L 87 90 L 73 90 Z" style={getStyle('Core')} onClick={() => handleMuscleClick('Core')} />

                        {/* Legs (Quads) */}
                        <path data-testid="muscle-Legs" aria-label="Legs" d="M 68 94 L 78 94 L 76 138 L 66 138 Z" style={getStyle('Legs')} onClick={() => handleMuscleClick('Legs')} />
                        <path data-testid="muscle-Legs-r" aria-label="Legs" d="M 82 94 L 92 94 L 94 138 L 84 138 Z" style={getStyle('Legs')} onClick={() => handleMuscleClick('Legs')} />

                        {/* Calves */}
                        <path d="M 65 142 L 74 142 L 72 178 L 67 178 Z" style={getStyle('Legs')} onClick={() => handleMuscleClick('Legs')} />
                        <path d="M 86 142 L 95 142 L 93 178 L 88 178 Z" style={getStyle('Legs')} onClick={() => handleMuscleClick('Legs')} />
                    </g>

                    {/* BACK FIGURE */}
                    <g id="back-figure">
                        {/* Head & Neck */}
                        <circle cx="240" cy="30" r="10" fill="url(#bodyBase)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                        <rect x="237" y="40" width="6" height="6" fill="url(#bodyBase)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

                        {/* Traps / Upper Back & Lats (Back) */}
                        <path data-testid="muscle-Back" aria-label="Back" d="M 226 46 L 254 46 L 250 82 L 230 82 Z" style={getStyle('Back')} onClick={() => handleMuscleClick('Back')} />

                        {/* Rear Shoulders */}
                        <path d="M 222 46 C 220 50, 220 54, 225 57 L 226 46 Z" style={getStyle('Shoulders')} onClick={() => handleMuscleClick('Shoulders')} />
                        <path d="M 258 46 C 260 50, 260 54, 255 57 L 254 46 Z" style={getStyle('Shoulders')} onClick={() => handleMuscleClick('Shoulders')} />

                        {/* Triceps */}
                        <path data-testid="muscle-Triceps" aria-label="Triceps" d="M 216 56 C 214 63, 216 69, 221 71 L 224 57 Z" style={getStyle('Triceps')} onClick={() => handleMuscleClick('Triceps')} />
                        <path data-testid="muscle-Triceps-r" aria-label="Triceps" d="M 264 56 C 266 63, 264 69, 259 71 L 256 57 Z" style={getStyle('Triceps')} onClick={() => handleMuscleClick('Triceps')} />

                        {/* Forearms */}
                        <path d="M 212 73 C 209 81, 211 89, 215 95 L 219 74 Z" style={getStyle('Forearms')} onClick={() => handleMuscleClick('Forearms')} />
                        <path d="M 268 73 C 271 81, 269 89, 265 95 L 261 74 Z" style={getStyle('Forearms')} onClick={() => handleMuscleClick('Forearms')} />

                        {/* Glutes / Hamstrings (Legs) */}
                        <path d="M 228 85 L 252 85 L 250 106 L 230 106 Z" style={getStyle('Legs')} onClick={() => handleMuscleClick('Legs')} />
                        <path d="M 228 109 L 238 109 L 236 138 L 226 138 Z" style={getStyle('Legs')} onClick={() => handleMuscleClick('Legs')} />
                        <path d="M 242 109 L 252 109 L 254 138 L 244 138 Z" style={getStyle('Legs')} onClick={() => handleMuscleClick('Legs')} />

                        {/* Calves */}
                        <path d="M 225 142 L 234 142 L 232 178 L 227 178 Z" style={getStyle('Legs')} onClick={() => handleMuscleClick('Legs')} />
                        <path d="M 246 142 L 255 142 L 253 178 L 248 178 Z" style={getStyle('Legs')} onClick={() => handleMuscleClick('Legs')} />
                    </g>
                </svg>

                {/* Heatmap Legend */}
                <div className="flex items-center justify-center gap-3 mt-2 pt-2 border-t border-white/5 w-full">
                    {Object.entries(MUSCLE_COLORS).map(([key, cfg]) => (
                        <div key={key} className="flex items-center gap-1 text-[9px] text-zinc-400 font-bold">
                            <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: cfg.fill, borderColor: cfg.stroke }} />
                            <span>{cfg.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Muscle Detail Card */}
            <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex items-center justify-between transition-all">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-sm">
                        {selectedMuscle[0]}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-white text-sm">{selectedMuscle}</h4>
                            <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border", MUSCLE_COLORS[activeStatus]?.bgClass)}>
                                {MUSCLE_COLORS[activeStatus]?.label}
                            </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                            {activeRow ? `${activeRow.sets} / ${activeRow.target.min}–${activeRow.target.max} sets completed` : '0 sets logged'}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-lg font-black text-primary font-mono">{activeRow?.sets ?? 0}</span>
                    <span className="text-[9px] text-zinc-500 block uppercase font-bold">Sets</span>
                </div>
            </div>
        </div>
    );
}
