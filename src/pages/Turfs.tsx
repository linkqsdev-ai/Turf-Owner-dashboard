import { useState, useRef } from 'react';
import { Plus, MapPin, Star, X, LayoutGrid, Trash2, Loader2, Map as MapIcon, IndianRupee, ShieldCheck, ArrowUpRight, ChevronDown } from 'lucide-react';
import { useStore, type Turf } from '../store/useStore';
import { supabase } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { showWarning, showError, showConfirm } from '../utils/alerts';
import MapPicker from '../components/MapPicker';
import { NumericInput } from '../components/NumericInput';
import { Input } from '../components/Input';

const DEFAULT_TURF_IMAGE = '/assets/images/default-turf.jpg';

const SportIcon = ({ sport, className = "w-4 h-4" }: { sport: string, className?: string }) => {
  switch (sport) {
    case 'Football':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
          <path d="m6.7 6.7 10.6 10.6" />
          <path d="m6.7 17.3 10.6-10.6" />
          <path d="M12 2v20" />
          <path d="M2 12h20" />
        </svg>
      );
    case 'Cricket':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M14.5 2.5 3 14l3 3L17.5 5.5l-3-3z" />
          <circle cx="20" cy="20" r="2" />
        </svg>
      );
    case 'Tennis':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="16" cy="8" r="6" />
          <path d="M11.5 12.5 3 21" />
          <path d="M7 15l4 4" />
          <circle cx="21" cy="3" r="2" />
        </svg>
      );
    case 'Basketball':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2v20" />
          <path d="M2 12h20" />
          <path d="M4.93 4.93 19.07 19.07" />
          <path d="M4.93 19.07 19.07 4.93" />
        </svg>
      );
    case 'Volleyball':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 1 10 10" />
          <path d="M2 12a10 10 0 0 1 10 10" />
          <path d="M12 12 2 12" />
          <path d="M12 12v10" />
        </svg>
      );
    case 'Badminton':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M7 7 17 17" />
          <path d="M10 7 17 14" />
          <path d="M7 10 14 17" />
          <circle cx="19" cy="5" r="2" />
        </svg>
      );
    case 'Padel':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="14" cy="10" r="8" />
          <path d="M8 16 2 22" />
          <circle cx="20" cy="4" r="2" />
        </svg>
      );
    default:
      return <LayoutGrid className={className} />;
  }
};

