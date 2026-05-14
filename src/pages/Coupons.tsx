import { useState } from 'react';
import { Tag, Trash2, Clock, X, Ticket, Sparkles, Search, CheckCircle2, Calendar, MapPin } from 'lucide-react';
import { useStore, type Coupon } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { NumericInput } from '../components/NumericInput';
import { Input } from '../components/Input';
import { showConfirm } from '../utils/alerts';

export default function Coupons() {
  const { coupons, slots, addCoupon, updateCoupon, deleteCoupon } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [appliesTo, setAppliesTo] = useState<'all_slots' | 'specific_slots'>('all_slots');
  const [selectedSlotIds, setSelectedSlotIds] = useState<(string | number)[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSlots = slots.filter(s => 
    s.turf.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.time.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    const code = fd.get('code') as string;
    const discount = fd.get('discount') as string;
    const expires = fd.get('expires') as string;

    if (!code || code.trim().length < 3) newErrors.code = 'Coupon code must be at least 3 characters.';
    if (!discount) newErrors.discount = 'Please specify a discount value.';
    if (!expires) newErrors.expires = 'Set a valid expiration date.';
    
    if (appliesTo === 'specific_slots' && selectedSlotIds.length === 0) {
      newErrors.slots = 'Please select at least one slot for this campaign.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const data = {
      code: code.toUpperCase(),
      discount: discount,
      type: fd.get('type') as string,
      expires: expires,
      appliesTo,
      selectedSlotIds
    };

    if (editingCoupon) {
      await updateCoupon(editingCoupon.id, data);
    } else {
      await addCoupon(data);
    }
    
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
    setErrors({});
    setAppliesTo('all_slots');
    setSelectedSlotIds([]);
    setSearchTerm('');
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setAppliesTo(coupon.appliesTo || 'all_slots');
    setSelectedSlotIds(coupon.selectedSlotIds || []);
    setIsModalOpen(true);
  };

  const toggleSlotSelection = (id: string | number) => {
    setSelectedSlotIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
    if (errors.slots) setErrors(prev => ({ ...prev, slots: '' }));
  };

  const handleDelete = async (id: string | number, code: string) => {
    const confirmed = await showConfirm(
      'Purge Coupon',
      `Are you sure you want to delete coupon ${code}?`,
      'Purge'
    );
    if (confirmed) {
      deleteCoupon(id);
    }
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
            className="bg-bg-primary border border-border-light rounded-xl p-12 md:p-20 flex flex-col items-center justify-center text-center shadow-premium"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {coupons.map((coupon, idx) => (
              <motion.div 
                key={coupon.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-bg-primary rounded-xl p-4 border border-border-light hover:border-brand-primary/30 transition-all duration-300 shadow-premium relative overflow-hidden group hover:-translate-y-1 flex flex-col"
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
                
                <div className="space-y-3 flex-1">
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
                  <div className="flex justify-between items-center pt-2 border-t border-border-light/50">
                    <span className="text-text-muted text-[9px] font-bold uppercase tracking-wider">Targeting</span>
                    <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-full">
                      {coupon.appliesTo === 'specific_slots' ? `${coupon.selectedSlotIds?.length || 0} Slots` : 'All Slots'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-5 flex gap-2">
                  <button onClick={() => openEditModal(coupon)} className="flex-1 bg-brand-primary text-white font-bold text-[9px] uppercase tracking-wider py-2 rounded-lg transition-all shadow-sm shadow-brand-primary/10 hover:bg-brand-hover active:scale-95">
                    Edit
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.98, y: 10 }} 
              className={`bg-bg-primary border border-border-light p-6 rounded-xl shadow-modal w-full ${appliesTo === 'specific_slots' ? 'max-w-3xl' : 'max-w-md'} relative z-10 overflow-hidden transition-all duration-300`} 
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-text-primary tracking-tight">{editingCoupon ? 'Edit Campaign' : 'Initialize Campaign'}</h2>
                  <p className="text-text-muted text-[13px] mt-0.5">Define promotional parameters</p>
                </div>
                <button onClick={closeModal} className="p-1.5 text-text-muted hover:text-status-danger transition-colors" >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form noValidate onSubmit={handleSubmit} className="space-y-6">
                <div className={`${appliesTo === 'specific_slots' ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : 'space-y-6'}`}>
                  <div className="space-y-5">
                    <Input 
                      name="code"
                      label="Campaign Identifier"
                      defaultValue={editingCoupon?.code}
                      error={errors.code}
                      onChange={() => setErrors(prev => ({ ...prev, code: '' }))}
                      placeholder="e.g. FLASH50"
                      icon={<Ticket className="w-4 h-4" />}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <NumericInput 
                        name="discount" 
                        label="Value"
                        error={errors.discount}
                        onValueChange={() => setErrors(prev => ({ ...prev, discount: '' }))}
                        defaultValue={editingCoupon?.discount ? editingCoupon.discount.replace(/[^0-9.]/g, '') : ''}
                        placeholder="50" 
                        icon={<div className="text-[11px] font-bold">%</div>}
                      />
                      
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Structure</label>
                        <select name="type" className="w-full bg-bg-secondary border border-border-light rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-all font-bold h-[42px]">
                          <option value="Percentage">Percentage</option>
                          <option value="Fixed">Fixed Amount</option>
                        </select>
                      </div>
                    </div>

                    <Input 
                      name="expires"
                      label="Lifecycle Expiry"
                      type="date"
                      error={errors.expires}
                      onChange={() => setErrors(prev => ({ ...prev, expires: '' }))}
                      defaultValue={editingCoupon?.expires}
                      icon={<Clock className="w-4 h-4" />}
                    />

                    <div className="space-y-2.5">
                      <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Coupon Applies To</label>
                      <div className="flex gap-3">
                        <button 
                          type="button"
                          onClick={() => setAppliesTo('all_slots')}
                          className={`flex-1 py-2.5 rounded-lg border font-bold text-[12px] transition-all ${
                            appliesTo === 'all_slots' 
                              ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' 
                              : 'bg-bg-secondary border-border-light text-text-muted hover:border-border-medium'
                          }`}
                        >
                          All Slots
                        </button>
                        <button 
                          type="button"
                          onClick={() => setAppliesTo('specific_slots')}
                          className={`flex-1 py-2.5 rounded-lg border font-bold text-[12px] transition-all ${
                            appliesTo === 'specific_slots' 
                              ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' 
                              : 'bg-bg-secondary border-border-light text-text-muted hover:border-border-medium'
                          }`}
                        >
                          Specific Slots
                        </button>
                      </div>
                    </div>
                  </div>

                  {appliesTo === 'specific_slots' && (
                    <div className="flex flex-col h-[400px]">
                      <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2 flex justify-between items-center">
                        Select Targeted Slots
                        <span className="text-brand-primary lowercase font-medium">{selectedSlotIds.length} selected</span>
                      </label>
                      
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                        <input 
                          type="text"
                          placeholder="Search turf or date..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-bg-secondary border border-border-light rounded-lg pl-9 pr-4 py-2 text-[12px] text-text-primary outline-none focus:border-brand-primary transition-all"
                        />
                      </div>

                      <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                        {filteredSlots.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-4">
                            <Ticket className="w-8 h-8 text-text-muted opacity-20 mb-2" />
                            <p className="text-[11px] text-text-muted">No slots found</p>
                          </div>
                        ) : (
                          filteredSlots.map(slot => (
                            <div 
                              key={slot.id}
                              onClick={() => toggleSlotSelection(slot.id)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between group ${
                                selectedSlotIds.includes(slot.id)
                                  ? 'bg-brand-primary/5 border-brand-primary shadow-sm'
                                  : 'bg-bg-secondary/50 border-border-light hover:border-border-medium'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <MapPin className="w-3 h-3 text-brand-primary" />
                                  <span className="text-[11px] font-bold text-text-primary truncate">{slot.turf}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-text-muted font-medium">
                                  <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {slot.date}</span>
                                  <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {slot.time}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1 ml-4">
                                <span className="text-[11px] font-bold text-text-primary">{slot.price}</span>
                                {selectedSlotIds.includes(slot.id) ? (
                                  <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-border-light group-hover:border-brand-primary/30" />
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      {errors.slots && <p className="text-[11px] font-bold text-status-danger mt-2">{errors.slots}</p>}
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full bg-brand-primary text-white py-3.5 rounded-lg font-bold text-[13px] hover:bg-brand-hover transition-all mt-2 shadow-lg shadow-brand-primary/10 active:scale-[0.98]">
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
