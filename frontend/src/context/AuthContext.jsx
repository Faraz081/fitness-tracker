import { createContext, useCallback, useContext, useEffect, useMemo, useState, } from 'react';
import * as api from '../services/api';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const refreshUser = useCallback(async () => {
        try {
            const current = await api.getMe();
            setUser(current);
        }
        catch {
            setUser(null);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        void refreshUser();
    }, [refreshUser]);
    const login = useCallback(async (email, password) => {
        const result = await api.login(email, password);
        setUser(result.user);
    }, []);
    const register = useCallback(async (name, email, password) => {
        await api.register(name, email, password);
    }, []);
    const logout = useCallback(async () => {
        try {
            await api.logout();
        }
        finally {
            setUser(null);
            setLoading(false);
        }
    }, []);
    const value = useMemo(() => ({ user, loading, login, register, refreshUser, logout }), [user, loading, login, register, refreshUser, logout]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}
