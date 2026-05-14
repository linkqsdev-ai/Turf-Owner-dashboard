import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Input } from '../../components/Input';
import { NumericInput } from '../../components/NumericInput';
import { motion } from 'framer-motion';
import { Clock, MapPin, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';

export default function TurfSetup() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user, checkTurfSetup } = useAuthStore();
  const navigate = useNavigate();

  const TIMES = [
    '12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM', '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM'
  ];

  const generateSlots = (open: string, close: string) => {
    const parseTime = (t: string) => {
      const [time, period] = t.split(' ');
      let [h] = time.split(':').map(Number);
      if (period === 'PM' && h < 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60;
    };

    let startMin = parseTime(open);
    let endMin = parseTime(close);

    if (endMin <= startMin) {
      endMin += 24 * 60; // Next day
    }

    const slots = [];
    let sortOrder = 1;
    for (let current = startMin; current < endMin; current += 60) {
      const startH = Math.floor(current / 60) % 24;
      const endH = Math.floor((current + 60) / 60) % 24;
      
      const formatTimeDB = (h: number) => `${h.toString().padStart(2, '0')}:00:00`;

      slots.push({
        start_time: formatTimeDB(startH),
        end_time: formatTimeDB(endH),
        sort_order: sortOrder++
      });
    }
    return slots;
  };

  const handleSetup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const fd = new FormData(e.currentTarget);
    const turfName = fd.get('turfName') as string;
    const openingTime = fd.get('openingTime') as string;
    const closingTime = fd.get('closingTime') as string;
    const pricePerHour = fd.get('pricePerHour') as string;

    const newErrors: Record<string, string> = {};
    if (!turfName || turfName.trim().length < 3) newErrors.turfName = 'Please enter a valid turf name (min 3 chars).';
    if (!openingTime) newErrors.openingTime = 'Opening time is required.';
    if (!closingTime) newErrors.closingTime = 'Closing time is required.';
    if (openingTime === closingTime) newErrors.closingTime = 'Closing time cannot be same as opening time.';
    if (!pricePerHour || parseInt(pricePerHour) <= 0) newErrors.pricePerHour = 'Please enter a valid hourly price.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // 1. Create the Turf
      // Note: We include owner_id and price_per_hour
      const { data: turfData, error: turfError } = await supabase.from('turfs').insert({
        name: turfName,
        type: 'General',
        location: 'Default Location',
        price_per_hour: parseInt(pricePerHour),
        owner_id: user.id
      }).select('id').single();

      if (turfError) throw turfError;

      // 2. Generate and Insert Slots for today
      const slotsToCreate = generateSlots(openingTime, closingTime);
      const today = new Date().toISOString().split('T')[0];

      const { error: slotError } = await supabase.from('slots').insert(
        slotsToCreate.map(s => ({
          turf_id: turfData.id,
          slot_date: today,
          start_time: s.start_time,
          end_time: s.end_time,
          price: parseInt(pricePerHour),
          is_booked: false,
          sort_order: s.sort_order
        }))
      );

      if (slotError) throw slotError;

      // 3. Update local state and redirect
      await checkTurfSetup();
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Setup failed:", err);
      setErrors({ form: err.message || 'Failed to complete setup. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-bg-primary rounded-2xl shadow-premium border border-border-light overflow-hidden"
      >
        <div className="p-8 pb-6 text-center bg-bg-secondary/30 border-b border-border-light">
          <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-primary/20">
            <CheckCircle2 className="w-8 h-8 text-brand-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Setup your turf</h1>
          <p className="text-text-secondary text-[13px] mt-1.5 max-w-sm mx-auto">
            Add your turf details to generate your initial booking slots and get started.
          </p>
        </div>

        <form noValidate onSubmit={handleSetup} className="p-8 space-y-6">
          {errors.form && (
            <div className="p-3 rounded-lg bg-status-danger/5 border border-status-danger/10 text-status-danger text-[12px] font-bold text-center">
              {errors.form}
            </div>
          )}

          <Input 
            name="turfName"
            label="Turf Name"
            placeholder="e.g. Linkqs Arena"
            error={errors.turfName}
            onChange={() => setErrors(prev => ({ ...prev, turfName: '' }))}
            icon={<MapPin className="w-4 h-4" />}
          />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider ml-0.5">Opening Time</label>
              <div className="relative">
                <select 
                  name="openingTime"
                  className={`w-full bg-bg-secondary border rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none transition-all font-bold appearance-none ${
                    errors.openingTime ? 'border-status-danger ring-4 ring-status-danger/5' : 'border-border-light focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5'
                  }`}
                >
                  <option value="">Select</option>
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
              {errors.openingTime && <p className="text-[12px] font-bold text-status-danger mt-1.5 ml-0.5">{errors.openingTime}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider ml-0.5">Closing Time</label>
              <div className="relative">
                <select 
                  name="closingTime"
                  className={`w-full bg-bg-secondary border rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none transition-all font-bold appearance-none ${
                    errors.closingTime ? 'border-status-danger ring-4 ring-status-danger/5' : 'border-border-light focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5'
                  }`}
                >
                  <option value="">Select</option>
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
              {errors.closingTime && <p className="text-[12px] font-bold text-status-danger mt-1.5 ml-0.5">{errors.closingTime}</p>}
            </div>
          </div>

          <NumericInput 
            name="pricePerHour"
            label="Price Per Hour (₹)"
            placeholder="900"
            error={errors.pricePerHour}
            onValueChange={() => setErrors(prev => ({ ...prev, pricePerHour: '' }))}
            icon={<div className="text-sm font-bold">₹</div>}
          />

          <div className="pt-2">
            <button 
              disabled={loading}
              className="w-full bg-brand-primary text-white py-3.5 rounded-xl font-bold text-[13px] uppercase tracking-wider hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
              {loading ? 'Generating Slots...' : 'Generate Slots & Continue'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
