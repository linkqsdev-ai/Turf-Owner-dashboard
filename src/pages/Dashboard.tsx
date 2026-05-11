import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CalendarDays, 
  DollarSign, 
  Users, 
  Clock, 
  Map as MapIcon 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

const REVENUE_DATA = [
  { time: '08:00', amount: 120 },
  { time: '10:00', amount: 300 },
  { time: '12:00', amount: 450 },
  { time: '14:00', amount: 380 },
  { time: '16:00', amount: 600 },
  { time: '18:00', amount: 850 },
  { time: '20:00', amount: 1100 },
  { time: '22:00', amount: 900 },
];

const KPICard = ({ title, value, change, isPositive, icon: Icon, onClick }: any) => (
  <div 
    onClick={onClick}
    className="bg-bg-card p-6 rounded-3xl border border-border-light hover:border-brand-primary/20 shadow-sm hover:shadow-hover transition-all duration-500 group cursor-pointer active:scale-[0.98]"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-bg-secondary rounded-2xl group-hover:bg-brand-primary/10 transition-colors duration-500">
        <Icon className="w-6 h-6 text-brand-primary group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className={`flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${isPositive ? 'text-status-success bg-status-success/5 border border-status-success/10' : 'text-status-danger bg-status-danger/5 border border-status-danger/10'}`}>
        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
        {change}
      </div>
    </div>
    <div>
      <h3 className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</h3>
      <p className="text-text-primary text-3xl font-black tracking-tight group-hover:text-brand-primary transition-colors duration-500">{value}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { bookings, turfs, customers } = useStore();
  
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === today).length;
  
  // Calculate real revenue data for the chart (grouped by date)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const dayBookings = bookings.filter(b => b.date === date);
    const revenue = dayBookings.reduce((sum, b) => sum + (parseFloat(b.amount.replace(/[^0-9.]/g, '')) || 0), 0);
    const label = new Date(date).toLocaleDateString('en-IN', { weekday: 'short' });
    return { name: label, amount: revenue };
  });

  const totalRevenue = bookings.reduce((sum, b) => {
    const amt = parseFloat(b.amount.replace(/[^0-9.]/g, '')) || 0;
    return sum + amt;
  }, 0);

  const recentBookings = [...bookings].reverse().slice(0, 5);

  return (
    <div className="space-y-10 pb-12 max-w-[1600px] mx-auto px-4 md:px-0">
      <div className="bg-gradient-to-br from-bg-card via-bg-secondary to-bg-secondary/50 p-8 md:p-12 rounded-[2.5rem] border border-border-light relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-primary/5 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 opacity-[0.03] rotate-12">
          <MapIcon className="w-96 h-96 text-brand-primary" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/10 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            <span className="text-[10px] font-black text-brand-primary tracking-[0.2em] uppercase">Control Center</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-text-primary mb-6 tracking-tight leading-[1.1]">
            Elite Operations <span className="text-brand-primary">Dashboard.</span>
          </h1>
          <p className="text-text-secondary text-lg font-medium leading-relaxed mb-10">
            Welcome back, Admin. Your network is currently operating at <span className="text-brand-primary font-bold">peak efficiency</span> across {turfs.length} managed facilities.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/bookings')}
              className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-brand-hover shadow-[0_8px_24px_rgba(16,185,129,0.25)] transition-all hover:-translate-y-1 active:scale-95"
            >
              Initialize Booking
            </button>
            <button 
              onClick={() => navigate('/slots')}
              className="bg-bg-card text-text-primary px-8 py-4 rounded-2xl font-bold hover:bg-bg-secondary transition-all border border-border-medium shadow-sm hover:-translate-y-1 active:scale-95"
            >
              View Grid
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard title="Scheduled" value={todayBookings.toString()} change="+12%" isPositive={true} icon={CalendarDays} onClick={() => navigate('/bookings')} />
        <KPICard title="Net Yield" value={`₹${totalRevenue.toLocaleString()}`} change="+8.5%" isPositive={true} icon={DollarSign} onClick={() => navigate('/analytics')} />
        <KPICard title="Athletes" value={customers.length.toString()} change="+24" isPositive={true} icon={Users} onClick={() => navigate('/customers')} />
        <KPICard title="Velocity" value="19:00" change="Optimal" isPositive={true} icon={Clock} onClick={() => navigate('/analytics')} />
        <KPICard title="Load" value={`${Math.min(100, turfs.length * 15)}%`} change="Stable" isPositive={true} icon={MapIcon} onClick={() => navigate('/turfs')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-bg-card p-8 md:p-10 rounded-[2.5rem] border border-border-light shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-text-primary tracking-tight">Performance Vector</h2>
              <p className="text-text-muted text-sm mt-1 font-medium italic">Aggregated revenue analytics (7D window)</p>
            </div>
            <select className="bg-bg-secondary border border-border-medium text-text-primary text-xs font-bold rounded-xl py-2.5 px-5 outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer hover:bg-bg-hover transition-colors">
              <option>Last 7 Days</option>
              <option>Monthly Projection</option>
            </select>
          </div>
          <div className="h-[400px] w-full min-h-[400px] relative">
            <ResponsiveContainer width="99%" height="99%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700}} tickLine={false} axisLine={false} dy={15} />
                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 11, fontWeight: 700}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-medium)', borderRadius: '20px', color: 'var(--text-primary)', boxShadow: 'var(--shadow-modal)', padding: '16px', border: '1px solid var(--border-light)' }}
                  itemStyle={{ color: 'var(--brand-primary)', fontWeight: '900', fontSize: '18px' }}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: '6px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="amount" stroke="var(--brand-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 8, strokeWidth: 4, stroke: 'var(--bg-card)', fill: 'var(--brand-primary)' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-bg-card p-8 md:p-10 rounded-[2.5rem] border border-border-light shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-text-primary tracking-tight">Activity Log</h2>
              <p className="text-text-muted text-sm mt-1 font-medium">System wide events</p>
            </div>
            <button onClick={() => navigate('/bookings')} className="text-brand-primary text-xs font-black uppercase tracking-widest hover:text-brand-hover transition-colors py-2 px-4 rounded-xl hover:bg-brand-primary/5">Details</button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
            {recentBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                <CalendarDays className="w-12 h-12 text-text-muted" />
                <p className="text-text-muted text-xs font-bold uppercase tracking-widest">Idle State</p>
              </div>
            ) : recentBookings.map((booking) => (
              <div 
                key={booking.id} 
                onClick={() => navigate('/bookings')}
                className="flex items-center justify-between p-5 bg-bg-secondary/40 rounded-3xl hover:bg-bg-secondary transition-all border border-transparent hover:border-brand-primary/10 group cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-2xl bg-bg-card flex items-center justify-center mr-4 border border-border-light group-hover:border-brand-primary/20 transition-all shadow-sm">
                     <span className="text-text-primary font-black group-hover:text-brand-primary transition-colors">{booking.customer.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-text-primary group-hover:text-brand-primary transition-colors">{booking.customer}</p>
                    <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-wider">{booking.turf} • {booking.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-text-primary">{booking.amount}</p>
                  <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full mt-2 inline-block border ${
                    booking.status === 'Confirmed' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/10' : 
                    booking.status === 'Pending' ? 'bg-status-warning/10 text-status-warning border-status-warning/10' : 
                    'bg-status-danger/10 text-status-danger border-status-danger/10'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
