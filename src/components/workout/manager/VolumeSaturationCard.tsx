import { Zap } from "lucide-react";

export function VolumeSaturationCard() {
    return (
        <section className="stitch-card-1 p-4 border border-[#262b36] bg-[#14171d] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                    <h2 className="text-xs font-mono font-bold tracking-wider text-[#8e95a5] uppercase">
                        Volume Saturation
                    </h2>
                </div>
                <span className="stitch-badge-target font-mono text-[10px] px-2 py-0.5">
                    Week 03 Active
                </span>
            </div>

            {/* Arm Asymmetry Protocol Highlight Banner */}
            <div className="p-3 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/30 space-y-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#ccff00] uppercase tracking-wide">
                        <Zap size={14} className="fill-[#ccff00]" />
                        Arm Asymmetry Neutralizer Active
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-[#ccff00] text-black px-1.5 py-0.5 rounded">
                        Left Bias
                    </span>
                </div>
                <p className="text-[11px] text-[#8e95a5] leading-relaxed">
                    Left bias: +2 sets unilateral volume applied per push/pull session to balance non-dominant arm.
                </p>
            </div>

            {/* Saturation Progress Bars */}
            <div className="space-y-3 pt-1">
                {/* Chest Focus */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white uppercase tracking-tight">Chest Focus</span>
                            <span className="stitch-badge-neutral text-[9px] font-mono py-0 px-1">MAV</span>
                        </div>
                        <span className="font-mono font-bold text-[#ccff00] text-xs">20 / 20 Sets</span>
                    </div>
                    <div className="w-full bg-[#1e232d] h-2 rounded-full overflow-hidden">
                        <div className="bg-[#ccff00] h-full rounded-full transition-all duration-500 w-full" />
                    </div>
                </div>

                {/* Triceps Spec */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white uppercase tracking-tight">Triceps Spec</span>
                            <span className="stitch-badge-target text-[9px] font-mono py-0 px-1">Priority Overreach</span>
                        </div>
                        <span className="font-mono font-bold text-[#ccff00] text-xs">16 / 16 Sets</span>
                    </div>
                    <div className="w-full bg-[#1e232d] h-2 rounded-full overflow-hidden">
                        <div className="bg-[#ccff00] h-full rounded-full transition-all duration-500 w-full" />
                    </div>
                </div>

                {/* Biceps Spec */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white uppercase tracking-tight">Biceps Spec</span>
                            <span className="stitch-badge-neutral text-[9px] font-mono py-0 px-1">87% Target</span>
                        </div>
                        <span className="font-mono font-bold text-white text-xs">14 / 16 Sets</span>
                    </div>
                    <div className="w-full bg-[#1e232d] h-2 rounded-full overflow-hidden">
                        <div className="bg-[#ccff00] h-full rounded-full transition-all duration-500 w-[87%]" />
                    </div>
                </div>
            </div>
        </section>
    );
}
