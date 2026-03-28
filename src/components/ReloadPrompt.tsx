import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, RefreshCw } from 'lucide-react';

export default function ReloadPrompt() {
    const [countdown, setCountdown] = useState(3);

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

    useEffect(() => {
        if (!needRefresh) return;

        setCountdown(3);
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    updateServiceWorker(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [needRefresh]);

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
                    {offlineReady
                        ? 'App is ready to work offline'
                        : `Updating in ${countdown}s…`}
                </div>
            </div>
            <div className="flex gap-2">
                {needRefresh && (
                    <button
                        onClick={() => updateServiceWorker(true)}
                        className="text-xs font-black bg-black text-primary px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                    >
                        Now
                    </button>
                )}
                <button
                    onClick={close}
                    className="text-xs font-bold border border-black/20 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
}
