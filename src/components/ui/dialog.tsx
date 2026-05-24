import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface DialogProps {
    open: boolean;
    title: string;
    children: ReactNode;
    onClose?: () => void;
    className?: string;
    panelClassName?: string;
    closeOnOverlay?: boolean;
}

export function Dialog({
    open,
    title,
    children,
    onClose,
    className,
    panelClassName,
    closeOnOverlay = true,
}: DialogProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const titleId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-dialog-title`;

    useEffect(() => {
        if (!open) return;

        previousFocusRef.current = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            firstFocusable?.focus();
        });

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose?.();
                return;
            }
            if (event.key !== 'Tab') return;

            const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (!focusable || focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
            previousFocusRef.current?.focus();
        };
    }, [onClose, open]);

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn('fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6 animate-in fade-in duration-200', className)}
            onMouseDown={(event) => {
                if (closeOnOverlay && event.target === event.currentTarget) onClose?.();
            }}
        >
            <div
                ref={panelRef}
                className={cn('bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4 animate-in zoom-in-95 duration-200', panelClassName)}
            >
                <h2 id={titleId} className="sr-only">{title}</h2>
                {children}
            </div>
        </div>
    );
}

