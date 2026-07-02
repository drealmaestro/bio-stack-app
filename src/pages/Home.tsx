import { useState } from "react";
import { useStore } from "../store/useStore";
import { cn } from "../lib/utils";
import { WorkoutsTab } from "../components/home/WorkoutsTab";
import { NutritionTab } from "../components/home/NutritionTab";
import { RecoveryTab } from "../components/home/RecoveryTab";
import { ProgressTab } from "../components/home/ProgressTab";

type ActiveTab = "workouts" | "nutrition" | "recovery" | "progress";

const TABS: { id: ActiveTab; label: string; bg: string }[] = [
    { id: "workouts", label: "Workouts", bg: "bg-pillar-activity" },
    { id: "nutrition", label: "Nutrition", bg: "bg-pillar-nutrition" },
    { id: "recovery", label: "Recovery", bg: "bg-pillar-sleep" },
    { id: "progress", label: "Progress", bg: "bg-pillar-mindfulness" },
];

export function Home() {
    const user = useStore(s => s.user);
    const [activeTab, setActiveTab] = useState<ActiveTab>("workouts");

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentDayName = now.toLocaleDateString('en-US', { weekday: 'long' });

    return (
        <div className={cn(
            "min-h-screen text-foreground space-y-6 pb-24 transition-colors duration-500",
            TABS.find(t => t.id === activeTab)?.bg
        )}>
            {/* Top Navigation Pill Tabs */}
            <div className="sticky top-0 z-45 bg-zinc-950/75 backdrop-blur-md border-b border-white/5 py-3 px-2 flex justify-around">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-black capitalize transition-all duration-300 tap-active",
                            activeTab === tab.id
                                ? "bg-white text-zinc-950 shadow-md scale-105"
                                : "text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="px-4 space-y-6">
                {/* Greeting Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-xs font-black text-primary uppercase tracking-widest block mb-0.5">
                            {currentDayName}, {now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                            Hi, <span className="text-primary">{user?.name?.split(" ")[0] || "Athlete"}</span>
                        </h2>
                    </div>
                </div>

                {activeTab === "workouts" && <WorkoutsTab todayStr={todayStr} />}
                {activeTab === "nutrition" && <NutritionTab todayStr={todayStr} />}
                {activeTab === "recovery" && <RecoveryTab todayStr={todayStr} />}
                {activeTab === "progress" && <ProgressTab todayStr={todayStr} />}
            </div>
        </div>
    );
}
