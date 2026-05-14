import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { showError, showWarning } from '../utils/alerts';

export type Turf = { id: string | number; name: string; type: string; location: string; map_url: string; status: string; rating: number; price: string; image: string };
export type Slot = { id: string | number; turf: string; date: string; time: string; price: string; isBooked: boolean };
export type Booking = { id: string; customer: string; turf: string; date: string; time: string; amount: string; status: string };
export type Coupon = { id: string | number; code: string; discount: string; type: string; usage: string; expires: string; status: string; appliesTo: 'all_slots' | 'specific_slots'; selectedSlotIds: (string | number)[] };
export type Customer = { id: string; name: string; email: string; phone: string; bookings: number; spent: string; lastActive: string };

type StoreState = {
  turfs: Turf[];
  slots: Slot[];
  bookings: Booking[];
  coupons: Coupon[];
  customers: Customer[];
  
  fetchTurfs: () => Promise<void>;
  addTurf: (turf: Omit<Turf, 'id' | 'rating' | 'status'>) => Promise<void>;
  updateTurf: (id: string | number, turf: Partial<Turf>) => Promise<void>;
  deleteTurf: (id: string | number) => Promise<void>;
  
  fetchSlots: () => Promise<void>;
  generateSlots: (slotInfo: Omit<Slot, 'id' | 'isBooked'>) => Promise<void>;
  updateSlot: (id: string | number, slot: Partial<Slot>) => Promise<void>;
  deleteSlot: (id: string | number) => Promise<void>;
  
  fetchBookings: () => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id' | 'status'>) => Promise<void>;
  updateBookingStatus: (id: string, status: string) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  
  fetchCoupons: () => Promise<void>;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usage' | 'status'>) => Promise<void>;
  updateCoupon: (id: string | number, coupon: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string | number) => Promise<void>;

  fetchCustomers: () => Promise<void>;
  
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
};

