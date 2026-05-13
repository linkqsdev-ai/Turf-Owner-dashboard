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
    <div className="w-full space-y-8 relative px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Slot Management</h1>
          <p className="text-text-secondary text-[13px] mt-0.5">Configure availability windows and dynamic pricing rules.</p>
        </div>
        <button 
          onClick={() => {
            setEditingSlot(null);
            setIsModalOpen(true);
          }} 
          className="bg-brand-primary text-white px-5 py-2.5 rounded-lg font-bold text-[13px] flex items-center hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10 hover:-translate-y-0.5 active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 mr-2" />
          Generate Slots
        </button>
      </div>

      <div className="bg-white border border-border-light rounded-xl shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-secondary/30 border-b border-border-light text-text-muted text-[10px] font-bold uppercase tracking-wider">
                <th className="px-5 py-3.5">Facility</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Time Window</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {slots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center space-y-4"
                    >
                      <div className="w-16 h-16 bg-bg-secondary rounded-xl flex items-center justify-center border border-border-light">
                        <CalendarDays className="w-8 h-8 text-brand-primary opacity-20" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-text-primary">No active slots</p>
                        <p className="text-text-secondary text-sm">Initialize your schedule to begin accepting bookings.</p>
                      </div>
                    </motion.div>
                  </td>
                </tr>
              ) : slots.map((slot, idx) => (
                <motion.tr 
                  key={slot.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-bg-secondary/20 transition-colors group"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center">
                      <div className="w-1 h-4 bg-brand-primary/20 rounded-full mr-2.5 group-hover:bg-brand-primary transition-colors" />
                      <span className="text-text-primary font-bold text-[13px]">{slot.turf}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center text-text-secondary text-[13px] font-medium">
                      <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-brand-primary" /> {slot.date}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center font-bold text-text-primary text-[13px]">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-brand-primary" /> {slot.time}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-brand-primary text-[13px] tracking-tight">{slot.price}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-all ${
                      slot.isBooked 
                        ? 'bg-status-danger/5 text-status-danger border-status-danger/10' 
                        : 'bg-brand-primary/5 text-brand-primary border-brand-primary/10'
                    }`}>
                      {slot.isBooked ? 'Booked' : 'Available'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!slot.isBooked && (
                        <button 
                          onClick={() => handleEdit(slot)}
                          className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(slot.id, slot.time)}
                        disabled={slot.isBooked}
                        className="p-1.5 text-text-muted hover:text-status-danger hover:bg-status-danger/5 rounded-lg transition-all disabled:opacity-0"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="bg-white border border-border-light rounded-xl shadow-modal w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-border-light flex justify-between items-center">
                <h3 className="font-bold text-text-primary text-sm">
                  {editingSlot ? 'Edit Slot' : 'Generate Slots'}
                </h3>
                <button 
                  onClick={() => { setIsModalOpen(false); setEditingSlot(null); }} 
                  className="p-1 text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Facility</label>
                  <select 
                    required 
                    name="turf" 
                    defaultValue={editingSlot?.turf}
                    disabled={!!editingSlot}
                    className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-medium transition-all cursor-pointer appearance-none disabled:opacity-50" 
                  >
                    <option value="" disabled>Select Facility</option>
                    {turfs.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Date</label>
                    <input 
                      required 
                      name="date" 
                      type="date" 
                      defaultValue={editingSlot?.date}
                      className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-medium transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Time Window</label>
                    <input 
                      required 
                      name="time" 
                      defaultValue={editingSlot?.time}
                      placeholder="18:00 - 19:00" 
                      className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-medium transition-all" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Price (₹)</label>
                  <input 
                    required 
                    name="price" 
                    defaultValue={editingSlot?.price}
                    placeholder="e.g. ₹1500" 
                    className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all" 
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold text-sm hover:bg-brand-hover transition-all mt-2 shadow-lg shadow-brand-primary/10 active:scale-[0.98]"
                >
                  {editingSlot ? 'Update slot' : 'Generate slots'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
