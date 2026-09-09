import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cake, Dumbbell, Edit3, Flag, Globe, Pencil, Ruler, Save, Scale, User as UserIcon, X, Check, } from 'lucide-react';
import * as api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Badge, Button, Card, Input, Select } from '../components/ui';
const GOALS = ['lose', 'maintain', 'gain', 'other'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
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
const toProfileState = (p) => ({
    name: p.name,
    bio: p.bio ?? '',
    age: p.age === null ? '' : String(p.age),
    weightKg: p.weightKg === null ? '' : String(p.weightKg),
    heightCm: p.heightCm === null ? '' : String(p.heightCm),
    goal: p.goal ?? '',
    fitnessLevel: p.fitnessLevel ?? '',
    avatarUrl: p.avatarUrl ?? '',
});
function validate(form) {
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
    if (form.weightKg !== '' && (Number(form.weightKg) < 20 || Number(form.weightKg) > 400)) {
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
const goalLabel = {
    lose: 'Lose weight',
    maintain: 'Maintain weight',
    gain: 'Gain muscle',
    other: 'Other',
};
const levelLabel = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
};
export default function ProfilePage() {
    const { refreshUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [pending, setPending] = useState(false);
    const [saved, setSaved] = useState(false);
    useEffect(() => {
        let cancelled = false;
        api
            .getProfile()
            .then((p) => {
            if (cancelled)
                return;
            setProfile(p);
            setForm(toProfileState(p));
        })
            .catch((err) => {
            if (cancelled)
                return;
            setLoadError(err instanceof Error ? err.message : 'Failed to load profile');
        })
            .finally(() => {
            if (!cancelled)
                setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, []);
    if (loading) {
        return (<div className="space-y-4">
        <div className="glass-elevated rounded-3xl p-8 skeleton">
          <div className="h-6 w-1/3 bg-dark-600 rounded mb-3"/>
          <div className="h-4 w-2/3 bg-dark-600 rounded"/>
        </div>
        <div className="h-64 glass-elevated rounded-2xl skeleton"/>
      </div>);
    }
    if (loadError && !profile) {
        return (<Card>
        <p className="text-error">{loadError}</p>
      </Card>);
    }
    if (!profile) {
        return null;
    }
    const setField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setSaved(false);
    };
    function startEdit() {
        if (!profile)
            return;
        setForm(toProfileState(profile));
        setErrors({});
        setSaved(false);
        setEditing(true);
    }
    function cancelEdit() {
        if (!profile)
            return;
        setForm(toProfileState(profile));
        setErrors({});
        setEditing(false);
    }
    async function handleSave(e) {
        e.preventDefault();
        const next = validate(form);
        setErrors(next);
        if (Object.keys(next).length > 0)
            return;
        const patch = {
            name: form.name.trim(),
            bio: form.bio.trim(),
            age: form.age === '' ? undefined : Number(form.age),
            weightKg: form.weightKg === '' ? undefined : Number(form.weightKg),
            heightCm: form.heightCm === '' ? undefined : Number(form.heightCm),
            goal: form.goal === '' ? undefined : form.goal,
            fitnessLevel: form.fitnessLevel === '' ? undefined : form.fitnessLevel,
            avatarUrl: form.avatarUrl.trim() === '' ? null : form.avatarUrl.trim(),
        };
        setPending(true);
        try {
            const updated = await api.updateProfile(patch);
            setProfile(updated);
            setForm(toProfileState(updated));
            setEditing(false);
            setSaved(true);
            await refreshUser();
        }
        catch (err) {
            setErrors({ form: err instanceof Error ? err.message : 'Failed to save profile' });
        }
        finally {
            setPending(false);
        }
    }
    const displayValue = (v) => {
        if (v === null || v === undefined || v === '')
            return '—';
        return String(v);
    };
    const statItems = [
        { icon: Cake, label: 'Age', value: displayValue(profile.age), unit: profile.age ? 'yrs' : '' },
        {
            icon: Scale,
            label: 'Weight',
            value: displayValue(profile.weightKg),
            unit: profile.weightKg ? 'kg' : '',
        },
        {
            icon: Ruler,
            label: 'Height',
            value: displayValue(profile.heightCm),
            unit: profile.heightCm ? 'cm' : '',
        },
    ];
    return (<div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden glass-elevated rounded-3xl p-6 sm:p-8">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl"/>
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-success/5 blur-3xl"/>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {profile.avatarUrl ? (<img src={profile.avatarUrl} alt={profile.name} className="h-20 w-20 rounded-2xl object-cover border-2 border-primary/50 glow"/>) : (<div className="gradient-primary h-20 w-20 rounded-2xl flex items-center justify-center glow-lg shrink-0">
              <UserIcon className="h-10 w-10 text-dark"/>
            </div>)}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight font-display">{profile.name}</h1>
              {profile.goal && (<Badge color="primary">
                  <Flag className="h-3 w-3 mr-1"/>
                  {goalLabel[profile.goal] ?? profile.goal}
                </Badge>)}
              {profile.fitnessLevel && (<Badge color="success">
                  <Dumbbell className="h-3 w-3 mr-1"/>
                  {levelLabel[profile.fitnessLevel] ?? profile.fitnessLevel}
                </Badge>)}
            </div>
            <p className="text-sm text-text-muted mt-1">
              <Globe className="h-3.5 w-3.5 inline mr-1"/>
              {profile.email}
            </p>
            {profile.bio && <p className="text-sm text-text-secondary mt-3">{profile.bio}</p>}
          </div>

          {!editing && (<Button variant="outline" onClick={startEdit} className="shrink-0">
              <Edit3 className="h-4 w-4"/>
              Edit Profile
            </Button>)}
        </div>
      </motion.div>

      {saved && (<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-sm text-success bg-success/10 border border-success/20 rounded-xl p-4">
          <Check className="h-5 w-5 shrink-0"/>
          Profile saved successfully.
        </motion.div>)}

      {errors.form && (<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-sm text-error bg-error/10 border border-error/20 rounded-xl p-4">
          <X className="h-5 w-5 shrink-0"/>
          {errors.form}
        </motion.div>)}

      {!editing ? (<div className="grid grid-cols-3 gap-4">
          {statItems.map((item, i) => (<motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card hover index={i} className="stat-card text-center">
                <div className="h-10 w-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <item.icon className="h-5 w-5 text-primary"/>
                </div>
                <p className="text-2xl font-bold font-display">
                  {item.value}
                  {item.unit && <span className="text-xs text-text-muted font-normal ml-1">{item.unit}</span>}
                </p>
                <p className="text-xs text-text-muted mt-1">{item.label}</p>
              </Card>
            </motion.div>))}
        </div>) : (<Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Pencil className="h-5 w-5 text-primary"/>
            </div>
            <h2 className="text-lg font-bold font-display">Edit your profile</h2>
          </div>

          <form onSubmit={handleSave} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              <Input id="name" label="Name" value={form.name} onChange={(e) => setField('name', e.target.value)} autoComplete="name" error={errors.name}/>
              <Input id="bio" label="Bio" value={form.bio} onChange={(e) => setField('bio', e.target.value)} error={errors.bio}/>
              <Input id="age" label="Age" type="number" inputMode="numeric" placeholder="e.g. 28" value={form.age} onChange={(e) => setField('age', e.target.value)} error={errors.age}/>
              <Input id="weightKg" label="Weight (kg)" type="number" inputMode="decimal" placeholder="e.g. 75" value={form.weightKg} onChange={(e) => setField('weightKg', e.target.value)} error={errors.weightKg}/>
              <Input id="heightCm" label="Height (cm)" type="number" inputMode="decimal" placeholder="e.g. 178" value={form.heightCm} onChange={(e) => setField('heightCm', e.target.value)} error={errors.heightCm}/>
              <Input id="avatarUrl" label="Avatar URL" type="url" placeholder="https://..." value={form.avatarUrl} onChange={(e) => setField('avatarUrl', e.target.value)} error={errors.avatarUrl}/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2">
              <Select id="goal" label="Goal" value={form.goal} onChange={(e) => setField('goal', e.target.value)}>
                <option value="">Select goal…</option>
                {GOALS.map((g) => (<option key={g} value={g}>
                    {goalLabel[g]}
                  </option>))}
              </Select>
              <Select id="fitnessLevel" label="Fitness level" value={form.fitnessLevel} onChange={(e) => setField('fitnessLevel', e.target.value)}>
                <option value="">Select level…</option>
                {LEVELS.map((l) => (<option key={l} value={l}>
                    {levelLabel[l]}
                  </option>))}
              </Select>
            </div>

            <div className="flex gap-3 mt-6">
              <Button type="submit" size="lg" isLoading={pending}>
                {!pending && <Save className="h-4 w-4"/>}
                {pending ? 'Saving…' : 'Save changes'}
              </Button>
              <Button type="button" variant="secondary" size="lg" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>)}

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-text-muted flex items-center justify-center gap-1.5">
        <Activity className="h-3.5 w-3.5"/>
        Track consistently — your future self will thank you.
      </motion.p>
    </div>);
}
