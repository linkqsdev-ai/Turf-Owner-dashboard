import { useState } from 'react';
import { Plus, Tag, Trash2, Clock, X, Ticket, Sparkles } from 'lucide-react';
import { useStore, type Coupon } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Coupons() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      code: (fd.get('code') as string).toUpperCase(),
      discount: fd.get('discount') as string,
      type: fd.get('type') as string,
      expires: fd.get('expires') as string,
    };

    if (editingCoupon) {
      await updateCoupon(editingCoupon.id, data);
    } else {
      await addCoupon(data);
    }
    
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleDelete = (id: string | number, code: string) => {
    if (window.confirm(`Are you sure you want to delete coupon ${code}?`)) {
      deleteCoupon(id);
    }
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 relative px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
            <span className="text-[10px] font-black text-brand-primary tracking-[0.2em] uppercase">Growth Engine</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight leading-tight">Elite <span className="text-brand-primary">Incentives.</span></h1>
          <p className="text-text-secondary font-medium mt-2">Design sophisticated promotional campaigns to drive network volume.</p>
        </div>
        <button 
          onClick={() => {
            setEditingCoupon(null);
            setIsModalOpen(true);
          }} 
          className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center hover:bg-brand-hover transition-all shadow-[0_8px_24px_rgba(16,185,129,0.2)] hover:-translate-y-1 active:scale-95"
        >
          <Sparkles className="w-5 h-5 mr-3" />
          Deploy Campaign
        </button>
      </div>

      <AnimatePresence mode="wait">
        {coupons.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-bg-card border border-border-light rounded-[3rem] p-16 md:p-32 flex flex-col items-center justify-center text-center shadow-sm"
          >
            <div className="w-24 h-24 bg-bg-secondary rounded-[2.5rem] flex items-center justify-center mb-8 border border-border-light shadow-inner">
              <Ticket className="w-10 h-10 text-brand-primary" />
            </div>
            <h2 className="text-3xl font-black text-text-primary mb-3">No Active Campaigns</h2>
            <p className="text-text-secondary max-w-md mb-10 font-medium">Incentivize your elite athletes with precision-targeted discount structures.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-text-primary text-bg-primary px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all shadow-card hover:shadow-hover"
            >
              Initialize Campaign
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coupons.map((coupon, idx) => (
              <motion.div 
                key={coupon.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-bg-card rounded-[2.5rem] p-8 border border-border-light hover:border-brand-primary/20 transition-all duration-500 shadow-sm relative overflow-hidden group hover:-translate-y-2"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-[4rem] -mr-16 -mt-16 pointer-events-none group-hover:bg-brand-primary/10 transition-colors duration-500" />
                
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-3xl bg-bg-secondary flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors border border-border-light group-hover:border-brand-primary/20">
                      <Tag className="w-8 h-8 text-brand-primary group-hover:rotate-12 transition-transform duration-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-text-primary tracking-[0.15em] uppercase">{coupon.code}</h3>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-2 inline-block border ${
                        coupon.status === 'Active' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/10' : 'bg-bg-secondary text-text-muted border-border-light'
                      }`}>
                        {coupon.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-end pb-6 border-b border-border-light">
                    <span className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">Net Discount</span>
                    <span className="text-4xl font-black text-brand-primary tracking-tighter group-hover:scale-110 transition-transform origin-right duration-500">{coupon.discount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">Redemptions</span>
                    <span className="text-text-primary font-black text-xl">{coupon.usage}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] flex items-center"><Clock className="w-3.5 h-3.5 mr-2 text-brand-primary" /> Lifecycle</span>
                    <span className="text-text-primary font-bold text-sm">{coupon.expires}</span>
                  </div>
                </div>
                
                <div className="mt-10 flex gap-4">
                  <button onClick={() => openEditModal(coupon)} className="flex-1 bg-bg-secondary hover:bg-brand-primary hover:text-white text-text-primary font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl transition-all border border-border-light hover:border-brand-primary active:scale-95 group/edit">
                    Edit Parameters
                  </button>
                  <button 
                    onClick={() => handleDelete(coupon.id, coupon.code)} 
                    className="px-6 bg-bg-secondary hover:bg-status-danger/10 text-text-muted hover:text-status-danger py-4 rounded-2xl transition-all border border-border-light active:scale-95"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsModalOpen(false); setEditingCoupon(null); }} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-bg-card border border-border-light p-10 rounded-[2.5rem] shadow-modal w-full max-w-lg relative z-10 overflow-hidden" >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-black text-text-primary tracking-tight">{editingCoupon ? 'Configure Campaign' : 'Initialize Campaign'}</h2>
                  <p className="text-text-muted text-sm font-medium mt-1">Define promotional parameters</p>
                </div>
                <button onClick={() => { setIsModalOpen(false); setEditingCoupon(null); }} className="p-3 bg-bg-secondary text-text-muted hover:text-status-danger rounded-2xl transition-colors border border-border-light" >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Campaign Code</label>
                  <input required defaultValue={editingCoupon?.code} name="code" className="w-full bg-bg-secondary border border-border-light rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 uppercase font-black transition-all placeholder:text-text-muted/40" placeholder="e.g. ELITE50" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Discount Value</label>
                    <input required defaultValue={editingCoupon?.discount} name="discount" placeholder="e.g. 20% or ₹100" className="w-full bg-bg-secondary border border-border-light rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all placeholder:text-text-muted/40" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Logic Type</label>
                    <select name="type" defaultValue={editingCoupon?.type || 'Percentage'} className="w-full bg-bg-secondary border border-border-light rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all cursor-pointer appearance-none">
                      <option>Percentage</option>
                      <option>Fixed Amount</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Campaign Lifecycle</label>
                  <input required defaultValue={editingCoupon?.expires ? new Date(editingCoupon.expires).toISOString().split('T')[0] : ''} name="expires" type="date" className="w-full bg-bg-secondary border border-border-light rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all cursor-pointer" />
                </div>
                <button type="submit" className="w-full bg-brand-primary text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-hover transition-all mt-6 shadow-[0_12px_24px_rgba(16,185,129,0.2)] active:scale-[0.98]">
                  {editingCoupon ? 'Confirm Update' : 'Initialize Lifecycle'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
