"use client";

import { Gauge, Keyboard, Trophy, Zap } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { LiveLeaderboard } from "@/components/leaderboard/live-leaderboard";
import { MetricCard } from "@/components/metric-card";
import { MissionBoard } from "@/components/missions/mission-board";
import { TypingArena } from "@/components/typing/typing-arena";
import { useUserStore } from "@/lib/stores/use-user-store";
import { formatNumber } from "@/lib/utils";

export function DashboardScreen() {
  const profile = useUserStore((state) => state.profile);

  return (
    <AppShell>
      <ProtectedRoute>
        <div className="container space-y-5 py-8">
          <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-green">Dashboard</p>
              <h1 className="mt-2 text-4xl font-black text-white md:text-6xl">Welcome back, {profile?.username ?? "typist"}.</h1>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={Zap} label="Level" value={String(profile?.level ?? 1)} helper={profile?.title ?? "Шинэхэн"} tone="green" />
            <MetricCard icon={Gauge} label="Best WPM" value={String(profile?.best_wpm ?? 0)} helper="personal peak" tone="blue" />
            <MetricCard icon={Keyboard} label="Words" value={formatNumber(profile?.words_typed ?? 0)} helper="synced total" tone="purple" />
            <MetricCard icon={Trophy} label="Wins" value={String(profile?.races_won ?? 0)} helper="ranked victories" tone="green" />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
            <TypingArena />
            <MissionBoard compact />
          </div>

          <LiveLeaderboard compact />
        </div>
      </ProtectedRoute>
    </AppShell>
  );
}
