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
    <header className="h-24 bg-bg-primary/70 backdrop-blur-2xl border-b border-border-light flex items-center justify-between px-10 sticky top-0 z-30 shrink-0 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="lg:hidden mr-6 p-3 -ml-2 rounded-2xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-all active:scale-95 border border-transparent hover:border-border-light"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tight text-text-primary leading-tight">{title}</h1>
          <div className="flex items-center space-x-2 mt-0.5">
             <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/40" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Node: Central-01</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-8">
        <div className="relative hidden md:block group">
          <Search className={`w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 transition-all duration-300 ${searchValue ? 'text-brand-primary scale-110' : 'text-text-muted'}`} />
          <input 
            type="text" 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search Intelligence..." 
            className="w-80 h-12 pl-12 pr-12 rounded-2xl bg-bg-secondary/50 border border-border-light text-sm font-bold text-text-primary focus:outline-none focus:border-brand-primary/30 focus:ring-8 focus:ring-brand-primary/5 transition-all placeholder:text-text-muted/60 shadow-inner group-hover:bg-bg-secondary"
          />
          <AnimatePresence>
            {searchValue && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchValue('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-bg-card hover:bg-bg-secondary rounded-xl transition-all shadow-sm border border-border-light"
              >
                <X className="w-3 h-3 text-text-primary" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleTheme}
            className="p-3 rounded-2xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-all border border-border-light hover:border-brand-primary/20 active:scale-90 relative overflow-hidden group bg-bg-card shadow-sm"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: 20, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -20, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </motion.div>
            </AnimatePresence>
          </button>

          <button 
            onClick={() => navigate('/notifications')}
            className="relative p-3 rounded-2xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-all border border-border-light hover:border-brand-primary/20 active:scale-90 bg-bg-card shadow-sm"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-status-danger border-2 border-bg-card shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse" />
          </button>
        </div>
      </div>
    </header>
  );
}
