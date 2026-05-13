import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Calendar, 
  BookOpen, 
  Users, 
  Ticket, 
  BarChart3, 
  Bell, 
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Turfs', path: '/turfs', icon: MapIcon },
  { name: 'Slots', path: '/slots', icon: Calendar },
  { name: 'Bookings', path: '/bookings', icon: BookOpen },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Coupons', path: '/coupons', icon: Ticket },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const sidebarContent = (
    <div className="w-56 h-full bg-white border-r border-border-light flex flex-col z-20">
      <div className="h-16 flex items-center px-5 shrink-0 border-b border-border-light/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shadow-md shadow-brand-primary/10">
            <span className="text-white font-bold text-base">L</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-text-primary font-heading leading-none">Linkqs</span>
            <span className="text-[8px] font-bold tracking-widest text-brand-primary uppercase mt-0.5">TurfPulse</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden ml-auto p-1.5 text-text-muted hover:text-status-danger transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5 scrollbar-hide">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => { if (window.innerWidth < 1024) onClose?.(); }}
            className={({ isActive }) => 
              `flex items-center px-3 py-2 rounded-lg transition-all relative group ${
                isActive 
                  ? 'text-brand-primary font-bold bg-brand-soft' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-4 h-4 mr-2.5 transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
                <span className="text-[13px]">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-border-light shrink-0">
        <div 
          onClick={() => {
            window.location.href = '/settings';
            if (window.innerWidth < 1024) onClose?.();
          }}
          className="flex items-center p-2.5 rounded-xl bg-bg-secondary hover:bg-bg-hover transition-all cursor-pointer border border-transparent hover:border-border-medium group"
        >
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-border-light shadow-sm">
            <img src="https://ui-avatars.com/api/?name=Admin+User&background=15803D&color=fff&bold=true" alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="ml-2.5 flex-1 overflow-hidden">
            <p className="text-[12px] font-bold text-text-primary truncate">Admin User</p>
            <p className="text-[10px] font-medium text-text-muted">Facility Owner</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to log out?')) {
                alert('Logging out...');
              }
            }}
            className="p-1.5 hover:text-status-danger transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block">
        {sidebarContent}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

