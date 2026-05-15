import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Trash2, X, CalendarDays, Zap, IndianRupee, ChevronDown, Edit2, Filter, Search } from 'lucide-react';
import { useStore, type Slot } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { NumericInput } from '../components/NumericInput';
import { showConfirm } from '../utils/alerts';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const STATUSES = ['All Statuses', 'Available', 'Booked', 'Under Maintenance'];

export default function Slots() {
  const { slots, turfs, generateSlots, updateSlot, deleteSlot } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  
  // Filters
  const [filterTurf, setFilterTurf] = useState<string>('All Facilities');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterDay, setFilterDay] = useState<string>('All Days');
  const [filterStatus, setFilterStatus] = useState<string>('All Statuses');
  
  // Modal State
  const [selectedTurf, setSelectedTurf] = useState<string>('');
  const [selectedTurfId, setSelectedTurfId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Available');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('07:00 AM');
  const [endTime, setEndTime] = useState('08:00 AM');
  
  const [isTurfDropdownOpen, setIsTurfDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isFilterTurfOpen, setIsFilterTurfOpen] = useState(false);
  const [isFilterDayOpen, setIsFilterDayOpen] = useState(false);
  const [isFilterStatusOpen, setIsFilterStatusOpen] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredSlots = useMemo(() => {
    return slots.filter(slot => {
      const matchTurf = filterTurf === 'All Facilities' || slot.turf === filterTurf;
      const matchStatus = filterStatus === 'All Statuses' || slot.status === filterStatus;
      const matchDay = filterDay === 'All Days' || slot.dayOfWeek === filterDay;
      
      const slotDateRaw = slot.date.split('/').reverse().join('-');
      const matchDate = !filterDate || slotDateRaw === filterDate;
      
      return matchTurf && matchStatus && matchDay && matchDate;
    });
  }, [slots, filterTurf, filterStatus, filterDay, filterDate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    const price = fd.get('price') as string;
    const status = editingSlot ? selectedStatus : 'Available';

    if (!selectedTurf) newErrors.turf = 'Facility required.';
    if (!price || parseInt(price) <= 0) newErrors.price = 'Valid price required.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const slotData: any = {
      turfId: selectedTurfId,
      turf: selectedTurf,
      date: selectedDate,
      time: `${startTime} - ${endTime}`,
      price: price,
      status: status
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
    setSelectedStatus(slot.status);
    setSelectedDate(slot.date.includes('/') ? slot.date.split('/').reverse().join('-') : slot.date);
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

  const TIMES_12H = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = (i % 2) * 30;
    const hour = h % 12 || 12;
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
  });

  return (
    <div className="w-full space-y-8 relative px-4 md:px-0 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Slot Management</h1>
          <p className="text-text-secondary text-[13px] mt-0.5">View and manage generated slots for your facilities.</p>
        </div>
        <button 
          onClick={() => {
            setEditingSlot(null);
            setSelectedTurf('');
            setSelectedTurfId('');
            setStartTime('07:00 AM');
            setEndTime('08:00 AM');
            setIsModalOpen(true);
          }} 
          className="bg-brand-primary text-white px-5 py-2.5 rounded-lg font-bold text-[13px] flex items-center hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10 active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 mr-2" />
          Quick Slot
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-bg-primary border border-border-light rounded-xl shadow-premium">
        {/* Facility Filter */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-0.5">Facility</label>
          <div className="relative">
            <button 
              onClick={() => setIsFilterTurfOpen(!isFilterTurfOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-bg-secondary border border-border-light rounded-lg text-[12px] font-bold text-text-primary transition-all hover:border-brand-primary/30"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3 h-3 text-brand-primary" />
                {filterTurf}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${isFilterTurfOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isFilterTurfOpen && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute z-20 top-full left-0 right-0 mt-2 bg-bg-primary border border-border-light rounded-xl shadow-modal overflow-hidden py-1">
                  <button onClick={() => { setFilterTurf('All Facilities'); setIsFilterTurfOpen(false); }} className="w-full text-left px-4 py-2 text-[12px] font-bold hover:bg-bg-secondary text-text-primary">All Facilities</button>
                  {turfs.map(t => (
                    <button key={t.id} onClick={() => { setFilterTurf(t.name); setIsFilterTurfOpen(false); }} className="w-full text-left px-4 py-2 text-[12px] font-bold hover:bg-bg-secondary text-text-primary">{t.name}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Date Filter */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-0.5">Date</label>
          <div className="relative">
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 bg-bg-secondary border border-border-light rounded-lg text-[12px] font-bold text-text-primary outline-none focus:border-brand-primary transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Day Filter */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-0.5">Day</label>
          <div className="relative">
            <button 
              onClick={() => setIsFilterDayOpen(!isFilterDayOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-bg-secondary border border-border-light rounded-lg text-[12px] font-bold text-text-primary transition-all hover:border-brand-primary/30"
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-3 h-3 text-brand-primary" />
                {filterDay}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${isFilterDayOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isFilterDayOpen && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute z-20 top-full left-0 right-0 mt-2 bg-bg-primary border border-border-light rounded-xl shadow-modal overflow-hidden py-1 max-h-48 overflow-y-auto">
                  <button onClick={() => { setFilterDay('All Days'); setIsFilterDayOpen(false); }} className="w-full text-left px-4 py-2 text-[12px] font-bold hover:bg-bg-secondary text-text-primary">All Days</button>
                  {DAYS.map(day => (
                    <button key={day} onClick={() => { setFilterDay(day); setIsFilterDayOpen(false); }} className="w-full text-left px-4 py-2 text-[12px] font-bold hover:bg-bg-secondary text-text-primary">{day}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-0.5">Status</label>
          <div className="relative">
            <button 
              onClick={() => setIsFilterStatusOpen(!isFilterStatusOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-bg-secondary border border-border-light rounded-lg text-[12px] font-bold text-text-primary transition-all hover:border-brand-primary/30"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3 text-brand-primary" />
                {filterStatus}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${isFilterStatusOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isFilterStatusOpen && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute z-20 top-full left-0 right-0 mt-2 bg-bg-primary border border-border-light rounded-xl shadow-modal overflow-hidden py-1">
                  {STATUSES.map(status => (
                    <button key={status} onClick={() => { setFilterStatus(status); setIsFilterStatusOpen(false); }} className="w-full text-left px-4 py-2 text-[12px] font-bold hover:bg-bg-secondary text-text-primary">{status}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-primary border border-border-light rounded-xl shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-secondary/30 border-b border-border-light text-text-muted text-[10px] font-bold uppercase tracking-wider">
                <th className="px-5 py-3.5">Facility</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Day</th>
                <th className="px-5 py-3.5">Time Window</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredSlots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-bg-secondary rounded-xl flex items-center justify-center border border-border-light">
                        <CalendarDays className="w-8 h-8 text-brand-primary opacity-20" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-text-primary">No slots match your filters</p>
                        <p className="text-text-secondary text-[13px]">Try adjusting your search criteria.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredSlots.map((slot, idx) => (
                <motion.tr 
                  key={slot.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.01 }}
                  className="hover:bg-bg-secondary/20 transition-colors group"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center">
                      <div className="w-1 h-3.5 bg-brand-primary/20 rounded-full mr-2 group-hover:bg-brand-primary transition-colors" />
                      <span className="text-text-primary font-bold text-[13px]">{slot.turf}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-text-primary font-bold text-[12px]">{slot.date}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] font-bold text-text-secondary">
                    {slot.dayOfWeek || 'N/A'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center font-bold text-text-primary text-[12px]">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-brand-primary" /> {slot.time}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-brand-primary text-[12px] tracking-tight">{slot.price}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-all ${
                      slot.status === 'Booked' 
                        ? 'bg-bg-secondary text-text-muted border-border-light' 
                        : slot.status === 'Under Maintenance'
                          ? 'bg-status-danger/10 text-status-danger border-status-danger/20'
                          : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                    }`}>
                      {slot.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleEdit(slot)}
                        className="p-1.5 text-brand-primary bg-brand-primary/5 hover:bg-brand-primary hover:text-white rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
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

      {/* Modal - Same as before but with day field logic if needed */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} className="bg-bg-primary border border-border-light rounded-2xl shadow-modal w-full max-w-md relative z-10 overflow-hidden">
              <div className="p-6 border-b border-border-light flex justify-between items-center bg-bg-secondary/30">
                <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider">
                  {editingSlot ? 'Edit Slot' : 'Generate Quick Slot'}
                </h3>
                <button onClick={() => { setIsModalOpen(false); setEditingSlot(null); }} className="p-1 text-text-muted hover:text-text-primary transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form noValidate onSubmit={handleSubmit} className="p-6 pb-8 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Facility</label>
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => !editingSlot && setIsTurfDropdownOpen(!isTurfDropdownOpen)}
                      className={`w-full bg-bg-secondary border rounded-lg px-4 py-2.5 text-[13px] text-left flex justify-between items-center transition-all ${
                        !editingSlot ? 'hover:border-brand-primary/30' : 'opacity-50 cursor-not-allowed'
                      } ${isTurfDropdownOpen ? 'border-brand-primary ring-4 ring-brand-primary/5' : 'border-border-light'} ${
                        errors.turf ? 'border-status-danger ring-4 ring-status-danger/5' : ''
                      }`}
                    >
                      <span className={`font-bold ${selectedTurf ? 'text-text-primary' : 'text-text-muted'}`}>{selectedTurf || 'Select Facility'}</span>
                      <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isTurfDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isTurfDropdownOpen && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-bg-primary border border-border-light rounded-xl shadow-modal overflow-hidden py-1">
                        {turfs.map(t => (
                          <button key={t.id} type="button" onClick={() => { 
                            setSelectedTurf(t.name); 
                            setSelectedTurfId(t.id.toString());
                            setIsTurfDropdownOpen(false); 
                            setErrors({...errors, turf: ''}); 
                          }} className="w-full text-left px-4 py-2 text-[12px] font-bold hover:bg-bg-secondary text-text-primary">{t.name}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.turf && <p className="text-[11px] font-bold text-status-danger mt-1.5">{errors.turf}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Slot Date</label>
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-[13px] font-bold text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 [color-scheme:dark]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Start</label>
                    <select value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-[13px] font-bold text-text-primary outline-none focus:border-brand-primary">
                      {TIMES_12H.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">End</label>
                    <select value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-[13px] font-bold text-text-primary outline-none focus:border-brand-primary">
                      {TIMES_12H.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <NumericInput name="price" label="Price (₹)" error={errors.price} onValueChange={() => setErrors({...errors, price: ''})} defaultValue={editingSlot?.price?.replace(/[^0-9.]/g, '') || ''} placeholder="900" icon={<IndianRupee className="w-3.5 h-3.5" />} />

                {editingSlot && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Status</label>
                    <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-[13px] font-bold text-brand-primary outline-none focus:border-brand-primary">
                      {['Available', 'Booked', 'Under Maintenance'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                <button type="submit" className="w-full bg-brand-primary text-white py-3.5 rounded-xl font-bold text-[13px] uppercase tracking-wider hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10 active:scale-[0.98]">
                  {editingSlot ? 'Update Slot' : 'Generate Slot'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
