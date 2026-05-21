"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { useUserStore } from "@/lib/stores/use-user-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const setLoading = useUserStore((state) => state.setLoading);
  const setProfile = useUserStore((state) => state.setProfile);
  const setSession = useUserStore((state) => state.setSession);
  const setOnlineUsers = useUserStore((state) => state.setOnlineUsers);

  useEffect(() => {
    let cancelled = false;

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    async function boot() {
      const { data } = await supabase.auth.getSession();
      if (cancelled) {
        return;
      }

      setSession(data.session);

      if (data.session?.user.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .maybeSingle();
        setProfile(profile ?? null);
      }

      setLoading(false);
    }

    void boot();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [setLoading, setProfile, setSession]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const channel = supabase.channel("global-presence", {
      config: {
        presence: {
          key: crypto.randomUUID()
        }
      }
    });

    channel
      .on("presence", { event: "sync" }, () => {
        setOnlineUsers(Object.keys(channel.presenceState()).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, [setOnlineUsers]);

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
