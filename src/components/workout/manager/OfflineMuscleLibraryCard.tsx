import { useState } from "react";
import { Search, SlidersHorizontal, Plus, ShieldCheck, Zap } from "lucide-react";
import type { TargetMuscle } from "../../../types";

interface ExerciseItem {
    id: string;
    name: string;
    muscle: TargetMuscle;
    equipment: string;
    isAsymmetry: boolean;
    description: string;
}

const FEATURED_LIBRARY: ExerciseItem[] = [
    {
        id: "ex_shoulder_lockin_rotations",
        name: "Left-Shoulder Lock-In (Rotations + Face Pull)",
        muscle: "Shoulders",
        equipment: "Cable / Band",
        isAsymmetry: true,
        description: "Doctor Protocol: Wakes up left rotator cuff so left arm doesn't fade mid-set."
    },
    {
        id: "ex_incline_db_left_lead",
        name: "30° Incline Dumbbell Press (Left Lead + Offset)",
        muscle: "Chest",
        equipment: "Dumbbell",
        isAsymmetry: true,
        description: "Left arm sets rep ceiling + 20s rest-pause mini-set (4-5 reps) on left side."
    },
    {
        id: "ex_cross_body_tri_left_lead",
        name: "Single-Arm Cross-Body Tricep Extension (Left Lead)",
        muscle: "Triceps",
        equipment: "Cable",
        isAsymmetry: true,
        description: "Zero elbow pain. Builds left-tricep lockout stamina for stronger pressing."
    },
    {
        id: "ex_bayesian_cable_curl",
        name: "Single-Arm Bayesian Cable Curl (Left Lead)",
        muscle: "Biceps",
        equipment: "Cable",
        isAsymmetry: true,
        description: "Long head bias at maximum stretch. Rep capped on right arm."
    },
    {
        id: "ex_band_single_arm_press",
        name: "At-Home Stretch-Band Single-Arm Chest Press",
        muscle: "Chest",
        equipment: "Stretch Band",
        isAsymmetry: true,
        description: "Accommodating band resistance fixes mid-rep left-arm endurance wall."
    }
];

export function OfflineMuscleLibraryCard() {
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<string>("ASYMMETRY");

    const filtered = FEATURED_LIBRARY.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase());
        if (!matchesSearch) return false;

        if (activeFilter === "ASYMMETRY") return item.isAsymmetry;
        if (activeFilter === "ALL") return true;
        if (activeFilter === "CHEST") return item.muscle === "Chest";
        if (activeFilter === "BICEPS") return item.muscle === "Biceps";
        if (activeFilter === "TRICEPS") return item.muscle === "Triceps";
        return true;
    });

    return (
        <section className="stitch-card-1 p-4 border border-[#262b36] bg-[#14171d] rounded-xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#ccff00]" />
                    <h2 className="text-xs font-mono font-bold tracking-wider text-[#8e95a5] uppercase">
                        Offline Muscle Library
                    </h2>
                </div>
                <span className="stitch-badge-neutral font-mono text-[10px]">
                    150 Cached
                </span>
            </div>

            {/* Search Input Bar */}
            <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e95a5]" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search 150+ offline exercises..."
                        className="w-full pl-9 pr-3 py-2 bg-[#0d0f12] border border-[#262b36] rounded-lg text-xs text-white placeholder-[#8e95a5] focus:outline-none focus:border-[#ccff00]"
                    />
                </div>
                <button
                    className="p-2 bg-[#1a1e26] border border-[#262b36] rounded-lg text-[#8e95a5] hover:text-white"
                    title="Filters"
                >
                    <SlidersHorizontal size={16} />
                </button>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                <button
                    onClick={() => setActiveFilter("ASYMMETRY")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold uppercase whitespace-nowrap transition-colors ${
                        activeFilter === "ASYMMETRY"
                            ? "bg-[#ccff00] text-black"
                            : "bg-[#1a1e26] text-[#8e95a5] border border-[#262b36]"
                    }`}
                >
                    <Zap size={11} className={activeFilter === "ASYMMETRY" ? "fill-black" : ""} />
                    Asymmetry Fix
                </button>
                {["ALL", "CHEST", "BICEPS", "TRICEPS"].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveFilter(tab)}
                        className={`px-2.5 py-1 rounded font-bold uppercase whitespace-nowrap transition-colors ${
                            activeFilter === tab
                                ? "bg-[#ccff00] text-black"
                                : "bg-[#1a1e26] text-[#8e95a5] border border-[#262b36]"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Exercise List */}
            <div className="space-y-2.5">
                {filtered.map(item => (
                    <div
                        key={item.id}
                        className="p-3 bg-[#1a1e26]/70 border border-[#262b36] rounded-lg flex items-center justify-between gap-3 hover:border-[#ccff00]/40 transition-colors"
                    >
                        <div className="space-y-1 min-w-0 flex-1">
                            <h3 className="text-xs font-bold text-white truncate">
                                {item.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-1.5 text-[9px]">
                                {item.isAsymmetry && (
                                    <span className="bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 font-bold px-1.5 py-0.5 rounded uppercase">
                                        Asymmetry Correction
                                    </span>
                                )}
                                <span className="bg-[#0d0f12] text-[#8e95a5] border border-[#262b36] px-1.5 py-0.5 rounded uppercase font-mono">
                                    {item.equipment}
                                </span>
                                <span className="bg-[#0d0f12] text-[#8e95a5] border border-[#262b36] px-1.5 py-0.5 rounded uppercase font-mono">
                                    {item.muscle}
                                </span>
                            </div>
                            <p className="text-[10px] text-[#8e95a5] line-clamp-1">
                                {item.description}
                            </p>
                        </div>
                        <button
                            className="w-8 h-8 rounded bg-[#ccff00] text-black font-black flex items-center justify-center shrink-0 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_10px_rgba(204,255,0,0.2)]"
                            title={`Add ${item.name}`}
                        >
                            <Plus size={16} strokeWidth={3} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Offline Resilience Active Footer */}
            <div className="pt-2 border-t border-[#262b36] flex items-center justify-between text-[10px] font-mono text-[#8e95a5]">
                <span className="flex items-center gap-1.5 text-[#ccff00]">
                    <ShieldCheck size={12} /> Offline Resilience Active
                </span>
                <span>Full index cached</span>
            </div>
        </section>
    );
}
