import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Calendar, ChevronRight, Dumbbell, Flame, Plus, Target, TrendingUp, User as UserIcon, } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import * as api from '../services/api';
import { Badge, Card, Counter } from '../components/ui';
const categoryIcon = {
    strength: Dumbbell,
    cardio: Activity,
    flexibility: TrendingUp,
    hybrid: Target,
    other: Dumbbell,
};
const categoryColor = {
    strength: 'primary',
    cardio: 'success',
    flexibility: 'warning',
    hybrid: 'error',
    other: 'neutral',
};
function formatDate(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return iso;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
export default function Dashboard() {
    const { user } = useAuth();
    const [recentWorkouts, setRecentWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let cancelled = false;
        api
            .listWorkouts()
            .then((data) => {
            if (!cancelled)
                setRecentWorkouts(data.slice(0, 3));
        })
            .catch(() => {
            /* silently ignore for dashboard preview */
        })
            .finally(() => {
            if (!cancelled)
                setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, []);
    const totalExercises = recentWorkouts.reduce((sum, w) => sum + w.exercises.length, 0);
    return (<div className="space-y-8">
      {/* Hero greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl glass-elevated p-6 sm:p-8">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"/>
        <div className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-primary/5 blur-3xl"/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-success/5 blur-2xl"/>

        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="gradient-primary h-14 w-14 rounded-2xl flex items-center justify-center glow">
              <UserIcon className="h-7 w-7 text-dark"/>
            </motion.div>
            <div>
              <p className="text-xs uppercase tracking-wider text-text-muted font-medium">
                Welcome back
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
                {user?.name?.split(' ')[0] || 'Athlete'} <span className="text-gradient">⚡</span>
              </h1>
            </div>
          </div>

          <p className="text-sm sm:text-base text-text-secondary max-w-lg leading-relaxed">
            Ready to push your limits today? Your fitness journey is going great — keep the
            momentum going.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/workouts/new" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
              <Plus className="h-4 w-4"/>
              Log Workout
            </Link>
            <Link to="/workouts" className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm">
              <Dumbbell className="h-4 w-4"/>
              View Workouts
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card hover index={0} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Workouts
              </p>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-primary"/>
              </div>
            </div>
            <Counter to={recentWorkouts.length} className="text-4xl font-bold text-white font-display"/>
            <p className="text-xs text-text-muted mt-1">recent sessions</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card hover index={1} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Exercises
              </p>
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-success"/>
              </div>
            </div>
            <Counter to={totalExercises} className="text-4xl font-bold text-white font-display"/>
            <p className="text-xs text-text-muted mt-1">total tracked</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card hover index={2} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Momentum
              </p>
              <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-warning"/>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-warning"/>
              <span className="text-3xl font-bold text-white font-display">Let's go!</span>
            </div>
            <p className="text-xs text-text-muted mt-1">keep it up</p>
          </Card>
        </motion.div>
      </div>

      {/* Recent workouts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 font-display">
            <Calendar className="h-5 w-5 text-primary"/>
            Recent Workouts
          </h2>
          <Link to="/workouts" className="text-sm text-primary hover:text-primary-light font-medium flex items-center gap-1 transition-colors">
            View all <ChevronRight className="h-4 w-4"/>
          </Link>
        </div>

        {loading ? (<div className="space-y-4">
            {[0, 1, 2].map((i) => (<div key={i} className="glass-elevated rounded-2xl p-5 skeleton">
                <div className="h-4 w-1/3 bg-dark-600 rounded mb-2"/>
                <div className="h-3 w-1/2 bg-dark-600 rounded"/>
              </div>))}
          </div>) : recentWorkouts.length === 0 ? (<Card className="text-center py-10">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-dark-700 flex items-center justify-center mb-4">
              <Dumbbell className="h-8 w-8 text-dark-300"/>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">No workouts yet</h3>
            <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
              Start your fitness journey by logging your first workout.
            </p>
            <Link to="/workouts/new" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
              <Plus className="h-4 w-4"/>
              Log your first workout
            </Link>
          </Card>) : (<div className="space-y-3">
            {recentWorkouts.map((w, i) => {
                const Icon = categoryIcon[w.category] ?? Dumbbell;
                return (<motion.div key={w.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }} whileHover={{ x: 4 }}>
                  <Link to={`/workouts/${w.id}/edit`} className="flex items-center gap-4 card-interactive p-4 group">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-dark-700 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                      <Icon className="h-6 w-6 text-primary"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white group-hover:text-primary transition-colors truncate">{w.title}</span>
                        <Badge color={categoryColor[w.category] ?? 'neutral'}>
                          {w.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-muted mt-1">
                        {formatDate(w.date)} · {w.exercises.length}{' '}
                        {w.exercises.length === 1 ? 'exercise' : 'exercises'}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-dark-300 group-hover:text-primary transition-colors shrink-0"/>
                  </Link>
                </motion.div>);
            })}
          </div>)}
      </motion.div>
    </div>);
}
