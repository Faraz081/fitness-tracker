import { useCallback, useRef, useState } from 'react';
export function useToast() {
    const [toasts, setToasts] = useState([]);
    const counterRef = useRef(0);
    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
    const show = useCallback((type, message, options) => {
        const id = `toast-${Date.now()}-${counterRef.current++}`;
        setToasts((prev) => [...prev, { id, type, message }]);
        const duration = options?.duration ?? 4000;
        setTimeout(() => dismiss(id), duration);
        return id;
    }, [dismiss]);
    const success = useCallback((message, options) => show('success', message, options), [show]);
    const error = useCallback((message, options) => show('error', message, options), [show]);
    const warning = useCallback((message, options) => show('warning', message, options), [show]);
    const info = useCallback((message, options) => show('info', message, options), [show]);
    return { toasts, dismiss, show, success, error, warning, info };
}
