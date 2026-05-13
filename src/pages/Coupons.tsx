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
    <div className="w-full space-y-8 relative px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Elite <span className="text-brand-primary">Incentives</span></h1>
          <p className="text-text-secondary text-[13px] mt-0.5">Design sophisticated promotional campaigns to drive volume.</p>
        </div>
        <button 
          onClick={() => {
            setEditingCoupon(null);
            setIsModalOpen(true);
          }} 
          className="bg-brand-primary text-white px-5 py-2.5 rounded-lg font-bold text-[13px] flex items-center hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10 hover:-translate-y-0.5 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 mr-2" />
          Deploy Campaign
        </button>
      </div>

      <AnimatePresence mode="wait">
        {coupons.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-border-light rounded-xl p-12 md:p-20 flex flex-col items-center justify-center text-center shadow-premium"
          >
            <div className="w-16 h-16 bg-bg-secondary rounded-xl flex items-center justify-center mb-6 border border-border-light shadow-inner">
              <Ticket className="w-8 h-8 text-brand-primary opacity-20" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">No Active Campaigns</h2>
            <p className="text-text-secondary max-w-sm mb-8 text-[13px]">Incentivize your elite athletes with precision-targeted discount structures.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-primary text-white px-6 py-2.5 rounded-lg font-bold text-[13px] hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10 active:scale-95"
            >
              Initialize Campaign
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {coupons.map((coupon, idx) => (
              <motion.div 
                key={coupon.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl p-4 border border-border-light hover:border-brand-primary/30 transition-all duration-300 shadow-premium relative overflow-hidden group hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-primary/5 rounded-bl-[2rem] -mr-10 -mt-10 pointer-events-none group-hover:bg-brand-primary/10 transition-colors" />
                
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-bg-secondary flex items-center justify-center group-hover:bg-brand-primary/5 transition-colors border border-border-light group-hover:border-brand-primary/20">
                      <Tag className="w-4 h-4 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-primary tracking-wider uppercase">{coupon.code}</h3>
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-0.5 inline-block border ${
                        coupon.status === 'Active' ? 'bg-brand-primary/5 text-brand-primary border-brand-primary/10' : 'bg-bg-secondary text-text-muted border-border-light'
                      }`}>
                        {coupon.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-end pb-3 border-b border-border-light">
                    <span className="text-text-muted text-[9px] font-bold uppercase tracking-wider">Discount</span>
                    <span className="text-xl font-bold text-brand-primary tracking-tight">{coupon.discount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted text-[9px] font-bold uppercase tracking-wider">Redemptions</span>
                    <span className="text-text-primary font-bold text-sm">{coupon.usage}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted text-[9px] font-bold uppercase tracking-wider flex items-center"><Clock className="w-3 h-3 mr-1.5 text-brand-primary" /> Lifecycle</span>
                    <span className="text-text-primary font-bold text-[11px]">{coupon.expires}</span>
                  </div>
                </div>
                
                <div className="mt-5 flex gap-2">
                  <button onClick={() => openEditModal(coupon)} className="flex-1 bg-bg-secondary hover:bg-brand-primary hover:text-white text-text-primary font-bold text-[9px] uppercase tracking-wider py-2 rounded-lg transition-all border border-border-light hover:border-brand-primary active:scale-95">
                    Configure
                  </button>
                  <button 
                    onClick={() => handleDelete(coupon.id, coupon.code)} 
                    className="px-3 bg-bg-secondary hover:bg-status-danger/5 text-text-muted hover:text-status-danger py-2 rounded-lg transition-all border border-border-light active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsModalOpen(false); setEditingCoupon(null); }} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} className="bg-white border border-border-light p-6 rounded-xl shadow-modal w-full max-w-md relative z-10 overflow-hidden" >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-text-primary tracking-tight">{editingCoupon ? 'Configure Campaign' : 'Initialize Campaign'}</h2>
                  <p className="text-text-muted text-[13px] mt-0.5">Define promotional parameters</p>
                </div>
                <button onClick={() => { setIsModalOpen(false); setEditingCoupon(null); }} className="p-1.5 text-text-muted hover:text-status-danger transition-colors" >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-0.5">Campaign Code</label>
                  <input required defaultValue={editingCoupon?.code} name="code" className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 uppercase font-bold text-[13px] transition-all placeholder:text-text-muted/40" placeholder="e.g. ELITE50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-0.5">Discount Value</label>
                    <input required defaultValue={editingCoupon?.discount} name="discount" placeholder="e.g. 20%" className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold text-[13px] transition-all placeholder:text-text-muted/40" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-0.5">Logic Type</label>
                    <select name="type" defaultValue={editingCoupon?.type || 'Percentage'} className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold text-[13px] transition-all cursor-pointer appearance-none">
                      <option>Percentage</option>
                      <option>Fixed Amount</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-0.5">Campaign Lifecycle</label>
                  <input required defaultValue={editingCoupon?.expires ? new Date(editingCoupon.expires).toISOString().split('T')[0] : ''} name="expires" type="date" className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold text-[13px] transition-all cursor-pointer" />
                </div>
                <button type="submit" className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold text-[13px] hover:bg-brand-hover transition-all mt-4 shadow-lg shadow-brand-primary/10 active:scale-[0.98]">
                  {editingCoupon ? 'Confirm Update' : 'Initialize Campaign'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
