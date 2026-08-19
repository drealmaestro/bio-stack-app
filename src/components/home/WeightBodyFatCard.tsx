import { useState, useMemo } from "react";
import { useStore } from "../../store/useStore";

export interface WeightBodyFatCardProps {
    todayStr: string;
}

export function WeightBodyFatCard({ todayStr }: WeightBodyFatCardProps) {
    const { user, updateUserStats } = useStore();

    const [logWeightVal, setLogWeightVal] = useState("");
    const [logBodyFatVal, setLogBodyFatVal] = useState("");

    const lastWeight = useMemo(() => {
        if (!user?.stats?.weight?.length) return 0;
        const sorted = [...user.stats.weight].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return sorted[0].value;
    }, [user?.stats?.weight]);

    const lastBodyFat = useMemo(() => {
        if (!user?.stats?.body_fat?.length) return 0;
        const sorted = [...user.stats.body_fat].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return sorted[0].value;
    }, [user?.stats?.body_fat]);

    const handleLogWeight = () => {
        const val = parseFloat(logWeightVal);
        if (!isNaN(val) && val > 0) {
            updateUserStats('weight', { date: todayStr, value: val });
            setLogWeightVal("");
            navigator.vibrate?.(30);
        }
    };

    const handleLogBodyFat = () => {
        const val = parseFloat(logBodyFatVal);
        if (!isNaN(val) && val > 0) {
            updateUserStats('body_fat', { date: todayStr, value: val });
            setLogBodyFatVal("");
            navigator.vibrate?.(30);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-white/5 p-4 rounded-3xl space-y-3 shadow-md flex flex-col justify-between">
                <div>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Weight</span>
                    <div className="text-2xl font-black text-white mt-0.5">
                        {lastWeight > 0 ? `${lastWeight} kg` : "N/A"}
                    </div>
                </div>
                <div>
                    <div className="flex gap-1.5 pt-1">
                        <input
                            type="number"
                            step="0.1"
                            placeholder="kg"
                            aria-label="Weight in kg"
                            value={logWeightVal}
                            onChange={e => setLogWeightVal(e.target.value)}
                            className="w-full bg-black/40 border border-white/5 focus:border-primary rounded-xl px-2 py-1.5 text-center text-xs text-white font-bold min-h-[44px]"
                        />
                        <button
                            type="button"
                            onClick={handleLogWeight}
                            className="px-3 min-h-[44px] bg-primary text-black rounded-xl text-xs font-black hover:bg-primary/95 tap-active shadow-sm cursor-pointer"
                        >
                            Log
                        </button>
                    </div>
                    <div className="flex gap-1 mt-2">
                        {[-0.5, -0.1, 0.1, 0.5].map(offset => (
                            <button
                                key={offset}
                                type="button"
                                onClick={() => {
                                    const base = parseFloat(logWeightVal) || lastWeight || 70;
                                    const nextVal = Math.round((base + offset) * 10) / 10;
                                    setLogWeightVal(String(nextVal));
                                }}
                                className="flex-1 py-2 bg-white/5 hover:bg-white/10 active:scale-90 border border-white/5 rounded-lg text-[9px] font-black text-zinc-400 hover:text-white transition-all cursor-pointer min-h-[44px] flex items-center justify-center"
                            >
                                {offset > 0 ? `+${offset}` : offset}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-card border border-white/5 p-4 rounded-3xl space-y-3 shadow-md flex flex-col justify-between">
                <div>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Body Fat</span>
                    <div className="text-2xl font-black text-fat mt-0.5">
                        {lastBodyFat > 0 ? `${lastBodyFat}%` : "N/A"}
                    </div>
                </div>
                <div>
                    <div className="flex gap-1.5 pt-1">
                        <input
                            type="number"
                            step="0.1"
                            placeholder="%"
                            aria-label="Body fat percentage"
                            value={logBodyFatVal}
                            onChange={e => setLogBodyFatVal(e.target.value)}
                            className="w-full bg-black/40 border border-white/5 focus:border-fat rounded-xl px-2 py-1.5 text-center text-xs text-white font-bold min-h-[44px]"
                        />
                        <button
                            type="button"
                            onClick={handleLogBodyFat}
                            className="px-3 min-h-[44px] bg-fat text-white rounded-xl text-xs font-black hover:opacity-90 tap-active shadow-sm cursor-pointer"
                        >
                            Log
                        </button>
                    </div>
                    <div className="flex gap-1 mt-2">
                        {[-0.5, -0.1, 0.1, 0.5].map(offset => (
                            <button
                                key={offset}
                                type="button"
                                onClick={() => {
                                    const base = parseFloat(logBodyFatVal) || lastBodyFat || 15;
                                    const nextVal = Math.round((base + offset) * 10) / 10;
                                    setLogBodyFatVal(String(nextVal));
                                }}
                                className="flex-1 py-2 bg-white/5 hover:bg-white/10 active:scale-90 border border-white/5 rounded-lg text-[9px] font-black text-zinc-400 hover:text-white transition-all cursor-pointer min-h-[44px] flex items-center justify-center"
                            >
                                {offset > 0 ? `+${offset}` : offset}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
