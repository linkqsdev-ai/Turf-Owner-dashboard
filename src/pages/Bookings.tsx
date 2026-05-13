import { useState } from 'react';
import { CheckCircle, XCircle, Search, Trash2, CalendarX, Plus, User, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Bookings() {
  const { bookings, turfs, updateBookingStatus, addBooking, deleteBooking } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addBooking({
      customer: fd.get('customer') as string,
      turf: fd.get('turf') as string,
      date: fd.get('date') as string,
      time: fd.get('time') as string,
      amount: fd.get('amount') as string,
    });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, customer: string) => {
    if (window.confirm(`Are you sure you want to delete booking for ${customer}?`)) {
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
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-white border border-border-light text-[13px] font-medium text-text-primary focus:outline-none focus:border-brand-primary transition-all placeholder:text-text-muted/50"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-brand-primary text-white px-5 h-9 rounded-lg font-bold text-[13px] flex items-center justify-center hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 mr-2" />
            New Booking
          </button>
        </div>
      </div>

      <div className="bg-white border border-border-light rounded-xl shadow-premium overflow-hidden">
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
                  className="hover:bg-bg-secondary/20 transition-colors group"
                >
                  <td className="px-5 py-3.5">
                    <span className="text-brand-primary font-bold text-[9px] px-1.5 py-0.5 bg-brand-primary/5 rounded border border-brand-primary/10">
                      #{booking.id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-bg-secondary flex items-center justify-center text-brand-primary border border-border-light shadow-sm">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-text-primary font-bold text-[13px]">{booking.customer}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-text-primary text-[13px] flex items-center">
                      {booking.turf}
                      <ArrowRight className="w-2.5 h-2.5 mx-2 text-text-muted opacity-40" />
                    </div>
                    <div className="text-[9px] text-text-secondary font-bold uppercase tracking-wider mt-0.5">{booking.date} • {booking.time}</div>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-text-primary text-[13px]">{booking.amount}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-all ${
                      booking.status === 'Confirmed' ? 'bg-brand-primary/5 text-brand-primary border-brand-primary/10' : 
                      booking.status === 'Pending' ? 'bg-status-warning/5 text-status-warning border-status-warning/10' : 
                      'bg-status-danger/5 text-status-danger border-status-danger/10'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {booking.status === 'Pending' && (
                        <>
                          <button onClick={() => updateBookingStatus(booking.id, 'Confirmed')} className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all" title="Confirm"><CheckCircle className="w-3.5 h-3.5" /></button>
                          <button onClick={() => updateBookingStatus(booking.id, 'Cancelled')} className="p-1.5 text-text-muted hover:text-status-danger hover:bg-status-danger/5 rounded-lg transition-all" title="Reject"><XCircle className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                      <button onClick={() => handleDelete(booking.id, booking.customer)} className="p-1.5 text-text-muted hover:text-status-danger hover:bg-status-danger/5 rounded-lg transition-all" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} className="bg-white border border-border-light rounded-xl shadow-modal w-full max-w-md relative z-10 overflow-hidden" >
              <div className="p-6 border-b border-border-light flex justify-between items-center">
                <h3 className="font-bold text-text-primary text-sm">Manual Booking Entry</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-text-muted hover:text-text-primary transition-colors" >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Customer Name</label>
                  <input required name="customer" className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-medium transition-all" placeholder="e.g. Rahul Sharma" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Select Facility</label>
                  <select 
                    required 
                    name="turf" 
                    className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-medium transition-all cursor-pointer appearance-none"
                  >
                    <option value="" disabled selected>Select Facility</option>
                    {turfs.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Date</label>
                    <input required name="date" type="date" className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-medium transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Time (HH:MM)</label>
                    <input required name="time" placeholder="18:00" className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-medium transition-all" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Amount (₹)</label>
                  <input required name="amount" type="number" placeholder="450" className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all" />
                </div>
                <button type="submit" className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold text-sm hover:bg-brand-hover transition-all mt-2 shadow-lg shadow-brand-primary/10 active:scale-[0.98]">Confirm Booking</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
