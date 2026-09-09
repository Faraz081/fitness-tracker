import { useRef, useState } from 'react';
import { Check, Save, X } from 'lucide-react';
import * as api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { Button, Card, Input, Select } from '../ui';
import { toKg } from '../../utils/units';

const GOALS = ['lose', 'maintain', 'gain', 'other'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

const goalLabel = {
    lose: 'Lose weight',
    maintain: 'Maintain weight',
    gain: 'Gain muscle',
    other: 'Other',
};

export const PROFILE_GOAL_LABELS = goalLabel;

const levelLabel = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
};

export const PROFILE_LEVEL_LABELS = levelLabel;

const emptyForm = {
    name: '',
    bio: '',
    age: '',
    weightKg: '',
    heightCm: '',
    goal: '',
    fitnessLevel: '',
    avatarUrl: '',
};

const toForm = (p) => ({
    name: p.name ?? '',
    bio: p.bio ?? '',
    age: p.age === null || p.age === undefined ? '' : String(p.age),
    weightKg: p.weightKg === null || p.weightKg === undefined ? '' : String(p.weightKg),
    heightCm: p.heightCm === null || p.heightCm === undefined ? '' : String(p.heightCm),
    goal: p.goal ?? '',
    fitnessLevel: p.fitnessLevel ?? '',
    avatarUrl: p.avatarUrl ?? '',
});

function validate(form, units) {
    const errors = {};
    if (!form.name.trim()) {
        errors.name = 'Name is required';
    }
    else if (form.name.trim().length > 100) {
        errors.name = 'Name must be 100 characters or fewer';
    }
    if (form.bio.length > 500) {
        errors.bio = 'Bio must be 500 characters or fewer';
    }
    if (form.age !== '' && (Number(form.age) < 13 || Number(form.age) > 120)) {
        errors.age = 'Age must be between 13 and 120';
    }
    const weightKg = form.weightKg === '' ? '' : Number(toKg(form.weightKg, units));
    if (weightKg !== '' && (weightKg < 20 || weightKg > 400)) {
        errors.weightKg = 'Weight must be between 20 and 400 kg';
    }
    if (form.heightCm !== '' && (Number(form.heightCm) < 60 || Number(form.heightCm) > 280)) {
        errors.heightCm = 'Height must be between 60 and 280 cm';
    }
    if (form.avatarUrl !== '' && !/^https?:\/\/.+/i.test(form.avatarUrl)) {
        errors.avatarUrl = 'Avatar URL must be a valid http(s) URL';
    }
    return errors;
}

export function ProfileForm({ profile, onSaved, onCancel }) {
    const { preferences } = useSettings();
    const units = preferences.units;
    const [form, setForm] = useState(() => toForm(profile));
    const [errors, setErrors] = useState({});
    const [pending, setPending] = useState(false);
    const [formError, setFormError] = useState(null);
    const [saved, setSaved] = useState(false);
    const formErrorRef = useRef(null);

    const setField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setSaved(false);
        setErrors((prev) => (field in prev ? omitKey(prev, field) : prev));
    };

    function omitKey(obj, key) {
        const next = { ...obj };
        delete next[key];
        return next;
    }

    function reset() {
        setForm(toForm(profile));
        setErrors({});
        setFormError(null);
        setSaved(false);
    }

    function handleCancel() {
        reset();
        if (onCancel) onCancel();
    }

    async function handleSave(event) {
        event.preventDefault();
        const next = validate(form, units);
        setErrors(next);
        if (Object.keys(next).length > 0) return;
        const patch = {
            name: form.name.trim(),
            bio: form.bio.trim(),
            age: form.age === '' ? undefined : Number(form.age),
            weightKg: form.weightKg === '' ? undefined : Number(toKg(form.weightKg, units)),
            heightCm: form.heightCm === '' ? undefined : Number(form.heightCm),
            goal: form.goal === '' ? undefined : form.goal,
            fitnessLevel: form.fitnessLevel === '' ? undefined : form.fitnessLevel,
            avatarUrl: form.avatarUrl.trim() === '' ? null : form.avatarUrl.trim(),
        };
        setPending(true);
        setFormError(null);
        try {
            const updated = await api.updateProfile(patch);
            setForm(toForm(updated));
            setSaved(true);
            if (onSaved) onSaved(updated);
        }
        catch (err) {
            setFormError(err instanceof Error ? err.message : 'Failed to save profile');
        }
        finally {
            setPending(false);
        }
    }

    return (
        <Card>
            <form onSubmit={handleSave} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    <Input id="p-name" label="Name" value={form.name} onChange={(e) => setField('name', e.target.value)} autoComplete="name" error={errors.name} />
                    <Input id="p-bio" label="Bio" value={form.bio} onChange={(e) => setField('bio', e.target.value)} error={errors.bio} />
                    <Input id="p-age" label="Age" type="number" inputMode="numeric" placeholder="e.g. 28" value={form.age} onChange={(e) => setField('age', e.target.value)} error={errors.age} />
                    <Input id="p-weight" label={`Weight (${units})`} type="number" inputMode="decimal" placeholder={units === 'lb' ? 'e.g. 165' : 'e.g. 75'} value={form.weightKg} onChange={(e) => setField('weightKg', e.target.value)} error={errors.weightKg} />
                    <Input id="p-height" label="Height (cm)" type="number" inputMode="decimal" placeholder="e.g. 178" value={form.heightCm} onChange={(e) => setField('heightCm', e.target.value)} error={errors.heightCm} />
                    <Input id="p-avatar" label="Avatar URL" type="url" placeholder="https://..." value={form.avatarUrl} onChange={(e) => setField('avatarUrl', e.target.value)} error={errors.avatarUrl} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2">
                    <Select id="p-goal" label="Goal" value={form.goal} onChange={(e) => setField('goal', e.target.value)}>
                        <option value="">Select goal…</option>
                        {GOALS.map((g) => (
                            <option key={g} value={g}>
                                {goalLabel[g]}
                            </option>
                        ))}
                    </Select>
                    <Select id="p-level" label="Fitness level" value={form.fitnessLevel} onChange={(e) => setField('fitnessLevel', e.target.value)}>
                        <option value="">Select level…</option>
                        {LEVELS.map((l) => (
                            <option key={l} value={l}>
                                {levelLabel[l]}
                            </option>
                        ))}
                    </Select>
                </div>

                {formError && (
                    <div role="alert" className="mt-4 flex items-center gap-3 text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-xl p-4">
                        <X className="h-5 w-5 shrink-0" />
                        <span ref={formErrorRef}>{formError}</span>
                    </div>
                )}

                {saved && (
                    <div role="status" aria-live="polite" className="mt-4 flex items-center gap-3 text-sm text-[var(--color-success)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 rounded-xl p-4">
                        <Check className="h-5 w-5 shrink-0" />
                        Profile saved successfully.
                    </div>
                )}

                <div className="flex gap-3 mt-6">
                    <Button type="submit" size="lg" isLoading={pending}>
                        {!pending && <Save className="h-4 w-4" />}
                        {pending ? 'Saving…' : 'Save changes'}
                    </Button>
                    <Button type="button" variant="secondary" size="lg" onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Card>
    );
}