import { Bell, Menu, Sun, Moon, User as UserIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { motion } from 'framer-motion';

interface TopNavbarProps {
  onMenuClick?: () => void;
}

export default function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useStore();
  const { user } = useAuthStore();
  
  const pathName = location.pathname.substring(1);
  const title = pathName.charAt(0).toUpperCase() + pathName.slice(1) || 'Overview';
  
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=15803D&color=fff&bold=true`;

  return (
    <header className="h-12 bg-bg-primary/80 backdrop-blur-md border-b border-border-light flex items-center justify-between px-5 sticky top-0 z-30 shrink-0">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="lg:hidden mr-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-base font-bold tracking-tight text-text-primary font-heading leading-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center gap-1.5">
          {/* Sculptural Theme Switcher */}
          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded text-text-muted hover:text-brand-primary hover:bg-brand-soft transition-all duration-300 group relative"
          >
            <div className="relative z-10">
              {theme === 'light' ? (
                <motion.div initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
                  <Moon className="w-3.5 h-3.5" />
                </motion.div>
              ) : (
                <motion.div initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
                  <Sun className="w-3.5 h-3.5" />
                </motion.div>
              )}
            </div>
            <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/5 rounded transition-all duration-300" />
          </button>

          {/* Premium Notification Center */}
          <button 
            onClick={() => navigate('/notifications')}
            className="relative p-1.5 rounded text-text-muted hover:text-brand-primary hover:bg-brand-soft transition-all duration-300 group"
          >
            <motion.div 
              className="relative z-10"
              whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Bell className="w-3.5 h-3.5" />
            </motion.div>
            
            <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/5 rounded transition-all duration-300" />
          </button>
        </div>
      </div>
    </header>
  );
}
