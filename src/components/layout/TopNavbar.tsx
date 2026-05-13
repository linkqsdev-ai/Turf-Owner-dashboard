import { Search, Bell, Menu, X, Sun, Moon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

interface TopNavbarProps {
  onMenuClick?: () => void;
}

export default function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useStore();
  const [searchValue, setSearchValue] = useState('');
  
  const pathName = location.pathname.substring(1);
  const title = pathName.charAt(0).toUpperCase() + pathName.slice(1) || 'Overview';

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-border-light flex items-center justify-between px-8 sticky top-0 z-30 shrink-0">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="lg:hidden mr-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-text-primary font-heading leading-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block group">
          <Search className={`w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${searchValue ? 'text-brand-primary' : 'text-text-muted'}`} />
          <input 
            type="text" 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search everything..." 
            className="w-64 h-9 pl-10 pr-9 rounded-lg bg-bg-secondary border border-transparent focus:bg-white focus:border-brand-primary/20 text-[13px] font-medium text-text-primary outline-none transition-all placeholder:text-text-muted/70"
          />
          <AnimatePresence>
            {searchValue && (
              <button 
                onClick={() => setSearchValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* Sculptural Theme Switcher */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-text-muted hover:text-brand-primary hover:bg-brand-soft transition-all duration-300 group relative"
          >
            <div className="relative z-10">
              {theme === 'light' ? (
                <motion.div initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
                  <Moon className="w-4.5 h-4.5" />
                </motion.div>
              ) : (
                <motion.div initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
                  <Sun className="w-4.5 h-4.5" />
                </motion.div>
              )}
            </div>
            <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/5 rounded-xl transition-all duration-300" />
          </button>

          {/* Premium Notification Center */}
          <button 
            onClick={() => navigate('/notifications')}
            className="relative p-2.5 rounded-xl text-text-muted hover:text-brand-primary hover:bg-brand-soft transition-all duration-300 group"
          >
            <motion.div 
              className="relative z-10"
              whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Bell className="w-4.5 h-4.5" />
            </motion.div>
            
            <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/5 rounded-xl transition-all duration-300" />
          </button>
        </div>
      </div>
    </header>
  );
}

