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
    <div className="max-w-[1200px] mx-auto space-y-10 pb-20 relative px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
            <span className="text-[10px] font-black text-brand-primary tracking-[0.2em] uppercase">Control Panel</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight leading-tight">System <span className="text-brand-primary">Preferences.</span></h1>
          <p className="text-text-secondary font-medium mt-2">Calibrate your high-performance environment and secure your access protocols.</p>
        </div>
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center bg-brand-primary/10 text-brand-primary px-5 py-3 rounded-2xl border border-brand-primary/10 shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5 mr-3" />
              <span className="font-black text-xs uppercase tracking-widest">Configuration Synchronized</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-3 space-y-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center transition-all border ${
                activeTab === tab.id
                  ? 'bg-bg-card text-brand-primary border-brand-primary/20 shadow-sm'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary border-transparent'
              }`}
            >
              <tab.icon className={`w-4 h-4 mr-4 transition-colors ${activeTab === tab.id ? 'text-brand-primary' : 'text-text-muted'}`} /> 
              {tab.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-9 bg-bg-card border border-border-light rounded-[2.5rem] shadow-sm p-10 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {activeTab === 'profile' ? (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative"
              >
                <div className="flex items-center justify-between border-b border-border-light pb-8 mb-10">
                  <h2 className="text-2xl font-black text-text-primary tracking-tight uppercase">User profile</h2>
                  <div className="w-10 h-1 bg-brand-primary/20 rounded-full" />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-bg-secondary flex items-center justify-center overflow-hidden border-2 border-brand-primary shadow-lg p-1">
                      <div className="w-full h-full rounded-[2.2rem] bg-brand-primary/10 flex items-center justify-center text-brand-primary text-4xl font-black uppercase overflow-hidden">
                        AU
                      </div>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] backdrop-blur-sm">
                        <Save className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-3 bg-brand-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-transform active:scale-95 border-4 border-bg-card">
                      <Zap className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <button className="bg-bg-secondary hover:bg-bg-card text-text-primary px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-border-light mb-3">
                      Update Identifier
                    </button>
                    <p className="text-text-muted text-[10px] font-black uppercase tracking-widest opacity-60">High-resolution JPG or PNG assets only.</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Assigned Name</label>
                      <input type="text" defaultValue="Admin" className="w-full bg-bg-secondary border border-border-light rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Entity Family</label>
                      <input type="text" defaultValue="User" className="w-full bg-bg-secondary border border-border-light rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Communication Channel</label>
                    <input type="email" defaultValue="admin@linkqs.com" className="w-full bg-bg-secondary border border-border-light rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">System Biography</label>
                    <textarea rows={4} defaultValue="High-performance facility owner managing premium multi-sport nodes within the Linkqs network." className="w-full bg-bg-secondary border border-border-light rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all resize-none" />
                  </div>
                  <div className="pt-6 flex justify-end">
                    <button 
                      disabled={isSaving}
                      type="submit" 
                      className="bg-brand-primary text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center hover:bg-brand-hover transition-all shadow-[0_12px_24px_rgba(16,185,129,0.2)] hover:-translate-y-1 active:scale-95 disabled:opacity-70"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <ShieldCheck className="w-5 h-5 mr-3" />}
                      {isSaving ? 'Processing...' : 'Sync Configuration'}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="restricted"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-24 text-center relative"
              >
                <div className="w-24 h-24 bg-bg-secondary rounded-[2rem] flex items-center justify-center mb-10 border border-border-light shadow-inner group-hover:scale-110 transition-transform">
                  {tabs.find(t => t.id === activeTab)?.icon({ className: "w-10 h-10 text-brand-primary" })}
                </div>
                <h2 className="text-3xl font-black text-text-primary mb-3 uppercase tracking-tight">{tabs.find(t => t.id === activeTab)?.label} Protocol</h2>
                <p className="text-text-secondary max-w-sm font-medium text-lg">This operational module requires <span className="text-brand-primary font-black uppercase tracking-widest text-sm">Enterprise Node</span> clearance.</p>
                <div className="mt-12 flex flex-col sm:flex-row gap-4">
                  <button className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-hover transition-all shadow-[0_8px_20px_rgba(16,185,129,0.15)]">
                    Elevate Clearance
                  </button>
                  <button className="bg-bg-secondary text-text-primary px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-border-light hover:bg-bg-card transition-all">
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
