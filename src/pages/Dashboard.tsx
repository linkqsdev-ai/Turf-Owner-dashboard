import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CalendarDays, 
  IndianRupee, 
  Users, 
  Clock
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

const KPICard = ({ title, value, change, isPositive, icon: Icon, onClick }: any) => (
  <div 
    onClick={onClick}
    className="p-4 rounded-xl border border-transparent hover:border-border-light/60 hover:bg-white/40 transition-all duration-300 group cursor-pointer active:scale-[0.99]"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-brand-soft rounded-lg text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 shadow-sm">
        <Icon className="w-4 h-4" />
      </div>
      <div className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${isPositive ? 'text-status-success bg-status-success/10' : 'text-status-danger bg-status-danger/10'}`}>
        {isPositive ? <ArrowUpRight className="w-2.5 h-2.5 mr-1" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-1" />}
        {change}
      </div>
    </div>
    <div>
      <p className="text-text-secondary text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-70">{title}</p>
      <h3 className="text-xl font-bold tracking-tight text-text-primary">{value}</h3>
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { bookings, customers } = useStore();
  

  
  const totalRevenue = bookings.reduce((sum, b) => {
    const amt = parseFloat(b.amount.replace(/[^0-9.]/g, '')) || 0;
    return sum + amt;
  }, 0);

  const recentBookings = [...bookings].reverse().slice(0, 5);

  return (
    <div className="w-full px-4 py-2 space-y-12 bg-premium-grid min-h-full">
      {/* Premium Full-Width Centered Hero - Scaled Down */}
      <section className="space-y-10 flex flex-col items-center text-center w-full pt-4">
        <div className="space-y-6 w-full max-w-4xl flex flex-col items-center px-4">
          <div className="space-y-4">
            <h1 className="leading-[1.1] font-heading font-bold text-text-primary tracking-tight">
              The premium workspace for your sports facility.
            </h1>
            
            <p className="text-text-secondary text-[14px] leading-relaxed max-w-2xl font-medium">
              Streamline your turf operations with high-fidelity analytics and effortless booking management. 
              Designed for performance, built for clarity.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/bookings')}
              className="bg-brand-primary text-white px-6 py-2.5 rounded-lg font-bold text-[13px] shadow-lg shadow-brand-primary/20 hover:bg-brand-hover transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Add New Booking
            </button>
            <button 
              onClick={() => navigate('/slots')}
              className="bg-white text-text-primary px-6 py-2.5 rounded-lg font-bold text-[13px] border border-border-medium hover:bg-bg-secondary transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
            >
              Manage Schedule
            </button>
          </div>
        </div>
      </section>

      {/* KPI System */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 w-full max-w-[1200px] mx-auto">
        <KPICard title="Total Bookings" value={bookings.length.toString()} change="+12.5%" isPositive={true} icon={CalendarDays} onClick={() => navigate('/bookings')} />
        <KPICard title="Revenue" value={totalRevenue.toLocaleString()} change="+8.2%" isPositive={true} icon={IndianRupee} onClick={() => navigate('/analytics')} />
        <KPICard title="Total Athletes" value={customers.length.toString()} change="+24" isPositive={true} icon={Users} onClick={() => navigate('/customers')} />
        <KPICard title="Avg. Booking Time" value="19:00" change="Stable" isPositive={true} icon={Clock} onClick={() => navigate('/analytics')} />
      </div>

      <section className="flex flex-col w-full max-w-[1200px] mx-auto pb-12">
        <div className="flex justify-between items-end mb-6 px-4">
          <div className="text-left">
            <h3 className="text-xl font-bold tracking-tight">Recent Activity</h3>
            <p className="text-text-muted text-[13px] font-medium">Real-time facility updates</p>
          </div>
          <button onClick={() => navigate('/bookings')} className="text-brand-primary text-[11px] font-bold uppercase tracking-wider hover:underline border border-brand-primary/20 px-4 py-2 rounded-lg hover:bg-brand-soft transition-all">
            View Audit Log
          </button>
        </div>
        <div className="space-y-1.5 text-left px-2">
          {recentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 opacity-40">
              <CalendarDays className="w-10 h-10 text-text-muted mb-3" strokeWidth={1.5} />
              <p className="text-text-muted text-[11px] font-bold uppercase tracking-[0.2em]">System Quiet</p>
            </div>
          ) : recentBookings.map((booking) => (
            <div 
              key={booking.id} 
              className="flex items-center justify-between p-3.5 hover:bg-white/60 hover:backdrop-blur-md rounded-lg transition-all group cursor-pointer border border-transparent hover:border-border-light hover:shadow-premium"
              onClick={() => navigate('/bookings')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center font-bold text-brand-primary shadow-sm border border-border-light group-hover:scale-105 transition-transform">
                  {booking.customer.charAt(0)}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-text-primary leading-tight">{booking.customer}</p>
                  <p className="text-[12px] text-text-muted font-medium mt-0.5">{booking.turf} • {booking.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[14px] font-bold text-text-primary leading-tight">{booking.amount}</p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-1.5 inline-block ${
                    booking.status === 'Confirmed' ? 'bg-status-success/10 text-status-success' : 
                    'bg-status-warning/10 text-status-warning'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
