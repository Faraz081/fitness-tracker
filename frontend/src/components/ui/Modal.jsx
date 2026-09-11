import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useId, useEffect, useRef } from 'react';

function getFocusableElements(container) {
    return Array.from(
        container.querySelectorAll(
            'button, [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
    );
}

export function Modal({ isOpen, onClose, title, children, className = '' }) {
    const titleId = useId();
    const panelRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !panelRef.current) return;

        const panel = panelRef.current;

        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onClose();
                return;
            }
            if (e.key !== 'Tab') return;
            const focusable = getFocusableElements(panel);
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        }

        panel.addEventListener('keydown', handleKeyDown);
        const timer = setTimeout(() => {
            const first = getFocusableElements(panel)[0];
            first?.focus();
        }, 50);
        return () => { panel.removeEventListener('keydown', handleKeyDown); clearTimeout(timer); };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    <motion.div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? titleId : undefined}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto card-base shadow-xl ${className}`}
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                            {title && <h2 id={titleId} className="text-lg font-bold">{title}</h2>}
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg text-dark-200 hover:text-white hover:bg-dark-600 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                                aria-label="Close dialog"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-5">{children}</div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}