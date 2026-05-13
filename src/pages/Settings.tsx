import { useState } from 'react';
import { Save, User, Bell, Lock, Globe, Loader2, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const tabs = [
    { id: 'profile', label: 'User profile', icon: User },
    { id: 'facility', label: 'Node parameters', icon: Globe },
    { id: 'notifications', label: 'Relay system', icon: Bell },
    { id: 'security', label: 'Encryption', icon: Lock },
  ];

  return (
    <div className="w-full space-y-8 relative px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">System <span className="text-brand-primary">Preferences</span></h1>
          <p className="text-text-secondary text-[13px] mt-0.5">Calibrate your high-performance environment and secure protocols.</p>
        </div>
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex items-center bg-brand-primary/5 text-brand-primary px-4 py-2 rounded-lg border border-brand-primary/10 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              <span className="font-bold text-[11px] uppercase tracking-wider">Synchronized</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg font-bold text-[13px] flex items-center transition-all border ${
                activeTab === tab.id
                  ? 'bg-white text-brand-primary border-brand-primary/20 shadow-sm'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary border-transparent'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 mr-3 transition-colors ${activeTab === tab.id ? 'text-brand-primary' : 'text-text-muted'}`} /> 
              {tab.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-9 bg-white border border-border-light rounded-xl shadow-premium p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {activeTab === 'profile' ? (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="relative"
              >
                <div className="flex items-center justify-between border-b border-border-light pb-5 mb-8">
                  <h2 className="text-lg font-bold text-text-primary tracking-tight uppercase">User profile</h2>
                  <div className="w-8 h-1 bg-brand-primary/20 rounded-full" />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-xl bg-bg-secondary flex items-center justify-center overflow-hidden border border-brand-primary shadow-premium p-0.5">
                      <div className="w-full h-full rounded-lg bg-brand-primary/5 flex items-center justify-center text-brand-primary text-2xl font-bold uppercase overflow-hidden">
                        AU
                      </div>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-sm">
                        <Save className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <button className="absolute -bottom-1.5 -right-1.5 p-2 bg-brand-primary text-white rounded-lg shadow-lg hover:scale-110 transition-transform active:scale-95 border-2 border-white">
                      <Zap className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <button className="bg-bg-secondary hover:bg-bg-card text-text-primary px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all border border-border-light mb-2">
                      Update Identifier
                    </button>
                    <p className="text-text-muted text-[9px] font-bold uppercase tracking-wider opacity-60">High-resolution JPG or PNG assets only.</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-0.5">Assigned Name</label>
                      <input type="text" defaultValue="Admin" className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-text-primary text-[13px] outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-0.5">Entity Family</label>
                      <input type="text" defaultValue="User" className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-text-primary text-[13px] outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-0.5">Communication Channel</label>
                    <input type="email" defaultValue="admin@linkqs.com" className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-text-primary text-[13px] outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-0.5">System Biography</label>
                    <textarea rows={3} defaultValue="High-performance facility owner managing premium multi-sport nodes within the Linkqs network." className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-text-primary text-[13px] outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all resize-none" />
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button 
                      disabled={isSaving}
                      type="submit" 
                      className="bg-brand-primary text-white px-6 py-2.5 rounded-lg font-bold text-[13px] flex items-center hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10 active:scale-95 disabled:opacity-70"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                      {isSaving ? 'Processing...' : 'Sync Configuration'}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="restricted"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col items-center justify-center py-16 text-center relative"
              >
                <div className="w-16 h-16 bg-bg-secondary rounded-xl flex items-center justify-center mb-8 border border-border-light shadow-inner">
                  {tabs.find(t => t.id === activeTab)?.icon({ className: "w-8 h-8 text-brand-primary opacity-40" })}
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-2 uppercase tracking-tight">{tabs.find(t => t.id === activeTab)?.label} Protocol</h2>
                <p className="text-text-secondary max-w-xs font-medium text-[13px]">This operational module requires <span className="text-brand-primary font-bold uppercase tracking-wider text-[11px]">Enterprise Node</span> clearance.</p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button className="bg-brand-primary text-white px-6 py-2.5 rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10">
                    Elevate Clearance
                  </button>
                  <button className="bg-bg-secondary text-text-primary px-6 py-2.5 rounded-lg font-bold text-[11px] uppercase tracking-wider border border-border-light hover:bg-white transition-all">
                    Network Status
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
