import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (message, type = 'success') => {
        const id = Math.random().toString(36).slice(2);
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        // Auto-dismiss after 3.5s
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 3500);
    },
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Hook for easy usage
export const useToast = () => {
    const addToast = useToastStore((s) => s.addToast);
    return {
        success: (msg: string) => addToast(msg, 'success'),
        error: (msg: string) => addToast(msg, 'error'),
        info: (msg: string) => addToast(msg, 'info'),
    };
};

const ICONS: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={18} className="text-green-400 shrink-0" />,
    error: <XCircle size={18} className="text-red-400 shrink-0" />,
    info: <Info size={18} className="text-blue-400 shrink-0" />,
};

const BORDER_COLORS: Record<ToastType, string> = {
    success: 'border-green-500/30',
    error: 'border-red-500/30',
    info: 'border-blue-500/30',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    return (
        <div
            className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900/95 backdrop-blur border shadow-2xl shadow-black/60 transition-all duration-300',
                BORDER_COLORS[toast.type],
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
        >
            {ICONS[toast.type]}
            <p className="text-sm font-semibold text-white flex-1">{toast.message}</p>
            <button onClick={onRemove} className="text-zinc-500 hover:text-white transition-colors ml-1">
                <X size={14} />
            </button>
        </div>
    );
}

export function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed top-20 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto w-full max-w-sm">
                    <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
                </div>
            ))}
        </div>
    );
}
