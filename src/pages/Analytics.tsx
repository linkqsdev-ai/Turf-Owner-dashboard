import { 
  TrendingUp, 
  Calendar as CalendarIcon, 
  MapPin, 
  Activity, 
  Users, 
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useStore } from '../store/useStore';
import { useState } from 'react';

const PERFORMANCE_DATA = [
  { name: 'Mon', current: 4000, previous: 2400 },
  { name: 'Tue', current: 3000, previous: 1398 },
  { name: 'Wed', current: 2000, previous: 9800 },
  { name: 'Thu', current: 2780, previous: 3908 },
  { name: 'Fri', current: 1890, previous: 4800 },
  { name: 'Sat', current: 2390, previous: 3800 },
  { name: 'Sun', current: 3490, previous: 4300 },
];

const COLORS = ['#22c55e', '#16a34a', '#4ade80', '#86efac'];

export default function Analytics() {
  const { bookings, turfs } = useStore();
  const [isApplying, setIsApplying] = useState(false);
  const [timeRange, setTimeRange] = useState('Last 30 Days');

  // Calculate Sport Usage from real bookings
  const typeCounts: Record<string, number> = {};
  bookings.forEach(b => {
    const turf = turfs.find(t => t.name.toLowerCase().includes(b.turf.toLowerCase()));
    const type = turf ? turf.type : 'Other';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const totalBookings = bookings.length || 1;
  const sportUsage = Object.entries(typeCounts).map(([name, count]) => ({
    name,
    value: Math.round((count / totalBookings) * 100)
  })).sort((a, b) => b.value - a.value);

  const displayUsage = sportUsage.length > 0 ? sportUsage : [
    { name: 'No Data', value: 100 }
  ];

  const handleApplyFilters = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      alert('Filters applied successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-10 pb-12 max-w-[1600px] mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-10">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
            <span className="text-[10px] font-black text-brand-primary tracking-[0.2em] uppercase">Intelligence Engine</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight leading-tight">System <span className="text-brand-primary">Insights.</span></h1>
          <p className="text-text-secondary font-medium mt-2">Deep-layer analytics for multi-facility optimization.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="bg-bg-card border border-border-light rounded-2xl p-1.5 flex items-center shadow-sm">
            <div className="relative">
              <button 
                onClick={() => setTimeRange(timeRange === 'Last 30 Days' ? 'Last 7 Days' : 'Last 30 Days')}
                className="flex items-center px-5 py-2.5 border-r border-border-light hover:bg-bg-secondary transition-all rounded-xl group"
              >
                <CalendarIcon className="w-4 h-4 text-brand-primary mr-2.5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-text-primary">{timeRange}</span>
                <ChevronDown className="w-4 h-4 ml-3 text-text-muted" />
              </button>
            </div>
            <button 
              onClick={() => alert('Venue selection: All Venues')}
              className="flex items-center px-5 py-2.5 border-r border-border-light hover:bg-bg-secondary transition-all group"
            >
              <MapPin className="w-4 h-4 text-brand-primary mr-2.5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-text-primary">All Venues</span>
              <ChevronDown className="w-4 h-4 ml-3 text-text-muted" />
            </button>
            <button 
              onClick={() => alert('Sport selection: All Sports')}
              className="flex items-center px-5 py-2.5 hover:bg-bg-secondary transition-all rounded-xl group"
            >
              <Activity className="w-4 h-4 text-brand-primary mr-2.5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-text-primary">All Sports</span>
              <ChevronDown className="w-4 h-4 ml-3 text-text-muted" />
            </button>
          </div>
          <button 
            onClick={handleApplyFilters}
            disabled={isApplying}
            className="bg-brand-primary text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-hover transition-all shadow-[0_8px_20px_rgba(16,185,129,0.2)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-wait"
          >
            {isApplying ? 'Syncing...' : 'Sync Data'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-card p-6 rounded-2xl border border-border-light shadow-card hover:border-brand-primary/20 transition-all cursor-default">
          <div className="flex items-center mb-4">
            <div className="p-2.5 bg-brand-primary/10 rounded-lg mr-3">
              <TrendingUp className="w-5 h-5 text-brand-primary" />
            </div>
            <h3 className="text-text-secondary font-bold text-sm tracking-wider uppercase">Key Insight</h3>
          </div>
          <p className="text-text-primary font-bold text-lg mb-3">
            {sportUsage.length > 0 ? `${sportUsage[0].name} is your top performer.` : 'Start taking bookings to see insights.'}
          </p>
          <div className="flex items-center text-brand-primary font-semibold text-sm">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            Active growth phase
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-2xl border border-border-light shadow-card hover:border-brand-primary/20 transition-all cursor-default">
          <div className="flex items-center mb-4">
            <div className="p-2.5 bg-status-warning/10 rounded-lg mr-3">
              <CalendarIcon className="w-4 h-4 text-status-warning" />
            </div>
            <h3 className="text-text-secondary font-bold text-sm tracking-wider uppercase">Efficiency</h3>
          </div>
          <p className="text-text-primary font-bold text-lg mb-3">You have processed {bookings.length} total bookings.</p>
          <p className="text-text-secondary text-sm font-medium">Keep maintaining 100% data integrity.</p>
        </div>

        <div className="bg-bg-card p-6 rounded-2xl border border-border-light shadow-card hover:border-brand-primary/20 transition-all cursor-default">
          <div className="flex items-center mb-4">
            <div className="p-2.5 bg-status-danger/10 rounded-lg mr-3">
              <Users className="w-5 h-5 text-status-danger" />
            </div>
            <h3 className="text-text-secondary font-bold text-sm tracking-wider uppercase">Network</h3>
          </div>
          <p className="text-text-primary font-bold text-lg mb-3">User database is growing steadily.</p>
          <p className="text-status-danger font-semibold text-sm">Real-time sync enabled</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-bg-card p-8 rounded-[2rem] border border-border-light shadow-card hover:border-brand-primary/10 transition-all">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-text-primary uppercase tracking-tight">Revenue Analytics</h2>
            <div className="flex gap-4">
              <select className="bg-bg-secondary border border-border-light text-text-primary text-xs font-bold rounded-xl px-5 py-2.5 outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer transition-colors">
                <option>Weekly View</option>
                <option>Monthly View</option>
                <option>Annual View</option>
              </select>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="99%" height="99%">
              <AreaChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 13, fontWeight: 500}} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 13, fontWeight: 500}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-medium)', borderRadius: '16px', color: 'var(--text-primary)', boxShadow: 'var(--shadow-modal)' }}
                  itemStyle={{ color: 'var(--brand-primary)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="current" stroke="var(--brand-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorCurrent)" activeDot={{ r: 8, fill: 'var(--brand-primary)', strokeWidth: 0, style: { filter: 'drop-shadow(0px 0px 8px rgba(16,185,129,0.5))' } }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-bg-card p-8 rounded-[2rem] border border-border-light shadow-card hover:border-brand-primary/10 transition-all flex flex-col items-center">
          <div className="w-full mb-8 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-text-primary uppercase tracking-tight">Facility Distribution</h2>
              <p className="text-text-secondary text-sm mt-1">Bookings by Turf Type</p>
            </div>
            <button onClick={() => alert('Detailed report downloading...')} className="p-2 hover:bg-bg-secondary rounded-lg transition-colors group" title="Download Report">
              <TrendingUp className="w-5 h-5 text-text-muted group-hover:text-brand-primary transition-colors" />
            </button>
          </div>
          <div className="relative h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="99%" height="99%">
              <PieChart>
                <Pie
                  data={displayUsage}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {displayUsage.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="cursor-pointer outline-none hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-medium)', borderRadius: '12px', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-text-primary tracking-tight">
                {displayUsage[0]?.value || 0}%
              </span>
              <span className="text-[10px] font-black text-brand-primary tracking-widest uppercase mt-1">
                {displayUsage[0]?.name || 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="w-full mt-8 space-y-4">
            {displayUsage.map((sport, index) => (
              <div key={sport.name} className="flex items-center justify-between p-3 hover:bg-bg-secondary rounded-2xl transition-colors cursor-pointer group">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3 group-hover:scale-125 transition-transform" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-text-primary font-black text-sm group-hover:text-brand-primary transition-colors">{sport.name}</span>
                </div>
                <span className="text-text-primary font-black group-hover:text-brand-primary transition-colors">{sport.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
