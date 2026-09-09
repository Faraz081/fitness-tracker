import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './ui';
import { Sidebar } from './layout/Sidebar';

export default function Layout() {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toasts, dismiss } = useToast();

    return (
        <div className="dashboard-body min-h-screen">
            {user && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
            <div className={user ? 'lg:pl-64' : ''}>
                {user && (
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="fixed left-4 top-4 z-20 rounded-lg bg-panel p-2 text-ink-soft shadow-lg hover:bg-line lg:hidden"
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                )}
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </div>
    );
}