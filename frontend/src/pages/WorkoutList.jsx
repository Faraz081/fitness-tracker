import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Calendar, Clock, Dumbbell, Edit3, Plus, Trash2, TrendingUp, } from 'lucide-react';
import * as api from '../services/api';
import { Badge, Button, ListSkeleton } from '../components/ui';
function formatDate(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return iso;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
const CATEGORY_META = {
    strength: { icon: Dumbbell, color: 'primary', label: 'Strength' },
    cardio: { icon: Activity, color: 'success', label: 'Cardio' },
    flexibility: { icon: TrendingUp, color: 'warning', label: 'Flexibility' },
    hybrid: { icon: Activity, color: 'error', label: 'Hybrid' },
    other: { icon: Dumbbell, color: 'neutral', label: 'Other' },
};
export default function WorkoutList() {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.listWorkouts();
            const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setWorkouts(sorted);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load workouts');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        void load();
    }, [load]);
    async function handleDelete(id) {
        if (deletingId)
            return;
        setDeletingId(id);
        setError(null);
        try {
            await api.deleteWorkout(id);
            setWorkouts((prev) => prev.filter((w) => w.id !== id));
            setConfirmId(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete workout');
        }
        finally {
            setDeletingId(null);
        }
    }
    return (<div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
            Your <span className="text-gradient">Workouts</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">Track your training sessions</p>
        </div>
        <Link to="/workouts/new" className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm">
          <Plus className="h-4 w-4"/>
          <span className="hidden sm:inline">New Workout</span>
          <span className="sm:hidden">New</span>
        </Link>
      </motion.div>

      {error && (<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-sm text-error bg-error/10 border border-error/20 rounded-xl p-4">
          {error}
        </motion.div>)}

      {loading ? (<ListSkeleton count={4}/>) : workouts.length === 0 ? (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-elevated rounded-3xl p-8 text-center">
          <div className="h-20 w-20 mx-auto rounded-2xl bg-dark-700 flex items-center justify-center mb-5">
            <Dumbbell className="h-10 w-10 text-primary"/>
          </div>
          <h3 className="text-xl font-bold mb-2 font-display">No workouts yet</h3>
          <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
            Time to crush your first session! Log a workout to start building your training history.
          </p>
          <Link to="/workouts/new" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
            <Plus className="h-4 w-4"/>
            Create your first workout
          </Link>
        </motion.div>) : (<motion.div initial="hidden" animate="show" variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06 } },
            }} className="space-y-3">
          {workouts.map((w) => {
                const meta = CATEGORY_META[w.category] ?? CATEGORY_META.other;
                const Icon = meta.icon;
                return (<motion.div key={w.id} variants={{
                        hidden: { opacity: 0, y: 16 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                    }} whileHover={{ y: -2 }} className="glass-elevated rounded-2xl p-4 sm:p-5 hover:bg-dark-700 transition-all duration-200 group">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-dark-700 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <Icon className="h-6 w-6 text-primary"/>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <Link to={`/workouts/${w.id}/edit`} className="font-semibold text-base sm:text-lg text-white hover:text-primary transition-colors line-clamp-1">
                          {w.title}
                        </Link>
                        <div className="flex items-center gap-2 flex-wrap mt-1.5">
                          <Badge color={meta.color}>{meta.label}</Badge>
                          <span className="flex items-center gap-1 text-xs text-text-muted">
                            <Calendar className="h-3 w-3"/>
                            {formatDate(w.date)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-text-muted">
                            <Dumbbell className="h-3 w-3"/>
                            {w.exercises.length} {w.exercises.length === 1 ? 'exercise' : 'exercises'}
                          </span>
                          {w.exercises[0]?.restTimeSec != null && (<span className="flex items-center gap-1 text-xs text-text-muted">
                              <Clock className="h-3 w-3"/>
                              {w.exercises[0].restTimeSec}s rest
                            </span>)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link to={`/workouts/${w.id}/edit`} className="p-2.5 rounded-lg text-text-muted hover:text-primary hover:bg-dark-600 transition-colors cursor-pointer" title="Edit workout">
                          <Edit3 className="h-4 w-4"/>
                        </Link>

                        {confirmId === w.id ? (<div className="flex items-center gap-2">
                            <Button variant="danger" size="sm" onClick={() => handleDelete(w.id)} isLoading={deletingId === w.id}>
                              {deletingId === w.id ? 'Deleting…' : 'Confirm'}
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => setConfirmId(null)}>
                              Cancel
                            </Button>
                          </div>) : (<button type="button" onClick={() => setConfirmId(w.id)} className="p-2.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer" title="Delete workout">
                            <Trash2 className="h-4 w-4"/>
                          </button>)}
                      </div>
                    </div>

                    {w.notes && <p className="text-sm text-text-muted mt-2 line-clamp-2">{w.notes}</p>}

                    {w.exercises.length > 0 && (<div className="flex items-center gap-2 flex-wrap mt-3">
                        {w.exercises.slice(0, 3).map((ex, i) => (<span key={i} className="text-xs bg-dark-700 text-text-secondary px-2.5 py-1 rounded-lg border border-white/5">
                            {ex.name}
                          </span>))}
                        {w.exercises.length > 3 && (<span className="text-xs text-text-muted">
                            +{w.exercises.length - 3} more
                          </span>)}
                      </div>)}
                  </div>
                </div>
              </motion.div>);
            })}
        </motion.div>)}
    </div>);
}
