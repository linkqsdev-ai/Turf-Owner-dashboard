import { useState } from 'react';
import { CheckCircle, XCircle, Search, Trash2, CalendarX, Plus, User, ArrowRight, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { NumericInput } from '../components/NumericInput';
import { Input } from '../components/Input';
import { showConfirm } from '../utils/alerts';

export default function Bookings() {
  const { bookings, turfs, updateBookingStatus, addBooking, deleteBooking } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurf, setSelectedTurf] = useState<string>('');
  const [isTurfDropdownOpen, setIsTurfDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedSlot, setSelectedSlot] = useState('');

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const TIME_SLOTS = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', 
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
  ];

  const getActualDate = (dayName: string) => {
    const today = new Date();
    const dayIndex = DAYS.indexOf(dayName);
    const todayIndex = (today.getDay() + 6) % 7; // Convert Sun-Sat (0-6) to Mon-Sun (0-6)
    
    let diff = dayIndex - todayIndex;
    if (diff < 0) diff += 7; // If day has passed, pick next week's day
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    return targetDate.toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    const customer = fd.get('customer') as string;
    const amount = fd.get('amount') as string;

    if (!customer || customer.trim().length < 2) newErrors.customer = 'Please enter customer name.';
    if (!selectedTurf) newErrors.turf = 'Please select a facility.';
    if (!selectedSlot) newErrors.slot = 'Please select a time slot.';
    if (!amount) newErrors.amount = 'Enter booking amount.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    addBooking({
      customer,
      turf: selectedTurf,
      date: getActualDate(selectedDay),
      time: selectedSlot,
      amount,
    });
    setIsModalOpen(false);
    setSelectedTurf('');
    setSelectedSlot('');
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

  const filteredBookings = bookings.filter(b => 
    b.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.turf.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-8 relative px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Booking Management</h1>
          <p className="text-text-secondary text-[13px] mt-0.5">Oversee and validate the complete reservation lifecycle.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2.5 w-full md:w-auto">
          <div className="relative group flex-1 md:w-60">
            <Search className={`w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${searchTerm ? 'text-brand-primary' : 'text-text-muted'}`} />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-bg-primary border border-border-light text-[13px] font-medium text-text-primary focus:outline-none focus:border-brand-primary transition-all placeholder:text-text-muted/50"
            />
          </div>
          <button 
            onClick={() => {
              setSelectedTurf('');
              setIsModalOpen(true);
            }} 
            className="bg-brand-primary text-white px-5 h-9 rounded-lg font-bold text-[13px] flex items-center justify-center hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 mr-2" />
            New Booking
          </button>
        </div>
      </div>

      <div className="bg-bg-primary border border-border-light rounded-xl shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-secondary/30 border-b border-border-light text-text-muted text-[10px] font-bold uppercase tracking-wider">
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Facility & Schedule</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center space-y-4"
                    >
                      <div className="w-16 h-16 bg-bg-secondary rounded-xl flex items-center justify-center border border-border-light">
                        <CalendarX className="w-8 h-8 text-brand-primary opacity-20" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-text-primary">No records found</p>
                        <p className="text-text-secondary text-sm">Adjust filters or create a new reservation.</p>
                      </div>
                    </motion.div>
                  </td>
                </tr>
              ) : filteredBookings.map((booking, idx) => (
                <motion.tr 
                  key={booking.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-bg-secondary/20 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <span className="text-brand-primary font-bold text-[9px] px-1.5 py-0.5 bg-brand-primary/5 rounded border border-brand-primary/10">
                      #{booking.id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6.5 h-6.5 rounded-lg bg-bg-secondary flex items-center justify-center text-brand-primary border border-border-light shadow-sm">
                        <User className="w-3 h-3" />
                      </div>
                      <span className="text-text-primary font-bold text-[13px]">{booking.customer}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-bold text-text-primary text-[13px] flex items-center">
                      {booking.turf}
                      <ArrowRight className="w-2.5 h-2.5 mx-2 text-text-muted opacity-40" />
                    </div>
                    <div className="text-[9px] text-text-secondary font-bold uppercase tracking-wider mt-0.5">{booking.date} • {booking.time}</div>
                  </td>
                  <td className="px-4 py-2.5 font-bold text-text-primary text-[13px]">{booking.amount}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-all ${
                      booking.status === 'Confirmed' ? 'bg-brand-primary/5 text-brand-primary border-brand-primary/10' : 
                      booking.status === 'Pending' ? 'bg-status-warning/5 text-status-warning border-status-warning/10' : 
                      'bg-status-danger/5 text-status-danger border-status-danger/10'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {booking.status === 'Pending' && (
                        <>
                          <button onClick={() => updateBookingStatus(booking.id, 'Confirmed')} className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all" title="Confirm"><CheckCircle className="w-3 h-3" /></button>
                          <button onClick={() => updateBookingStatus(booking.id, 'Cancelled')} className="text-text-muted hover:text-status-danger p-1.5 rounded-lg hover:bg-status-danger/5 transition-all" title="Reject"><XCircle className="w-3 h-3" /></button>
                        </>
                      )}
                      <button onClick={() => handleDelete(booking.id, booking.customer)} className="p-1.5 text-text-muted hover:text-status-danger hover:bg-status-danger/5 rounded-lg transition-all" title="Delete"><Trash2 className="w-3 h-3" /></button>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} className="bg-bg-primary border border-border-light rounded-xl shadow-modal w-full max-w-md relative z-10" >
              <div className="p-6 border-b border-border-light flex justify-between items-center">
                <h3 className="font-bold text-text-primary text-sm">Manual Booking Entry</h3>
                <button onClick={() => { setIsModalOpen(false); setSelectedTurf(''); }} className="p-1 text-text-muted hover:text-text-primary transition-colors" >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <form noValidate onSubmit={handleSubmit} className="p-6 space-y-5">
                <Input 
                  name="customer"
                  label="Customer Name"
                  placeholder="e.g. Rahul Sharma"
                  error={errors.customer}
                  onChange={() => setErrors(prev => ({ ...prev, customer: '' }))}
                  icon={<User className="w-4 h-4" />}
                />
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Facility</label>
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsTurfDropdownOpen(!isTurfDropdownOpen);
                        setErrors(prev => ({ ...prev, turf: '' }));
                      }}
                      className={`w-full bg-bg-secondary border rounded-lg px-4 py-2.5 text-sm text-left flex justify-between items-center transition-all hover:border-brand-primary/30 ${
                        isTurfDropdownOpen ? 'border-brand-primary ring-4 ring-brand-primary/5' : ''
                      } ${
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
                                  setErrors(prev => ({ ...prev, turf: '' }));
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

                    <input type="hidden" name="turf" value={selectedTurf} />
                    
                    {isTurfDropdownOpen && (
                      <div className="fixed inset-0 z-40" onClick={() => setIsTurfDropdownOpen(false)} />
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider ml-0.5">Select Schedule</label>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                      {DAYS.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setSelectedDay(day)}
                          className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                            selectedDay === day 
                              ? 'bg-brand-primary text-white border-brand-primary' 
                              : 'bg-bg-primary text-text-muted border-border-light hover:border-brand-primary/30'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map(slot => {
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setSelectedSlot(slot);
                              setErrors(prev => ({ ...prev, slot: '' }));
                            }}
                            className={`py-2 rounded-lg text-[12px] font-bold transition-all border ${
                              isSelected
                                ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                                : 'bg-bg-primary text-text-primary border-border-light hover:border-brand-primary/30'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                    <AnimatePresence>
                      {errors.slot && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 ml-0.5">
                          <p className="text-[12px] font-bold text-status-danger leading-none">{errors.slot}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <NumericInput 
                  name="amount" 
                  label="Booking Amount (₹)"
                  error={errors.amount}
                  onValueChange={() => setErrors(prev => ({ ...prev, amount: '' }))}
                  placeholder="1200" 
                  icon={<div className="text-sm font-bold">₹</div>}
                  className="w-full bg-bg-secondary border border-border-light rounded-lg pr-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all" 
                />
                <button type="submit" className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold text-sm hover:bg-brand-hover transition-all mt-2 shadow-lg shadow-brand-primary/10 active:scale-[0.98]">Confirm Booking</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
