import { useState, useRef } from 'react';
import { Plus, MapPin, Star, X, Info, LayoutGrid, Upload, Trash2, Camera, Loader2, Map as MapIcon, Clock, DollarSign, ShieldCheck } from 'lucide-react';
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
        type: fd.get('type') as string,
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
      
      setIsModalOpen(false);
      setEditingTurf(null);
      setSelectedFile(null);
      setPreviewUrl(null);
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
    <div className="max-w-[1600px] mx-auto space-y-10 relative px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
            <span className="text-[10px] font-black text-brand-primary tracking-[0.2em] uppercase">Asset Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight leading-tight">Your <span className="text-brand-primary">Facilities.</span></h1>
          <p className="text-text-secondary font-medium mt-2">Scale your network and optimize premium pricing models.</p>
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
          className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center hover:bg-brand-hover transition-all shadow-[0_8px_24px_rgba(16,185,129,0.2)] hover:-translate-y-1 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-3" />
          Deploy New Turf
        </button>
      </div>

      <AnimatePresence mode="wait">
        {turfs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-bg-card border border-border-light rounded-[3rem] p-16 md:p-32 flex flex-col items-center justify-center text-center shadow-sm"
          >
            <div className="w-24 h-24 bg-bg-secondary rounded-[2rem] flex items-center justify-center mb-8 border border-border-light shadow-inner">
              <LayoutGrid className="w-10 h-10 text-brand-primary" />
            </div>
            <h2 className="text-3xl font-black text-text-primary mb-3">Inventory Empty</h2>
            <p className="text-text-secondary max-w-md mb-10 font-medium">Add your first facility to start generating intelligent booking slots and capturing revenue.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-text-primary text-bg-primary px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all shadow-card hover:shadow-hover"
            >
              Initialize First Facility
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {turfs.map((turf, idx) => (
              <motion.div 
                key={turf.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-bg-card rounded-[2rem] overflow-hidden border border-border-light hover:border-brand-primary/20 transition-all duration-500 shadow-sm hover:shadow-hover group"
              >
                <div className="h-60 relative overflow-hidden bg-bg-secondary">
                  {turf.image ? (
                    <img src={turf.image} alt={turf.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
                  ) : (
                    <img src={DEFAULT_TURF_IMAGE} alt={turf.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  <div className="absolute inset-0 border-[8px] border-transparent group-hover:border-white/5 transition-all duration-700 pointer-events-none" />
                  
                  <div className="absolute top-5 right-5 bg-bg-card/90 backdrop-blur-xl px-4 py-2 rounded-2xl text-xs font-black text-text-primary flex items-center shadow-sm border border-border-light">
                    <Star className="w-3.5 h-3.5 text-brand-primary mr-1.5 fill-brand-primary" />
                    {turf.rating}
                  </div>
                  
                  <div className={`absolute top-5 left-5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] shadow-sm border border-white/20 backdrop-blur-md ${
                    turf.status === 'Active' ? 'bg-brand-primary text-white' : 'bg-status-danger text-white'
                  }`}>
                    {turf.status}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-black text-text-primary group-hover:text-brand-primary transition-colors duration-500">{turf.name}</h3>
                    <button onClick={() => handleDelete(turf.id)} className="text-text-muted hover:text-status-danger p-2 rounded-xl hover:bg-status-danger/5 transition-all" title="Delete">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 mb-8">
                    <div className="flex items-center text-text-muted text-xs font-bold uppercase tracking-widest">
                      <MapPin className="w-3.5 h-3.5 mr-2 text-brand-primary" /> {turf.location}
                    </div>
                    {turf.map_url && (
                      <a 
                        href={turf.map_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-brand-primary text-[10px] font-black uppercase tracking-widest hover:underline ml-5.5 flex items-center gap-1"
                      >
                        View on Map <Plus className="w-3 h-3 rotate-45" />
                      </a>
                    )}
                    <div className="text-text-muted/60 text-[10px] font-bold uppercase tracking-widest ml-5.5">
                      {turf.type}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-border-light">
                    <div className="text-text-primary font-black text-2xl tracking-tight">{turf.price}</div>
                    <button 
                      onClick={() => handleEdit(turf)}
                      className="bg-bg-secondary text-text-primary font-black text-[10px] uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all px-6 py-3 rounded-xl border border-border-light hover:border-brand-primary active:scale-95"
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-bg-card border border-border-light rounded-[2.5rem] shadow-modal w-full max-w-6xl relative z-10 overflow-hidden flex flex-col md:flex-row"
            >
              {/* Left Column: Media & Identity */}
              <div className="w-full md:w-[40%] bg-bg-secondary/30 border-r border-border-light flex flex-col p-8 md:p-10">
                <div className="mb-8">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/10 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                    <span className="text-[9px] font-black text-brand-primary tracking-[0.2em] uppercase">Visual Identity</span>
                  </div>
                  <h2 className="text-2xl font-black text-text-primary tracking-tight">
                    {editingTurf ? 'Update Node' : 'New Facility'}
                  </h2>
                </div>

                <div className="flex-1 space-y-4">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/jpeg,image/png,image/webp" 
                    className="hidden" 
                  />
                  
                  <div className="relative group rounded-[2rem] overflow-hidden border-2 border-brand-primary/20 bg-bg-card h-full min-h-[300px] shadow-2xl transition-all duration-700">
                    <img 
                      src={previewUrl || editingTurf?.image || DEFAULT_TURF_IMAGE} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                      alt="Preview" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_TURF_IMAGE;
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-8 gap-3">
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        {editingTurf || previewUrl ? 'Change Asset' : 'Upload Asset'}
                      </button>
                      
                      {(previewUrl || (editingTurf?.image && editingTurf.image !== DEFAULT_TURF_IMAGE)) && (
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="w-full py-4 bg-status-danger/20 backdrop-blur-md text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-status-danger transition-all flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Reset to Default
                        </button>
                      )}
                    </div>

                    {!previewUrl && !editingTurf?.image && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                        <Upload className="w-10 h-10 text-white/20 mb-2" />
                        <p className="text-white/40 font-black text-[9px] uppercase tracking-widest">Asset Required</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-text-muted/60 uppercase tracking-widest italic">
                  <Info className="w-3 h-3 text-brand-primary" />
                  Media assets sync globally
                </div>
              </div>

              {/* Right Column: Form Data */}
              <div className="flex-1 flex flex-col bg-bg-card">
                <div className="p-8 md:p-10 border-b border-border-light flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                      <LayoutGrid className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="font-black text-text-primary uppercase tracking-widest text-xs">Configuration Parameters</h3>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">System Version 4.2.0</p>
                    </div>
                  </div>
                  <button onClick={resetModal} className="p-2 text-text-muted hover:text-status-danger transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form id="turf-form" onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Facility Identity */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] ml-1">Facility Name</label>
                      <input 
                        required 
                        name="name" 
                        defaultValue={editingTurf?.name}
                        className="w-full bg-bg-secondary border border-border-light rounded-xl px-5 py-4 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all placeholder:text-text-muted/30" 
                        placeholder="e.g. Arena-X Prime" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] ml-1">Asset Category</label>
                      <input 
                        required 
                        name="type" 
                        defaultValue={editingTurf?.type}
                        placeholder="e.g. Football / Multi-Sport" 
                        className="w-full bg-bg-secondary border border-border-light rounded-xl px-5 py-4 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all placeholder:text-text-muted/30" 
                      />
                    </div>

                    {/* Geolocation Matrix */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] ml-1">Service Region</label>
                      <input 
                        required 
                        name="location" 
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        className="w-full bg-bg-secondary border border-border-light rounded-xl px-5 py-4 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all placeholder:text-text-muted/30" 
                        placeholder="e.g. South Bangalore" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] ml-1">Navigation Key</label>
                      <div className="flex gap-2">
                        <input 
                          required 
                          name="map_url" 
                          value={formMapUrl}
                          onChange={(e) => setFormMapUrl(e.target.value)}
                          className="flex-1 bg-bg-secondary border border-border-light rounded-xl px-5 py-4 text-sm text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-bold transition-all placeholder:text-text-muted/30" 
                          placeholder="Map Pointer URL" 
                        />
                        <button 
                          type="button"
                          onClick={() => setIsMapOpen(true)}
                          className="w-14 h-14 bg-bg-secondary border border-border-light rounded-xl text-brand-primary hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center group"
                        >
                          <MapIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>

                    {/* Revenue Model */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] ml-1">Hourly Revenue Yield (₹)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary" />
                        <input 
                          required 
                          name="price" 
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          placeholder="1500" 
                          className="w-full bg-bg-secondary border border-border-light rounded-xl pl-12 pr-5 py-4 text-lg text-text-primary outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 font-black transition-all" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] ml-1">Operating Status</label>
                      <div className="w-full bg-bg-secondary/50 border border-border-light rounded-xl px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                          <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">Live & Operational</span>
                        </div>
                        <ShieldCheck className="w-5 h-5 text-brand-primary" />
                      </div>
                    </div>
                  </div>
                </form>

                <div className="p-8 md:p-10 pt-0">
                  <button 
                    type="submit" 
                    form="turf-form"
                    disabled={isUploading}
                    className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-hover transition-all shadow-[0_12px_30px_rgba(16,185,129,0.2)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center group"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        {editingTurf ? 'Update Profile' : 'Commit Facility'}
                        <Plus className="w-5 h-5 ml-3 group-hover:rotate-90 transition-transform" />
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
