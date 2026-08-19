import { useState } from "react";
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
    const [activeTab, setActiveTab] = useState<ActiveTab>("workouts");

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return (
        <div className={cn(
            "min-h-screen text-foreground space-y-4 pb-24 transition-colors duration-500",
            TABS.find(t => t.id === activeTab)?.bg
        )}>
            {/* Sticky Top Navigation Pill Tabs matching preview */}
            <div className="sticky top-0 z-45 bg-zinc-950/90 backdrop-blur-md border-b border-white/5 py-2.5 px-3 flex justify-between gap-1.5 shrink-0">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex-1 py-1.5 min-h-[44px] rounded-full text-xs font-black capitalize transition-all duration-300 tap-active flex items-center justify-center cursor-pointer",
                            activeTab === tab.id
                                ? "bg-white text-zinc-950 shadow-md scale-105"
                                : "text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="px-3 space-y-4">
                {activeTab === "workouts" && <WorkoutsTab todayStr={todayStr} />}
                {activeTab === "nutrition" && <NutritionTab todayStr={todayStr} />}
                {activeTab === "recovery" && <RecoveryTab todayStr={todayStr} />}
                {activeTab === "progress" && <ProgressTab todayStr={todayStr} />}
            </div>
        </div>
    );
}
