import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import PageLoader from './layout/PageLoader';

export default function ProtectedRoute() {
  const { session, loading, hasTurf } = useAuthStore();
  const location = useLocation();

  if (loading || hasTurf === null) {
    return <PageLoader />;
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
