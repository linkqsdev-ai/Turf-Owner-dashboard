import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { X, Search, Navigation, MapPin, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946,
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: false,
};

interface MapPickerProps {
  initialLocation?: string;
  onSelect: (location: { lat: number; lng: number; address: string; mapUrl: string }) => void;
  onClose: () => void;
}

export default function MapPicker({ initialLocation, onSelect, onClose }: MapPickerProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const isKeyMissing = !apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const [marker, setMarker] = useState<google.maps.LatLngLiteral>(defaultCenter);
  const [address, setAddress] = useState('');
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (initialLocation && initialLocation.includes('q=')) {
      const coordsMatch = initialLocation.match(/q=([-.\d]+),([-.\d]+)/);
      if (coordsMatch) {
        setMarker({ lat: parseFloat(coordsMatch[1]), lng: parseFloat(coordsMatch[2]) });
      }
    }
  }, [initialLocation]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarker(newPos);
      reverseGeocode(newPos);
    }
  }, []);

  const reverseGeocode = async (pos: google.maps.LatLngLiteral) => {
    try {
      const results = await getGeocode({ location: pos });
      if (results && results[0]) {
        setAddress(results[0].formatted_address);
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
      setAddress(`${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
    }
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const handleSelectPlace = async (val: string) => {
    try {
      const results = await getGeocode({ address: val });
      const { lat, lng } = await getLatLng(results[0]);
      const newPos = { lat, lng };
      setMarker(newPos);
      setAddress(results[0].formatted_address);
      map?.panTo(newPos);
      map?.setZoom(16);
    } catch (error) {
      console.error('Error selecting place:', error);
    }
  };

  const handleConfirm = () => {
    const mapUrl = `https://www.google.com/maps?q=${marker.lat},${marker.lng}`;
    onSelect({ 
      lat: marker.lat, 
      lng: marker.lng, 
      address: address || `${marker.lat.toFixed(6)}, ${marker.lng.toFixed(6)}`, 
      mapUrl 
    });
  };

  if (loadError) return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
       <div className="bg-bg-card p-10 rounded-[2.5rem] border border-status-danger/20 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-status-danger mx-auto mb-6" />
          <h3 className="text-2xl font-black text-text-primary mb-2">Maps API Error</h3>
          <p className="text-text-muted mb-8 font-medium">Failed to load Google Maps. Please check your API key in .env</p>
          <button onClick={onClose} className="w-full bg-bg-secondary py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-status-danger hover:text-white transition-all">Close</button>
       </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-bg-card w-full max-w-5xl h-[85vh] rounded-[3rem] overflow-hidden flex flex-col border border-border-light shadow-modal relative"
      >
        {isKeyMissing && (
          <div className="absolute inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 text-center">
            <div className="bg-bg-card p-10 rounded-[2.5rem] border border-brand-primary/20 max-w-md shadow-2xl">
              <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-brand-primary" />
              </div>
              <h3 className="text-2xl font-black text-text-primary mb-3">Google Maps API Key Required</h3>
              <p className="text-text-muted mb-8 font-medium leading-relaxed">
                To provide a real Google Maps experience with search and precise navigation, please add your <span className="text-brand-primary font-bold">VITE_GOOGLE_MAPS_API_KEY</span> to the .env file.
              </p>
              <div className="flex gap-4">
                <button onClick={onClose} className="flex-1 bg-bg-secondary py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-border-medium transition-all">Go Back</button>
                <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noopener noreferrer" className="flex-1 bg-brand-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-hover transition-all text-center">Get Key</a>
              </div>
            </div>
          </div>
        )}

        <div className="p-8 border-b border-border-light flex justify-between items-center bg-bg-secondary/30 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
               <h3 className="text-2xl font-black text-text-primary tracking-tight">Google Map Deployment</h3>
            </div>
            <p className="text-text-muted text-xs font-medium">Verified geographic location and search services</p>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-bg-secondary rounded-2xl transition-all border border-border-light shadow-sm">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="relative flex-1 bg-bg-secondary/10">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={14}
              center={marker}
              onClick={onMapClick}
              onLoad={onMapLoad}
              options={options}
            >
              <Marker 
                position={marker} 
                draggable={true}
                onDragEnd={(e) => {
                  if (e.latLng) {
                    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                    setMarker(newPos);
                    reverseGeocode(newPos);
                  }
                }}
              />
            </GoogleMap>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-text-muted">
              <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
              <p className="font-black text-[10px] uppercase tracking-[0.2em]">Initializing Google Engines...</p>
            </div>
          )}

          {/* Search Box */}
          {isLoaded && <SearchBox onSelect={handleSelectPlace} />}

          {/* Selection Stats Overlay */}
          <div className="absolute bottom-8 left-8 right-8 z-10 flex flex-col md:flex-row justify-between items-end gap-6 pointer-events-none">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/90 backdrop-blur-2xl p-6 rounded-[2rem] shadow-2xl border border-white/50 max-w-lg pointer-events-auto"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary mb-1 block">Verified Location</span>
                  <p className="text-sm font-bold text-text-primary leading-relaxed mb-1">
                    {address || "Locating precision coordinates..."}
                  </p>
                  <p className="text-[10px] font-medium text-text-muted italic">
                    Lat: {marker.lat.toFixed(6)}, Lng: {marker.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </motion.div>
            
            <button 
              onClick={handleConfirm}
              className="bg-brand-primary text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-hover transition-all shadow-[0_12px_40px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:scale-95 pointer-events-auto flex items-center gap-3"
            >
              Confirm Deployment
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SearchBox({ onSelect }: { onSelect: (val: string) => void }) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      locationBias: 'IP' as any,
    },
    debounce: 300,
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSelect = (val: string) => () => {
    setValue(val, false);
    clearSuggestions();
    onSelect(val);
  };

  return (
    <div className="absolute top-8 left-8 right-8 z-20 max-w-2xl">
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand-primary transition-colors" />
        <input 
          disabled={!ready}
          value={value}
          onChange={handleInput}
          placeholder="Search for a turf or landmark..."
          className="w-full bg-white/95 backdrop-blur-xl border-2 border-white/20 rounded-[1.5rem] pl-14 pr-6 py-5 text-sm font-black text-text-primary outline-none focus:border-brand-primary/30 focus:ring-8 focus:ring-brand-primary/5 shadow-2xl transition-all placeholder:text-text-muted/50"
        />
        
        <AnimatePresence>
          {status === "OK" && (
            <motion.ul 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-2xl rounded-[1.5rem] shadow-2xl border border-white/50 overflow-hidden max-h-[300px] overflow-y-auto"
            >
              {data.map(({ place_id, description }) => (
                <li 
                  key={place_id} 
                  onClick={handleSelect(description)}
                  className="px-6 py-4 hover:bg-brand-primary/5 cursor-pointer transition-colors border-b border-border-light last:border-0 flex items-center gap-3"
                >
                  <MapPin className="w-4 h-4 text-brand-primary/40" />
                  <span className="text-sm font-bold text-text-primary">{description}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
