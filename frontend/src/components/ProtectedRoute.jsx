import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';
export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (<div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin"/>
        <p className="text-sm text-text-muted">Loading your fitness space…</p>
      </div>);
    }
    if (!user) {
        return <Navigate to="/login" replace/>;
    }
    return <>{children}</>;
}
