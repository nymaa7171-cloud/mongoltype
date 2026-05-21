"use client";

import { motion } from "framer-motion";
import { ImageUp, Save, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { useUserStore } from "@/lib/stores/use-user-store";
import { getLevelTitle } from "@/lib/xp";

export function OnboardingScreen() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const profile = useUserStore((state) => state.profile);
  const setProfile = useUserStore((state) => state.setProfile);
  const [username, setUsername] = useState(profile?.username ?? user?.user_metadata.username ?? "");
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function saveProfile() {
    if (!user || !username.trim()) {
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const payload = {
        id: user.id,
        username: username.trim(),
        display_name: displayName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        level: profile?.level ?? 1,
        xp: profile?.xp ?? 0,
        title: profile?.title ?? getLevelTitle(1),
        profile_glow: profile?.profile_glow ?? "neon-green"
      };

      const { data, error } = await supabase.from("profiles").upsert(payload).select("*").single();
      if (error) {
        throw error;
      }

      await supabase
        .from("leaderboard")
        .upsert(
          {
            user_id: user.id,
            username: payload.username,
            avatar_url: payload.avatar_url,
            highest_level: payload.level
          },
          { onConflict: "user_id" }
        );

      setProfile(data);
      router.push("/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadAvatar(file: File | undefined) {
    if (!user || !file) {
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${user.id}/avatar-${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, {
        cacheControl: "604800",
        upsert: true
      });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not upload avatar.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <AppShell>
      <ProtectedRoute>
        <div className="container grid min-h-[calc(100vh-4rem)] items-center gap-8 py-10 lg:grid-cols-[1fr_460px]">
          <section>
            <Badge>
              <Sparkles className="mr-1 size-3.5" />
              profile setup
            </Badge>
            <motion.h1 className="mt-5 max-w-3xl text-5xl font-black text-white md:text-7xl" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              Choose the name that shows up on the track.
            </motion.h1>
          </section>

          <Card className="p-5">
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white">Username</span>
                <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="erdene" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white">Display name</span>
                <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Эрдэнэ" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white">Avatar URL</span>
                <Input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://..." />
              </label>
            </div>

            <div className="mt-5 rounded-lg border border-white/10 bg-black/25 p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-14 place-items-center overflow-hidden rounded-lg border border-neon-green/30 bg-neon-green/10">
                  {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : <ImageUp className="size-6 text-neon-green" />}
                </div>
                <div>
                  <p className="font-black text-white">{username || "username"}</p>
                  <p className="text-sm text-muted-foreground">{displayName || "Display name"}</p>
                </div>
              </div>
              <label className="focus-ring mt-4 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.07] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.11]">
                <ImageUp className="size-4" />
                {uploading ? "Uploading..." : "Upload avatar"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  disabled={uploading}
                  onChange={(event) => void uploadAvatar(event.target.files?.[0])}
                />
              </label>
            </div>

            {message && <p className="mt-4 rounded-md border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">{message}</p>}

            <Button className="mt-5 w-full" onClick={saveProfile} disabled={busy || !username.trim()}>
              <Save className="size-4" />
              Save profile
            </Button>
          </Card>
        </div>
      </ProtectedRoute>
    </AppShell>
  );
}
