import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NumericInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onValueChange?: (value: string) => void;
  icon?: React.ReactNode;
}

export const NumericInput: React.FC<NumericInputProps> = ({ 
  label, 
  error: externalError, 
  onValueChange, 
  icon,
  className = '',
  value,
  defaultValue,
  onChange,
  ...props 
}) => {
  const [internalValue, setInternalValue] = useState<string>((value as string) || (defaultValue as string) || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value as string);
    } else if (defaultValue !== undefined) {
      setInternalValue(defaultValue as string);
    }
  }, [value, defaultValue]);

  const validateAndSanitize = (val: string) => {
    const sanitized = val.replace(/[^0-9]/g, '');
    if (val !== sanitized) {
      setError('Only integer values (0-9) are allowed');
      setTimeout(() => setError(null), 2000);
    }
    return sanitized;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = validateAndSanitize(e.target.value);
    setInternalValue(sanitized);
    
    if (onValueChange) {
      onValueChange(sanitized);
    }

    if (onChange) {
      // Create a fake event for compatibility with existing form handlers if needed
      const fakeEvent = {
        ...e,
        target: {
          ...e.target,
          value: sanitized,
          name: props.name || ''
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(fakeEvent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent scientific notation keys and decimal point
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault();
      setError('Only integer values are allowed');
      setTimeout(() => setError(null), 2000);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData('text');
    if (!/^\d+$/.test(pastedData)) {
      e.preventDefault();
      const sanitized = pastedData.replace(/[^0-9]/g, '');
      setInternalValue(sanitized);
      setError('Invalid characters removed from paste');
      setTimeout(() => setError(null), 2000);
      
      if (onValueChange) onValueChange(sanitized);
    }
  };

  return (
    <div className="space-y-1.5 w-full relative">
      {label && (
        <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary">
            {icon}
          </div>
        )}
        <input
          {...props}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={internalValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className={`${className} ${icon ? 'pl-10' : ''} ${error || externalError ? 'border-status-danger focus:border-status-danger focus:ring-status-danger/5' : ''}`}
        />
      </div>
      
      <AnimatePresence>
        {(error || externalError) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 ml-0.5"
          >
            <p className="text-[12px] font-bold text-status-danger leading-none">
              {error || externalError}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
