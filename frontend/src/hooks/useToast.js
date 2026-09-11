import { useCallback, useRef, useState } from 'react';

export function useToast() {
    const [toasts, setToasts] = useState([]);
    const counterRef = useRef(0);
    const timers = useRef({});

    const dismiss = useCallback((id) => {
        clearTimeout(timers.current[id]?.timeoutId);
        delete timers.current[id];
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const pause = useCallback((id) => {
        const timer = timers.current[id];
        if (!timer) return;
        clearTimeout(timer.timeoutId);
        timer.elapsed += Date.now() - timer.startedAt;
        timers.current[id] = { ...timer, timeoutId: null };
    }, []);

    const resume = useCallback((id) => {
        const timer = timers.current[id];
        if (!timer || timer.timeoutId !== null) return;
        timer.startedAt = Date.now();
        const remaining = Math.max(0, timer.duration - timer.elapsed);
        timer.timeoutId = remaining > 0 ? setTimeout(() => dismiss(id), remaining) : null;
        timers.current[id] = timer;
    }, [dismiss]);

    const show = useCallback((type, message, options) => {
        const id = `toast-${Date.now()}-${counterRef.current++}`;
        const duration = options?.duration ?? 4000;
        const startedAt = Date.now();
        const timeoutId = setTimeout(() => dismiss(id), duration);
        timers.current[id] = { duration, elapsed: 0, startedAt, timeoutId };
        setToasts((prev) => [...prev, { id, type, message }]);
        return id;
    }, [dismiss]);

    const success = useCallback((message, options) => show('success', message, options), [show]);
    const error = useCallback((message, options) => show('error', message, options), [show]);
    const warning = useCallback((message, options) => show('warning', message, options), [show]);
    const info = useCallback((message, options) => show('info', message, options), [show]);

    return { toasts, dismiss, show, success, error, warning, info, pause, resume };
}