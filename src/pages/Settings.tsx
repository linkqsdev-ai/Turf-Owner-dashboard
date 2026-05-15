import { Save, User, Clock, ToggleLeft as Toggle, Settings2, Globe, Lock, CheckCircle2, Camera, Loader2, ShieldCheck, ToggleRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast, showConfirm } from '../utils/alerts';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../components/Input';
import { useAuthStore } from '../store/useAuthStore';
import { useStore, type TimingRule } from '../store/useStore';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMES = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM',
  '12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM'
];

const formatTo24 = (t: string) => {
  const [time, period] = t.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${(m || 0).toString().padStart(2, '0')}:00`;
};

const formatTo12 = (t: string) => {
  if (!t) return '07:00 AM';
  let [h] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h.toString().padStart(2, '0')}:00 ${period}`;
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  
  const { user, updateProfile, signOut } = useAuthStore();
  const { turfs, fetchTurfs, fetchTimingRules, saveTimingRules, generateSlotsFromRules } = useStore();
  
  const [selectedTurfId, setSelectedTurfId] = useState<string>('');
  const [localRules, setLocalRules] = useState<Record<string, { isOpen: boolean, start: string, end: string }>>({});

  useEffect(() => {
    fetchTurfs();
  }, []);

  useEffect(() => {
    if (turfs.length > 0 && !selectedTurfId) {
      setSelectedTurfId(turfs[0].id.toString());
    }
  }, [turfs]);

  useEffect(() => {
    if (selectedTurfId) {
      fetchTimingRules(selectedTurfId).then((rules) => {
        const rulesMap = DAYS.reduce((acc, day) => {
          const rule = rules.find(r => r.day_of_week === day);
          return {
            ...acc,
            [day]: {
              isOpen: rule ? rule.is_open : true,
              start: rule ? formatTo12(rule.start_time) : '07:00 AM',
              end: rule ? formatTo12(rule.end_time) : '11:00 PM'
            }
          };
        }, {});
        setLocalRules(rulesMap);
      });
    }
  }, [selectedTurfId]);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
  const displayEmail = user?.email || 'admin@linkqs.com';
  const avatarUrl = user?.user_metadata?.avatar_url || '/default-avatar.png';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const name = fd.get('name') as string;
    if (!name || name.trim().length < 2) {
      setErrors({ name: 'Valid name required.' });
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({ full_name: name });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      showToast('Sync Failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTiming = async () => {
    if (!selectedTurfId) return;
    setIsSaving(true);
    try {
      const rules: TimingRule[] = DAYS.map(day => ({
        turf_id: selectedTurfId,
        day_of_week: day,
        is_open: localRules[day].isOpen,
        start_time: formatTo24(localRules[day].start),
        end_time: formatTo24(localRules[day].end),
        timing_type: 'custom'
      }));

      await saveTimingRules(selectedTurfId, rules);
      
      const confirmed = await showConfirm(
        'Regenerate Slots?',
        'Would you like to regenerate slots for the next 7 days based on these new rules?',
        'Regenerate'
      );

      if (confirmed) {
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        await generateSlotsFromRules(selectedTurfId, today, nextWeek.toISOString().split('T')[0]);
        showToast('Slots regenerated successfully.', 'success');
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      showToast('Failed to save rules.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm('Logout', 'Terminate active session?', 'Sign Out');
    if (confirmed) {
      await signOut();
      navigate('/signin');
    }
  };

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'timing', label: 'Slot Timing', icon: Clock },
    { id: 'facility', label: 'Facility Details', icon: Globe },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="w-full space-y-8 relative px-4 md:px-0 pb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">System <span className="text-brand-primary">Preferences</span></h1>
          <p className="text-text-secondary text-[13px] mt-0.5">Manage your profile and operational parameters.</p>
        </div>
        <AnimatePresence>
          {showSuccess && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-lg border border-brand-primary/20">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              <span className="font-bold text-[11px] uppercase tracking-wider">Synchronized</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-[13px] flex items-center transition-all border ${
                activeTab === tab.id
                  ? 'bg-white text-brand-primary border-brand-primary/20 shadow-sm'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary border-transparent'
              }`}
            >
              <tab.icon className={`w-4 h-4 mr-3 transition-colors ${activeTab === tab.id ? 'text-brand-primary' : 'text-text-muted'}`} /> 
              {tab.label}
            </button>
          ))}
          <div className="pt-4 px-2">
            <button onClick={handleLogout} className="w-full bg-status-danger/5 hover:bg-status-danger/10 text-status-danger py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider border border-status-danger/10 transition-all">
              Sign Out
            </button>
          </div>
        </div>

        <div className="lg:col-span-9 bg-white border border-border-light rounded-2xl shadow-premium p-6 md:p-10 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' ? (
              <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-bg-secondary flex items-center justify-center overflow-hidden border-2 border-brand-primary/20 shadow-inner group-hover:border-brand-primary transition-all">
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary leading-tight">{displayName}</h3>
                    <p className="text-[11px] font-bold text-brand-primary uppercase tracking-widest mt-0.5">Facility Owner</p>
                  </div>
                </div>

                <form noValidate onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input name="name" label="Assigned Name" defaultValue={displayName} error={errors.name} />
                    <Input name="email" label="Primary Channel" defaultValue={displayEmail} readOnly className="opacity-60" />
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button disabled={isSaving} type="submit" className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold text-[13px] flex items-center hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-70">
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                      Sync Profile
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : activeTab === 'timing' ? (
              <motion.div key="timing" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Slot Timing Rules</h2>
                    <p className="text-[12px] text-text-secondary font-medium">Configure weekly recurring timings for your facilities.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select 
                      value={selectedTurfId}
                      onChange={(e) => setSelectedTurfId(e.target.value)}
                      className="bg-bg-secondary border border-border-light rounded-xl px-4 py-2 text-[12px] font-bold text-text-primary outline-none focus:border-brand-primary"
                    >
                      {turfs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <button 
                      onClick={handleSaveTiming}
                      disabled={isSaving}
                      className="bg-brand-primary text-white px-5 py-2 rounded-xl font-bold text-[12px] flex items-center hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-70"
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-2" />}
                      Apply Rules
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {DAYS.map(day => (
                    <div key={day} className="flex flex-wrap items-center justify-between p-4 bg-bg-secondary/40 rounded-2xl border border-border-light gap-4 transition-all hover:bg-bg-secondary/60">
                      <div className="flex items-center gap-4 min-w-[140px]">
                        <button 
                          onClick={() => setLocalRules({...localRules, [day]: {...localRules[day], isOpen: !localRules[day].isOpen}})}
                          className="transition-colors"
                        >
                          {localRules[day]?.isOpen ? <ToggleRight className="w-8 h-8 text-brand-primary" /> : <Toggle className="w-8 h-8 text-text-muted" />}
                        </button>
                        <span className={`text-[13px] font-bold ${localRules[day]?.isOpen ? 'text-text-primary' : 'text-text-muted'}`}>{day}</span>
                      </div>

                      {localRules[day]?.isOpen ? (
                        <div className="flex items-center gap-3">
                          <select 
                            value={localRules[day].start}
                            onChange={(e) => setLocalRules({...localRules, [day]: {...localRules[day], start: e.target.value}})}
                            className="bg-white border border-border-light rounded-xl px-3 py-2 text-[12px] font-bold text-text-primary outline-none focus:border-brand-primary"
                          >
                            {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <span className="text-text-muted font-bold text-[11px]">to</span>
                          <select 
                            value={localRules[day].end}
                            onChange={(e) => setLocalRules({...localRules, [day]: {...localRules[day], end: e.target.value}})}
                            className="bg-white border border-border-light rounded-xl px-3 py-2 text-[12px] font-bold text-text-primary outline-none focus:border-brand-primary"
                          >
                            {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-status-danger uppercase tracking-widest px-4">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Settings2 className="w-12 h-12 text-brand-primary opacity-20 mb-4" />
                <h3 className="text-lg font-bold text-text-primary">Advanced Protocols Restricted</h3>
                <p className="text-text-secondary text-[13px] max-w-xs mt-1">This operational module requires enterprise-level clearance.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
