import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, Download } from 'lucide-react';

export default function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: any) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error: Error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 flex items-center justify-between bg-primary text-black p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3">
                {offlineReady ? <Download size={20} /> : <RefreshCw size={20} className="animate-spin" />}
                <div className="text-sm font-bold">
                    {offlineReady ? 'App is ready to work offline' : 'New update available!'}
                </div>
            </div>
            <div className="flex gap-2">
                {needRefresh && (
                    <button
                        onClick={() => updateServiceWorker(true)}
                        className="text-xs font-black bg-black text-primary px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                    >
                        Reload
                    </button>
                )}
                <button
                    onClick={close}
                    className="text-xs font-bold border border-black/20 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
