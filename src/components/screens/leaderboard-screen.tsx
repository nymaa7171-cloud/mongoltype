"use client";

import { AppShell } from "@/components/app-shell";
import { LiveLeaderboard } from "@/components/leaderboard/live-leaderboard";

export function LeaderboardScreen() {
  return (
    <AppShell>
      <div className="container py-8">
        <LiveLeaderboard />
      </div>
    </AppShell>
  );
}
