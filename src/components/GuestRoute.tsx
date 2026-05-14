import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function GuestRoute() {
  const { session, loading } = useAuthStore();

  if (loading) return null;

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
