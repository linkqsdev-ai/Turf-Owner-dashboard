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
    <div className="max-w-[1600px] mx-auto space-y-10 relative px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
            <span className="text-[10px] font-black text-brand-primary tracking-[0.2em] uppercase">Transaction Ledger</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight leading-tight">Elite <span className="text-brand-primary">Reservations.</span></h1>
          <p className="text-text-secondary font-medium mt-2">Oversee and validate the complete reservation lifecycle.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:w-80">
            <Search className={`w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${searchTerm ? 'text-brand-primary' : 'text-text-muted'}`} />
            <input 
              type="text" 
              placeholder="Search Intelligence..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-12 pr-6 rounded-2xl bg-bg-secondary border border-border-light text-sm font-bold text-text-primary focus:outline-none focus:border-brand-primary/30 focus:ring-8 focus:ring-brand-primary/5 transition-all placeholder:text-text-muted/40 shadow-inner group-hover:bg-bg-secondary/80"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center hover:bg-brand-hover transition-all shadow-[0_8px_24px_rgba(16,185,129,0.2)] hover:-translate-y-1 active:scale-95"
          >
            <Plus className="w-5 h-5 mr-3" />
            New Booking
          </button>
        </div>
      </div>

      <div className="bg-bg-card border border-border-light rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-secondary/50 border-b border-border-light text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-8">System ID</th>
                <th className="p-8">Athlete profile</th>
                <th className="p-8">Node & Timeline</th>
                <th className="p-8">Yield</th>
                <th className="p-8">Status</th>
                <th className="p-8 text-right">Execution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-32 text-center">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center space-y-6"
                    >
                      <div className="w-20 h-20 bg-bg-secondary rounded-3xl flex items-center justify-center border border-border-light">
                        <CalendarX className="w-10 h-10 text-brand-primary" />
                      </div>
                      <div>
                        <p className="text-xl font-black text-text-primary">No Records Found</p>
                        <p className="text-text-muted text-sm font-medium mt-1">Adjust filters or initialize a new record.</p>
                      </div>
                    </motion.div>
                  </td>
                </tr>
              ) : filteredBookings.map((booking, idx) => (
                <motion.tr 
                  key={booking.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-bg-secondary/40 transition-colors group"
                >
                  <td className="p-8">
                    <span className="text-brand-primary font-black tracking-widest text-[10px] px-3 py-1 bg-brand-primary/5 rounded-lg border border-brand-primary/10">
                      #{booking.id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center text-brand-primary border border-border-light shadow-sm group-hover:scale-110 transition-transform">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="text-text-primary font-black">{booking.customer}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="font-black text-text-primary flex items-center">
                      {booking.turf}
                      <ArrowRight className="w-3.5 h-3.5 mx-2 text-text-muted opacity-40" />
                    </div>
                    <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1.5">{booking.date} • {booking.time}</div>
                  </td>
                  <td className="p-8 font-black text-text-primary text-lg">{booking.amount}</td>
                  <td className="p-8">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                      booking.status === 'Confirmed' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/10' : 
                      booking.status === 'Pending' ? 'bg-status-warning/10 text-status-warning border-status-warning/10' : 
                      'bg-status-danger/10 text-status-danger border-status-danger/10'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {booking.status === 'Pending' && (
                        <>
                          <button onClick={() => updateBookingStatus(booking.id, 'Confirmed')} className="p-3 bg-bg-secondary hover:bg-brand-primary/10 text-text-muted hover:text-brand-primary rounded-2xl transition-all border border-border-light shadow-sm active:scale-90" title="Confirm Reservation"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => updateBookingStatus(booking.id, 'Cancelled')} className="p-3 bg-bg-secondary hover:bg-status-danger/10 text-text-muted hover:text-status-danger rounded-2xl transition-all border border-border-light shadow-sm active:scale-90" title="Reject Reservation"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                      <button onClick={() => handleDelete(booking.id, booking.customer)} className="p-3 bg-bg-secondary hover:bg-status-danger/10 text-text-muted hover:text-status-danger rounded-2xl transition-all border border-border-light shadow-sm active:scale-90" title="Purge Record"><Trash2 className="w-4 h-4" /></button>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-bg-card border border-border-light p-10 rounded-[2.5rem] shadow-modal w-full max-w-lg relative z-10 overflow-hidden" >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-black text-text-primary tracking-tight">Manual Entry</h2>
                  <p className="text-text-muted text-sm font-medium mt-1">Override system with direct record</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-bg-secondary text-text-muted hover:text-status-danger rounded-2xl transition-colors border border-border-light" >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Athlete Identifier</label>
                  <input required name="customer" className="w-full bg-bg-secondary border border-border-light rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all placeholder:text-text-muted/40" placeholder="e.g. Rahul Sharma" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Assigned Node</label>
                  <select 
                    required 
                    name="turf" 
                    className="w-full bg-bg-secondary border border-border-light rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all cursor-pointer appearance-none"
                  >
                    <option value="" disabled selected>Select Facility</option>
                    {turfs.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Timeline Date</label>
                    <input required name="date" type="date" className="w-full bg-bg-secondary border border-border-light rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Window (HH:MM)</label>
                    <input required name="time" placeholder="18:00" className="w-full bg-bg-secondary border border-border-light rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all placeholder:text-text-muted/40" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Settlement Amount (₹)</label>
                  <input required name="amount" type="number" placeholder="450" className="w-full bg-bg-secondary border border-border-light rounded-2xl px-6 py-4 text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-black transition-all placeholder:text-text-muted/40" />
                </div>
                <button type="submit" className="w-full bg-brand-primary text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-hover transition-all mt-6 shadow-[0_12px_24px_rgba(16,185,129,0.2)] active:scale-[0.98]">Confirm Settlement</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
