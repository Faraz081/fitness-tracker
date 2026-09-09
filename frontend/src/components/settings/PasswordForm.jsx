import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Save, X } from 'lucide-react';
import * as api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button, Input } from '../ui';

export function PasswordForm() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [pending, setPending] = useState(false);

    function setField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => (field in prev ? omitKey(prev, field) : prev));
    }

    function omitKey(obj, key) {
        const next = { ...obj };
        delete next[key];
        return next;
    }

    function validate() {
        const next = {};
        if (!form.currentPassword) {
            next.currentPassword = 'Current password is required';
        }
        if (form.newPassword.length < 6) {
            next.newPassword = 'New password must be at least 6 characters';
        }
        if (form.confirmPassword !== form.newPassword) {
            next.confirmPassword = 'Passwords do not match';
        }
        return next;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const next = validate();
        setErrors(next);
        if (Object.keys(next).length > 0) return;
        setPending(true);
        try {
            await api.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
            success('Password changed. Please sign in again.');
            await logout();
            navigate('/login', { replace: true });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to change password';
            if (err?.code === 'INVALID_PASSWORD') {
                setErrors({ currentPassword: message });
            }
            else {
                showError(message);
            }
        }
        finally {
            setPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate aria-label="Change password">
            <p aria-live="polite" className="mb-4 text-sm text-[var(--color-ink-soft)]">
                Change your password. Signing in again is required after a change.
            </p>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
                <Input id="pw-current" label="Current password" type="password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => setField('currentPassword', e.target.value)} error={errors.currentPassword} />
                <Input id="pw-new" label="New password" type="password" autoComplete="new-password" value={form.newPassword} onChange={(e) => setField('newPassword', e.target.value)} error={errors.newPassword} />
                <Input id="pw-confirm" label="Confirm new password" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(e) => setField('confirmPassword', e.target.value)} error={errors.confirmPassword} />
            </div>
            <div className="flex items-center gap-3">
                <Button type="submit" isLoading={pending}>
                    {!pending && <KeyRound className="h-4 w-4" />}
                    {pending ? 'Changing…' : 'Change password'}
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setErrors({});
                    }}
                >
                    <X className="h-4 w-4" />
                    Clear
                </Button>
            </div>
        </form>
    );
}