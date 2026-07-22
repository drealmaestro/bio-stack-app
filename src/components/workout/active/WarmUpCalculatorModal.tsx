import { useState } from 'react';
import { Dialog } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { X, Flame } from 'lucide-react';
import { calculate1RM, calculateWarmUpSets } from '../../../utils/fitnessMath';

interface WarmUpCalculatorModalProps {
    open: boolean;
    onClose: () => void;
    initialWeight?: number;
    exerciseName?: string;
    targetReps?: number;
}

export function WarmUpCalculatorModal({
    open,
    onClose,
    initialWeight = 60,
    exerciseName = 'Exercise',
    targetReps = 8,
}: WarmUpCalculatorModalProps) {
    const [workingWeight, setWorkingWeight] = useState<number>(initialWeight || 60);
    const [reps, setReps] = useState<number>(targetReps || 8);
    const [formula, setFormula] = useState<'epley' | 'brzycki'>('epley');

    const warmUpSets = calculateWarmUpSets(workingWeight);
    const estimated1RM = calculate1RM(workingWeight, reps, formula);

    return (
        <Dialog
            open={open}
            title="Warm-up calculator"
            onClose={onClose}
            className="z-50 items-center justify-center bg-black/80 backdrop-blur-md px-4"
            panelClassName="w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200"
        >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <Flame size={20} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-white leading-tight">Warm-Up Calculator</h3>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{exerciseName}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Close warm-up calculator"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Weight & Reps Input */}
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-1">
                            Working Weight (kg)
                        </label>
                        <input
                            type="number"
                            step="2.5"
                            min="0"
                            value={workingWeight || ''}
                            onChange={(e) => setWorkingWeight(parseFloat(e.target.value) || 0)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-base font-black text-white focus:outline-none focus:border-primary/50 text-center"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-1">
                            Target Reps
                        </label>
                        <input
                            type="number"
                            step="1"
                            min="1"
                            max="30"
                            value={reps || ''}
                            onChange={(e) => setReps(parseInt(e.target.value, 10) || 1)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-base font-black text-white focus:outline-none focus:border-primary/50 text-center"
                        />
                    </div>
                </div>

                {/* Quick Weight Adjusters */}
                <div className="flex gap-1.5 justify-center">
                    {[-10, -5, +5, +10].map((delta) => (
                        <button
                            key={delta}
                            onClick={() => setWorkingWeight((w) => Math.max(0, w + delta))}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-300 transition-colors"
                        >
                            {delta > 0 ? `+${delta}` : delta} kg
                        </button>
                    ))}
                </div>
            </div>

            {/* 1RM Estimation Card */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex justify-between items-center">
                <div>
                    <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                        Estimated 1RM
                    </div>
                    <div className="text-xl font-black text-primary">
                        {estimated1RM} <span className="text-xs font-bold text-zinc-400">kg</span>
                    </div>
                </div>

                {/* Formula toggle */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setFormula('epley')}
                        className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition-all ${
                            formula === 'epley' ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Epley
                    </button>
                    <button
                        onClick={() => setFormula('brzycki')}
                        className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition-all ${
                            formula === 'brzycki' ? 'bg-primary text-black' : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Brzycki
                    </button>
                </div>
            </div>

            {/* Warm-Up Sets Table */}
            <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">
                    <span>Warm-Up Set</span>
                    <span>Weight & Reps</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                    {warmUpSets.length > 0 ? (
                        warmUpSets.map((set, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between items-center p-3 rounded-xl bg-white/3 border border-white/5"
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-black flex items-center justify-center">
                                        {idx + 1}
                                    </span>
                                    <div>
                                        <div className="text-xs font-bold text-white">{set.label}</div>
                                        <div className="text-[10px] text-zinc-400">{set.percentage}% working weight</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-white">{set.weight} kg</div>
                                    <div className="text-xs text-primary font-bold">{set.reps} reps</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-zinc-500 text-xs py-4">
                            Enter a working weight above to view warm-up sets.
                        </div>
                    )}
                </div>
            </div>

            {/* Action Footer */}
            <Button
                onClick={onClose}
                className="w-full bg-primary text-black font-black hover:bg-primary/90 rounded-xl"
            >
                Done
            </Button>
        </Dialog>
    );
}