export const useStore = create<StoreState>((set, get) => ({
  turfs: [],
  slots: [],
  bookings: [],
  coupons: [],
  customers: [],
  
  fetchTurfs: async () => {
    try {
      const { data, error } = await supabase.from('turfs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const formatted = data.map(t => ({
          id: t.id, name: t.name, type: t.type, location: t.location, map_url: t.map_url || '',
          status: t.status, rating: t.rating, price: `₹${t.price_per_hour}/hr`, image: t.image_url || ''
        }));
        set({ turfs: formatted });
      }
    } catch (error) {
      console.error("fetchTurfs error:", error);
    }
  },
  
  addTurf: async (turf) => {
    try {
      const priceNum = parseFloat(turf.price.replace(/[^0-9.]/g, ''));
      const { data, error } = await supabase.from('turfs').insert([{
        name: turf.name, 
        type: turf.type, 
        location: turf.location, 
        // map_url: turf.map_url, // TODO: Uncomment after running: ALTER TABLE turfs ADD COLUMN map_url TEXT;
        price_per_hour: isNaN(priceNum) ? 0 : priceNum, 
        image_url: turf.image
      }]).select();
      
      if (error) throw error;
      if (data) await get().fetchTurfs();
    } catch (error: any) {
      console.error("addTurf error:", error);
      throw new Error(`Failed to add turf: ${error.message}`);
    }
  },
  
  updateTurf: async (id, turf) => {
    const updateData: any = {};
    if (turf.name) updateData.name = turf.name;
    if (turf.type) updateData.type = turf.type;
    if (turf.location) updateData.location = turf.location;
    // if (turf.map_url !== undefined) updateData.map_url = turf.map_url; // TODO: Uncomment after schema update
    if (turf.price) {
      const priceNum = parseFloat(turf.price.replace(/[^0-9.]/g, ''));
      updateData.price_per_hour = isNaN(priceNum) ? 0 : priceNum;
    }
    if (turf.image !== undefined) updateData.image_url = turf.image;

    const { error } = await supabase.from('turfs').update(updateData).eq('id', id);
    if (!error) {
      await get().fetchTurfs();
    }
  },
  
  deleteTurf: async (id) => {
    const { error } = await supabase.from('turfs').delete().eq('id', id);
    if (!error) {
      await get().fetchTurfs();
    } else {
      console.warn("deleteTurf failed.");
    }
  },
  
  fetchSlots: async () => {
    const { data, error } = await supabase.from('slots').select('*, turfs(name)').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    if (!error && data) {
      const formatTime = (timeStr: string) => {
        if (!timeStr) return 'N/A';
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${m} ${ampm}`;
      };
      const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr === 'Unknown Date') return dateStr;
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      };

      const formatted = data.map(s => ({
        id: s.id, turf: s.turfs?.name || 'Unknown Turf', 
        date: formatDate(s.slot_date), 
        time: `${formatTime(s.start_time)} - ${formatTime(s.end_time)}`, 
        price: `₹${s.price}`, isBooked: s.is_booked
      }));
      set({ slots: formatted });
    }
  },
  
  generateSlots: async (slotInfo) => {
    try {
      console.log("Generating slot for:", slotInfo);
      const { data: turfData, error: turfErr } = await supabase.from('turfs').select('id').eq('name', slotInfo.turf).maybeSingle();
      
      if (turfErr) console.error("Turf lookup error:", turfErr);

      if (turfData) {
        const normalizeTime = (t: string) => {
          if (!t) return null;
          let time = t.trim().toUpperCase();
          const isPM = time.includes('PM');
          const isAM = time.includes('AM');
          
          // Remove AM/PM for parsing
          time = time.replace(/(AM|PM)/g, '').trim();

          if (time.includes(':')) {
            const parts = time.split(':');
            let h = parseInt(parts[0]);
            const m = (parts[1] || '00').padStart(2, '0');
            
            if (isPM && h < 12) h += 12;
            if (isAM && h === 12) h = 0;
            
            return `${h.toString().padStart(2, '0')}:${m}:00`;
          } else {
            let h = parseInt(time);
            if (isPM && h < 12) h += 12;
            if (isAM && h === 12) h = 0;
            return `${h.toString().padStart(2, '0')}:00:00`;
          }
        };

        const times = slotInfo.time.split('-').map(t => t.trim());
        const start_time = normalizeTime(times[0]) || '00:00:00';
        let end_time = normalizeTime(times[1]);
        
        if (!end_time) {
          const hour = parseInt(start_time.split(':')[0]);
          end_time = `${(hour + 1).toString().padStart(2, '0')}:00:00`;
        }

        const priceNum = typeof slotInfo.price === 'string' ? parseFloat(slotInfo.price.replace(/[^0-9.]/g, '')) : slotInfo.price;
        const price = isNaN(priceNum) ? 0 : priceNum;

        const { error } = await supabase.from('slots').insert({
          turf_id: turfData.id,
          slot_date: slotInfo.date,
          start_time,
          end_time,
          price,
          is_booked: false
        });

        if (!error) {
          await get().fetchSlots();
          console.log("Slot generated successfully");
        } else {
          console.error("Slot insert error:", error);
          showError('Slot Error', `Failed to generate slot: ${error.message}`);
        }
      } else {
        console.warn("Turf not found for slot generation:", slotInfo.turf);
        showWarning('Turf Not Found', `Turf "${slotInfo.turf}" not found. Please ensure the turf exists.`);
      }
    } catch (e) {
      console.error('Failed to generate slot in DB:', e);
    }
  },

  updateSlot: async (id, slot) => {
    const updateData: any = {};
    if (slot.date) updateData.slot_date = slot.date;
    if (slot.price) {
      const priceNum = typeof slot.price === 'string' ? parseFloat(slot.price.replace(/[^0-9.]/g, '')) : slot.price;
      updateData.price = isNaN(priceNum) ? 0 : priceNum;
    }
    if (slot.isBooked !== undefined) updateData.is_booked = slot.isBooked;

    const { error } = await supabase.from('slots').update(updateData).eq('id', id);
    if (!error) {
      await get().fetchSlots();
    } else {
      console.error("Update slot error:", error);
    }
  },
  
  deleteSlot: async (id) => {
    const { error } = await supabase.from('slots').delete().eq('id', id);
    if (!error) {
      await get().fetchSlots();
    } else {
      console.error("Delete slot error:", error);
    }
  },
  
  fetchBookings: async () => {
    const { data, error } = await supabase.from('bookings').select('*, customers(full_name), slots(slot_date, start_time, end_time, turfs(name))').order('created_at', { ascending: false });
    if (!error && data) {
      const formatTime = (timeStr: string) => {
        if (!timeStr) return 'N/A';
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${m} ${ampm}`;
      };
      const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr === 'Unknown Date') return dateStr;
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      };

      const formatted = data.map(b => ({
        id: b.booking_ref, customer: b.customers?.full_name || 'Unknown', 
        turf: b.slots?.turfs?.name || 'Unknown Turf', 
        date: formatDate(b.slots?.slot_date || 'Unknown Date'), 
        time: b.slots ? `${formatTime(b.slots.start_time)} - ${formatTime(b.slots.end_time)}` : 'Unknown',
        amount: `₹${b.total_amount}`, status: b.status
      }));
      set({ bookings: formatted });
    } else if (error) {
      console.error("Fetch bookings error:", error);
    }
  },
  
  addBooking: async (booking) => {
    try {
      console.log("Adding booking:", booking);
      let customerId = null;
      const { data: custData } = await supabase.from('customers').select('id').eq('full_name', booking.customer).maybeSingle();
      
      if (custData) {
        customerId = custData.id;
      } else {
        const { data: newCust, error: custErr } = await supabase.from('customers').insert({ 
          full_name: booking.customer, 
          email: `${booking.customer.replace(/\s+/g, '').toLowerCase()}${Math.floor(Math.random()*1000)}@example.com` 
        }).select('id').single();
        if (!custErr && newCust) customerId = newCust.id;
        else console.error("Customer creation error:", custErr);
      }

      const { data: turfData } = await supabase.from('turfs').select('id').eq('name', booking.turf).maybeSingle();
      
      let slotId = null;
      if (turfData) {
        const normalizeTime = (t: string) => {
          if (!t) return null;
          let time = t.trim().toUpperCase();
          const isPM = time.includes('PM');
          const isAM = time.includes('AM');
          
          time = time.replace(/(AM|PM)/g, '').trim();

          if (time.includes(':')) {
            const parts = time.split(':');
            let h = parseInt(parts[0]);
            const m = (parts[1] || '00').padStart(2, '0');
            
            if (isPM && h < 12) h += 12;
            if (isAM && h === 12) h = 0;
            
            return `${h.toString().padStart(2, '0')}:${m}:00`;
          } else {
            let h = parseInt(time);
            if (isPM && h < 12) h += 12;
            if (isAM && h === 12) h = 0;
            return `${h.toString().padStart(2, '0')}:00:00`;
          }
        };

        const times = booking.time.split('-').map(t => t.trim());
        const start_time = normalizeTime(times[0]) || '00:00:00';
        
        const { data: slotData } = await supabase.from('slots').select('id')
          .eq('turf_id', turfData.id)
          .eq('slot_date', booking.date)
          .eq('start_time', start_time)
          .maybeSingle();
        
        if (slotData) {
          slotId = slotData.id;
        } else {
          console.warn("Matching slot not found for booking:", { turfId: turfData.id, date: booking.date, start_time });
          showWarning('Slot Conflict', "Matching slot not found. Please ensure a slot exists for this time (Format: HH:MM, e.g., 18:00).");
        }
      } else {
        console.warn("Turf not found for booking:", booking.turf);
      }

      if (customerId && slotId) {
        const amountNum = typeof booking.amount === 'string' ? parseFloat(booking.amount.replace(/[^0-9.]/g, '')) : booking.amount;
        const amount = isNaN(amountNum) ? 0 : amountNum;
        const ref = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

        const { error: bookingErr } = await supabase.from('bookings').insert({
          booking_ref: ref,
          customer_id: customerId,
          slot_id: slotId,
          total_amount: amount,
          status: 'Pending'
        });

        if (!bookingErr) {
          await supabase.from('slots').update({ is_booked: true }).eq('id', slotId);
          await get().fetchBookings();
          await get().fetchSlots();
          await get().fetchCustomers();
          console.log("Booking added successfully");
        } else {
          console.error("Booking insert error:", bookingErr);
          showError('Booking Error', `Failed to add booking: ${bookingErr.message}`);
        }
      }
    } catch (e) {
      console.error('Failed to add booking in DB:', e);
    }
  },
  
  updateBookingStatus: async (id, status) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('booking_ref', id);
    if (!error) {
      await get().fetchBookings();
    }
  },

  deleteBooking: async (id) => {
    // First find the slot_id to unbook it
    const { data } = await supabase.from('bookings').select('slot_id').eq('booking_ref', id).maybeSingle();
    if (data?.slot_id) {
      await supabase.from('slots').update({ is_booked: false }).eq('id', data.slot_id);
    }
    
    const { error } = await supabase.from('bookings').delete().eq('booking_ref', id);
    if (!error) {
      await get().fetchBookings();
      await get().fetchSlots();
    }
  },
  
  fetchCoupons: async () => {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      const formatted = data.map(c => ({
        id: c.id, code: c.code, discount: c.discount_type === 'Percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`,
        type: c.discount_type, usage: `${c.usage_count}/${c.usage_limit || 'Unlim'}`,
        expires: new Date(c.expires_at).toLocaleDateString('en-GB'), status: c.status,
        appliesTo: c.applies_to || 'all_slots', selectedSlotIds: c.selected_slot_ids || []
      }));
      set({ coupons: formatted });
    }
  },
  
  addCoupon: async (coupon) => {
    const isPerc = coupon.discount.includes('%');
    const val = parseFloat(coupon.discount.replace(/[^0-9.]/g, ''));
    const { data, error } = await supabase.from('coupons').insert([{
      code: coupon.code, discount_value: isNaN(val) ? 0 : val, discount_type: isPerc ? 'Percentage' : 'Fixed',
      expires_at: new Date(coupon.expires).toISOString(), usage_count: 0,
      applies_to: coupon.appliesTo || 'all_slots',
      selected_slot_ids: coupon.selectedSlotIds || []
    }]).select();
    
    if (!error && data) {
      await get().fetchCoupons();
    } else {
      console.warn("addCoupon failed", error);
      showError('Coupon Error', `Failed to initialize campaign: ${error?.message || 'Unknown error'}`);
    }
  },
  
  updateCoupon: async (id, coupon) => {
    const updateData: any = {};
    if (coupon.code) updateData.code = coupon.code;
    if (coupon.discount) {
      const isPerc = coupon.discount.includes('%');
      updateData.discount_value = parseFloat(coupon.discount.replace(/[^0-9.]/g, ''));
      updateData.discount_type = isPerc ? 'Percentage' : 'Fixed';
    }
    if (coupon.expires) updateData.expires_at = new Date(coupon.expires).toISOString();
    if (coupon.status) updateData.status = coupon.status;
    if (coupon.appliesTo) updateData.applies_to = coupon.appliesTo;
    if (coupon.selectedSlotIds) updateData.selected_slot_ids = coupon.selectedSlotIds;

    const { error } = await supabase.from('coupons').update(updateData).eq('id', id);
    if (!error) {
      await get().fetchCoupons();
    } else {
      console.error("Update coupon error:", error);
      showError('Update Failed', `Could not update campaign: ${error.message}`);
    }
  },
  
  deleteCoupon: async (id) => {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (!error) {
      await get().fetchCoupons();
    }
  },

  fetchCustomers: async () => {
    try {
      // Use a single query with count if possible, or fetch all and aggregate
      const { data, error } = await supabase.from('customers').select('*, bookings(id)').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const formatted = data.map(c => ({
          id: c.id,
          name: c.full_name,
          email: c.email,
          phone: c.phone || 'N/A',
          bookings: c.bookings?.length || 0,
          spent: `₹${c.total_spent || 0}`,
          lastActive: 'Active'
        }));
        set({ customers: formatted });
      }
    } catch (error) {
      console.error("fetchCustomers error:", error);
    }
  },

  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  },
  setTheme: (theme: 'light' | 'dark') => {
    set({ theme });
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}));
