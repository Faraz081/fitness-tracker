import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Lock, Mail, User as UserIcon, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button, Input } from '../components/ui';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export default function Register() {
    const { register, user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
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
        if (!form.name.trim())
            next.name = 'Name is required';
        if (!EMAIL_RE.test(form.email))
            next.email = 'Enter a valid email address';
        if (form.password.length < 6)
            next.password = 'Password must be at least 6 characters';
        if (form.confirmPassword !== form.password)
            next.confirmPassword = 'Passwords do not match';
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
            await register(form.name.trim(), form.email.trim(), form.password);
            navigate('/login', { state: { registered: true } });
        }
        catch (err) {
            setErrors({ form: err instanceof Error ? err.message : 'Registration failed' });
        }
        finally {
            setPending(false);
        }
    }
    return (<div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }} className="gradient-primary h-16 w-16 mx-auto rounded-2xl flex items-center justify-center glow-lg mb-4">
            <Dumbbell className="h-8 w-8 text-dark"/>
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-display">
            Start your journey with <span className="text-gradient">FitTrack</span>
          </h1>
          <p className="text-sm text-text-muted mt-2">Create your account in seconds</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-elevated rounded-2xl p-6 sm:p-8 shadow-xl">
          {errors.form && (<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3 text-sm text-error bg-error/10 border border-error/20 rounded-xl p-4">
              <Zap className="h-5 w-5 shrink-0"/>
              <span>{errors.form}</span>
            </motion.div>)}

          <form onSubmit={handleSubmit} noValidate>
            <Input id="name" label="Name" type="text" placeholder="Your name" icon={<UserIcon className="h-4 w-4"/>} value={form.name} onChange={(e) => setField('name', e.target.value)} autoComplete="name" error={errors.name}/>

            <Input id="email" label="Email" type="email" placeholder="you@example.com" icon={<Mail className="h-4 w-4"/>} value={form.email} onChange={(e) => setField('email', e.target.value)} autoComplete="email" error={errors.email}/>

            <Input id="password" label="Password" type="password" placeholder="At least 6 characters" icon={<Lock className="h-4 w-4"/>} value={form.password} onChange={(e) => setField('password', e.target.value)} autoComplete="new-password" error={errors.password}/>

            <Input id="confirmPassword" label="Confirm password" type="password" placeholder="Repeat your password" icon={<Lock className="h-4 w-4"/>} value={form.confirmPassword} onChange={(e) => setField('confirmPassword', e.target.value)} autoComplete="new-password" error={errors.confirmPassword}/>

            <Button type="submit" isLoading={pending} fullWidth size="lg" className="mt-4">
              {!pending && <Zap className="h-4 w-4"/>}
              {pending ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-light font-semibold transition-colors">
              Log in
            </Link>
          </p>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 text-center text-xs text-text-muted">
          By creating an account, you agree to our Terms of Service.
        </motion.p>
      </motion.div>
    </div>);
}
