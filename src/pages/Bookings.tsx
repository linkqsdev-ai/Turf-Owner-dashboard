import { useState } from 'react';
import { CheckCircle, XCircle, Search, Trash2, CalendarX, Plus, User, ArrowRight, ChevronDown, Pencil, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { NumericInput } from '../components/NumericInput';
import { Input } from '../components/Input';
import { showConfirm } from '../utils/alerts';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Bookings() {
  const { bookings, turfs, slots, customers, updateBookingStatus, addBooking, updateBooking, deleteBooking } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurf, setSelectedTurf] = useState<string>('');
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedTurfId, setSelectedTurfId] = useState<string>('');
  const [isTurfDropdownOpen, setIsTurfDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [formAmount, setFormAmount] = useState('');

  const availableSlotsForSelection = slots.filter(s => {
    const slotDateRaw = s.date.split('/').reverse().join('-');
    return String(s.turf_id) === String(selectedTurfId) && slotDateRaw === selectedDate;
  }).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    const customerName = customerSearch;
    const amount = formAmount;

    if (!customerName || customerName.trim().length < 2) newErrors.customer = 'Customer name required.';
    if (!selectedTurf) newErrors.turf = 'Facility required.';
    if (selectedSlots.length === 0) newErrors.slot = 'Please select at least one time slot.';
    if (!amount) newErrors.amount = 'Booking amount required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingBooking) {
      const bookingData: any = {
        customerName,
        turfId: selectedTurfId,
        turfName: selectedTurf,
        date: selectedDate,
        timeWindow: selectedSlots[0] || '',
        amount,
      };
      updateBooking(editingBooking, bookingData);
    } else {
      // Create one booking record per selected slot
      for (const slot of selectedSlots) {
        await addBooking({
          customerName,
          turfId: selectedTurfId,
          turfName: selectedTurf,
          date: selectedDate,
          timeWindow: slot,
          amount,
          sport: selectedSport
        });
      }
    }

    setIsModalOpen(false);
    setEditingBooking(null);
    setSelectedTurf('');
    setSelectedSport('');
    setSelectedTurfId('');
    setCustomerSearch('');
    setSelectedSlots([]);
    setFormAmount('');
  };

  const handleEdit = (booking: any) => {
    setEditingBooking(booking.id);
    setSelectedTurf(booking.turfName);
    setCustomerSearch(booking.customerName || '');
    
    // Find the turf ID from the name if possible, or we might need it in the booking object
    const turf = turfs.find(t => t.name === booking.turfName);
    if (turf) setSelectedTurfId(turf.id.toString());

    setSelectedSlots(booking.timeWindow ? [booking.timeWindow] : []);
    setFormAmount(booking.amount ? booking.amount.replace(/[^0-9]/g, '') : '');
    const dateParts = booking.date.split('/');
    if (dateParts.length === 3) {
      setSelectedDate(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, customer: string) => {
    const confirmed = await showConfirm(
      'Delete Booking',
      `Are you sure you want to delete booking for ${customer}?`,
      'Delete'
    );
    if (confirmed) {
      deleteBooking(id);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'Confirmed' | 'Cancelled', customer: string) => {
    const actionText = status === 'Confirmed' ? 'Confirm' : 'Cancel';
    const confirmed = await showConfirm(
      `${actionText} Booking`,
      `Are you sure you want to ${actionText.toLowerCase()} booking for ${customer}?`,
      actionText
    );
    if (confirmed) {
      updateBookingStatus(id, status);
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.turfName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.sport && b.sport.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedDayName = DAYS[new Date(selectedDate).getDay()];

  return (
    <div className="w-full h-full flex flex-col space-y-6 relative pb-2">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-5 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Booking Management {turfs.length > 0 ? `- ${turfs[0].name}` : ''}</h1>
          <p className="text-text-secondary text-[13px] mt-0.5">Manage and track manual bookings and reservations.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2.5 w-full md:w-auto shrink-0">
          <div className="relative group flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-brand-primary" />
            <input 
              type="text" 
              placeholder="Search customers or facilities..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-bg-primary border border-border-light text-[13px] font-bold text-text-primary focus:outline-none focus:border-brand-primary transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={() => {
              setEditingBooking(null);
              setSelectedTurf('');
              setSelectedTurfId('');
              setCustomerSearch('');
              setSelectedSlots([]);
              setFormAmount('');
              setIsModalOpen(true);
            }} 
            className="bg-brand-primary text-white px-6 h-10 rounded-xl font-bold text-[13px] flex items-center justify-center hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </button>
        </div>
      </div>

      <div className="bg-bg-primary border border-border-light rounded-xl shadow-premium overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-bg-secondary/90 backdrop-blur-md border-b border-border-light text-text-muted text-[10px] font-bold tracking-wider">
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Sports & Schedule</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-bg-secondary rounded-2xl flex items-center justify-center border border-border-light shadow-inner">
                        <CalendarX className="w-8 h-8 text-brand-primary opacity-20" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-text-primary">No bookings found</p>
                        <p className="text-text-secondary text-[13px]">Create a new booking or adjust your search.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.map((booking, idx) => (
                <motion.tr 
                  key={booking.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-bg-secondary/20 transition-colors group"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center text-brand-primary border border-border-light shadow-sm">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-text-primary font-bold text-[13px]">{booking.customerName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-text-primary text-[13px] flex items-center">
                      {booking.sport || turfs.find(t => String(t.id) === String(booking.turfId))?.type || booking.turfName}
                      <ArrowRight className="w-3 h-3 mx-2 text-text-muted opacity-40" />
                    </div>
                    <div className="text-[10px] text-text-secondary font-bold tracking-wider mt-1">{booking.date} • {booking.timeWindow}</div>
                  </td>
                  <td className="px-5 py-4 font-bold text-text-primary text-[13px]">{booking.amount}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider border transition-all ${
                      booking.status === 'Confirmed' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' : 
                      booking.status === 'Pending' ? 'bg-status-warning/10 text-status-warning border-status-warning/20' : 
                      'bg-status-danger/10 text-status-danger border-status-danger/20'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {booking.status === 'Pending' && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(booking.id, 'Confirmed', booking.customerName); }} 
                            className="p-2 text-status-success hover:bg-status-success/10 rounded-lg transition-all" 
                            title="Confirm Booking"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(booking.id, 'Cancelled', booking.customerName); }} 
                            className="p-2 text-status-danger hover:bg-status-danger/10 rounded-lg transition-all" 
                            title="Cancel Booking"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(booking); }} 
                        className="p-2 text-text-muted hover:text-brand-primary hover:bg-bg-secondary rounded-lg transition-all" 
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(booking.id, booking.customerName); }} 
                        className="p-2 text-text-muted hover:text-status-danger hover:bg-bg-secondary rounded-lg transition-all" 
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => { setIsModalOpen(false); setSelectedTurf(''); setSelectedSlots([]); setFormAmount(''); }} />
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} className="bg-bg-primary border border-border-light rounded-2xl shadow-modal w-full max-w-lg relative z-10 overflow-hidden" >
              <div className="p-6 border-b border-border-light flex justify-between items-center bg-bg-secondary/30">
                <h3 className="font-bold text-text-primary text-sm tracking-widest">{editingBooking ? 'Edit Booking' : 'New Booking'}</h3>
                <button onClick={() => { setIsModalOpen(false); setSelectedTurf(''); setSelectedSport(''); setSelectedSlots([]); setFormAmount(''); setEditingBooking(null); setCustomerSearch(''); }} className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-all" >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form noValidate onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 relative">
                    <label className="text-[11px] font-bold text-text-secondary tracking-wider">Customer Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted z-10" />
                      <input 
                        type="text"
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          setIsCustomerDropdownOpen(true);
                          setErrors({...errors, customer: ''});
                        }}
                        onFocus={() => setIsCustomerDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsCustomerDropdownOpen(false), 200)}
                        placeholder="Enter or search name"
                        className={`w-full bg-bg-secondary border rounded-xl pl-10 pr-4 py-2.5 text-[13px] font-bold text-text-primary outline-none transition-all ${
                          isCustomerDropdownOpen ? 'border-brand-primary ring-4 ring-brand-primary/5' : 'border-border-light'
                        } ${errors.customer ? 'border-status-danger' : ''}`}
                      />
                    </div>
                    {errors.customer && <p className="text-[11px] font-bold text-status-danger mt-1">{errors.customer}</p>}
                    
                    <AnimatePresence>
                      {isCustomerDropdownOpen && customerSearch && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, y: 5 }} 
                          className="absolute z-50 top-[calc(100%+0.5rem)] left-0 right-0 bg-bg-primary border border-border-light rounded-xl shadow-modal overflow-hidden max-h-48 overflow-y-auto custom-scrollbar"
                        >
                          {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).length > 0 ? (
                            customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).map(c => (
                              <button 
                                key={c.id}
                                type="button" 
                                onClick={() => {
                                  setCustomerSearch(c.name);
                                  setIsCustomerDropdownOpen(false);
                                  setErrors({...errors, customer: ''});
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-bg-secondary transition-colors border-b border-border-light last:border-0"
                              >
                                <span className="block text-[12px] font-bold text-text-primary">{c.name}</span>
                                <span className="block text-[10px] text-text-secondary font-normal mt-0.5">{c.email}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-[12px] text-text-muted italic">
                              New customer will be created
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary tracking-wider">Sport / Game</label>
                    <div className="relative">
                      <button 
                        type="button"
                        onClick={() => setIsTurfDropdownOpen(!isTurfDropdownOpen)}
                        className={`w-full bg-bg-secondary border rounded-xl px-4 py-2.5 text-[13px] text-left flex justify-between items-center transition-all ${
                          isTurfDropdownOpen ? 'border-brand-primary ring-4 ring-brand-primary/5' : 'border-border-light'
                        } ${errors.turf ? 'border-status-danger' : ''}`}
                      >
                        <span className={`font-bold ${selectedTurf ? 'text-text-primary' : 'text-text-muted'}`}>
                          {selectedSport ? `${selectedSport} (${selectedTurf})` : (selectedTurf ? (turfs.find(t => t.name === selectedTurf)?.type || selectedTurf) : 'Select Sport')}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isTurfDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isTurfDropdownOpen && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-bg-primary border border-border-light rounded-xl shadow-modal overflow-hidden py-1 max-h-48 overflow-y-auto custom-scrollbar">
                          {turfs.length === 0 ? (
                            <div className="px-4 py-3 text-center">
                              <p className="text-[11px] font-bold text-status-danger tracking-wider">No Sports Found</p>
                              <p className="text-[10px] text-text-muted mt-1">Add facilities in the Turf section</p>
                            </div>
                          ) : (
                            turfs.flatMap(t => 
                              (t.type || t.name).split(',').map(s => s.trim()).filter(Boolean).map((sport, index) => (
                                <button 
                                  key={`${t.id}-${index}`} 
                                  type="button" 
                                  onClick={() => { 
                                    setSelectedTurf(t.name); 
                                    setSelectedTurfId(t.id.toString());
                                    setSelectedSport(sport);
                                    setIsTurfDropdownOpen(false); 
                                    setErrors({...errors, turf: ''}); 
                                  }} 
                                  className="w-full text-left px-4 py-2 text-[12px] font-bold hover:bg-bg-secondary text-text-primary"
                                >
                                  {sport} {turfs.filter(turf => turf.type.includes(sport)).length > 1 ? `(${t.name})` : ''}
                                </button>
                              ))
                            )
                          )}
                        </div>
                      )}
                    </div>
                    {errors.turf && <p className="text-[11px] font-bold text-status-danger mt-1.5">{errors.turf}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-secondary tracking-wider">Booking Date</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlots([]); }}
                      className="flex-1 bg-bg-secondary border border-border-light rounded-xl px-4 py-2.5 text-[13px] font-bold text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 [color-scheme:dark]"
                    />
                    <div className="px-4 py-2.5 bg-brand-primary/10 border border-brand-primary/20 rounded-xl text-[11px] font-extrabold text-brand-primary tracking-widest min-w-[100px] text-center">
                      {selectedDayName}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-text-secondary tracking-wider">
                      Select Time Slots
                    </label>
                    {selectedSlots.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-extrabold tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                        {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {!selectedTurfId ? (
                      <div className="col-span-full py-10 text-center bg-bg-secondary/50 rounded-2xl border border-dashed border-border-light">
                        <Plus className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-20" />
                        <p className="text-[11px] font-bold text-text-muted tracking-wider">Please Select Facility</p>
                        <p className="text-[10px] text-text-muted mt-1">Choose a facility above to see slots.</p>
                      </div>
                    ) : availableSlotsForSelection.length === 0 ? (
                      <div className="col-span-full py-10 text-center bg-status-danger/5 rounded-2xl border border-dashed border-status-danger/20">
                        <CalendarX className="w-8 h-8 text-status-danger mx-auto mb-2 opacity-30" />
                        <p className="text-[11px] font-bold text-status-danger tracking-wider">No Slots Generated</p>
                        <p className="text-[10px] text-text-muted mt-1">Check timing rules in Settings.</p>
                      </div>
                    ) : (
                      availableSlotsForSelection.map(slot => {
                        const isSelected = selectedSlots.includes(slot.time);
                        const isDisabled = slot.status !== 'Available';
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              setSelectedSlots(prev =>
                                prev.includes(slot.time)
                                  ? prev.filter(s => s !== slot.time)
                                  : [...prev, slot.time]
                              );
                              setErrors(prev => ({ ...prev, slot: '' }));
                            }}
                            className={`relative py-3 rounded-xl text-[12px] font-bold transition-all border flex flex-col items-center justify-center gap-1 ${
                              isSelected
                                ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20 scale-[1.02] z-10'
                                : isDisabled
                                  ? 'bg-bg-secondary text-text-muted border-border-light opacity-50 cursor-not-allowed'
                                  : 'bg-bg-primary text-text-primary border-border-light hover:border-brand-primary/50 hover:bg-bg-secondary'
                            }`}
                          >
                            <span className="tracking-tight">{slot.time}</span>
                            {isSelected && <span className="text-[9px] uppercase opacity-80">✓ Selected</span>}
                            {!isSelected && !isDisabled && <span className="text-[9px] text-brand-primary uppercase opacity-60">Available</span>}
                            {isDisabled && <span className="text-[9px] uppercase">{slot.status}</span>}
                          </button>
                        );
                      })
                    )}
                  </div>
                  {errors.slot && <p className="text-[11px] font-bold text-status-danger mt-1.5">{errors.slot}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <NumericInput 
                    name="amount" 
                    label="Booking Amount (₹)"
                    error={errors.amount}
                    value={formAmount}
                    onValueChange={(val) => { setFormAmount(val); setErrors(prev => ({ ...prev, amount: '' })); }}
                    placeholder="1200" 
                    icon={<div className="text-[13px] font-bold">₹</div>}
                  />
                  <div className="flex items-end">
                    <button 
                      type="submit" 
                      disabled={!selectedTurfId || selectedSlots.length === 0}
                      className="w-full bg-brand-primary text-white h-[45px] rounded-xl font-bold text-[13px] uppercase tracking-wider hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                      {editingBooking ? 'Save Changes' : 'Confirm Entry'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
