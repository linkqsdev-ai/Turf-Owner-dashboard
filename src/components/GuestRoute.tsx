import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import PageLoader from './layout/PageLoader';

export default function GuestRoute() {
  const { session, loading } = useAuthStore();

  if (loading) return <PageLoader />;

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