export default function Turfs() {
  const { turfs, addTurf, updateTurf, deleteTurf } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTurf, setEditingTurf] = useState<Turf | null>(null);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [formLocation, setFormLocation] = useState('');
  const [formMapUrl, setFormMapUrl] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStatus, setFormStatus] = useState<string>('Active');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const SUPPORTED_SPORTS = ['Football', 'Cricket', 'Tennis', 'Volleyball', 'Badminton', 'Basketball', 'Padel'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        showWarning('Invalid File', 'Please upload a JPG, PNG or WEBP image.');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('turf-images')
      .upload(filePath, file);

    if (uploadError) {
      if (uploadError.message.includes('Bucket not found')) {
        throw new Error('Storage bucket "turf-images" not found. Please create it in your Supabase dashboard and set it to Public.');
      }
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('turf-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Custom Validation
    const fd = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};
    
    const name = fd.get('name') as string;
    if (!name || name.trim().length < 2) newErrors.name = 'Please enter a valid facility name.';
    if (!formLocation || formLocation.trim().length < 3) newErrors.location = 'Please provide a specific location.';
    if (!formPrice) newErrors.price = 'Please enter a valid hourly rate.';
    
    if (selectedSports.length === 0) {
      newErrors.sports = 'Please select a sport category.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsUploading(true);
    
    try {
      const fd = new FormData(e.currentTarget);
      let imageUrl = editingTurf?.image || '';

      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      } else if (!previewUrl) {
        imageUrl = DEFAULT_TURF_IMAGE;
      }

      const turfData = {
        name: fd.get('name') as string,
        type: selectedSports.join(', '),
        location: formLocation,
        map_url: formMapUrl,
        price: formPrice,
        image: imageUrl || DEFAULT_TURF_IMAGE,
        status: formStatus
      };

      if (editingTurf) {
        await updateTurf(editingTurf.id, turfData);
      } else {
        await addTurf(turfData);
      }
      
      resetModal();
    } catch (error: any) {
      console.error('Error uploading image:', error);
      showError('Upload Failed', error.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (turf: Turf) => {
    setEditingTurf(turf);
    setPreviewUrl(turf.image && !turf.image.includes('unsplash.com') ? turf.image : null);
    setFormLocation(turf.location);
    setFormMapUrl(turf.map_url);
    setFormPrice(turf.price.replace(/[^0-9]/g, ''));
    setFormStatus(turf.status || 'Active');
    setSelectedSports(turf.type.split(',').map(s => s.trim()));
    setIsModalOpen(true);
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setEditingTurf(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormLocation('');
    setFormMapUrl('');
    setFormPrice('');
    setFormStatus('Active');
    setIsStatusDropdownOpen(false);
    setSelectedSports([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string | number) => {
    const confirmed = await showConfirm(
      'Decommission Facility',
      'Are you sure you want to decommission this facility? All associated booking slots will be permanently purged from the system.',
      'Decommission'
    );
    if (confirmed) {
      deleteTurf(id);
    }
  };

  return (
    <div className="w-full space-y-8 relative px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Your Turf</h1>
          <p className="text-text-secondary text-[13px] mt-0.5">Manage and optimize your facility network.</p>
        </div>
        <button 
          onClick={() => {
            setEditingTurf(null);
            setPreviewUrl(null);
            setSelectedFile(null);
            setFormLocation('');
            setFormMapUrl('');
            setFormPrice('');
            setFormStatus('Active');
            setIsModalOpen(true);
          }}
          className="bg-brand-primary text-white px-5 py-2.5 rounded-lg font-bold text-[13px] flex items-center hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10 hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 mr-2" />
          Add Turf
        </button>
      </div>

      <AnimatePresence mode="wait">
        {turfs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-bg-primary border border-border-light rounded-xl p-20 flex flex-col items-center justify-center text-center shadow-premium"
          >
            <div className="w-16 h-16 bg-bg-secondary rounded-xl flex items-center justify-center mb-6 border border-border-light">
              <LayoutGrid className="w-8 h-8 text-brand-primary opacity-20" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">No facilities found</h2>
            <p className="text-text-secondary text-sm max-w-sm mb-8">Start by adding your first turf facility to manage bookings and schedules.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-text-primary text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-brand-primary transition-all"
            >
              Add First Facility
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {turfs.map((turf, idx) => (
              <motion.div 
                key={turf.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-bg-primary rounded-xl overflow-hidden border border-border-light hover:border-brand-primary/30 transition-all duration-300 shadow-premium hover:shadow-hover group"
              >
                <div className="h-32 relative overflow-hidden bg-bg-secondary">
                  {turf.image ? (
                    <img src={turf.image} alt={turf.name} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                  ) : (
                    <img src={DEFAULT_TURF_IMAGE} alt={turf.name} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                  )}
                  
                  <div className="absolute top-2.5 right-2.5 bg-bg-primary/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-text-primary flex items-center shadow-sm border border-border-light">
                    <Star className="w-2.5 h-2.5 text-brand-primary mr-0.5 fill-brand-primary" />
                    {turf.rating}
                  </div>
                  
                  <div className={`absolute top-2.5 left-2.5 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider shadow-sm ${
                    turf.status === 'Active' 
                      ? 'bg-brand-primary text-white' 
                      : turf.status === 'Maintenance' || turf.status === 'maintenance'
                      ? 'bg-status-warning text-white'
                      : 'bg-status-danger text-white'
                  }`}>
                    {turf.status}
                  </div>
                </div>
                <div className="p-3.5">
                  <div className="flex justify-between items-start mb-2.5">
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-[14px] font-bold text-text-primary group-hover:text-brand-primary transition-colors truncate" title={turf.name}>{turf.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        {turf.type.split(',').map(s => s.trim()).map(sport => (
                          <div key={sport} className="p-1 bg-brand-soft rounded text-brand-primary border border-brand-primary/5 shadow-sm" title={sport}>
                            <SportIcon sport={sport} className="w-2.5 h-2.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(turf.id)} 
                      className="text-text-muted hover:text-status-danger p-1 rounded-lg hover:bg-status-danger/5 transition-all ml-2 flex-shrink-0" 
                      title="Decommission"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center text-text-secondary text-[12px] font-medium truncate">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-brand-primary flex-shrink-0" /> {turf.location}
                    </div>
                    {turf.map_url && (
                      <a 
                        href={turf.map_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-brand-primary text-[10px] font-bold hover:underline inline-flex items-center gap-0.5"
                      >
                        Navigate <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-border-light">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-text-muted font-bold tracking-wider uppercase">Hourly</span>
                      <div className="text-text-primary font-bold text-sm tracking-tight">{turf.price}</div>
                    </div>
                    <button 
                      onClick={() => handleEdit(turf)}
                      className="bg-brand-primary text-white font-bold text-[10px] tracking-wider hover:bg-brand-hover transition-all px-3 py-1.5 rounded-lg shadow-sm shadow-brand-primary/10"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="bg-bg-primary border border-border-light rounded-xl shadow-modal w-full max-w-4xl relative z-10 overflow-hidden flex flex-col md:flex-row"
            >
              {/* Left Column: Media */}
              <div className="w-full md:w-[35%] bg-bg-secondary/20 border-r border-border-light flex flex-col p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-text-primary tracking-tight">
                    {editingTurf ? 'Edit turf' : 'New turf'}
                  </h2>
                </div>

                <div className="flex-1">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/jpeg,image/png,image/webp" 
                    className="hidden" 
                  />
                  
                  <div className="relative group rounded-xl overflow-hidden border border-border-light bg-bg-card aspect-[4/5] shadow-sm">
                    <img 
                      src={previewUrl || editingTurf?.image || DEFAULT_TURF_IMAGE} 
                      className="w-full h-full object-cover" 
                      alt="Preview" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_TURF_IMAGE;
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-2">
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 bg-bg-primary text-text-primary rounded-lg font-bold text-[11px] tracking-wider hover:bg-brand-primary hover:text-white transition-all"
                      >
                        Change Photo
                      </button>
                      
                      {(previewUrl || (editingTurf?.image && editingTurf.image !== DEFAULT_TURF_IMAGE)) && (
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="w-full py-2.5 bg-status-danger text-white rounded-lg font-bold text-[11px] tracking-wider transition-all"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Form */}
              <div className="flex-1 flex flex-col bg-bg-primary">
                <div className="p-6 border-b border-border-light flex justify-between items-center">
                  <h3 className="font-bold text-text-primary text-sm">Turf Details</h3>
                  <button onClick={resetModal} className="p-1 text-text-muted hover:text-text-primary transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form id="turf-form" noValidate onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="md:col-span-2">
                      <Input 
                        name="name" 
                        defaultValue={editingTurf?.name}
                        error={errors.name}
                        placeholder="Facility Name (e.g. Arena-X Prime)"
                        onChange={() => setErrors(prev => ({ ...prev, name: '' }))}
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold text-text-secondary tracking-wider">Sport Category (Select One)</label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {SUPPORTED_SPORTS.map(sport => {
                          const isSelected = selectedSports.includes(sport);
                          return (
                            <button
                              key={sport}
                              type="button"
                              onClick={() => {
                                setErrors(prev => ({ ...prev, sports: '' }));
                                if (isSelected) {
                                  setSelectedSports([]);
                                } else {
                                  setSelectedSports([sport]);
                                }
                              }}
                              className={`w-12 h-12 rounded-xl transition-all border flex flex-col items-center justify-center gap-1.5 relative group ${
                                isSelected 
                                  ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20 scale-105' 
                                  : 'bg-bg-secondary text-text-muted border-border-light hover:border-brand-primary/30 hover:bg-bg-card'
                              }`}
                              title={sport}
                            >
                              <SportIcon sport={sport} className="w-5 h-5" />
                              <span className={`text-[7px] font-black tracking-tighter absolute -bottom-4 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100 text-brand-primary' : 'text-text-muted'}`}>
                                {sport}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <AnimatePresence>
                        {errors.sports && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] font-bold text-status-danger mt-1.5 ml-0.5">{errors.sports}</motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="md:col-span-2">
                      <Input 
                        name="location" 
                        label="Location"
                        value={formLocation}
                        error={errors.location}
                        onChange={(e) => {
                          setFormLocation(e.target.value);
                          setErrors(prev => ({ ...prev, location: '' }));
                        }}
                        placeholder="e.g. South Bangalore"
                        icon={<MapPin className="w-3.5 h-3.5" />}
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold text-text-secondary tracking-wider">Map Pointer (Optional)</label>
                      <div className="flex gap-2">
                        <input 
                          name="map_url" 
                          value={formMapUrl}
                          onChange={(e) => setFormMapUrl(e.target.value)}
                          className="flex-1 bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-medium transition-all" 
                          placeholder="Google Maps URL" 
                        />
                        <button 
                          type="button"
                          onClick={() => setIsMapOpen(true)}
                          className="px-4 bg-bg-secondary border border-border-light rounded-lg text-brand-primary hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center"
                        >
                          <MapIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                      <NumericInput 
                        name="price" 
                        label="Hourly Price (₹)"
                        value={formPrice}
                        error={errors.price}
                        onValueChange={(val) => {
                          setFormPrice(val);
                          setErrors(prev => ({ ...prev, price: '' }));
                        }}
                        placeholder="1500" 
                        icon={<IndianRupee className="w-3.5 h-3.5" />}
                      />
                    
                    <div className="space-y-1.5 relative">
                      <label className="text-[11px] font-bold text-text-secondary tracking-wider block ml-0.5">Status</label>
                      
                      {/* Dropdown Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        className="w-full bg-bg-secondary border border-border-light rounded-lg pl-9 pr-10 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all h-[42px] flex items-center justify-between text-left shadow-sm hover:bg-bg-card active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            formStatus === 'Active' 
                              ? 'bg-status-success animate-pulse' 
                              : formStatus === 'Maintenance' 
                              ? 'bg-status-warning animate-pulse' 
                              : 'bg-status-danger'
                          }`} />
                          <span>{formStatus}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {isStatusDropdownOpen && (
                          <>
                            {/* Transparent Click-outside Backdrop */}
                            <div 
                              className="fixed inset-0 z-[110]" 
                              onClick={() => setIsStatusDropdownOpen(false)} 
                            />
                            
                            {/* Menu Container */}
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 8, scale: 0.96 }}
                              transition={{ duration: 0.15, ease: 'easeOut' }}
                              className="absolute left-0 right-0 bottom-full mb-2 bg-bg-primary border border-border-light rounded-xl shadow-modal overflow-hidden z-[120]"
                            >
                              <div className="p-1.5 space-y-1 bg-bg-primary/95 backdrop-blur-md">
                                {[
                                  { value: 'Active', label: 'Active', color: 'bg-status-success', desc: 'Fully operational & open' },
                                  { value: 'Closed', label: 'Closed', color: 'bg-status-danger', desc: 'Decommissioned or shut down' },
                                  { value: 'Maintenance', label: 'Maintenance', color: 'bg-status-warning', desc: 'Undergoing upgrades or repairs' }
                                ].map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      setFormStatus(opt.value);
                                      setIsStatusDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex flex-col gap-0.5 hover:bg-brand-primary/5 group ${
                                      formStatus === opt.value 
                                        ? 'bg-brand-primary/10 text-brand-primary' 
                                        : 'text-text-primary hover:text-brand-primary'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${opt.color} ${opt.value !== 'Closed' ? 'animate-pulse' : ''}`} />
                                      <span>{opt.label}</span>
                                    </div>
                                    <span className="text-[9px] text-text-muted font-normal pl-4 group-hover:text-brand-primary/70 transition-colors">
                                      {opt.desc}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </form>

                <div className="p-6 pt-0">
                  <button 
                    type="submit" 
                    form="turf-form"
                    disabled={isUploading}
                    className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold text-sm hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        {editingTurf ? 'Update turf' : 'Add turf'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMapOpen && (
          <MapPicker 
            initialLocation={formLocation}
            onClose={() => setIsMapOpen(false)}
            onSelect={(loc) => {
              setFormMapUrl(loc.mapUrl);
              // Also update text location if it's empty
              if (!formLocation) {
                setFormLocation(loc.address);
              }
              setIsMapOpen(false);
            }}
          />
        )}
      </AnimatePresence>
      
    </div>
  );
}
