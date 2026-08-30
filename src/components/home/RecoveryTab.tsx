import { useState } from "react";
import { useStore } from "../../store/useStore";
import { Moon } from "lucide-react";
import { Dialog } from "../ui/dialog";
import { BoxBreathingPacer } from "./BoxBreathingPacer";

const WATER_TARGET_ML = 2000;

export function RecoveryTab({ todayStr }: { todayStr: string }) {
    const { waterIntake, sleepDuration, logWaterIntake, resetWater, logSleep } = useStore();

    const todayWater = waterIntake?.[todayStr] || 1250;
    const todaySleepDur = sleepDuration?.[todayStr] || (7 * 60 + 45); // 7h 45m

    const [showSleepModal, setShowSleepModal] = useState(false);
    const [sleepHrs, setSleepHrs] = useState("7");
    const [sleepMins, setSleepMins] = useState("45");

    const waterPct = Math.min(Math.round((todayWater / WATER_TARGET_ML) * 100), 100);

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-12">
            {/* Hydration Tracker Card */}
            <div className="bg-card border border-white/5 p-5 rounded-3xl space-y-3 shadow-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest block">Hydration</span>
                        <h4 className="text-xl font-black text-white">Water Intake</h4>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-white">{todayWater.toLocaleString()} <span className="text-xs text-sky-400 font-bold">ml</span></div>
                        <span className="text-[10px] text-zinc-400 font-bold">Target: {WATER_TARGET_ML.toLocaleString()} ml</span>
                    </div>
                </div>

                {/* Animated Fill Bar */}
                <div className="h-6 w-full rounded-2xl bg-black/40 border border-white/5 overflow-hidden relative">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-2xl transition-all duration-500 flex items-center justify-end pr-3"
                        style={{ width: `${waterPct}%` }}
                    >
                        <span className="text-[9px] font-black text-white">{waterPct}%</span>
                    </div>
                </div>

                {/* Quick Bump Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                    {[250, 500, 750].map((amount) => (
                        <button
                            key={amount}
                            type="button"
                            onClick={() => { logWaterIntake(todayStr, amount); navigator.vibrate?.(30); }}
                            className="min-h-[44px] py-2.5 bg-white/5 hover:bg-sky-500/20 active:scale-95 border border-white/5 rounded-xl text-xs font-black text-sky-400 flex items-center justify-center transition-all cursor-pointer"
                        >
                            +{amount}ml
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => { resetWater(todayStr); navigator.vibrate?.(20); }}
                        className="min-h-[44px] py-2.5 bg-white/5 hover:bg-red-500/20 active:scale-95 border border-white/5 rounded-xl text-xs font-black text-zinc-400 transition-all cursor-pointer"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Sleep Target vs Actual Card */}
            <div className="bg-card border border-white/5 p-5 rounded-3xl space-y-3 shadow-xl">
                <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block">Rest & Anabolic Recovery</span>
                        <h4 className="text-lg font-black text-white">Last Night's Sleep</h4>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowSleepModal(true)}
                        className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 cursor-pointer min-h-[32px] flex items-center"
                    >
                        Optimal
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-400 shrink-0">
                        <Moon size={22} />
                    </div>
                    <div className="space-y-0.5">
                        <div className="text-2xl font-black text-white">
                            {todaySleepDur > 0
                                ? `${Math.floor(todaySleepDur / 60)}h ${todaySleepDur % 60}m`
                                : "7h 45m"}
                        </div>
                        <span className="text-xs text-primary font-bold block">
                            Target met (7h 00m) — CNS fully recovered
                        </span>
                    </div>
                </div>
            </div>

            {/* Coach's Daily Rule */}
            <div className="bg-card border border-primary/20 p-4 rounded-3xl space-y-2 shadow-xl">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Coach's Daily Rule</span>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    Hydrate before caffeine. Hit 2L water before 6:00 PM and maintain high protein intake to preserve lean mass during training.
                </p>
            </div>

            {/* Box Breathing Pacer */}
            <BoxBreathingPacer />

            {/* Sleep Logger Dialog */}
            <Dialog
                open={showSleepModal}
                title="Log Sleep"
                onClose={() => setShowSleepModal(false)}
            >
                <div className="space-y-4">
                    <h3 className="text-base font-black text-white">How long did you sleep?</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-zinc-500 uppercase">Hours</label>
                            <input
                                type="number"
                                min={0}
                                max={16}
                                value={sleepHrs}
                                onChange={e => setSleepHrs(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 focus:border-purple-400 rounded-xl px-3 py-2 text-sm text-white font-bold min-h-[44px]"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-zinc-500 uppercase">Minutes</label>
                            <input
                                type="number"
                                min={0}
                                max={59}
                                value={sleepMins}
                                onChange={e => setSleepMins(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 focus:border-purple-400 rounded-xl px-3 py-2 text-sm text-white font-bold min-h-[44px]"
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            const totalMins = (parseInt(sleepHrs) || 0) * 60 + (parseInt(sleepMins) || 0);
                            logSleep(todayStr, totalMins);
                            setShowSleepModal(false);
                            navigator.vibrate?.(30);
                        }}
                        className="w-full min-h-[44px] py-3 bg-purple-500 hover:opacity-90 active:scale-95 text-white font-black text-sm rounded-xl transition-all shadow-md cursor-pointer"
                    >
                        Save Sleep Record
                    </button>
                </div>
            </Dialog>
        </div>
    );
}
