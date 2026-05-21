import { Search, Filter, MoreHorizontal, X, User } from 'lucide-react';
import { useStore, type Customer } from '../store/useStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '../utils/alerts';

export default function Customers() {
  const { customers } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="w-full h-full flex flex-col space-y-6 relative pb-2">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-5 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Customer Directory</h1>
          <p className="text-text-secondary text-[13px] mt-0.5">Manage your user base and analyze individual engagement metrics.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2.5 w-full md:w-auto">
          <div className="relative group flex-1 md:w-60">
            <Search className={`w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${searchTerm ? 'text-brand-primary' : 'text-text-muted'}`} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-bg-primary border border-border-light text-[13px] font-medium text-text-primary focus:outline-none focus:border-brand-primary transition-all placeholder:text-text-muted/50"
            />
          </div>
          <button 
            onClick={() => showToast('Filter logic initialized.', 'info')}
            className="bg-bg-primary text-text-primary px-5 h-9 rounded-lg font-bold text-[13px] flex items-center justify-center hover:bg-bg-secondary transition-all border border-border-light active:scale-95"
          >
            <Filter className="w-3.5 h-3.5 mr-2 text-brand-primary" />
            Filters
          </button>
        </div>
      </div>

      <div className="bg-bg-primary border border-border-light rounded-xl shadow-premium overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-bg-secondary/90 backdrop-blur-md border-b border-border-light text-text-muted text-[10px] font-bold uppercase tracking-wider">
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Contact Information</th>
                <th className="px-5 py-3.5">Sessions</th>
                <th className="px-5 py-3.5">Total Spend</th>
                <th className="px-5 py-3.5">Last Visit</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center space-y-4"
                    >
                      <div className="w-16 h-16 bg-bg-secondary rounded-xl flex items-center justify-center border border-border-light">
                        <User className="w-8 h-8 text-brand-primary opacity-20" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-text-primary">No records found</p>
                        <p className="text-text-secondary text-sm">Adjust search or filter parameters.</p>
                      </div>
                    </motion.div>
                  </td>
                </tr>
              ) : filteredCustomers.map((customer, idx) => (
                <motion.tr 
                  key={customer.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-bg-secondary/20 transition-colors group cursor-pointer"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-bg-secondary flex items-center justify-center text-brand-primary border border-border-light shadow-sm">
                        <span className="text-[13px] font-bold">{customer.name.charAt(0)}</span>
                      </div>
                      <span className="text-text-primary font-bold text-[13px]">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-[13px] font-bold text-text-primary mb-0.5">{customer.email}</div>
                    <div className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">{customer.phone}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-bg-secondary text-text-primary text-[9px] font-bold border border-border-light uppercase tracking-wider">
                      {customer.bookings} Sessions
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-brand-primary text-[13px]">{customer.spent}</td>
                  <td className="px-5 py-3.5 text-[9px] font-bold text-text-secondary uppercase tracking-wider">{customer.lastActive}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="transition-opacity">
                      <button className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all">
                        <MoreHorizontal className="w-3.5 h-3.5" />
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
        {selectedCustomer && (
          <div className="fixed inset-0 z-[200] flex items-center justify-end bg-black/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-bg-primary w-full max-w-sm h-full shadow-modal relative z-10 overflow-y-auto border-l border-border-light p-6 md:p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Customer Profile</h3>
                <button onClick={() => setSelectedCustomer(null)} className="p-1.5 text-text-muted hover:text-text-primary transition-colors"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-20 h-20 rounded-2xl bg-bg-secondary flex items-center justify-center text-brand-primary text-2xl font-bold border border-border-light shadow-sm mb-4">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-text-primary tracking-tight">{selectedCustomer.name}</h3>
                <p className="text-text-secondary text-[13px] mt-0.5">{selectedCustomer.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-bg-secondary/50 p-6 rounded-2xl border border-border-light">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Total Value</p>
                  <p className="text-xl font-bold text-brand-primary">{selectedCustomer.spent}</p>
                </div>
                <div className="bg-bg-secondary/50 p-6 rounded-2xl border border-border-light">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Total Bookings</p>
                  <p className="text-xl font-bold text-text-primary">{selectedCustomer.bookings}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border-light pb-3">
                  <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Recent Activity</h4>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-xl border border-border-light bg-bg-secondary/20">
                      <div>
                        <p className="text-xs font-bold text-text-primary">Booking #{2048 + i}</p>
                        <p className="text-[10px] text-text-secondary mt-0.5">Confirmed • {selectedCustomer.lastActive}</p>
                      </div>
                      <span className="text-sm font-bold text-text-primary">₹1,200</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 space-y-3">
                <button className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10">
                  Send Message
                </button>
                <button className="w-full bg-bg-primary text-text-primary py-3 rounded-xl font-bold text-sm hover:bg-bg-secondary transition-all border border-border-light">
                  View Full History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
