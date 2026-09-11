import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
    const [refreshKey, setRefreshKey] = useState(0);
    const timerRef = useRef(null);

    const refreshDashboard = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setRefreshKey((k) => k + 1);
        }, 100);
    }, []);

    const value = useMemo(() => ({ refreshKey, refreshDashboard }), [refreshKey, refreshDashboard]);

    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardRefresh() {
    const ctx = useContext(DashboardContext);
    if (!ctx) throw new Error('useDashboardRefresh must be used within DashboardProvider');
    return ctx;
}
