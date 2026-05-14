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
import { motion, AnimatePresence } from 'framer-motion';
import { showToast, showSuccess } from '../utils/alerts';

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
  const [selectedVenue, setSelectedVenue] = useState('All Venues');
  const [selectedSport, setSelectedSport] = useState('All Sports');
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const TIME_OPTIONS = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'];
  const SPORT_OPTIONS = ['All Sports', 'Cricket', 'Football', 'Tennis', 'Badminton', 'Basketball'];
  const VENUE_OPTIONS = ['All Venues', ...turfs.map(t => t.name)];

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
      showSuccess('Applied', 'Filters applied successfully!');
    }, 1000);
  };

  return (
    <div className="w-full space-y-8 relative px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Performance Analytics</h1>
          <p className="text-text-secondary text-[13px] mt-0.5">Deep-layer analytics for multi-facility optimization.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="bg-bg-primary border border-border-light rounded-xl p-1 flex items-center shadow-sm relative">
            {/* Time Range Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'time' ? null : 'time')}
                className="flex items-center px-4 py-1.5 border-r border-border-light hover:bg-bg-secondary transition-all rounded-lg group"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-brand-primary mr-2 group-hover:scale-110 transition-transform" />
                <span className="text-[13px] font-bold text-text-primary">{timeRange}</span>
                <ChevronDown className={`w-3.5 h-3.5 ml-2 text-text-muted transition-transform duration-300 ${activeDropdown === 'time' ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {activeDropdown === 'time' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-bg-primary border border-border-light rounded-xl shadow-modal z-50 overflow-hidden py-1"
                  >
                    {TIME_OPTIONS.map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          setTimeRange(option);
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-[13px] font-bold transition-all ${
                          timeRange === option ? 'bg-brand-primary/5 text-brand-primary' : 'text-text-primary hover:bg-bg-secondary'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Venue Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'venue' ? null : 'venue')}
                className="flex items-center px-4 py-1.5 border-r border-border-light hover:bg-bg-secondary transition-all group"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-primary mr-2 group-hover:scale-110 transition-transform" />
                <span className="text-[13px] font-bold text-text-primary truncate max-w-[120px]">{selectedVenue}</span>
                <ChevronDown className={`w-3.5 h-3.5 ml-2 text-text-muted transition-transform duration-300 ${activeDropdown === 'venue' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'venue' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-bg-primary border border-border-light rounded-xl shadow-modal z-50 overflow-hidden py-1 max-h-60 overflow-y-auto"
                  >
                    {VENUE_OPTIONS.map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          setSelectedVenue(option);
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-[13px] font-bold transition-all ${
                          selectedVenue === option ? 'bg-brand-primary/5 text-brand-primary' : 'text-text-primary hover:bg-bg-secondary'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sport Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'sport' ? null : 'sport')}
                className="flex items-center px-4 py-1.5 hover:bg-bg-secondary transition-all rounded-lg group"
              >
                <Activity className="w-3.5 h-3.5 text-brand-primary mr-2 group-hover:scale-110 transition-transform" />
                <span className="text-[13px] font-bold text-text-primary">{selectedSport}</span>
                <ChevronDown className={`w-3.5 h-3.5 ml-2 text-text-muted transition-transform duration-300 ${activeDropdown === 'sport' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'sport' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-bg-primary border border-border-light rounded-xl shadow-modal z-50 overflow-hidden py-1"
                  >
                    {SPORT_OPTIONS.map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          setSelectedSport(option);
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-[13px] font-bold transition-all ${
                          selectedSport === option ? 'bg-brand-primary/5 text-brand-primary' : 'text-text-primary hover:bg-bg-secondary'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Click Outside Overlay */}
            {activeDropdown && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setActiveDropdown(null)}
              />
            )}
          </div>
          <button 
            onClick={handleApplyFilters}
            disabled={isApplying}
            className="bg-brand-primary text-white px-5 py-2 rounded-lg font-bold text-[13px] hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-wait"
          >
            {isApplying ? 'Syncing...' : 'Sync Data'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-bg-primary p-4.5 rounded-xl border border-border-light shadow-premium hover:border-brand-primary/20 transition-all cursor-default">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-brand-primary/10 rounded-lg mr-2.5">
              <TrendingUp className="w-4 h-4 text-brand-primary" />
            </div>
            <h3 className="text-text-muted font-bold text-[10px] tracking-wider uppercase">Key Insight</h3>
          </div>
          <p className="text-text-primary font-bold text-base mb-2">
            {sportUsage.length > 0 ? `${sportUsage[0].name} is your top performer.` : 'Start taking bookings to see insights.'}
          </p>
          <div className="flex items-center text-brand-primary font-bold text-[11px] uppercase tracking-wider">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
            Active growth phase
          </div>
        </div>

        <div className="bg-bg-primary p-4.5 rounded-xl border border-border-light shadow-premium hover:border-brand-primary/20 transition-all cursor-default">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-status-warning/10 rounded-lg mr-2.5">
              <CalendarIcon className="w-3.5 h-3.5 text-status-warning" />
            </div>
            <h3 className="text-text-muted font-bold text-[10px] tracking-wider uppercase">Efficiency</h3>
          </div>
          <p className="text-text-primary font-bold text-base mb-2">You have processed {bookings.length} total bookings.</p>
          <p className="text-text-secondary text-[12px] font-medium">Keep maintaining 100% data integrity.</p>
        </div>

        <div className="bg-bg-primary p-4.5 rounded-xl border border-border-light shadow-premium hover:border-brand-primary/20 transition-all cursor-default">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-status-danger/10 rounded-lg mr-2.5">
              <Users className="w-4 h-4 text-status-danger" />
            </div>
            <h3 className="text-text-muted font-bold text-[10px] tracking-wider uppercase">Network</h3>
          </div>
          <p className="text-text-primary font-bold text-base mb-2">User database is growing steadily.</p>
          <p className="text-status-danger font-bold text-[11px] uppercase tracking-wider">Real-time sync enabled</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-bg-primary p-6 rounded-xl border border-border-light shadow-premium hover:border-brand-primary/10 transition-all">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-text-primary uppercase tracking-tight">Revenue Analytics</h2>
            <div className="flex gap-3">
              <select className="bg-bg-secondary border border-border-light text-text-primary text-[11px] font-bold rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-primary/10 cursor-pointer transition-colors">
                <option>Weekly View</option>
                <option>Monthly View</option>
                <option>Annual View</option>
              </select>
            </div>
          </div>
          <div className="h-[350px] w-full min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={350}>
              <AreaChart data={PERFORMANCE_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500}} tickLine={false} axisLine={false} dy={5} />
                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-light)', borderRadius: '12px', color: 'var(--text-primary)', boxShadow: 'var(--shadow-premium)', fontSize: '12px' }}
                  itemStyle={{ color: 'var(--brand-primary)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="current" stroke="var(--brand-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" activeDot={{ r: 6, fill: 'var(--brand-primary)', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-bg-primary p-6 rounded-xl border border-border-light shadow-premium hover:border-brand-primary/10 transition-all flex flex-col items-center">
          <div className="w-full mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-text-primary uppercase tracking-tight">Facility Distribution</h2>
              <p className="text-text-secondary text-[12px] mt-0.5">By Turf Type</p>
            </div>
            <button onClick={() => showToast('Detailed report downloading...', 'info')} className="p-1.5 hover:bg-bg-secondary rounded-lg transition-colors group" title="Download Report">
              <TrendingUp className="w-4 h-4 text-text-muted group-hover:text-brand-primary transition-colors" />
            </button>
          </div>
          <div className="relative h-[220px] w-full flex items-center justify-center min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={220}>
              <PieChart>
                <Pie
                  data={displayUsage}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {displayUsage.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="cursor-pointer outline-none hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-light)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '11px' }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-text-primary tracking-tight">
                {displayUsage[0]?.value || 0}%
              </span>
              <span className="text-[9px] font-bold text-brand-primary tracking-widest uppercase">
                {displayUsage[0]?.name || 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="w-full mt-6 space-y-2">
            {displayUsage.map((sport, index) => (
              <div key={sport.name} className="flex items-center justify-between p-2 hover:bg-bg-secondary rounded-xl transition-colors cursor-pointer group">
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full mr-2.5 group-hover:scale-125 transition-transform" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-text-primary font-bold text-[13px] group-hover:text-brand-primary transition-colors">{sport.name}</span>
                </div>
                <span className="text-text-primary font-bold text-[13px] group-hover:text-brand-primary transition-colors">{sport.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
