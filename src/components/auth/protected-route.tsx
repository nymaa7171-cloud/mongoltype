"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useUserStore } from "@/lib/stores/use-user-store";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const loading = useUserStore((state) => state.loading);
  const session = useUserStore((state) => state.session);

  useEffect(() => {
    if (!loading && isSupabaseConfigured && !session) {
      router.replace("/auth");
    }
  }, [loading, router, session]);

  if (!isSupabaseConfigured) {
    return (
      <div className="container flex min-h-screen items-center justify-center py-20">
        <div className="glass-panel max-w-xl rounded-lg p-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-neon-blue">Supabase required</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Realtime sync is waiting for env keys.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable protected routes,
            auth, rooms, leaderboards, and live missions.
          </p>
          <Button className="mt-5" onClick={() => router.push("/")}>
            Back to preview
          </Button>
        </div>
      </div>
    );
  }

  if (loading || !session) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border border-neon-green/30 border-t-neon-green" />
      </div>
    );
  }

  return children;
}
