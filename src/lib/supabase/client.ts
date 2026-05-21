"use client";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key";

export const isSupabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
  !supabaseUrl.includes("example.supabase.co");

const memoryStorage = new Map<string, string>();

const authStorage = {
  getItem(key: string) {
    if (typeof window === "undefined") {
      return memoryStorage.get(key) ?? null;
    }

    return window.sessionStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") {
      memoryStorage.set(key, value);
      return;
    }

    window.sessionStorage.setItem(key, value);
  },
  removeItem(key: string) {
    if (typeof window === "undefined") {
      memoryStorage.delete(key);
      return;
    }

    window.sessionStorage.removeItem(key);
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    persistSession: true,
    storage: authStorage,
    storageKey: "mongoltype.auth"
  },
  realtime: {
    params: {
      eventsPerSecond: 20
    }
  },
  global: {
    headers: {
      "x-application-name": "mongoltype"
    }
  }
});
