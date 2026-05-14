import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Trash2, X, CalendarDays, Zap, IndianRupee, ChevronDown, Edit2 } from 'lucide-react';
import { useStore, type Slot } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { NumericInput } from '../components/NumericInput';
import { showConfirm } from '../utils/alerts';

export default function Slots() {
  const { slots, turfs, generateSlots, updateSlot, deleteSlot } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [selectedTurf, setSelectedTurf] = useState<string>('');
  const [isTurfDropdownOpen, setIsTurfDropdownOpen] = useState(false);
  const [startTime, setStartTime] = useState('06:00 AM');
  const [endTime, setEndTime] = useState('07:00 AM');
  const [isStartDropdownOpen, setIsStartDropdownOpen] = useState(false);
  const [isEndDropdownOpen, setIsEndDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const TIMES_12H = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = (i % 2) * 30;
    const hour = h % 12 || 12;
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    const price = fd.get('price') as string;
    if (!selectedTurf) newErrors.turf = 'Please select a facility.';
    if (!price) newErrors.price = 'Please set a price for this slot.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const slotData = {
      turf: selectedTurf,
      date: new Date().toISOString().split('T')[0],
      time: `${startTime} - ${endTime}`,
      price: price,
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
    setSelectedTurf(slot.turf);
    const [s, e] = slot.time.split('-').map(t => t.trim());
    setStartTime(s);
    setEndTime(e);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number, time: string) => {
    const confirmed = await showConfirm(
      'Delete Slot', 
      `Are you sure you want to delete the slot at ${time}?`,
      'Delete'
    );
    if (confirmed) {
      deleteSlot(id);
    }
  };

  return (
    <div className="w-full space-y-8 relative px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Slot Management</h1>
          <p className="text-text-secondary text-[13px] mt-0.5">Edit availability windows and dynamic pricing rules.</p>
        </div>
        <button 
          onClick={() => {
            setEditingSlot(null);
            setSelectedTurf('');
            setStartTime('06:00 AM');
            setEndTime('07:00 AM');
            setIsModalOpen(true);
          }} 
          className="bg-brand-primary text-white px-5 py-2.5 rounded-lg font-bold text-[13px] flex items-center hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10 hover:-translate-y-0.5 active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 mr-2" />
          Generate Slots
        </button>
      </div>

      <div className="bg-bg-primary border border-border-light rounded-xl shadow-premium overflow-hidden">
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
                  <td className="px-4 py-2.5">
                    <div className="flex items-center">
                      <div className="w-1 h-3.5 bg-brand-primary/20 rounded-full mr-2 group-hover:bg-brand-primary transition-colors" />
                      <span className="text-text-primary font-bold text-[13px]">{slot.turf}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center text-text-secondary text-[12px] font-medium">
                      <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-brand-primary" /> {slot.date}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center font-bold text-text-primary text-[12px]">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-brand-primary" /> {slot.time}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-bold text-brand-primary text-[12px] tracking-tight">{slot.price}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-all ${
                      slot.isBooked 
                        ? 'bg-status-danger/5 text-status-danger border-status-danger/10' 
                        : 'bg-brand-primary/5 text-brand-primary border-brand-primary/10'
                    }`}>
                      {slot.isBooked ? 'Booked' : 'Available'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!slot.isBooked && (
                        <button 
                          onClick={() => handleEdit(slot)}
                          className="p-1.5 text-brand-primary bg-brand-primary/5 hover:bg-brand-primary hover:text-white rounded-lg transition-all shadow-sm shadow-brand-primary/5"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(slot.id, slot.time)}
                        className="p-1.5 text-text-muted hover:text-status-danger hover:bg-status-danger/5 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
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
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="bg-bg-primary border border-border-light rounded-xl shadow-modal w-full max-w-md relative z-10"
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
              <form noValidate onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Facility</label>
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => {
                        if (!editingSlot) {
                          setIsTurfDropdownOpen(!isTurfDropdownOpen);
                          setErrors(prev => ({ ...prev, turf: '' }));
                        }
                      }}
                      className={`w-full bg-bg-secondary border rounded-lg px-4 py-2.5 text-sm text-left flex justify-between items-center transition-all ${
                        !editingSlot ? 'hover:border-brand-primary/30' : 'opacity-50 cursor-not-allowed'
                      } ${isTurfDropdownOpen ? 'border-brand-primary ring-4 ring-brand-primary/5' : ''} ${
                        errors.turf ? 'border-status-danger ring-4 ring-status-danger/5' : 'border-border-light'
                      }`}
                    >
                      <span className={`font-medium ${selectedTurf ? 'text-text-primary' : 'text-text-muted'}`}>
                        {selectedTurf || 'Select Facility'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-300 ${isTurfDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {errors.turf && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5 ml-0.5">
                          <p className="text-[12px] font-bold text-status-danger leading-none">{errors.turf}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {isTurfDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-50 top-full left-0 right-0 mt-2 bg-bg-primary border border-border-light rounded-xl shadow-modal overflow-hidden"
                        >
                          <div className="max-h-60 overflow-y-auto py-1">
                            {turfs.map(t => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                  setSelectedTurf(t.name);
                                  setIsTurfDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-[13px] font-bold transition-all ${
                                  selectedTurf === t.name ? 'bg-brand-primary/5 text-brand-primary' : 'text-text-primary hover:bg-bg-secondary'
                                }`}
                              >
                                {t.name}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Hidden input for form submission if needed, though we use state now */}
                    <input type="hidden" name="turf" value={selectedTurf} />
                    
                    {isTurfDropdownOpen && (
                      <div className="fixed inset-0 z-40" onClick={() => setIsTurfDropdownOpen(false)} />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Start Time</label>
                    <div className="relative">
                      <button 
                        type="button"
                        onClick={() => setIsStartDropdownOpen(!isStartDropdownOpen)}
                        className={`w-full bg-bg-secondary border border-border-light rounded-lg pl-10 pr-4 py-2.5 text-sm text-left flex justify-between items-center transition-all hover:border-brand-primary/30 ${isStartDropdownOpen ? 'border-brand-primary ring-4 ring-brand-primary/5' : ''}`}
                      >
                        <span className="text-text-primary font-bold">{startTime}</span>
                        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-300 ${isStartDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                        <Clock className="w-3.5 h-3.5" />
                      </div>

                      <AnimatePresence>
                        {isStartDropdownOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute z-50 top-full left-0 right-0 mt-2 bg-bg-primary border border-border-light rounded-xl shadow-modal overflow-hidden"
                          >
                            <div className="max-h-48 overflow-y-auto py-1">
                              {TIMES_12H.map(t => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => {
                                    setStartTime(t);
                                    setIsStartDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-[13px] font-bold transition-all ${
                                    startTime === t ? 'bg-brand-primary/5 text-brand-primary' : 'text-text-primary hover:bg-bg-secondary'
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">End Time</label>
                    <div className="relative">
                      <button 
                        type="button"
                        onClick={() => setIsEndDropdownOpen(!isEndDropdownOpen)}
                        className={`w-full bg-bg-secondary border border-border-light rounded-lg pl-10 pr-4 py-2.5 text-sm text-left flex justify-between items-center transition-all hover:border-brand-primary/30 ${isEndDropdownOpen ? 'border-brand-primary ring-4 ring-brand-primary/5' : ''}`}
                      >
                        <span className="text-text-primary font-bold">{endTime}</span>
                        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-300 ${isEndDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                        <Clock className="w-3.5 h-3.5" />
                      </div>

                      <AnimatePresence>
                        {isEndDropdownOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute z-50 top-full left-0 right-0 mt-2 bg-bg-primary border border-border-light rounded-xl shadow-modal overflow-hidden"
                          >
                            <div className="max-h-48 overflow-y-auto py-1">
                              {TIMES_12H.map(t => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => {
                                    setEndTime(t);
                                    setIsEndDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-[13px] font-bold transition-all ${
                                    endTime === t ? 'bg-brand-primary/5 text-brand-primary' : 'text-text-primary hover:bg-bg-secondary'
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  {/* Click Outside Overlay for times */}
                  {(isStartDropdownOpen || isEndDropdownOpen) && (
                    <div className="fixed inset-0 z-40" onClick={() => { setIsStartDropdownOpen(false); setIsEndDropdownOpen(false); }} />
                  )}
                </div>
                  <div className="space-y-1.5">
                    <NumericInput 
                      name="price" 
                      label="Price (₹)"
                      error={errors.price}
                      onValueChange={() => setErrors(prev => ({ ...prev, price: '' }))}
                      defaultValue={editingSlot?.price ? editingSlot.price.replace(/[^0-9.]/g, '') : ''}
                      placeholder="1500" 
                      icon={<IndianRupee className="w-3.5 h-3.5" />}
                      className="w-full bg-bg-secondary border border-border-light rounded-lg pr-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all" 
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
