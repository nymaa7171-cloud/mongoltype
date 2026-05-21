"use client";

import { AppShell } from "@/components/app-shell";
import { RaceRoom } from "@/components/race/race-room";

export function RaceScreen() {
  return (
    <AppShell>
      <div className="container py-8">
        <RaceRoom />
      </div>
    </AppShell>
  );
}
