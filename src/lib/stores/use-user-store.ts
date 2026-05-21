"use client";

import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

import type { Profile } from "@/lib/supabase/database.types";

interface UserState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  onlineUsers: number;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setOnlineUsers: (count: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  session: null,
  user: null,
  profile: null,
  onlineUsers: 0,
  loading: true,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  setLoading: (loading) => set({ loading })
}));
