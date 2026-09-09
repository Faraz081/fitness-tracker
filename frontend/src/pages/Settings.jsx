import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, LogOut } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { SettingsSections } from '../components/settings/SettingsSections';
import { PreferencesForm } from '../components/settings/PreferencesForm';
import { PasswordForm } from '../components/settings/PasswordForm';
import { DeleteAccountModal } from '../components/settings/DeleteAccountModal';
import { ProfileForm } from '../components/profile/ProfileForm';
import { NotificationSettings } from '../components/notifications/NotificationSettings';
import { useNotifications } from '../context/NotificationsContext';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui';
import * as api from '../services/api';

function PageHeading() {
    const dateLabel = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    return (
        <div>
            <p className="text-sm text-[var(--color-ink-muted)]">{dateLabel}</p>
            <h1 className="mt-1 dash-num text-2xl sm:text-3xl text-[var(--color-ink)]">Settings</h1>
        </div>
    );
}

export default function Settings() {
    const { success } = useToast();
    const { user, logout } = useAuth();
    const notifications = useNotifications();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let cancelled = false;
        api.getProfile()
            .then((p) => {
                if (!cancelled) setProfile(p);
            })
            .catch((err) => {
                if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load profile');
            });
        return () => {
            cancelled = true;
        };
    }, []);

    function handleProfileSaved(updated) {
        setProfile(updated);
        success('Profile saved successfully.');
    }

    async function handleLogout() {
        setLoggingOut(true);
        try {
            await logout();
            navigate('/login', { replace: true });
        }
        finally {
            setLoggingOut(false);
        }
    }

    async function handleDeleteAccount() {
        setDeleting(true);
        try {
            await api.deleteAccount({ email: user?.email ?? profile?.email ?? '' });
            await logout();
            navigate('/login', { replace: true });
        }
        finally {
            setDeleting(false);
            setDeleteOpen(false);
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeading />
                <SettingsSections heading="Profile" description="Your personal details. The email cannot be changed.">
                    {loadError && !profile && <p className="text-sm text-[var(--color-error)]">{loadError}</p>}
                    {profile && <ProfileForm key={profile.id} profile={profile} onSaved={handleProfileSaved} />}
                </SettingsSections>
                <SettingsSections heading="Preferences" description="Weight units and theme apply across the entire app.">
                    <PreferencesForm />
                </SettingsSections>
                <SettingsSections heading="Notifications" description="Choose which reminders you receive. These sync with the Notifications page.">
                    <NotificationSettings
                        settings={notifications.settings}
                        onChangeType={notifications.toggleType}
                        onToggleMute={notifications.setMuted}
                    />
                </SettingsSections>
                <SettingsSections heading="Account" description="Security and sign-in options.">
                    <PasswordForm />
                    <div className="mt-6 border-t border-[var(--color-line)] pt-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-[var(--color-ink)]">Sign out</p>
                                <p className="text-xs text-[var(--color-ink-muted)]">Ends this session on all devices using this browser.</p>
                            </div>
                            <Button variant="secondary" onClick={() => void handleLogout()} isLoading={loggingOut}>
                                {!loggingOut && <LogOut className="h-4 w-4" />}
                                {loggingOut ? 'Signing out…' : 'Logout'}
                            </Button>
                        </div>
                    </div>
                </SettingsSections>
                <SettingsSections heading="Danger Zone" description="Destructive actions. These cannot be undone." danger>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-[var(--color-ink)]">Delete account</p>
                            <p className="text-xs text-[var(--color-ink-muted)]">Permanently removes your account and all of your data.</p>
                        </div>
                        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                            <AlertTriangle className="h-4 w-4" />
                            Delete my account
                        </Button>
                    </div>
                </SettingsSections>
                <DeleteAccountModal
                    isOpen={deleteOpen}
                    onClose={() => setDeleteOpen(false)}
                    userEmail={user?.email ?? profile?.email}
                    onDelete={handleDeleteAccount}
                    pending={deleting}
                />
            </div>
        </DashboardLayout>
    );
}