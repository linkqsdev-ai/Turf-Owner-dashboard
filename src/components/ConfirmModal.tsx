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
            onClick={onCancel}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-bg-card border border-border-light p-8 md:p-10 rounded-[2.5rem] shadow-modal w-full max-w-md relative z-10 text-center"
          >
            <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 ${
              type === 'danger' ? 'bg-status-danger/10 text-status-danger' : 
              type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
              'bg-brand-primary/10 text-brand-primary'
            }`}>
              <AlertTriangle className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-text-primary mb-3">{title}</h3>
            <p className="text-text-muted font-medium mb-10 leading-relaxed">{message}</p>

            <div className="flex gap-4">
              <button 
                onClick={onCancel}
                className="flex-1 bg-bg-secondary text-text-primary py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-border-light transition-all active:scale-95 border border-border-light"
              >
                {cancelText}
              </button>
              <button 
                onClick={onConfirm}
                className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all active:scale-95 shadow-lg ${
                  type === 'danger' ? 'bg-status-danger hover:bg-red-600 shadow-red-500/20' : 
                  type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 
                  'bg-brand-primary hover:bg-brand-hover shadow-brand-primary/20'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
