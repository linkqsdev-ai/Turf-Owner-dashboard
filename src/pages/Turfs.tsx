import { useState, useRef } from 'react';
import { Plus, MapPin, Star, X, LayoutGrid, Trash2, Loader2, Map as MapIcon, IndianRupee, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useStore, type Turf } from '../store/useStore';
import { supabase } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import MapPicker from '../components/MapPicker';
import ConfirmModal from '../components/ConfirmModal';

const DEFAULT_TURF_IMAGE = '/assets/images/default-turf.jpg';

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
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const SUPPORTED_SPORTS = ['Football', 'Cricket', 'Tennis', 'Volleyball', 'Badminton', 'Basketball', 'Padel'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Please upload a JPG, PNG or WEBP image.');
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
    
    if (selectedSports.length === 0) {
      alert('Please select at least one sport type.');
      return;
    }

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
        image: imageUrl || DEFAULT_TURF_IMAGE
      };

      if (editingTurf) {
        await updateTurf(editingTurf.id, turfData);
      } else {
        await addTurf(turfData);
      }
      
      resetModal();
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (turf: Turf) => {
    setEditingTurf(turf);
    setPreviewUrl(turf.image && !turf.image.includes('unsplash.com') ? turf.image : null);
    setFormLocation(turf.location);
    setFormMapUrl(turf.map_url);
    setFormPrice(turf.price);
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
    setSelectedSports([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: string | number) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteTurf(deleteId);
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="w-full space-y-8 relative px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Your Facilities</h1>
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
            setIsModalOpen(true);
          }}
          className="bg-brand-primary text-white px-5 py-2.5 rounded-lg font-bold text-[13px] flex items-center hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/10 hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 mr-2" />
          Add New Facility
        </button>
      </div>

      <AnimatePresence mode="wait">
        {turfs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-border-light rounded-xl p-20 flex flex-col items-center justify-center text-center shadow-premium"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {turfs.map((turf, idx) => (
              <motion.div 
                key={turf.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl overflow-hidden border border-border-light hover:border-brand-primary/30 transition-all duration-300 shadow-premium hover:shadow-hover group"
              >
                <div className="h-40 relative overflow-hidden bg-bg-secondary">
                  {turf.image ? (
                    <img src={turf.image} alt={turf.name} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                  ) : (
                    <img src={DEFAULT_TURF_IMAGE} alt={turf.name} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                  )}
                  
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-text-primary flex items-center shadow-sm border border-border-light">
                    <Star className="w-3 h-3 text-brand-primary mr-1 fill-brand-primary" />
                    {turf.rating}
                  </div>
                  
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider shadow-sm ${
                    turf.status === 'Active' ? 'bg-brand-primary text-white' : 'bg-status-danger text-white'
                  }`}>
                    {turf.status}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-bold text-text-primary group-hover:text-brand-primary transition-colors">{turf.name}</h3>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">{turf.type}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(turf.id)} 
                      className="text-text-muted hover:text-status-danger p-1.5 rounded-lg hover:bg-status-danger/5 transition-all opacity-0 group-hover:opacity-100" 
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="space-y-1.5 mb-5">
                    <div className="flex items-center text-text-secondary text-[13px] font-medium">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-brand-primary" /> {turf.location}
                    </div>
                    {turf.map_url && (
                      <a 
                        href={turf.map_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-brand-primary text-[11px] font-bold hover:underline inline-flex items-center gap-1"
                      >
                        Navigate <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-border-light">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Hourly</span>
                      <div className="text-text-primary font-bold text-lg tracking-tight">{turf.price}</div>
                    </div>
                    <button 
                      onClick={() => handleEdit(turf)}
                      className="bg-bg-secondary text-text-primary font-bold text-[11px] uppercase tracking-wider hover:bg-brand-primary hover:text-white transition-all px-4 py-2 rounded-lg border border-border-light hover:border-brand-primary"
                    >
                      Configure
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
              onClick={resetModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="bg-white border border-border-light rounded-xl shadow-modal w-full max-w-4xl relative z-10 overflow-hidden flex flex-col md:flex-row"
            >
              {/* Left Column: Media */}
              <div className="w-full md:w-[35%] bg-bg-secondary/20 border-r border-border-light flex flex-col p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-text-primary tracking-tight">
                    {editingTurf ? 'Edit Facility' : 'New Facility'}
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
                        className="w-full py-2.5 bg-white text-text-primary rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-brand-primary hover:text-white transition-all"
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
                          className="w-full py-2.5 bg-status-danger text-white rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Form */}
              <div className="flex-1 flex flex-col bg-white">
                <div className="p-6 border-b border-border-light flex justify-between items-center">
                  <h3 className="font-bold text-text-primary text-sm">Facility Details</h3>
                  <button onClick={resetModal} className="p-1 text-text-muted hover:text-text-primary transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form id="turf-form" onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Name</label>
                      <input 
                        required 
                        name="name" 
                        defaultValue={editingTurf?.name}
                        className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-medium transition-all" 
                        placeholder="e.g. Arena-X Prime" 
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Sport Categories (Select Multiple)</label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {SUPPORTED_SPORTS.map(sport => {
                          const isSelected = selectedSports.includes(sport);
                          return (
                            <button
                              key={sport}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedSports(selectedSports.filter(s => s !== sport));
                                } else {
                                  setSelectedSports([...selectedSports, sport]);
                                }
                              }}
                              className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
                                isSelected 
                                  ? 'bg-brand-primary text-white border-brand-primary shadow-sm' 
                                  : 'bg-bg-secondary text-text-muted border-border-light hover:border-brand-primary/30'
                              }`}
                            >
                              {sport}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Location</label>
                      <input 
                        required 
                        name="location" 
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        className="w-full bg-bg-secondary border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-medium transition-all" 
                        placeholder="e.g. South Bangalore" 
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Map Pointer (Optional)</label>
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

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Hourly Price (₹)</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-primary" />
                        <input 
                          required 
                          name="price" 
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          placeholder="1500" 
                          className="w-full bg-bg-secondary border border-border-light rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Status</label>
                      <div className="w-full bg-bg-secondary/50 border border-border-light rounded-lg px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                          <span className="text-[11px] font-bold text-text-primary uppercase">Active</span>
                        </div>
                        <ShieldCheck className="w-4 h-4 text-brand-primary" />
                      </div>
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
                        {editingTurf ? 'Update facility' : 'Add facility'}
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
      
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Confirm Deletion"
        message="Are you sure you want to decommission this facility? All associated booking slots will be permanently purged from the system."
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmText="Decommission"
      />
    </div>
  );
}
