import { useState } from "react";
import { useStore } from "../../store/useStore";
import { Droplet, Moon, Footprints, BedDouble, UtensilsCrossed } from "lucide-react";
import { cn } from "../../lib/utils";
import { Dialog } from "../ui/dialog";
import { BoxBreathingPacer } from "./BoxBreathingPacer";

const WATER_TARGET_ML = 2000;
const SLEEP_TARGET_MINS = 7 * 60;

export function RecoveryTab({ todayStr }: { todayStr: string }) {
    const { waterIntake, sleepDuration, logWaterIntake, resetWater, logSleep } = useStore();

    const todayWater = waterIntake?.[todayStr] || 0;
    const todaySleepDur = sleepDuration?.[todayStr] || 0;

    // Sleep modal
    const [showSleepModal, setShowSleepModal] = useState(false);
    const [sleepHrs, setSleepHrs] = useState("7");
    const [sleepMins, setSleepMins] = useState("30");

    const dayIndex = new Date().getDay();
    const isRestDay = dayIndex === 0 || dayIndex === 3; // Sunday & Wednesday

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-12">
            {/* Coach's Recovery Protocol — static guidance, zero fabricated metrics */}
            <div className="bg-card border border-primary/20 p-5 rounded-3xl space-y-3 shadow-md">
                <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest block">
                        {isRestDay ? "Rest Day Protocol" : "Training Day Recovery"}
                    </span>
                    <h4 className="text-lg font-black text-white">
                        {isRestDay ? "Muscle grows today" : "Set up tomorrow's session"}
                    </h4>
                </div>
                <div className="space-y-2.5">
                    {(isRestDay ? [
                        { icon: <Footprints size={14} />, text: "30–40 min zone-2 walk — easy pace, fat-burning, zero recovery cost." },
                        { icon: <UtensilsCrossed size={14} />, text: "Keep protein high even without training — muscle repair happens today." },
                        { icon: <BedDouble size={14} />, text: "Aim for 7+ hours of sleep. It's the strongest natural anabolic you have." },
                    ] : [
                        { icon: <Droplet size={14} />, text: "Hit 2L of water — dehydrated muscle underperforms and recovers slower." },
                        { icon: <UtensilsCrossed size={14} />, text: "Get 30–40g protein within a couple of hours after training." },
                        { icon: <Moon size={14} />, text: "Wind down early tonight — the next session is only as good as tonight's sleep." },
                    ]).map((tip, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed">
                            <span className="text-primary mt-0.5 shrink-0">{tip.icon}</span>
                            <span>{tip.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Water Tracker */}
            <div className="bg-card border border-white/5 p-5 rounded-3xl space-y-4 shadow-md">
                <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest block">Hydration</span>
                        <h4 className="text-lg font-black text-white">Water Intake</h4>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-black text-white">{todayWater} <span className="text-xs text-zinc-500 font-bold">ml</span></div>
                        <span className="text-[10px] text-zinc-500 font-bold">Target: {WATER_TARGET_ML.toLocaleString()} ml</span>
                    </div>
                </div>

                <div className="h-6 w-full rounded-2xl bg-black/40 border border-white/5 overflow-hidden relative">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-2xl transition-all duration-700 ease-out flex items-center justify-end pr-3"
                        style={{ width: `${Math.min((todayWater / WATER_TARGET_ML) * 100, 100)}%` }}
                    >
                        {todayWater > 0 && (
                            <span className="text-[9px] font-black text-white">
                                {Math.round(Math.min((todayWater / WATER_TARGET_ML) * 100, 100))}%
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {[250, 500, 750].map(amount => (
                        <button
                            key={amount}
                            type="button"
                            onClick={() => { logWaterIntake(todayStr, amount); navigator.vibrate?.(30); }}
                            className="min-h-[44px] py-2 bg-white/5 hover:bg-sky-500/10 hover:border-sky-500/20 active:scale-95 border border-white/5 rounded-xl text-xs font-black text-sky-400 flex items-center justify-center gap-1 transition-all cursor-pointer"
                            aria-label={`Add ${amount}ml water`}
                        >
                            <Droplet size={12} className="fill-current" /> +{amount}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => { resetWater(todayStr); navigator.vibrate?.(20); }}
                        className="min-h-[44px] py-2 bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 active:scale-95 border border-white/5 rounded-xl text-xs font-black text-zinc-400 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        aria-label="Reset water intake"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Sleep — simple manual hours, zero invented stages or scores */}
            <div className="bg-card border border-white/5 p-5 rounded-3xl space-y-4 shadow-md">
                <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-sleep uppercase tracking-widest block">Rest & Recovery</span>
                        <h4 className="text-lg font-black text-white">Last Night's Sleep</h4>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            const h = Math.floor(todaySleepDur / 60) || 7;
                            const m = todaySleepDur % 60;
                            setSleepHrs(String(h));
                            setSleepMins(String(m));
                            setShowSleepModal(true);
                        }}
                        className="text-xs font-black text-sleep bg-sleep/10 px-4 py-2 min-h-[44px] rounded-full hover:bg-sleep/20 transition-all cursor-pointer flex items-center"
                    >
                        Log Sleep
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sleep/15 flex items-center justify-center text-sleep shrink-0">
                        <Moon size={22} />
                    </div>
                    <div className="flex-1">
                        <div className="text-2xl font-black text-white">
                            {todaySleepDur > 0
                                ? `${Math.floor(todaySleepDur / 60)}h ${todaySleepDur % 60}m`
                                : "Not logged"}
                        </div>
                        <span className={cn(
                            "text-[10px] font-bold block mt-0.5",
                            todaySleepDur === 0 ? "text-zinc-500" :
                            todaySleepDur >= SLEEP_TARGET_MINS ? "text-primary" : "text-warning"
                        )}>
                            {todaySleepDur === 0
                                ? "Tap Log Sleep after you wake up"
                                : todaySleepDur >= SLEEP_TARGET_MINS
                                    ? "On target — recovery covered"
                                    : `${Math.round((SLEEP_TARGET_MINS - todaySleepDur) / 6) / 10}h short of the 7h target`}
                        </span>
                    </div>
                </div>
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
                                className="w-full bg-black/40 border border-white/5 focus:border-sleep rounded-xl px-3 py-2 text-sm text-white font-bold min-h-[44px]"
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
                                className="w-full bg-black/40 border border-white/5 focus:border-sleep rounded-xl px-3 py-2 text-sm text-white font-bold min-h-[44px]"
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
                        className="w-full min-h-[44px] py-3 bg-sleep hover:opacity-90 active:scale-95 text-white font-black text-sm rounded-xl transition-all shadow-md cursor-pointer"
                    >
                        Save Sleep Record
                    </button>
                </div>
            </Dialog>
        </div>
    );
}
