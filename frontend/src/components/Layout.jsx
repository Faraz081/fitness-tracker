import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Apple, Dumbbell, LayoutDashboard, LogOut, Menu, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './ui';
import { Button } from './ui';
export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { toasts, dismiss } = useToast();
    async function handleLogout() {
        await logout();
        navigate('/login', { replace: true });
    }
    const navItems = user
        ? [
            { to: '/', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/workouts', label: 'Workouts', icon: Dumbbell },
            { to: '/nutrition', label: 'Nutrition', icon: Apple },
            { to: '/profile', label: 'Profile', icon: UserIcon },
        ]
        : [];
    const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
    return (<div className="min-h-screen gradient-dark gradient-mesh">
      <header className="sticky top-0 z-30 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div whileHover={{ rotate: 15, scale: 1.05 }} className="gradient-primary h-10 w-10 rounded-xl flex items-center justify-center glow">
                <Dumbbell className="h-5 w-5 text-dark"/>
              </motion.div>
              <span className="text-xl font-bold text-white tracking-tight font-display group-hover:text-primary transition-colors">
                Fit<span className="text-gradient">Track</span>
              </span>
            </Link>

            {user && (<>
                <nav className="hidden md:flex items-center gap-1 bg-dark-800/50 rounded-xl p-1 border border-white/5">
                  {navItems.map((item) => (<Link key={item.to} to={item.to} className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive(item.to)
                    ? 'text-primary bg-primary/10'
                    : 'text-text-secondary hover:text-white hover:bg-dark-700'}`}>
                      <item.icon className="h-4 w-4"/>
                      {item.label}
                      {isActive(item.to) && (<motion.div layoutId="nav-active" className="absolute inset-0 rounded-lg bg-primary/10 -z-10" transition={{ type: 'spring', stiffness: 400, damping: 30 }}/>)}
                    </Link>))}
                </nav>

                <div className="hidden md:flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4"/>
                    Log out
                  </Button>
                </div>

                <button className="md:hidden p-2 rounded-lg text-text-secondary hover:text-white hover:bg-dark-700 cursor-pointer" onClick={() => setMobileOpen((prev) => !prev)}>
                  {mobileOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
                </button>
              </>)}

            {!user && (<nav className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-white transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary px-5 py-2.5 text-sm">
                  Get Started
                </Link>
              </nav>)}
          </div>

          <AnimatePresence>
            {mobileOpen && user && (<motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden pb-4 space-y-1">
                {navItems.map((item) => (<Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.to)
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-text-secondary hover:text-white hover:bg-dark-700'}`}>
                    <item.icon className="h-5 w-5"/>
                    {item.label}
                  </Link>))}
                <button onClick={() => {
                setMobileOpen(false);
                void handleLogout();
            }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-colors cursor-pointer">
                  <LogOut className="h-5 w-5"/>
                  Log out
                </button>
              </motion.nav>)}
          </AnimatePresence>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismiss}/>
    </div>);
}
