import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { useStore } from '../../store/useStore';
import PageLoader from './PageLoader';
import { AnimatePresence } from 'framer-motion';

export default function DashboardLayout() {
  const { fetchTurfs, fetchSlots, fetchBookings, fetchCoupons, fetchCustomers, theme, isLoading } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Apply initial theme
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    const loadData = async () => {
      try {
        await Promise.all([
          fetchTurfs(),
          fetchSlots(),
          fetchBookings(),
          fetchCoupons(),
          fetchCustomers()
        ]);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, [fetchTurfs, fetchSlots, fetchBookings, fetchCoupons, fetchCustomers, theme]);

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {(isLoading || isInitialLoading) && <PageLoader />}
      </AnimatePresence>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <TopNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-bg-secondary p-4 md:p-5 scroll-smooth flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
