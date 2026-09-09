import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const SettingsContext = createContext(null);

const DEFAULT_PREFERENCES = { units: 'kg', theme: 'dark' };

export function SettingsProvider({ children }) {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            setPreferences(DEFAULT_PREFERENCES);
            setLoading(false);
            setError(null);
            return;
        }
        let cancelled = false;
        setLoading(true);
        api.getPreferences()
            .then(({ preferences: next }) => {
                if (cancelled) return;
                setPreferences(next ?? DEFAULT_PREFERENCES);
                setError(null);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err instanceof Error ? err.message : 'Failed to load preferences');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [user]);

    useEffect(() => {
        document.documentElement.dataset.theme = preferences.theme;
    }, [preferences.theme]);

    const applyPatch = useCallback(
        async (patch) => {
            const previous = preferences;
            setPreferences((prev) => ({ ...prev, ...patch }));
            try {
                const { preferences: next } = await api.updatePreferences(patch);
                setPreferences(next);
                setError(null);
                return next;
            }
            catch (err) {
                setPreferences(previous);
                setError(err instanceof Error ? err.message : 'Failed to save preferences');
                throw err;
            }
        },
        [preferences],
    );

    const updateUnits = useCallback(async (units) => applyPatch({ units }), [applyPatch]);
    const updateTheme = useCallback(async (theme) => applyPatch({ theme }), [applyPatch]);

    const value = useMemo(
        () => ({ preferences, loading, error, updateUnits, updateTheme }),
        [preferences, loading, error, updateUnits, updateTheme],
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}