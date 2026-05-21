"use client";

import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProfileDashboard } from "@/components/profile/profile-dashboard";

export function ProfileScreen() {
  return (
    <AppShell>
      <ProtectedRoute>
        <div className="container py-8">
          <ProfileDashboard />
        </div>
      </ProtectedRoute>
    </AppShell>
  );
}
