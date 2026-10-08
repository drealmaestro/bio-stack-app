import { Trophy, Award } from "lucide-react";

interface RecordItem {
    id: string;
    exercise: string;
    weightKg: number;
    reps: number;
    date: string;
    isKeyFocus?: boolean;
}

const DEFAULT_RECORDS: RecordItem[] = [
    {
        id: "pr_1",
        exercise: "Incline DB Press (Left Lead)",
        weightKg: 38.0,
        reps: 8,
        date: "OCT 21",
        isKeyFocus: true
    },
    {
        id: "pr_2",
        exercise: "Barbell Bench Press",
        weightKg: 110.0,
        reps: 6,
        date: "OCT 14",
        isKeyFocus: false
    },
    {
        id: "pr_3",
        exercise: "Cable Triceps Pushdown",
        weightKg: 45.0,
        reps: 12,
        date: "OCT 22",
        isKeyFocus: true
    },
    {
        id: "pr_4",
        exercise: "Incline DB Curl",
        weightKg: 18.0,
        reps: 10,
        date: "OCT 19",
        isKeyFocus: true
    }
];

export function RecordBoardCard() {
    return (
        <section className="stitch-card-1 p-4 border border-[#262b36] bg-[#14171d] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-[#ccff00]" />
                    <h2 className="text-xs font-mono font-bold tracking-wider text-[#8e95a5] uppercase">
                        Arm & Chest Record Board
                    </h2>
                </div>
                <span className="stitch-badge-target font-mono text-[10px]">
                    Verified Offline
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
                {DEFAULT_RECORDS.map(rec => (
                    <div
                        key={rec.id}
                        className="p-3 bg-[#1a1e26]/80 border border-[#262b36] rounded-lg space-y-1.5 hover:border-[#ccff00]/40 transition-colors"
                    >
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#8e95a5]">
                            <span className="flex items-center gap-1 text-[#ccff00]">
                                <Award size={12} /> PR
                            </span>
                            <span>{rec.date}</span>
                        </div>
                        <h3 className="text-xs font-bold text-white leading-tight line-clamp-1">
                            {rec.exercise}
                        </h3>
                        <div className="flex items-baseline gap-1.5 pt-0.5">
                            <span className="text-lg font-black font-display text-[#ccff00]">
                                {rec.weightKg.toFixed(1)}
                            </span>
                            <span className="text-[10px] font-mono text-[#8e95a5] uppercase">
                                KG × {rec.reps} REPS
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
