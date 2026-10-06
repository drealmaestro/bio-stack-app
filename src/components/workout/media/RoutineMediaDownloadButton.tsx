import React, { useState, useEffect } from "react";
import { Download, CheckCircle2, Loader2, WifiOff } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useMediaStorage } from "../../../hooks/useMediaStorage";
import { isMediaCached } from "../../../utils/mediaManager";

export interface RoutineMediaDownloadButtonProps {
    exerciseIds: string[];
    className?: string;
}

export function RoutineMediaDownloadButton({ exerciseIds, className }: RoutineMediaDownloadButtonProps) {
    const { report, isDownloading, downloadProgress, downloadRoutine } = useMediaStorage();
    const [isLocalDownloading, setIsLocalDownloading] = useState(false);
    const [isFullyCached, setIsFullyCached] = useState(false);

    const isOnline = report?.isOnline ?? true;
    const estMb = Math.max(0.8, exerciseIds.length * 0.45).toFixed(1);

    useEffect(() => {
        let active = true;
        if (exerciseIds.length === 0) { setIsFullyCached(false); return; }
        Promise.all(exerciseIds.map(id => isMediaCached(id))).then(results => {
            if (active) {
                const allCached = results.length > 0 && results.every(Boolean);
                setIsFullyCached(prev => prev === allCached ? prev : allCached);
            }
        });
        return () => { active = false; };
    }, [exerciseIds, report]);

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOnline || isDownloading || isLocalDownloading) return;
        try { navigator.vibrate?.(20); } catch {}
        setIsLocalDownloading(true);
        try { await downloadRoutine(exerciseIds); } finally { setIsLocalDownloading(false); }
    };

    if (isFullyCached) {
        return (
            <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", className)}>
                <CheckCircle2 size={12} />
                <span>Offline Ready</span>
            </div>
        );
    }

    if (isDownloading || isLocalDownloading) {
        return (
            <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-sky-500/10 text-sky-400 border border-sky-500/20", className)}>
                <Loader2 size={12} className="animate-spin" />
                <span>Downloading {downloadProgress > 0 ? `${downloadProgress}%` : ""}...</span>
            </div>
        );
    }

    if (!isOnline) {
        return (
            <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/5 text-zinc-500 border border-white/5 cursor-not-allowed", className)}>
                <WifiOff size={12} />
                <span>Offline (Pending)</span>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={handleDownload}
            className={cn("min-h-[36px] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer", className)}
            title={`Download media for ${exerciseIds.length} exercises (~${estMb} MB)`}
            aria-label="Download routine media"
        >
            <Download size={12} />
            <span>Download Media (~{estMb} MB)</span>
        </button>
    );
}
