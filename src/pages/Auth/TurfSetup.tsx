import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { useStore, type TimingRule } from '../../store/useStore';
import { Input } from '../../components/Input';
import { NumericInput } from '../../components/NumericInput';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, CheckCircle2, Loader2, Calendar, Settings2, ToggleLeft as Toggle, ToggleRight } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMES = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM',
  '12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM'
];

export default function TurfSetup() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customizing, setCustomizing] = useState(false);
  
  const [weekdayTiming, setWeekdayTiming] = useState({ start: '07:00 AM', end: '11:00 PM' });
  const [weekendTiming, setWeekendTiming] = useState({ start: '06:00 AM', end: '02:00 AM' });
  
  const [customDays, setCustomDays] = useState<Record<string, { isOpen: boolean, start: string, end: string }>>(
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: { 
        isOpen: true, 
        start: ['Saturday', 'Sunday'].includes(day) ? '06:00 AM' : '07:00 AM',
        end: ['Saturday', 'Sunday'].includes(day) ? '02:00 AM' : '11:00 PM'
      }
    }), {})
  );

  const { user, checkTurfSetup } = useAuthStore();
  const { saveTimingRules, generateSlotsFromRules } = useStore();
  const navigate = useNavigate();

  const handleSetup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const fd = new FormData(e.currentTarget);
    const turfName = fd.get('turfName') as string;
    const pricePerHour = fd.get('pricePerHour') as string;

    const newErrors: Record<string, string> = {};
    if (!turfName || turfName.trim().length < 3) newErrors.turfName = 'Turf name required (min 3 chars).';
    if (!pricePerHour || parseInt(pricePerHour) <= 0) newErrors.pricePerHour = 'Price per hour required (integer > 0).';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // 1. Create the Turf
      const { data: turfData, error: turfError } = await supabase.from('turfs').insert({
        name: turfName,
        type: 'General',
        location: 'Default Location',
        price_per_hour: parseInt(pricePerHour),
        owner_id: user.id,
        setup_completed: true
      }).select('id').single();

      if (turfError) throw turfError;

      // 2. Prepare Timing Rules
      const rules: TimingRule[] = DAYS.map(day => {
        const isWeekend = ['Saturday', 'Sunday'].includes(day);
        const dayData = customDays[day];
        
        const timingType = customizing ? 'custom' : (isWeekend ? 'weekend' : 'weekday');
        const start = customizing ? dayData.start : (isWeekend ? weekendTiming.start : weekdayTiming.start);
        const end = customizing ? dayData.end : (isWeekend ? weekendTiming.end : weekdayTiming.end);
        const isOpen = customizing ? dayData.isOpen : true;

        const formatTo24 = (t: string) => {
          const [time, period] = t.split(' ');
          let [h, m] = time.split(':').map(Number);
          if (period === 'PM' && h < 12) h += 12;
          if (period === 'AM' && h === 12) h = 0;
          return `${h.toString().padStart(2, '0')}:${(m || 0).toString().padStart(2, '0')}:00`;
        };

        return {
          turf_id: turfData.id,
          day_of_week: day,
          is_open: isOpen,
          start_time: formatTo24(start),
          end_time: formatTo24(end),
          timing_type: timingType as any
        };
      });

      // 3. Save Rules
      await saveTimingRules(turfData.id, rules);

      // 4. Generate Slots for next 7 days
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      
      await generateSlotsFromRules(turfData.id, today, nextWeekStr);

      // 5. Update auth state and redirect
      await checkTurfSetup();
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Setup failed:", err);
      setErrors({ form: err.message || 'Failed to complete setup.' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-bg-primary rounded-3xl shadow-premium border border-border-light overflow-hidden"
      >
        <div className="p-8 text-center bg-bg-secondary/30 border-b border-border-light relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary/20">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-brand-primary"
            />
          </div>
          
          <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-primary/20 shadow-inner">
            <CheckCircle2 className="w-9 h-9 text-brand-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Onboarding</h1>
          <p className="text-text-secondary text-[14px] mt-2 max-w-md mx-auto leading-relaxed">
            Configure your facility timings to generate booking slots automatically.
          </p>
        </div>

        <form noValidate onSubmit={handleSetup} className="p-8 space-y-8">
          {errors.form && (
            <div className="p-4 rounded-xl bg-status-danger/5 border border-status-danger/10 text-status-danger text-[13px] font-bold text-center">
              {errors.form}
            </div>
          )}

          {/* Basic Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center border border-border-light">
                <Settings2 className="w-4 h-4 text-brand-primary" />
              </div>
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">Basic Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                name="turfName"
                label="Turf Name"
                placeholder="e.g. Linkqs Arena"
                error={errors.turfName}
                icon={<MapPin className="w-4 h-4" />}
              />
              <NumericInput 
                name="pricePerHour"
                label="Price Per Hour (₹)"
                placeholder="900"
                error={errors.pricePerHour}
                icon={<div className="text-sm font-bold">₹</div>}
              />
            </div>
          </div>

          <div className="h-px bg-border-light w-full" />

          {/* Timing Rules */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center border border-border-light">
                  <Clock className="w-4 h-4 text-brand-primary" />
                </div>
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">Opening Hours</h2>
              </div>
              
              <button 
                type="button"
                onClick={() => setCustomizing(!customizing)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border ${
                  customizing ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'bg-bg-secondary border-border-light text-text-muted hover:text-text-primary'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                Customize Individual Days
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!customizing ? (
                <motion.div 
                  key="common"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-bg-secondary/40 rounded-2xl border border-border-light">
                    {/* Weekdays */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-primary" />
                        <span className="text-[12px] font-bold text-text-primary uppercase tracking-wider">Weekdays (Mon - Fri)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-muted uppercase ml-0.5">Start</label>
                          <select 
                            value={weekdayTiming.start}
                            onChange={(e) => setWeekdayTiming({...weekdayTiming, start: e.target.value})}
                            className="w-full bg-bg-primary border border-border-light rounded-xl px-3 py-2.5 text-[13px] font-bold text-text-primary outline-none focus:border-brand-primary transition-all"
                          >
                            {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-muted uppercase ml-0.5">End</label>
                          <select 
                            value={weekdayTiming.end}
                            onChange={(e) => setWeekdayTiming({...weekdayTiming, end: e.target.value})}
                            className="w-full bg-bg-primary border border-border-light rounded-xl px-3 py-2.5 text-[13px] font-bold text-text-primary outline-none focus:border-brand-primary transition-all"
                          >
                            {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Weekend */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-status-warning" />
                        <span className="text-[12px] font-bold text-text-primary uppercase tracking-wider">Weekend (Sat - Sun)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-muted uppercase ml-0.5">Start</label>
                          <select 
                            value={weekendTiming.start}
                            onChange={(e) => setWeekendTiming({...weekendTiming, start: e.target.value})}
                            className="w-full bg-bg-primary border border-border-light rounded-xl px-3 py-2.5 text-[13px] font-bold text-text-primary outline-none focus:border-brand-primary transition-all"
                          >
                            {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-muted uppercase ml-0.5">End</label>
                          <select 
                            value={weekendTiming.end}
                            onChange={(e) => setWeekendTiming({...weekendTiming, end: e.target.value})}
                            className="w-full bg-bg-primary border border-border-light rounded-xl px-3 py-2.5 text-[13px] font-bold text-text-primary outline-none focus:border-brand-primary transition-all"
                          >
                            {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="custom"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {DAYS.map(day => (
                    <div key={day} className="flex flex-wrap items-center justify-between p-4 bg-bg-secondary/40 rounded-2xl border border-border-light gap-4 transition-all hover:bg-bg-secondary/60">
                      <div className="flex items-center gap-4 min-w-[140px]">
                        <button 
                          type="button"
                          onClick={() => setCustomDays({...customDays, [day]: {...customDays[day], isOpen: !customDays[day].isOpen}})}
                          className="transition-colors"
                        >
                          {customDays[day].isOpen ? (
                            <ToggleRight className="w-8 h-8 text-brand-primary" />
                          ) : (
                            <Toggle className="w-8 h-8 text-text-muted" />
                          )}
                        </button>
                        <span className={`text-[13px] font-bold ${customDays[day].isOpen ? 'text-text-primary' : 'text-text-muted'}`}>
                          {day}
                        </span>
                      </div>

                      {customDays[day].isOpen ? (
                        <div className="flex items-center gap-3">
                          <select 
                            value={customDays[day].start}
                            onChange={(e) => setCustomDays({...customDays, [day]: {...customDays[day], start: e.target.value}})}
                            className="bg-bg-primary border border-border-light rounded-xl px-3 py-2 text-[12px] font-bold text-text-primary outline-none focus:border-brand-primary"
                          >
                            {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <span className="text-text-muted font-bold">to</span>
                          <select 
                            value={customDays[day].end}
                            onChange={(e) => setCustomDays({...customDays, [day]: {...customDays[day], end: e.target.value}})}
                            className="bg-bg-primary border border-border-light rounded-xl px-3 py-2 text-[12px] font-bold text-text-primary outline-none focus:border-brand-primary"
                          >
                            {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-status-danger uppercase tracking-widest px-4">Closed</span>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-6">
            <button 
              disabled={loading}
              className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold text-[14px] uppercase tracking-wider hover:bg-brand-hover transition-all shadow-xl shadow-brand-primary/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {loading ? 'Finalizing Setup...' : 'Complete Onboarding'}
            </button>
            <p className="text-center text-[11px] text-text-muted mt-4 font-medium italic">
              * Slots for the next 7 days will be generated automatically.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
