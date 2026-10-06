import { useState } from "react";
import { HardDrive, Download, Trash2, CheckCircle2, Wifi, WifiOff, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Card } from "../../ui/card";
import { Dialog } from "../../ui/dialog";
import { useToast } from "../../ui/toast";
import { useMediaStorage } from "../../../hooks/useMediaStorage";

export function MediaStorageWidget() {
    const { report, isDownloading, downloadProgress, downloadLibrary, purge } = useMediaStorage();
    const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
    const toast = useToast();

    const cachedCount = report?.cachedCount ?? 0;
    const totalCount = report?.totalCount ?? 33;
    const usedMb = report?.usedMb ?? 0;
    const isOnline = report?.isOnline ?? true;
    const pct = totalCount > 0 ? Math.round((cachedCount / totalCount) * 100) : 0;
    const isFullyCached = cachedCount >= totalCount && totalCount > 0;

    const handleDownloadAll = async () => {
        if (!isOnline) {
            toast.error("Offline: Connect to Wi-Fi to download media");
            return;
        }
        toast.info("Starting full library media download...");
        const res = await downloadLibrary();
        if (res?.success) toast.success(`Downloaded ${totalCount} exercises offline!`);
    };

    const handleConfirmPurge = async () => {
        await purge();
        setShowPurgeConfirm(false);
        toast.info("Offline media cache purged.");
    };

    return (
        <Card className="glass-card border border-white/10 rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <HardDrive size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white leading-tight">Offline Media Storage</h3>
                        <p className="text-[10px] text-zinc-400 font-bold">WebP/AVIF animation cache</p>
                    </div>
                </div>
                <span className={cn(
                    "text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1",
                    isOnline
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                )}>
                    {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                    {isOnline ? "Wi-Fi Ready" : "Offline Mode"}
                </span>
            </div>

            <div className="bg-black/30 rounded-2xl p-3.5 border border-white/5 space-y-2.5">
                <div className="flex justify-between items-baseline">
                    <div className="text-xs font-black text-white">
                        {cachedCount} <span className="text-zinc-500">/ {totalCount} exercises cached</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-primary">
                        {usedMb.toFixed(1)} MB <span className="text-[10px] text-zinc-500 font-normal">used</span>
                    </div>
                </div>

                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
                    <div
                        className="h-full bg-linear-to-r from-primary to-emerald-400 transition-all duration-300 rounded-full"
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 font-bold">
                    <span>{pct}% complete</span>
                    <span>~25 MB full library</span>
                </div>
            </div>

            <div className="flex gap-2.5 pt-1">
                <button
                    type="button"
                    onClick={handleDownloadAll}
                    disabled={isDownloading || isFullyCached || !isOnline}
                    className={cn(
                        "flex-1 min-h-[44px] py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all tap-active cursor-pointer",
                        isFullyCached
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                            : isDownloading
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : !isOnline
                                    ? "bg-white/5 text-zinc-500 border border-white/5 cursor-not-allowed"
                                    : "bg-primary text-black hover:bg-primary/90 shadow-md shadow-primary/20"
                    )}
                >
                    {isDownloading ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Downloading {downloadProgress}%...</span>
                        </>
                    ) : isFullyCached ? (
                        <>
                            <CheckCircle2 size={14} />
                            <span>Library Fully Cached</span>
                        </>
                    ) : (
                        <>
                            <Download size={14} />
                            <span>Download Full Library</span>
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setShowPurgeConfirm(true)}
                    disabled={cachedCount === 0 || isDownloading}
                    className="min-w-[44px] min-h-[44px] px-3.5 rounded-xl border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/15 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Purge cached media"
                    aria-label="Purge cached media"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <Dialog
                open={showPurgeConfirm}
                title="Purge Media Cache"
                onClose={() => setShowPurgeConfirm(false)}
            >
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-400">
                        <AlertTriangle size={20} />
                        <h4 className="font-black text-white text-base">Purge Media Cache?</h4>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        This will delete {cachedCount} cached animations ({usedMb.toFixed(1)} MB) from local storage.
                        You will need an active internet connection to stream animations until downloaded again.
                    </p>
                    <div className="flex gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowPurgeConfirm(false)}
                            className="flex-1 min-h-[44px] rounded-xl border border-white/10 text-xs font-bold text-zinc-300 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmPurge}
                            data-testid="confirm-purge-button"
                            className="flex-1 min-h-[44px] rounded-xl bg-destructive text-xs font-black text-white hover:bg-destructive/80 transition-colors cursor-pointer"
                        >
                            Purge Cache
                        </button>
                    </div>
                </div>
            </Dialog>
        </Card>
    );
}
