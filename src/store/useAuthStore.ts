import { create } from 'zustand';
import { supabase } from '../services/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasTurf: boolean | null; // null means checking
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  checkTurfSetup: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  hasTurf: null,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, user: session?.user ?? null }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, hasTurf: null });
  },
  checkTurfSetup: async () => {
    const { user } = get();
    if (!user) {
      set({ hasTurf: false });
      return;
    }

    try {
      // Check if this owner has any turf
      const { data, error } = await supabase
        .from('turfs')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error checking turf setup:", error);
      }

      set({ hasTurf: !!data });
    } catch (err) {
      console.error("Turf setup check failed:", err);
      set({ hasTurf: false });
    }
  },
  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null });
    
    if (session?.user) {
      await get().checkTurfSetup();
    } else {
      set({ hasTurf: false });
    }

    set({ loading: false });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        await get().checkTurfSetup();
      } else {
        set({ hasTurf: false });
      }
      set({ loading: false });
    });
  },
}));
