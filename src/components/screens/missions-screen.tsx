"use client";

import { AppShell } from "@/components/app-shell";
import { MissionBoard } from "@/components/missions/mission-board";

export function MissionsScreen() {
  return (
    <AppShell>
      <div className="container py-8">
        <MissionBoard />
      </div>
    </AppShell>
  );
}
