import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const { session, loading, hasTurf } = useAuthStore();
  const location = useLocation();

  if (loading || hasTurf === null) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-xl">L</span>
        </div>
        <div className="flex items-center gap-2 text-text-muted font-bold text-[12px] uppercase tracking-widest">
          <Loader2 className="w-4 h-4 animate-spin" />
          Synchronizing Session...
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  // If user hasn't completed setup and is trying to access dashboard, redirect to setup
  if (hasTurf === false && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  // If user has completed setup and is trying to access setup, redirect to dashboard
  if (hasTurf === true && location.pathname === '/setup') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
