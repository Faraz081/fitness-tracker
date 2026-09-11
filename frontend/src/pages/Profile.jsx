import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cake, Dumbbell, Edit3, Flag, Globe, Ruler, Scale, User as UserIcon, X, Check } from 'lucide-react';
import * as api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../context/SettingsContext';
import { useDashboardRefresh } from '../context/DashboardContext';
import { Badge, Button, Card } from '../components/ui';
import { ProfileForm, PROFILE_GOAL_LABELS, PROFILE_LEVEL_LABELS } from '../components/profile/ProfileForm';
import { formatWeight, weightUnitLabel } from '../utils/units';

export default function ProfilePage() {
    const { refreshUser } = useAuth();
    const { refreshDashboard } = useDashboardRefresh();
    const { preferences } = useSettings();
    const units = preferences.units;
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [saved, setSaved] = useState(false);
    useEffect(() => {
        let cancelled = false;
        api
            .getProfile()
            .then((p) => {
            if (cancelled)
                return;
            setProfile(p);
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
    function startEdit() {
        setSaved(false);
        setEditing(true);
    }
    function handleSaved(updated) {
        setProfile(updated);
        setSaved(true);
        setEditing(false);
        refreshDashboard();
        void refreshUser();
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
            value: profile.weightKg === null || profile.weightKg === undefined ? '—' : formatWeight(profile.weightKg, units),
            unit: profile.weightKg ? ` ${weightUnitLabel(units)}` : '',
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
                  {PROFILE_GOAL_LABELS[profile.goal] ?? profile.goal}
                </Badge>)}
              {profile.fitnessLevel && (<Badge color="success">
                  <Dumbbell className="h-3 w-3 mr-1"/>
                  {PROFILE_LEVEL_LABELS[profile.fitnessLevel] ?? profile.fitnessLevel}
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
        </div>) : (<ProfileForm
          key={`${profile.id}-${editing ? 'edit' : 'view'}`}
          profile={profile}
          onSaved={handleSaved}
          onCancel={() => setEditing(false)}
        />)}

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-text-muted flex items-center justify-center gap-1.5">
        <Activity className="h-3.5 w-3.5"/>
        Track consistently — your future self will thank you.
      </motion.p>
    </div>);
}