import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Dumbbell, Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button, Input } from '../components/ui';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export default function Login() {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const justRegistered = location.state?.registered === true;
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [pending, setPending] = useState(false);
    if (user) {
        return <Navigate to="/" replace/>;
    }
    const setField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const validate = () => {
        const next = {};
        if (!EMAIL_RE.test(form.email))
            next.email = 'Enter a valid email address';
        if (!form.password)
            next.password = 'Password is required';
        return next;
    };
    async function handleSubmit(e) {
        e.preventDefault();
        const next = validate();
        setErrors(next);
        if (Object.keys(next).length > 0)
            return;
        setPending(true);
        try {
            await login(form.email.trim(), form.password);
            navigate('/', { replace: true });
        }
        catch (err) {
            setErrors({ form: err instanceof Error ? err.message : 'Login failed' });
        }
        finally {
            setPending(false);
        }
    }
    return (<div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }} className="gradient-primary h-16 w-16 mx-auto rounded-2xl flex items-center justify-center glow-lg mb-4">
            <Dumbbell className="h-8 w-8 text-dark"/>
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-display">
            Welcome back to <span className="text-gradient">FitTrack</span>
          </h1>
          <p className="text-sm text-text-muted mt-2">Log in to continue your fitness journey</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-elevated rounded-2xl p-6 sm:p-8 shadow-xl">
          {justRegistered && (<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3 text-sm text-success bg-success/10 border border-success/20 rounded-xl p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0"/>
              <span>Account created — please log in.</span>
            </motion.div>)}

          {errors.form && (<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3 text-sm text-error bg-error/10 border border-error/20 rounded-xl p-4">
              <Lock className="h-5 w-5 shrink-0"/>
              <span>{errors.form}</span>
            </motion.div>)}

          <form onSubmit={handleSubmit} noValidate>
            <Input id="email" label="Email" type="email" placeholder="you@example.com" icon={<Mail className="h-4 w-4"/>} value={form.email} onChange={(e) => setField('email', e.target.value)} autoComplete="email" error={errors.email}/>

            <Input id="password" label="Password" type="password" placeholder="••••••••" icon={<Lock className="h-4 w-4"/>} value={form.password} onChange={(e) => setField('password', e.target.value)} autoComplete="current-password" error={errors.password}/>

            <Button type="submit" isLoading={pending} fullWidth size="lg" className="mt-4">
              {!pending && <Sparkles className="h-4 w-4"/>}
              {pending ? 'Logging in…' : 'Log in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            New to FitTrack?{' '}
            <Link to="/register" className="text-primary hover:text-primary-light font-semibold transition-colors">
              Create an account
            </Link>
          </p>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 text-center text-xs text-text-muted">
          Your data is secure and encrypted.
        </motion.p>
      </motion.div>
    </div>);
}
