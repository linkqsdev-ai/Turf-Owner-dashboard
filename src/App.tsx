import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Turfs from './pages/Turfs';
import Slots from './pages/Slots';
import Bookings from './pages/Bookings';
import Customers from './pages/Customers';
import Coupons from './pages/Coupons';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Tournament from './pages/Tournament';
import SignIn from './pages/Auth/SignIn';
import SignUp from './pages/Auth/SignUp';
import TurfSetup from './pages/Auth/TurfSetup';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';

function App() {
  const initializeAuth = useAuthStore(state => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <Routes>
        {/* Guest Routes */}
        <Route element={<GuestRoute />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/setup" element={<TurfSetup />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="turfs" element={<Turfs />} />
            <Route path="slots" element={<Slots />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="customers" element={<Customers />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="tournament" element={<Tournament />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
