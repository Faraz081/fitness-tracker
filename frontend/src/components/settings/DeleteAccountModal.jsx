import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button, Input, Modal } from '../ui';

export function DeleteAccountModal({ isOpen, onClose, userEmail, onDelete, pending }) {
    const [step, setStep] = useState(1);
    const [confirmation, setConfirmation] = useState('');
    const [error, setError] = useState(null);
    const modalRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        setStep(1);
        setConfirmation('');
        setError(null);
        const timer = setTimeout(() => {
            modalRef.current?.querySelector('button')?.focus();
        }, 50);
        return () => clearTimeout(timer);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && step === 2) {
            const timer = setTimeout(() => document.getElementById('dc-email')?.focus(), 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen, step]);

    useEffect(() => {
        if (!isOpen) return;
        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                onClose();
                return;
            }
            if (event.key !== 'Tab' || !modalRef.current) return;
            const focusables = modalRef.current.querySelectorAll('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])');
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            }
            else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const exactMatch = confirmation.trim().toLowerCase() === String(userEmail || '').trim().toLowerCase();

    async function handleFinalConfirm() {
        setError(null);
        if (!exactMatch) {
            setError('The email you typed does not match your account.');
            return;
        }
        try {
            await onDelete();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete account');
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Delete account">
            <div ref={modalRef} role="dialog" aria-modal="true" aria-label="Delete account confirmation">
                <p aria-live="polite" className="text-sm text-[var(--color-ink-soft)]">
                    {step === 1
                        ? 'This permanently deletes your account, workouts, nutrition entries, notifications, preferences and settings. This action cannot be undone.'
                        : `Type your email (${userEmail}) below to confirm deletion.`}
                </p>

                {step === 1 ? (
                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-[var(--color-error)]/25 bg-[var(--color-error)]/10 p-4">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-error)]" />
                        <div className="text-sm text-[var(--color-ink-soft)]">
                            <p className="font-semibold text-[var(--color-error)]">Irreversible</p>
                            <p className="mt-1">All your data is erased immediately. There is no recovery.</p>
                        </div>
                    </div>
                ) : (
                    <Input
                        id="dc-email"
                        label="Confirm email"
                        type="text"
                        autoComplete="off"
                        value={confirmation}
                        onChange={(e) => {
                            setConfirmation(e.target.value);
                            setError(null);
                        }}
                        error={error}
                        placeholder={userEmail}
                    />
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    {step === 1 ? (
                        <Button type="button" variant="danger" onClick={() => setStep(2)}>
                            Continue
                        </Button>
                    ) : (
                        <Button type="button" variant="danger" onClick={() => void handleFinalConfirm()} disabled={!exactMatch || Boolean(pending)} isLoading={pending}>
                            {!pending && <Trash2 className="h-4 w-4" />}
                            {pending ? 'Deleting…' : 'Delete my account'}
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
}