import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { showError, showWarning } from '../utils/alerts';
import { useAuthStore } from './useAuthStore';

export type Turf = { id: string | number; name: string; type: string; location: string; map_url: string; status: string; rating: number; price: string; image: string };
export type TimingRule = { id?: string; turf_id: string; day_of_week: string; is_open: boolean; start_time: string; end_time: string; timing_type: 'weekday' | 'weekend' | 'custom' };
export type Slot = { id: string | number; turf_id?: string; turf: string; date: string; time: string; price: string; isBooked: boolean; status: string; dayOfWeek?: string; sortOrder?: number };
export type Booking = { id: string; ownerId: string; turfId: string; slotId?: string; customerName: string; turfName: string; date: string; timeWindow: string; amount: string; status: string; createdAt?: string };
export type Coupon = { id: string | number; code: string; discount: string; type: string; usage: string; expires: string; status: string; appliesTo: 'all_slots' | 'specific_slots'; selectedSlotIds: (string | number)[] };
export type Customer = { id: string; name: string; email: string; phone: string; bookings: number; spent: string; lastActive: string };

type StoreState = {
  turfs: Turf[];
  slots: Slot[];
  bookings: Booking[];
  coupons: Coupon[];
  customers: Customer[];
  timingRules: TimingRule[];
  
  fetchTurfs: () => Promise<void>;
  addTurf: (turf: Omit<Turf, 'id' | 'rating' | 'status'>) => Promise<void>;
  updateTurf: (id: string | number, turf: Partial<Turf>) => Promise<void>;
  deleteTurf: (id: string | number) => Promise<void>;
  
  fetchSlots: () => Promise<void>;
  generateSlots: (slotInfo: Omit<Slot, 'id' | 'isBooked'>) => Promise<void>;
  generateSlotsFromRules: (turfId: string, startDate: string, endDate: string) => Promise<void>;
  updateSlot: (id: string | number, slot: Partial<Slot>) => Promise<void>;
  deleteSlot: (id: string | number) => Promise<void>;
  
  fetchTimingRules: (turfId: string) => Promise<TimingRule[]>;
  saveTimingRules: (turfId: string, rules: TimingRule[]) => Promise<void>;
  
  fetchBookings: () => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id' | 'status'>) => Promise<void>;
  updateBooking: (id: string, booking: Partial<Omit<Booking, 'id' | 'status'>>) => Promise<void>;
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
  timingRules: [],
  
  fetchTurfs: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('turfs')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
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
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    try {
      const priceNum = parseFloat(turf.price.replace(/[^0-9.]/g, ''));
      const { data, error } = await supabase.from('turfs').insert([{
        name: turf.name, 
        type: turf.type, 
        location: turf.location, 
        owner_id: userId,
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
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    const updateData: any = {};
    if (turf.name) updateData.name = turf.name;
    if (turf.type) updateData.type = turf.type;
    if (turf.location) updateData.location = turf.location;
    if (turf.price) {
      const priceNum = parseFloat(turf.price.replace(/[^0-9.]/g, ''));
      updateData.price_per_hour = isNaN(priceNum) ? 0 : priceNum;
    }
    if (turf.image !== undefined) updateData.image_url = turf.image;

    const { error } = await supabase.from('turfs').update(updateData).eq('id', id).eq('owner_id', userId);
    if (!error) {
      await get().fetchTurfs();
    }
  },
  
  deleteTurf: async (id) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    const { error } = await supabase.from('turfs').delete().eq('id', id).eq('owner_id', userId);
    if (!error) {
      await get().fetchTurfs();
    } else {
      console.warn("deleteTurf failed.");
    }
  },
  

  
  generateSlots: async (slotInfo) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    try {
      let turfId = (slotInfo as any).turfId;
      let turfData: any = null;

      if (!turfId) {
        const { data } = await supabase.from('turfs').select('id, price_per_hour').eq('name', slotInfo.turf).maybeSingle();
        turfData = data;
        if (turfData) turfId = turfData.id;
      } else {
        const { data } = await supabase.from('turfs').select('id, price_per_hour').eq('id', turfId).maybeSingle();
        turfData = data;
      }

      if (!turfId || !turfData) {
        console.error("Turf not found for slot generation:", slotInfo.turf);
        return;
      }

      const parseTime = (t: string) => {
        const [time, period] = t.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (period === 'PM' && h < 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return h * 60 + (m || 0);
      };

      const formatTimeDB = (m: number) => {
        const h = Math.floor(m / 60) % 24;
        const mm = m % 60;
        return `${h.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:00`;
      };

      const [startT, endT] = slotInfo.time.split('-').map(t => t.trim());
      let startMin = parseTime(startT);
      let endMin = parseTime(endT);
      if (endMin <= startMin) endMin += 1440;

      const slotsToInsert = [];
      let current = startMin;
      let order = 1;

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[new Date(slotInfo.date).getDay()];

      while (current < endMin) {
        slotsToInsert.push({
          turf_id: turfData.id,
          owner_id: userId,
          slot_date: slotInfo.date,
          start_time: formatTimeDB(current),
          end_time: formatTimeDB(current + 60),
          price: parseFloat(slotInfo.price.replace(/[^0-9.]/g, '')) || turfData.price_per_hour,
          day_of_week: dayName,
          sort_order: order++,
          status: 'Available'
        });
        current += 60;
      }

      const { error } = await supabase.from('slots').insert(slotsToInsert);
      if (!error) await get().fetchSlots();
    } catch (e) {
      console.error('generateSlots error:', e);
    }
  },

  generateSlotsFromRules: async (turfId, startDate, endDate) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    
    try {
      const { data: rules } = await supabase.from('timing_rules').select('*').eq('turf_id', turfId);
      const { data: turf } = await supabase.from('turfs').select('price_per_hour').eq('id', turfId).single();
      if (!rules || !turf) return;

      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      const allSlots: any[] = [];
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayName = days[d.getDay()];
        const rule = rules.find(r => r.day_of_week === dayName);
        
        if (!rule || !rule.is_open) continue;

        const dateStr = d.toISOString().split('T')[0];
        
        const parseTimeDB = (t: string) => {
          const [h, m] = t.split(':').map(Number);
          return h * 60 + m;
        };

        const formatTimeDB = (m: number) => {
          const h = Math.floor(m / 60) % 24;
          const mm = m % 60;
          return `${h.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:00`;
        };

        let startMin = parseTimeDB(rule.start_time);
        let endMin = parseTimeDB(rule.end_time);
        if (endMin <= startMin) endMin += 1440;

        let current = startMin;
        let order = 1;
        while (current < endMin) {
          allSlots.push({
            turf_id: turfId,
            owner_id: userId,
            slot_date: dateStr,
            start_time: formatTimeDB(current),
            end_time: formatTimeDB(current + 60),
            price: turf.price_per_hour,
            day_of_week: dayName,
            sort_order: order++,
            status: 'Available'
          });
          current += 60;
        }
      }

      // Bulk insert ignoring duplicates (handled by unique constraint or manual check)
      // Since we don't have ON CONFLICT here easily in JS without specific Supabase syntax, 
      // we'll filter out existing slots first.
      const { data: existing } = await supabase.from('slots').select('slot_date, start_time').eq('turf_id', turfId);
      const filteredSlots = allSlots.filter(s => 
        !existing?.some(ex => ex.slot_date === s.slot_date && ex.start_time === s.start_time)
      );

      if (filteredSlots.length > 0) {
        await supabase.from('slots').insert(filteredSlots);
      }
      await get().fetchSlots();
    } catch (e) {
      console.error('generateSlotsFromRules error:', e);
    }
  },

  updateSlot: async (id, slot) => {
    const updateData: any = {};
    if (slot.date) updateData.slot_date = slot.date;
    if (slot.price) {
      const priceNum = typeof slot.price === 'string' ? parseFloat(slot.price.replace(/[^0-9.]/g, '')) : slot.price;
      updateData.price = isNaN(priceNum) ? 0 : priceNum;
    }
    if (slot.isBooked !== undefined) {
      updateData.is_booked = slot.isBooked;
      if (slot.isBooked) updateData.status = 'Booked';
      else if (updateData.status !== 'Under Maintenance') updateData.status = 'Available';
    }
    if (slot.status) {
      updateData.status = slot.status;
      if (slot.status === 'Booked') updateData.is_booked = true;
      else updateData.is_booked = false;
    }

    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    const { error } = await supabase.from('slots').update(updateData).eq('id', id).eq('owner_id', userId);
    if (!error) {
      await get().fetchSlots();
    } else {
      console.error("Update slot error:", error);
    }
  },
  
  deleteSlot: async (id) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    const { error } = await supabase.from('slots').delete().eq('id', id).eq('owner_id', userId);
    if (!error) {
      await get().fetchSlots();
    } else {
      console.error("Delete slot error:", error);
    }
  },

  fetchSlots: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    try {
      const { data } = await supabase
        .from('slots')
        .select('*, turfs!inner(id, name, owner_id)')
        .eq('turfs.owner_id', userId)
        .eq('is_active', true)
        .order('slot_date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (data) {
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

        const formatted = data.map(s => {
          const start_time = formatTime(s.start_time);
          const end_time = formatTime(s.end_time);
          
          return {
            id: s.id,
            turf_id: s.turfs?.id,
            turf: s.turfs?.name || 'Unknown',
            date: formatDate(s.slot_date),
            time: `${start_time} - ${end_time}`,
            price: `₹${s.price}`,
            isBooked: s.is_booked,
            status: s.status,
            dayOfWeek: s.day_of_week,
            sortOrder: parseInt(s.start_time.replace(/:/g, ''))
          };
        });
        set({ slots: formatted });
      }
    } catch (err) {
      console.error("fetchSlots error:", err);
    }
  },

  fetchTimingRules: async (turfId) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return [];
    const { data, error } = await supabase.from('timing_rules').select('*').eq('turf_id', turfId);
    if (!error && data) {
      set({ timingRules: data });
      return data;
    }
    return [];
  },

  saveTimingRules: async (turfId, rules) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    
    try {
      // Upsert rules
      const rulesWithIds = rules.map(r => ({
        ...r,
        turf_id: turfId,
        owner_id: userId
      }));

      const { error } = await supabase.from('timing_rules').upsert(rulesWithIds, { onConflict: 'turf_id, day_of_week' });
      if (error) throw error;

      await get().fetchTimingRules(turfId);
    } catch (e) {
      console.error('saveTimingRules error:', e);
      throw e;
    }
  },
  
  fetchBookings: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    const { data, error } = await supabase
      .from('bookings')
      .select('*, customers(full_name), slots(slot_date, start_time, end_time, turfs(name))')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
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
        id: b.id, 
        ownerId: b.owner_id,
        turfId: b.slots?.turfs?.id || '',
        slotId: b.slot_id,
        customerName: b.customers?.full_name || 'Unknown', 
        turfName: b.slots?.turfs?.name || 'Unknown Turf', 
        date: formatDate(b.slots?.slot_date || 'Unknown Date'), 
        timeWindow: b.slots ? `${formatTime(b.slots.start_time)} - ${formatTime(b.slots.end_time)}` : 'Unknown',
        amount: `₹${Math.round(b.total_amount || 0)}`, 
        status: b.status,
        createdAt: b.created_at
      }));
      set({ bookings: formatted });
    } else if (error) {
      console.error("Fetch bookings error:", error);
    }
  },
  
  addBooking: async (booking) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    try {
      console.log("Adding booking:", booking);
      let customerId = null;
      const { data: custData } = await supabase.from('customers').select('id, owner_id').eq('full_name', booking.customerName).maybeSingle();
      
      if (custData) {
        customerId = custData.id;
        // If customer exists but owner_id is missing, claim them for this owner
        if (!custData.owner_id) {
          await supabase.from('customers').update({ owner_id: userId }).eq('id', customerId);
        }
      } else {
        const { data: newCust, error: custErr } = await supabase.from('customers').insert({ 
          full_name: booking.customerName, 
          owner_id: userId,
          email: `${booking.customerName.replace(/\s+/g, '').toLowerCase()}${Math.floor(Math.random()*1000)}@example.com` 
        }).select('id').single();
        if (!custErr && newCust) customerId = newCust.id;
        else console.error("Customer creation error:", custErr);
      }

      let slotId = null;
      let turfId = booking.turfId;

      if (!turfId && booking.turfName) {
        const { data: turfData } = await supabase.from('turfs').select('id').eq('name', booking.turfName).maybeSingle();
        if (turfData) turfId = turfData.id;
      }

      if (turfId) {
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

        const times = booking.timeWindow.split('-').map(t => t.trim());
        const start_time = normalizeTime(times[0]) || '00:00:00';
        
        const { data: slotData } = await supabase.from('slots').select('id')
          .eq('turf_id', turfId)
          .eq('slot_date', booking.date)
          .eq('start_time', start_time)
          .maybeSingle();
        
        if (slotData) {
          slotId = slotData.id;
        } else {
          console.warn("Matching slot not found for booking:", { turfId, date: booking.date, start_time });
          showWarning('Slot Conflict', "Matching slot not found. Please ensure a slot exists for this time (Format: HH:MM, e.g., 18:00).");
        }
      } else {
        console.warn("Turf not found for booking:", booking.turfName);
      }

      if (customerId && slotId) {
        const amountNum = typeof booking.amount === 'string' ? parseFloat(booking.amount.replace(/[^0-9.]/g, '')) : booking.amount;
        const amount = isNaN(amountNum) ? 0 : amountNum;
        const ref = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

        const { error: bookingErr } = await supabase.from('bookings').insert({
          booking_ref: ref,
          owner_id: userId,
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
  
  updateBooking: async (id, booking) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    try {
      // Find the existing booking to get current slot info if needed
      const { data: existing } = await supabase.from('bookings').select('*, slots(*, turfs(*)), customers(*)').eq('id', id).maybeSingle();
      if (!existing) return;

      const updateData: any = {};
      
      // Update customer if changed
      if (booking.customerName && booking.customerName !== (existing.customers?.full_name)) {
        let customerId = null;
        const { data: custData } = await supabase.from('customers').select('id').eq('full_name', booking.customerName).maybeSingle();
        if (custData) {
          customerId = custData.id;
        } else {
          const { data: newCust } = await supabase.from('customers').insert({ 
            full_name: booking.customerName, 
            owner_id: userId,
            email: `${booking.customerName.replace(/\s+/g, '').toLowerCase()}${Math.floor(Math.random()*1000)}@example.com` 
          }).select('id').single();
          if (newCust) customerId = newCust.id;
        }
        if (customerId) updateData.customer_id = customerId;
      }

      // Update amount if changed
      if (booking.amount) {
        const amountNum = typeof booking.amount === 'string' ? parseFloat(booking.amount.replace(/[^0-9.]/g, '')) : booking.amount;
        updateData.total_amount = isNaN(amountNum) ? 0 : amountNum;
      }

      // Update slot if turf, date, or time changed
      if (booking.turfName || booking.turfId || booking.date || booking.timeWindow) {
        let turfId = booking.turfId;
        const turfName = booking.turfName || existing.slots?.turfs?.name;
        const date = booking.date || existing.slots?.slot_date;
        const time = booking.timeWindow || `${existing.slots?.start_time} - ${existing.slots?.end_time}`;

        if (!turfId && turfName) {
          const { data: turfData } = await supabase.from('turfs').select('id').eq('name', turfName).maybeSingle();
          if (turfData) turfId = turfData.id;
        }

        if (turfId) {
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

          const times = time.split('-').map(t => t.trim());
          const start_time = normalizeTime(times[0]) || '00:00:00';
          
          const { data: slotData } = await supabase.from('slots').select('id')
            .eq('turf_id', turfId)
            .eq('slot_date', date)
            .eq('start_time', start_time)
            .maybeSingle();
          
          if (slotData && slotData.id !== existing.slot_id) {
            // Unbook old slot
            await supabase.from('slots').update({ is_booked: false }).eq('id', existing.slot_id);
            // Book new slot
            await supabase.from('slots').update({ is_booked: true }).eq('id', slotData.id);
            updateData.slot_id = slotData.id;
          }
        }
      }

      const { error } = await supabase.from('bookings').update(updateData).eq('id', id).eq('owner_id', userId);
      if (!error) {
        await get().fetchBookings();
        await get().fetchSlots();
      }
    } catch (e) {
      console.error('Failed to update booking:', e);
    }
  },

  updateBookingStatus: async (id, status) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id).eq('owner_id', userId);
    if (!error) {
      if (status === 'Cancelled') {
        const { data: booking } = await supabase.from('bookings').select('slot_id').eq('id', id).maybeSingle();
        if (booking?.slot_id) {
          await supabase.from('slots').update({ is_booked: false }).eq('id', booking.slot_id);
        }
      }
      await get().fetchBookings();
      await get().fetchSlots();
    }
  },

  deleteBooking: async (id) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    // First find the slot_id to unbook it
    const { data } = await supabase.from('bookings').select('slot_id').eq('id', id).eq('owner_id', userId).maybeSingle();
    if (data?.slot_id) {
      await supabase.from('slots').update({ is_booked: false }).eq('id', data.slot_id).eq('owner_id', userId);
    }
    
    const { error } = await supabase.from('bookings').delete().eq('id', id).eq('owner_id', userId);
    if (!error) {
      await get().fetchBookings();
      await get().fetchSlots();
    }
  },
  
  fetchCoupons: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
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
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    
    // Support both explicit type property and percentage sign detection
    const isPerc = coupon.type === 'Percentage' || coupon.discount.includes('%');
    const val = parseFloat(coupon.discount.replace(/[^0-9.]/g, ''));
    
    let expiryDate;
    try {
      expiryDate = new Date(coupon.expires).toISOString();
    } catch (e) {
      console.error("Invalid date for coupon:", coupon.expires);
      expiryDate = new Date().toISOString();
    }

    const { data, error } = await supabase.from('coupons').insert([{
      code: coupon.code, 
      owner_id: userId,
      discount_value: isNaN(val) ? 0 : val, 
      discount_type: isPerc ? 'Percentage' : 'Fixed',
      expires_at: expiryDate, 
      usage_count: 0,
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
      const isPerc = coupon.type === 'Percentage' || coupon.discount.includes('%');
      updateData.discount_value = parseFloat(coupon.discount.replace(/[^0-9.]/g, ''));
      updateData.discount_type = isPerc ? 'Percentage' : 'Fixed';
    }
    if (coupon.expires) updateData.expires_at = new Date(coupon.expires).toISOString();
    if (coupon.status) updateData.status = coupon.status;
    if (coupon.appliesTo) updateData.applies_to = coupon.appliesTo;
    if (coupon.selectedSlotIds) updateData.selected_slot_ids = coupon.selectedSlotIds;

    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    const { error } = await supabase.from('coupons').update(updateData).eq('id', id).eq('owner_id', userId);
    if (!error) {
      await get().fetchCoupons();
    } else {
      console.error("Update coupon error:", error);
      showError('Update Failed', `Could not update campaign: ${error.message}`);
    }
  },
  
  deleteCoupon: async (id) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id).eq('owner_id', userId);
    if (!error) {
      await get().fetchCoupons();
    }
  },

  fetchCustomers: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    try {
      // Fetch customers owned by this user OR who have bookings with this user
      const { data, error } = await supabase
        .from('customers')
        .select('*, bookings(id, total_amount, owner_id)')
        .or(`owner_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const formatted = data.map(c => {
          const ownerBookings = c.bookings?.filter((b: any) => b.owner_id === userId) || [];
          return {
            id: c.id,
            name: c.full_name,
            email: c.email,
            phone: c.phone || 'N/A',
            bookings: ownerBookings.length,
            spent: `₹${Math.round(ownerBookings.reduce((acc: number, b: any) => acc + (b.total_amount || 0), 0))}`,
            lastActive: 'Active'
          };
        });
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
