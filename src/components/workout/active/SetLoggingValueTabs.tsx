import { Scale, Repeat } from "lucide-react";
import { cn } from "../../../lib/utils";

export interface SetLoggingValueTabsProps {
    activeTab: "weight" | "reps";
    onSelectTab: (tab: "weight" | "reps") => void;
    weight: number;
    reps: number;
}

export function SetLoggingValueTabs({
    activeTab,
    onSelectTab,
    weight,
    reps,
}: SetLoggingValueTabsProps) {
    return (
        <div className="grid grid-cols-2 gap-3">
            <button
                type="button"
                onClick={() => onSelectTab("weight")}
                className={cn(
                    "p-3 rounded-2xl border text-left transition-all tap-active flex items-center justify-between cursor-pointer min-h-[64px]",
                    activeTab === "weight"
                        ? "bg-primary/10 border-primary/50 ring-1 ring-primary/30"
                        : "bg-black/30 border-white/5 hover:bg-white/5"
                )}
            >
                <div>
                    <span className="text-[10px] font-extrabold uppercase text-zinc-400 flex items-center gap-1">
                        <Scale className="w-3 h-3" /> Weight (kg)
                    </span>
                    <div className="text-2xl font-mono font-black text-white mt-0.5">
                        {weight} <span className="text-xs font-normal text-zinc-400">kg</span>
                    </div>
                </div>
            </button>

            <button
                type="button"
                onClick={() => onSelectTab("reps")}
                className={cn(
                    "p-3 rounded-2xl border text-left transition-all tap-active flex items-center justify-between cursor-pointer min-h-[64px]",
                    activeTab === "reps"
                        ? "bg-primary/10 border-primary/50 ring-1 ring-primary/30"
                        : "bg-black/30 border-white/5 hover:bg-white/5"
                )}
            >
                <div>
                    <span className="text-[10px] font-extrabold uppercase text-zinc-400 flex items-center gap-1">
                        <Repeat className="w-3 h-3" /> Reps
                    </span>
                    <div className="text-2xl font-mono font-black text-white mt-0.5">
                        {reps} <span className="text-xs font-normal text-zinc-400">reps</span>
                    </div>
                </div>
            </button>
        </div>
    );
}
