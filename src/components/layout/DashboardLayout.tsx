import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { useStore } from '../../store/useStore';

export default function DashboardLayout() {
  const { fetchTurfs, fetchSlots, fetchBookings, fetchCoupons, fetchCustomers, theme } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Apply initial theme
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    fetchTurfs();
    fetchSlots();
    fetchBookings();
    fetchCoupons();
    fetchCustomers();
  }, [fetchTurfs, fetchSlots, fetchBookings, fetchCoupons, fetchCustomers, theme]);

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <TopNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-bg-secondary p-4 md:p-5 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
