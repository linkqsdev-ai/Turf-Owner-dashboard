import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/60 backdrop-blur-sm">
      <div className="relative">
        {/* Outer Ring */}
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-brand-primary/20 border-t-brand-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner Pulse */}
        <motion.div
          className="absolute inset-0 m-auto w-6 h-6 bg-brand-primary rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [1, 0.6, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Branding Subtext */}
        <motion.div 
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-[10px] font-black tracking-[0.2em] text-brand-primary animate-pulse uppercase">
            Processing...
          </span>
        </motion.div>
      </div>
    </div>
  );
}
