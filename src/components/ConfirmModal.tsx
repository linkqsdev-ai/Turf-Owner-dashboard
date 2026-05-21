import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'danger'
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="bg-bg-primary border border-border-light rounded-2xl shadow-modal w-full max-w-md relative z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border-light flex justify-between items-center bg-bg-secondary/30">
              <h3 className="font-bold text-text-primary text-sm tracking-wider">
                {title}
              </h3>
              <button onClick={onCancel} className="p-1 text-text-muted hover:text-text-primary transition-colors">
                <AlertTriangle className={`w-4 h-4 ${
                  type === 'danger' ? 'text-status-danger' : 
                  type === 'warning' ? 'text-amber-500' : 
                  'text-brand-primary'
                }`} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <p className="text-text-secondary font-medium text-[13px] leading-relaxed">
                {message}
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={onCancel}
                  className="flex-1 bg-bg-secondary text-text-primary py-3 rounded-xl font-bold text-[13px] hover:bg-bg-hover transition-all active:scale-[0.98] border border-border-light"
                >
                  {cancelText}
                </button>
                <button 
                  onClick={onConfirm}
                  className={`flex-[1.5] py-3 rounded-xl font-bold text-[13px] text-white transition-all active:scale-[0.98] shadow-lg ${
                    type === 'danger' ? 'bg-status-danger hover:bg-red-600 shadow-status-danger/10' : 
                    type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10' : 
                    'bg-brand-primary hover:bg-brand-hover shadow-brand-primary/10'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
