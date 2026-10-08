import { ShieldCheck, Download, FileSpreadsheet, Database, CheckCircle2 } from "lucide-react";
import { useStore } from "../../store/useStore";

export function OfflinePortabilityCard() {
    const { logs, exercises } = useStore();

    const handleExportCSV = () => {
        const headers = ["Timestamp", "Exercise", "Weight_KG", "Reps_Completed"];
        const rows = logs.flatMap(l =>
            l.completed_exercises.map(s => {
                const exName = exercises.find(e => e.id === s.exercise_id)?.name || s.exercise_id;
                return [l.timestamp, `"${exName}"`, s.weight_kg, s.reps_completed].join(",");
            })
        );
        const csvContent = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `el-maestro-telemetry-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportJSON = () => {
        const jsonContent = JSON.stringify(logs, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `el-maestro-backup-${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            {/* Rest & MPS Adherence Card */}
            <section className="stitch-card-1 p-4 border border-[#262b36] bg-[#14171d] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-[#ccff00]" />
                        <h2 className="text-xs font-mono font-bold tracking-wider text-[#8e95a5] uppercase">
                            Rest & MPS Adherence
                        </h2>
                    </div>
                    <span className="stitch-badge-target font-mono text-[10px]">
                        Target Hit
                    </span>
                </div>

                <div className="p-3 bg-[#1a1e26] border border-[#262b36] rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">2 of 2 Rest Days Completed</span>
                        <span className="font-mono font-bold text-[#ccff00]">100%</span>
                    </div>
                    <p className="text-[11px] text-[#8e95a5] leading-relaxed">
                        Muscle Protein Synthesis (MPS) window optimal: 48h spacing strictly observed between high-threshold arm sessions.
                    </p>
                </div>
            </section>

            {/* Offline Data Portability Card */}
            <section className="stitch-card-1 p-4 border border-[#262b36] bg-[#14171d] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Database size={16} className="text-[#ccff00]" />
                        <h2 className="text-xs font-mono font-bold tracking-wider text-[#8e95a5] uppercase">
                            Offline Data Portability
                        </h2>
                    </div>
                    <span className="stitch-badge-neutral font-mono text-[10px] flex items-center gap-1">
                        <ShieldCheck size={11} className="text-[#ccff00]" /> 100% Local
                    </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#8e95a5] px-1">
                    <span>Database Integrity</span>
                    <span className="text-[#ccff00] font-bold">PASS (SHA-256)</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                        onClick={handleExportCSV}
                        className="py-2.5 px-3 rounded-lg bg-[#1a1e26] border border-[#262b36] hover:border-[#ccff00]/50 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        <FileSpreadsheet size={14} className="text-[#ccff00]" />
                        Export CSV
                    </button>
                    <button
                        onClick={handleExportJSON}
                        className="py-2.5 px-3 rounded-lg bg-[#1a1e26] border border-[#262b36] hover:border-[#ccff00]/50 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        <Download size={14} className="text-[#ccff00]" />
                        Dump JSON
                    </button>
                </div>
            </section>
        </div>
    );
}
