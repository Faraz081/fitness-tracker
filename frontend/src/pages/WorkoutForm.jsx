import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Dumbbell, Plus, Save, Trash2, X, Activity, TrendingUp, Target, ClipboardList, } from 'lucide-react';
import * as api from '../services/api';
import { Button, Input, Select } from '../components/ui';
const CATEGORIES = [
    { value: 'strength', label: 'Strength', icon: Dumbbell },
    { value: 'cardio', label: 'Cardio', icon: Activity },
    { value: 'flexibility', label: 'Flexibility', icon: TrendingUp },
    { value: 'hybrid', label: 'Hybrid', icon: Target },
    { value: 'other', label: 'Other', icon: Dumbbell },
];
const emptyRow = () => ({
    name: '',
    sets: '1',
    reps: '1',
    weightKg: '',
    notes: '',
    restTimeSec: '',
});
const toDateInput = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};
const toRows = (exercises) => exercises.map((ex) => ({
    name: ex.name,
    sets: String(ex.sets),
    reps: String(ex.reps),
    weightKg: ex.weightKg === null ? '' : String(ex.weightKg),
    notes: ex.notes ?? '',
    restTimeSec: ex.restTimeSec === null ? '' : String(ex.restTimeSec),
}));
export default function WorkoutForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [notes, setNotes] = useState('');
    const [exercises, setExercises] = useState([emptyRow()]);
    const [errors, setErrors] = useState({});
    const [pending, setPending] = useState(false);
    const [loading, setLoading] = useState(isEdit);
    const [loadError, setLoadError] = useState(null);
    useEffect(() => {
        if (!isEdit)
            return;
        let cancelled = false;
        api
            .getWorkout(id)
            .then((w) => {
            if (cancelled)
                return;
            setTitle(w.title);
            setCategory(w.category);
            setDate(toDateInput(w.date));
            setNotes(w.notes ?? '');
            setExercises(toRows(w.exercises).length > 0 ? toRows(w.exercises) : [emptyRow()]);
        })
            .catch((err) => {
            if (cancelled)
                return;
            setLoadError(err instanceof Error ? err.message : 'Failed to load workout');
        })
            .finally(() => {
            if (!cancelled)
                setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [id, isEdit]);
    function updateRow(index, field, value) {
        setExercises((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    }
    function addRow() {
        setExercises((prev) => [...prev, emptyRow()]);
    }
    function removeRow(index) {
        setExercises((prev) => prev.filter((_, i) => i !== index));
    }
    function validate() {
        const next = {};
        if (!title.trim()) {
            next.title = 'Title is required';
        }
        else if (title.trim().length > 100) {
            next.title = 'Title must be 100 characters or fewer';
        }
        if (!category.toString()) {
            next.category = 'Category is required';
        }
        for (const row of exercises) {
            if (!row.name.trim()) {
                next.exercises = 'Every exercise needs a name';
                break;
            }
            if (!/^\d+$/.test(row.sets) || Number(row.sets) < 1 || Number(row.sets) > 50) {
                next.exercises = 'Sets must be between 1 and 50';
                break;
            }
            if (!/^\d+$/.test(row.reps) || Number(row.reps) < 1 || Number(row.reps) > 500) {
                next.exercises = 'Reps must be between 1 and 500';
                break;
            }
            if (row.weightKg !== '' && Number(row.weightKg) < 0) {
                next.exercises = 'Weight cannot be negative';
                break;
            }
            if (row.restTimeSec !== '' && (Number(row.restTimeSec) < 0 || Number(row.restTimeSec) > 600)) {
                next.exercises = 'Rest time must be between 0 and 600 seconds';
                break;
            }
        }
        if (date && Number.isNaN(new Date(`${date}T00:00:00`).getTime())) {
            next.form = 'Invalid date';
        }
        return next;
    }
    async function handleSubmit(e) {
        e.preventDefault();
        const next = validate();
        setErrors(next);
        if (Object.keys(next).length > 0)
            return;
        const exercisePayload = exercises.map((row) => ({
            name: row.name.trim(),
            sets: Number(row.sets),
            reps: Number(row.reps),
            weightKg: row.weightKg === '' ? undefined : Number(row.weightKg),
            notes: row.notes.trim() === '' ? undefined : row.notes.trim(),
            restTimeSec: row.restTimeSec === '' ? undefined : Number(row.restTimeSec),
        }));
        const payload = {
            title: title.trim(),
            category: category,
            date: date === '' ? undefined : `${date}T00:00:00.000Z`,
            notes: notes.trim() === '' ? undefined : notes.trim(),
            exercises: exercisePayload,
        };
        setPending(true);
        try {
            if (isEdit) {
                await api.updateWorkout(id, payload);
            }
            else {
                await api.createWorkout(payload);
            }
            navigate('/workouts');
        }
        catch (err) {
            setErrors({ form: err instanceof Error ? err.message : 'Failed to save workout' });
        }
        finally {
            setPending(false);
        }
    }
    if (loading) {
        return (<div className="space-y-4">
        <div className="h-8 w-1/3 skeleton rounded"/>
        <div className="glass-elevated rounded-2xl p-6 space-y-4">
          <div className="h-10 w-full skeleton rounded-xl"/>
          <div className="h-10 w-full skeleton rounded-xl"/>
          <div className="h-10 w-full skeleton rounded-xl"/>
        </div>
        <div className="glass-elevated rounded-2xl p-6 space-y-4">
          <div className="h-10 w-full skeleton rounded-xl"/>
          <div className="h-10 w-full skeleton rounded-xl"/>
        </div>
      </div>);
    }
    if (loadError) {
        return (<div className="glass-elevated rounded-2xl p-8 text-center">
        <div className="h-12 w-12 mx-auto rounded-xl bg-error/10 flex items-center justify-center mb-4">
          <X className="h-6 w-6 text-error"/>
        </div>
        <p className="text-error mb-4">{loadError}</p>
        <Link to="/workouts" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-dark font-semibold text-sm">
          <ArrowLeft className="h-4 w-4"/>
          Back to workouts
        </Link>
      </div>);
    }
    return (<div>
      <Link to="/workouts" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors mb-4">
        <ArrowLeft className="h-4 w-4"/>
        Back to workouts
      </Link>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="gradient-primary h-10 w-10 rounded-xl flex items-center justify-center glow shrink-0">
          <Dumbbell className="h-5 w-5 text-dark"/>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {isEdit ? <>Edit <span className="text-gradient">Workout</span></> : <>New <span className="text-gradient">Workout</span></>}
          </h1>
          <p className="text-sm text-text-muted">
            {isEdit ? 'Update your workout details' : 'Log your training session'}
          </p>
        </div>
      </motion.div>

      {errors.form && (<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-sm text-error bg-error/10 border border-error/30 rounded-xl p-3">
          {errors.form}
        </motion.div>)}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Basic info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-elevated rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
            Session Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <div className="sm:col-span-2">
              <Input id="title" label="Workout title" placeholder="e.g. Push Day, Upper Body, Morning Run" icon={<ClipboardList className="h-4 w-4"/>} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} error={errors.title}/>
            </div>
            <Select id="category" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} error={errors.category}>
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>
                  {c.label}
                </option>))}
            </Select>
            <Input id="date" label="Date" type="date" icon={<Calendar className="h-4 w-4"/>} value={date} onChange={(e) => setDate(e.target.value)}/>
            <div className="sm:col-span-2">
              <Input id="notes" label="Notes (optional)" placeholder="How did it feel? Any observations?" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000}/>
            </div>
          </div>
        </motion.div>

        {/* Exercises */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-elevated rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">
              Exercises
            </h2>
            <span className="text-xs text-text-muted">
              {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
            </span>
          </div>

          {errors.exercises && (<motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-error mb-3 bg-error/10 border border-error/30 rounded-lg p-2">
              {errors.exercises}
            </motion.p>)}

          <div className="space-y-4">
            <AnimatePresence>
              {exercises.map((row, index) => (<motion.div key={index} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }} transition={{ duration: 0.2 }} className="bg-dark-700/40 rounded-xl p-4 border border-dark-400/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-primary-10 flex items-center justify-center">
                        <Dumbbell className="h-3.5 w-3.5 text-primary"/>
                      </div>
                      <span className="text-xs font-semibold text-text-secondary">
                        Exercise {index + 1}
                      </span>
                    </div>
                    <button type="button" onClick={() => removeRow(index)} disabled={exercises.length === 1} className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                      <Trash2 className="h-4 w-4"/>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="col-span-2 sm:col-span-4">
                      <Input id={`ex-name-${index}`} label="Exercise name" placeholder="e.g. Bench Press, Squat, Deadlift" icon={<Dumbbell className="h-4 w-4"/>} value={row.name} onChange={(e) => updateRow(index, 'name', e.target.value)} maxLength={100}/>
                    </div>
                    <div>
                      <Input id={`ex-sets-${index}`} label="Sets" type="number" inputMode="numeric" placeholder="3" value={row.sets} onChange={(e) => updateRow(index, 'sets', e.target.value)}/>
                    </div>
                    <div>
                      <Input id={`ex-reps-${index}`} label="Reps" type="number" inputMode="numeric" placeholder="12" value={row.reps} onChange={(e) => updateRow(index, 'reps', e.target.value)}/>
                    </div>
                    <div>
                      <Input id={`ex-weight-${index}`} label="Weight (kg)" type="number" inputMode="decimal" placeholder="60" value={row.weightKg} onChange={(e) => updateRow(index, 'weightKg', e.target.value)}/>
                    </div>
                    <div>
                      <Input id={`ex-rest-${index}`} label="Rest (sec)" type="number" inputMode="numeric" placeholder="60" value={row.restTimeSec} onChange={(e) => updateRow(index, 'restTimeSec', e.target.value)}/>
                    </div>
                    <div className="col-span-2 sm:col-span-4">
                      <Input id={`ex-notes-${index}`} label="Notes (optional)" placeholder="Form cues, intensity, etc." value={row.notes} onChange={(e) => updateRow(index, 'notes', e.target.value)} maxLength={500}/>
                    </div>
                  </div>
                </motion.div>))}
            </AnimatePresence>
          </div>

          <button type="button" onClick={addRow} className="mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-dark-400 text-sm text-text-secondary hover:text-primary hover:border-primary/40 transition-colors cursor-pointer">
            <Plus className="h-4 w-4"/>
            Add exercise
          </button>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col sm:flex-row gap-3">
          <Button type="submit" size="lg" isLoading={pending} className="flex-1">
            {!pending && <Save className="h-4 w-4"/>}
            {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create workout'}
          </Button>
          <Link to="/workouts" className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-dark-600 border border-dark-400 text-sm font-semibold text-text-secondary hover:text-white hover:bg-dark-500 transition-all">
            Cancel
          </Link>
        </motion.div>
      </form>
    </div>);
}
