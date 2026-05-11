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
    <div className="w-64 h-full bg-bg-sidebar border-r border-border-light flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
      <div className="h-24 flex items-center px-8 border-b border-border-light shrink-0">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-hover flex items-center justify-center mr-4 shadow-[0_8px_16px_rgba(16,185,129,0.25)]">
          <span className="text-white font-black text-2xl">T</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight text-text-primary leading-none">Linkqs</span>
          <span className="text-[10px] font-bold tracking-[0.2em] text-brand-primary uppercase mt-1">TurfPulse</span>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden ml-auto p-2 text-text-muted hover:text-status-danger transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-8 px-5 flex flex-col gap-1.5 scrollbar-hide">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => { if (window.innerWidth < 1024) onClose?.(); }}
            className={({ isActive }) => 
              `flex items-center px-4 py-3.5 rounded-2xl transition-all relative group ${
                isActive 
                  ? 'text-brand-primary font-bold bg-brand-primary/5' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute left-0 w-1.5 h-6 bg-brand-primary rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={`w-5 h-5 mr-3.5 relative z-10 transition-transform ${isActive ? 'scale-110' : 'group-hover:translate-x-1'}`} />
                <span className="relative z-10 text-[15px]">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="p-6 border-t border-border-light shrink-0 bg-bg-secondary/30">
        <div 
          onClick={() => {
            window.location.href = '/settings';
            if (window.innerWidth < 1024) onClose?.();
          }}
          className="flex items-center p-3 rounded-2xl bg-bg-card hover:bg-bg-secondary transition-all cursor-pointer border border-border-light hover:border-brand-primary/20 group shadow-sm active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center overflow-hidden border border-border-light group-hover:border-brand-primary/30 transition-all shadow-inner">
            <img src="https://ui-avatars.com/api/?name=Admin+User&background=10b981&color=fff&bold=true" alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="ml-3 flex-1 overflow-hidden">
            <p className="text-sm font-bold text-text-primary truncate group-hover:text-brand-primary transition-colors">Admin User</p>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">Owner</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to log out?')) {
                alert('Logging out...');
              }
            }}
            className="p-2.5 hover:bg-status-danger/10 rounded-xl transition-colors group/logout"
            title="Log Out"
          >
            <LogOut className="w-4 h-4 text-text-muted group-hover/logout:text-status-danger transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
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
