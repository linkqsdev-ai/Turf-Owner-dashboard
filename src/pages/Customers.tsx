import { Search, Filter, Mail, Phone, MoreHorizontal, X, User, ArrowUpRight } from 'lucide-react';
import { useStore, type Customer } from '../store/useStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="max-w-[1600px] mx-auto space-y-10 relative px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
            <span className="text-[10px] font-black text-brand-primary tracking-[0.2em] uppercase">User Intelligence</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight leading-tight">Athlete <span className="text-brand-primary">Database.</span></h1>
          <p className="text-text-secondary font-medium mt-2">Manage your core user base and analyze individual engagement metrics.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:w-80">
            <Search className={`w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${searchTerm ? 'text-brand-primary' : 'text-text-muted'}`} />
            <input 
              type="text" 
              placeholder="Search Athletes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-12 pr-12 rounded-2xl bg-bg-secondary border border-border-light text-sm font-bold text-text-primary focus:outline-none focus:border-brand-primary/30 focus:ring-8 focus:ring-brand-primary/5 transition-all placeholder:text-text-muted/40 shadow-inner group-hover:bg-bg-secondary/80"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-bg-card rounded-xl transition-colors text-text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button 
            onClick={() => alert('Advanced filtering initialized.')}
            className="bg-bg-card text-text-primary px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center hover:bg-bg-secondary transition-all border border-border-light active:scale-95 shadow-sm"
          >
            <Filter className="w-4 h-4 mr-3 text-brand-primary" />
            Filter Logic
          </button>
        </div>
      </div>

      <div className="bg-bg-card border border-border-light rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-secondary/50 border-b border-border-light text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-8">Athlete profile</th>
                <th className="p-8">Communication</th>
                <th className="p-8">Engagement</th>
                <th className="p-8">LTV Index</th>
                <th className="p-8">Last activity</th>
                <th className="p-8 text-right">Insight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-32 text-center">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center space-y-6"
                    >
                      <div className="w-20 h-20 bg-bg-secondary rounded-3xl flex items-center justify-center border border-border-light">
                        <User className="w-10 h-10 text-brand-primary" />
                      </div>
                      <div>
                        <p className="text-xl font-black text-text-primary">No Matching Athletes</p>
                        <p className="text-text-muted text-sm font-medium mt-1">Refine your search parameters to find the profile.</p>
                      </div>
                    </motion.div>
                  </td>
                </tr>
              ) : filteredCustomers.map((customer, idx) => (
                <motion.tr 
                  key={customer.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-bg-secondary/40 transition-colors group cursor-pointer"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <td className="p-8">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-bg-secondary flex items-center justify-center text-brand-primary border border-border-light shadow-sm group-hover:scale-110 transition-transform group-hover:border-brand-primary/20">
                        <span className="text-lg font-black">{customer.name.charAt(0)}</span>
                      </div>
                      <span className="text-text-primary font-black group-hover:text-brand-primary transition-colors">{customer.name}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center text-sm font-bold text-text-primary mb-1.5"><Mail className="w-3.5 h-3.5 mr-3 text-brand-primary" /> {customer.email}</div>
                    <div className="flex items-center text-[10px] text-text-muted font-black uppercase tracking-widest"><Phone className="w-3.5 h-3.5 mr-3 text-brand-primary/60" /> {customer.phone}</div>
                  </td>
                  <td className="p-8">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-bg-secondary text-text-primary font-black border border-border-light">
                      {customer.bookings} <span className="text-[10px] text-text-muted ml-2 font-black uppercase tracking-widest">Sessions</span>
                    </div>
                  </td>
                  <td className="p-8 font-black text-brand-primary text-xl tracking-tighter">{customer.spent}</td>
                  <td className="p-8 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{customer.lastActive}</td>
                  <td className="p-8 text-right">
                    <button 
                      className="p-3 bg-bg-secondary hover:bg-brand-primary/10 text-text-muted hover:text-brand-primary rounded-2xl transition-all border border-border-light shadow-sm active:scale-90"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-[200] flex items-center justify-end bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCustomer(null)}
              className="absolute inset-0"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-bg-card w-full max-w-xl h-full shadow-modal relative z-10 overflow-y-auto border-l border-border-light p-12 md:p-16"
            >
              <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-center mb-16 relative">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                  <span className="text-[10px] font-black text-brand-primary tracking-[0.2em] uppercase">Intelligence Node</span>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="p-4 bg-bg-secondary hover:bg-status-danger/10 text-text-muted hover:text-status-danger rounded-[1.5rem] transition-all border border-border-light shadow-sm"><X className="w-6 h-6" /></button>
              </div>

              <div className="flex flex-col items-center text-center mb-16 relative">
                <div className="w-32 h-32 rounded-[2.5rem] bg-bg-secondary flex items-center justify-center text-brand-primary text-5xl font-black shadow-inner mb-8 border border-border-light">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <h3 className="text-4xl font-black text-text-primary tracking-tight">{selectedCustomer.name}</h3>
                <p className="text-text-muted font-bold text-lg mt-2">{selectedCustomer.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-16 relative">
                <div className="bg-bg-secondary p-8 rounded-[2rem] border border-border-light shadow-sm">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Gross Value</p>
                  <p className="text-3xl font-black text-brand-primary tracking-tighter">{selectedCustomer.spent}</p>
                </div>
                <div className="bg-bg-secondary p-8 rounded-[2rem] border border-border-light shadow-sm">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Total Volume</p>
                  <p className="text-3xl font-black text-text-primary tracking-tighter">{selectedCustomer.bookings} <span className="text-sm uppercase tracking-widest text-text-muted">Hits</span></p>
                </div>
              </div>

              <div className="space-y-8 relative">
                <div className="flex items-center justify-between border-b border-border-light pb-4">
                  <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Temporal Activity Log</h4>
                  <ArrowUpRight className="w-4 h-4 text-brand-primary" />
                </div>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex justify-between items-center p-6 rounded-[1.5rem] border border-border-light bg-bg-secondary/30 hover:bg-bg-secondary transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-black text-text-primary uppercase tracking-widest">Transaction #{1024 + i}</p>
                        <p className="text-[11px] text-text-muted font-bold mt-1">Turf Pulse Core • <span className="text-brand-primary">Authorized</span></p>
                      </div>
                      <span className="text-lg font-black text-text-primary group-hover:text-brand-primary transition-colors">₹1,500</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-20 space-y-4 relative">
                <button className="w-full bg-brand-primary text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-hover transition-all shadow-[0_12px_24px_rgba(16,185,129,0.2)] active:scale-[0.98]">
                  Initialize Notification
                </button>
                <button className="w-full bg-bg-secondary text-text-primary py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-bg-card transition-all border border-border-light active:scale-[0.98]">
                  Export Intelligence
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
