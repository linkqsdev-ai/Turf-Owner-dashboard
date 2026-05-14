import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CalendarDays, 
  IndianRupee, 
  Users, 
  Clock,
  TrendingUp
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const MINI_CHART_DATA = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 600 },
  { name: 'Thu', value: 800 },
  { name: 'Fri', value: 500 },
  { name: 'Sat', value: 900 },
  { name: 'Sun', value: 1100 },
];

const KPICard = ({ title, value, change, isPositive, icon: Icon, onClick }: any) => (
  <div 
    onClick={onClick}
    className="p-3 rounded-xl border border-transparent hover:border-border-light/60 hover:bg-bg-card/40 transition-all duration-300 group cursor-pointer active:scale-[0.99]"
  >
    <div className="flex justify-between items-start mb-2.5">
      <div className="p-1.5 bg-brand-soft rounded-lg text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 shadow-sm">
        <Icon className="w-3 h-3" />
      </div>
      <div className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${isPositive ? 'text-status-success bg-status-success/10' : 'text-status-danger bg-status-danger/10'}`}>
        {isPositive ? <ArrowUpRight className="w-2.5 h-2.5 mr-1" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-1" />}
        {change}
      </div>
    </div>
    <div>
      <p className="text-text-secondary text-[8.5px] font-bold uppercase tracking-wider mb-0.5 opacity-70">{title}</p>
      <h3 className="text-base font-bold tracking-tight text-text-primary">{value}</h3>
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
    <div className="w-full px-4 py-0 space-y-6 bg-premium-grid min-h-full">
      {/* Premium Full-Width Centered Hero - Scaled Down */}
      <section className="space-y-4 flex flex-col items-center text-center w-full pt-1">
        <div className="space-y-3 w-full max-w-2xl flex flex-col items-center px-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-[36px] leading-[1.1] font-heading font-bold text-text-primary tracking-tight">
              The premium workspace for your sports facility.
            </h1>
            
            <p className="text-text-secondary text-[13px] leading-relaxed max-w-lg font-medium opacity-80">
              Streamline your turf operations with high-fidelity analytics and effortless booking management. 
              Designed for performance, built for clarity.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-2.5">
            <button 
              onClick={() => navigate('/bookings')}
              className="bg-brand-primary text-white px-4 py-1.5 rounded-lg font-bold text-[12px] shadow-lg shadow-brand-primary/20 hover:bg-brand-hover transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Add New Booking
            </button>
            <button 
              onClick={() => navigate('/slots')}
              className="bg-bg-primary text-text-primary px-4 py-1.5 rounded-lg font-bold text-[12px] border border-border-medium hover:bg-bg-secondary transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
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

      <section className="w-full max-w-[1200px] mx-auto pb-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Recent Activity */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex justify-between items-end">
              <div className="text-left">
                <h3 className="text-base font-bold tracking-tight">Recent Activity</h3>
                <p className="text-text-muted text-[11px] font-medium opacity-70">Real-time facility updates</p>
              </div>
              <button onClick={() => navigate('/bookings')} className="text-brand-primary text-[9px] font-bold uppercase tracking-wider hover:underline border border-brand-primary/20 px-2.5 py-1 rounded-md hover:bg-brand-soft transition-all">
                View Audit Log
              </button>
            </div>
            <div className="space-y-1.5">
              {recentBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 opacity-40 bg-bg-primary rounded-xl border border-border-light">
                  <CalendarDays className="w-10 h-10 text-text-muted mb-3" strokeWidth={1.5} />
                  <p className="text-text-muted text-[11px] font-bold uppercase tracking-[0.2em]">System Quiet</p>
                </div>
              ) : recentBookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between p-2.5 bg-bg-primary/50 hover:bg-bg-card/60 hover:backdrop-blur-md rounded-lg transition-all group cursor-pointer border border-border-light hover:shadow-premium"
                  onClick={() => navigate('/bookings')}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-bg-primary flex items-center justify-center font-bold text-brand-primary shadow-sm border border-border-light group-hover:scale-105 transition-transform">
                      <span className="text-[11px]">{booking.customer.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-text-primary leading-tight">{booking.customer}</p>
                      <p className="text-[10px] text-text-muted font-medium mt-0.5">{booking.turf} • {booking.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="text-[12px] font-bold text-text-primary leading-tight">{booking.amount}</p>
                      <span className={`text-[7.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mt-1 inline-block ${
                        booking.status === 'Confirmed' ? 'bg-status-success/10 text-status-success' : 
                        'bg-status-warning/10 text-status-warning'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <ArrowUpRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Mini Analytics */}
          <div className="space-y-3">
            <div className="text-left">
              <h3 className="text-base font-bold tracking-tight">Performance</h3>
              <p className="text-text-muted text-[11px] font-medium opacity-70">Quick-layer insights</p>
            </div>

            <div className="space-y-2.5">
              {/* Revenue Pulse Card */}
              <div className="bg-bg-primary border border-border-light rounded-xl p-3.5 shadow-premium">
                <div className="flex justify-between items-center mb-2.5">
                  <div>
                    <p className="text-[8.5px] font-bold text-text-muted uppercase tracking-widest mb-0.5">Revenue Pulse</p>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-text-primary">₹14.2k</h4>
                      <span className="text-[8.5px] font-bold text-status-success">+14%</span>
                    </div>
                  </div>
                  <div className="p-1 bg-brand-soft rounded text-brand-primary">
                    <TrendingUp className="w-2.5 h-2.5" />
                  </div>
                </div>
                <div className="h-16 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MINI_CHART_DATA}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="var(--brand-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* View Full Analytics Link */}
              <button 
                onClick={() => navigate('/analytics')}
                className="w-full py-2 bg-bg-secondary hover:bg-bg-card text-text-primary rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all border border-border-light flex items-center justify-center group"
              >
                Go to Analytics Protocol
                <ArrowUpRight className="w-2.5 h-2.5 ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
