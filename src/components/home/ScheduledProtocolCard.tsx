import { Play, Coffee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { WorkoutTemplate, TargetMuscle } from "../../types";

const MUSCLE_COLORS: Record<TargetMuscle, string> = {
    Chest: "text-orange-400 bg-orange-400/10",
    Back: "text-blue-400 bg-blue-400/10",
    Legs: "text-green-400 bg-green-400/10",
    Shoulders: "text-purple-400 bg-purple-400/10",
    Biceps: "text-pink-400 bg-pink-400/10",
    Triceps: "text-yellow-400 bg-yellow-400/10",
    Core: "text-red-400 bg-red-400/10",
    Forearms: "text-zinc-400 bg-zinc-400/10",
    Other: "text-zinc-400 bg-zinc-400/10",
};

interface ScheduledProtocolCardProps {
    todayTemplate: WorkoutTemplate | null;
    nextTemplate: WorkoutTemplate | null;
    isSessionLocked: boolean;
    getExerciseMuscle: (id: string) => TargetMuscle;
    onStartWorkout: (id: string) => void;
}

export function ScheduledProtocolCard({
    todayTemplate,
    nextTemplate,
    isSessionLocked,
    getExerciseMuscle,
    onStartWorkout,
}: ScheduledProtocolCardProps) {
    const navigate = useNavigate();

    return (
        <div className="space-y-3">
            <h3 className="section-label px-1">Scheduled Protocol</h3>

            {todayTemplate ? (
                <div className="bg-card border border-primary/25 rounded-3xl p-5 space-y-4 shadow-md">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Today's target routine</span>
                            <h4 className="text-xl font-black text-white leading-tight">{todayTemplate.name}</h4>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 bg-white/5 px-2 py-1 rounded-xl">
                            {todayTemplate.exercises.length} exercises
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {[...new Set(todayTemplate.exercises.map(e => getExerciseMuscle(e.exercise_id)))].map(muscle => (
                            <span key={muscle} className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${MUSCLE_COLORS[muscle as TargetMuscle]}`}>
                                {muscle}
                            </span>
                        ))}
                    </div>

                    <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/15 flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-medium">🎯 Target overload:</span>
                        <span className="text-primary font-black">+2.5 kg progression</span>
                    </div>

                    <button
                        onClick={() => { if (!isSessionLocked) onStartWorkout(todayTemplate.id); navigate("/active"); }}
                        className="w-full min-h-[48px] py-3.5 bg-primary hover:bg-[#2fb27f] text-black font-black rounded-2xl flex items-center justify-center gap-2 transition-all tap-active shadow-lg shadow-primary/15 cursor-pointer"
                    >
                        <Play size={16} fill="currentColor" /> {isSessionLocked ? "Resume Active Session" : "Start Workout Session"}
                    </button>
                </div>
            ) : (
                <div className="p-5 bg-card border border-white/5 rounded-3xl space-y-3 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                            <Coffee size={20} />
                        </div>
                        <div>
                            <h4 className="text-base font-black text-white">Active Recovery Day</h4>
                            <p className="text-xs text-zinc-400">A 30–40 min brisk walk burns chest fat without eating into recovery.</p>
                        </div>
                    </div>

                    {nextTemplate && (
                        <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                            <span className="text-xs text-zinc-400 font-medium">Next up: <span className="text-white font-bold">{nextTemplate.name}</span></span>
                            <button
                                onClick={() => { if (!isSessionLocked) onStartWorkout(nextTemplate.id); navigate("/active"); }}
                                className="px-3.5 py-1.5 bg-white/5 hover:bg-primary hover:text-black border border-white/10 rounded-xl text-xs font-black text-zinc-300 flex items-center gap-1.5 transition-all cursor-pointer min-h-[44px]"
                            >
                                <Play size={11} fill="currentColor" /> Start Anyway
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
