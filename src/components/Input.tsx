import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon,
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block ml-0.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`w-full bg-bg-secondary border rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none transition-all font-bold placeholder:text-text-muted/40 ${
            icon ? 'pl-10' : ''
          } ${
            error 
              ? 'border-status-danger ring-4 ring-status-danger/5' 
              : 'border-border-light focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5'
          } ${className}`}
        />
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 ml-0.5"
          >
            <p className="text-[12px] font-bold text-status-danger leading-none">
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
