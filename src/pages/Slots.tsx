import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Trash2, X, CalendarDays, Zap } from 'lucide-react';
import { useStore, type Slot } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Slots() {
  const { slots, turfs, generateSlots, updateSlot, deleteSlot } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const slotData = {
      turf: fd.get('turf') as string,
      date: fd.get('date') as string,
      time: fd.get('time') as string,
      price: fd.get('price') as string,
    };

    if (editingSlot) {
      await updateSlot(editingSlot.id, slotData);
    } else {
      await generateSlots(slotData);
    }
    
    setIsModalOpen(false);
    setEditingSlot(null);
  };

  const handleEdit = (slot: Slot) => {
    setEditingSlot(slot);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string | number, time: string) => {
    if (window.confirm(`Are you sure you want to delete the slot at ${time}?`)) {
      deleteSlot(id);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 relative px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
            <span className="text-[10px] font-black text-brand-primary tracking-[0.2em] uppercase">Inventory Control</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight leading-tight">Slot <span className="text-brand-primary">Management.</span></h1>
          <p className="text-text-secondary font-medium mt-2">Configure daily availability windows and dynamic pricing rules.</p>
        </div>
        <button 
          onClick={() => {
            setEditingSlot(null);
            setIsModalOpen(true);
          }} 
          className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center hover:bg-brand-hover transition-all shadow-[0_8px_24px_rgba(16,185,129,0.2)] hover:-translate-y-1 active:scale-95"
        >
          <Zap className="w-5 h-5 mr-3" />
          Generate Availability
        </button>
      </div>

      <div className="bg-bg-card border border-border-light rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-secondary/50 border-b border-border-light text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-8">Facility Node</th>
                <th className="p-8">Timeline</th>
                <th className="p-8">Window</th>
                <th className="p-8">Price Index</th>
                <th className="p-8">Status</th>
                <th className="p-8 text-right">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {slots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-32 text-center">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center space-y-6"
                    >
                      <div className="w-20 h-20 bg-bg-secondary rounded-3xl flex items-center justify-center border border-border-light">
                        <CalendarDays className="w-10 h-10 text-brand-primary" />
                      </div>
                      <div>
                        <p className="text-xl font-black text-text-primary">No Active Slots</p>
                        <p className="text-text-muted text-sm font-medium mt-1">Initialize your facility timeline to begin.</p>
                      </div>
                    </motion.div>
                  </td>
                </tr>
              ) : slots.map((slot, idx) => (
                <motion.tr 
                  key={slot.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-bg-secondary/40 transition-colors group"
                >
                  <td className="p-8">
                    <div className="flex items-center">
                      <div className="w-1.5 h-6 bg-brand-primary/20 rounded-full mr-4 group-hover:bg-brand-primary transition-colors" />
                      <span className="text-text-primary font-black">{slot.turf}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center text-text-secondary font-bold">
                      <CalendarIcon className="w-4 h-4 mr-3 text-brand-primary" /> {slot.date}
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center font-black text-text-primary">
                      <Clock className="w-4 h-4 mr-3 text-brand-primary" /> {slot.time}
                    </div>
                  </td>
                  <td className="p-8 font-black text-brand-primary text-lg tracking-tight">{slot.price}</td>
                  <td className="p-8">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                      slot.isBooked 
                        ? 'bg-status-danger/10 text-status-danger border-status-danger/10' 
                        : 'bg-brand-primary/10 text-brand-primary border-brand-primary/10 group-hover:bg-brand-primary group-hover:text-white'
                    }`}>
                      {slot.isBooked ? 'Locked' : 'Available'}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {!slot.isBooked && (
                        <button 
                          onClick={() => handleEdit(slot)}
                          className="p-3 bg-bg-secondary hover:bg-brand-primary/10 text-text-muted hover:text-brand-primary rounded-2xl transition-all border border-border-light shadow-sm active:scale-90"
                          title="Edit Configuration"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(slot.id, slot.time)}
                        disabled={slot.isBooked}
                        className="p-3 bg-bg-secondary hover:bg-status-danger/10 text-text-muted hover:text-status-danger rounded-2xl transition-all border border-border-light shadow-sm active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed"
                        title="Decommission Slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsModalOpen(false); setEditingSlot(null); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-bg-card border border-border-light p-10 rounded-[2.5rem] shadow-modal w-full max-w-lg relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-black text-text-primary tracking-tight">{editingSlot ? 'Update Window' : 'Generate Grid'}</h2>
                  <p className="text-text-muted text-sm font-medium mt-1">Configure availability parameters</p>
                </div>
                <button 
                  onClick={() => { setIsModalOpen(false); setEditingSlot(null); }} 
                  className="p-3 bg-bg-secondary text-text-muted hover:text-status-danger rounded-2xl transition-colors border border-border-light"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Facility Identifier</label>
                  <select 
                    required 
                    name="turf" 
                    defaultValue={editingSlot?.turf}
                    disabled={!!editingSlot}
                    className="w-full bg-bg-secondary border border-border-light rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all cursor-pointer appearance-none disabled:opacity-40" 
                  >
                    <option value="" disabled>Select Facility</option>
                    {turfs.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Timeline Date</label>
                    <input 
                      required 
                      name="date" 
                      type="date" 
                      defaultValue={editingSlot?.date}
                      className="w-full bg-bg-secondary border border-border-light rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Time Window</label>
                    <input 
                      required 
                      name="time" 
                      defaultValue={editingSlot?.time}
                      placeholder="18:00 - 19:00" 
                      className="w-full bg-bg-secondary border border-border-light rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all placeholder:text-text-muted/40" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Yield Value</label>
                  <input 
                    required 
                    name="price" 
                    defaultValue={editingSlot?.price}
                    placeholder="e.g. ₹1500" 
                    className="w-full bg-bg-secondary border border-border-light rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-black transition-all placeholder:text-text-muted/40" 
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-brand-primary text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-hover transition-all mt-6 shadow-[0_12px_24px_rgba(16,185,129,0.2)] active:scale-[0.98]"
                >
                  {editingSlot ? 'Commit Update' : 'Initialize Timeline'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
