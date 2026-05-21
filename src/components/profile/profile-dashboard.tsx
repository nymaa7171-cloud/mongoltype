"use client";

import { motion } from "framer-motion";
import { Activity, BadgeCheck, Flame, Gauge, LineChart, Swords, Trophy, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { MetricCard } from "@/components/metric-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { achievementDefinitions } from "@/lib/achievements";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { useUserStore } from "@/lib/stores/use-user-store";
import { getLevelTitle, progressToNextLevel } from "@/lib/xp";
import { compactDate, formatNumber } from "@/lib/utils";

type MatchHistory = Database["public"]["Tables"]["match_history"]["Row"];

const demoMatches: MatchHistory[] = [
  {
    id: "h1",
    user_id: "demo",
    race_id: "r1",
    placement: 1,
    wpm: 96,
    accuracy: 98.4,
    xp_earned: 420,
    result: "win",
    created_at: new Date().toISOString()
  },
  {
    id: "h2",
    user_id: "demo",
    race_id: "r2",
    placement: 2,
    wpm: 88,
    accuracy: 96.8,
    xp_earned: 260,
    result: "podium",
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export function ProfileDashboard() {
  const user = useUserStore((state) => state.user);
  const profile = useUserStore((state) => state.profile);
  const [matches, setMatches] = useState<MatchHistory[]>(demoMatches);
  const level = profile?.level ?? 12;
  const xp = profile?.xp ?? 9200;
  const title = profile?.title ?? getLevelTitle(level);
  const progress = progressToNextLevel(xp);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) {
      return;
    }

    async function load() {
      const { data } = await supabase
        .from("match_history")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(12);

      setMatches(data ?? []);
    }

    void load();
  }, [user]);

  return (
    <div className="space-y-5">
      <section className="glass-panel overflow-hidden rounded-lg">
        <div className="relative min-h-64 p-6 md:p-8">
          <img
            src="/brand/mongoltype-grid.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/40" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-20 border border-neon-green/30 shadow-glow">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.username ?? "Profile"} />
                <AvatarFallback>{profile?.username?.slice(0, 2).toUpperCase() ?? "MT"}</AvatarFallback>
              </Avatar>
              <div>
                <Badge>{title}</Badge>
                <h1 className="mt-3 text-4xl font-black text-white md:text-6xl">{profile?.username ?? "MongolType Player"}</h1>
                <p className="mt-2 text-muted-foreground">Profile glow: {profile?.profile_glow ?? "neon-green"}</p>
              </div>
            </div>
            <div className="min-w-72 rounded-lg border border-white/10 bg-black/[0.45] p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Level {level}</span>
                <span className="text-sm font-bold text-white">{formatNumber(xp)} XP</span>
              </div>
              <Progress value={progress} className="mt-3" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Gauge} label="Best WPM" value={String(profile?.best_wpm ?? 121)} helper="single race peak" tone="green" />
        <MetricCard icon={BadgeCheck} label="Accuracy" value={`${formatNumber(profile?.best_accuracy ?? 99.2, 1)}%`} helper="highest clean run" tone="blue" />
        <MetricCard icon={Trophy} label="Wins" value={String(profile?.races_won ?? 28)} helper="ranked races" tone="purple" />
        <MetricCard icon={Flame} label="Streak" value={String(profile?.longest_streak ?? 12)} helper="longest win chain" tone="green" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neon-blue">Typing analytics</p>
              <h2 className="mt-2 text-2xl font-black text-white">Recent velocity</h2>
            </div>
            <LineChart className="size-5 text-neon-blue" />
          </div>
          <div className="mt-6 flex h-64 items-end gap-2">
            {matches.concat(demoMatches).slice(0, 12).reverse().map((match, index) => (
              <motion.div key={`${match.id}-${index}`} className="flex flex-1 flex-col items-center gap-2" initial={{ height: 0 }} animate={{ height: "auto" }}>
                <div
                  className="w-full rounded-t bg-gradient-to-t from-neon-green to-neon-blue shadow-blue-glow"
                  style={{ height: `${Math.max(match.wpm, 24) * 1.5}px` }}
                />
                <span className="text-[10px] text-muted-foreground">{compactDate(match.created_at)}</span>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Activity className="size-5 text-neon-green" />
            <h2 className="text-2xl font-black text-white">Recent matches</h2>
          </div>
          <div className="mt-5 space-y-3">
            {matches.map((match) => (
              <div key={match.id} className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.045] p-3">
                <div>
                  <p className="font-bold text-white">#{match.placement} {match.result}</p>
                  <p className="text-xs text-muted-foreground">{compactDate(match.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-white">{match.wpm} WPM</p>
                  <p className="text-xs text-neon-green">+{match.xp_earned} XP</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <Zap className="size-5 text-neon-purple" />
          <h2 className="text-2xl font-black text-white">Achievements</h2>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {achievementDefinitions.map((achievement, index) => (
            <div key={achievement.slug} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
              <Badge variant={index < 2 ? "default" : "muted"}>{index < 2 ? "Unlocked" : "Locked"}</Badge>
              <h3 className="mt-3 font-black text-white">{achievement.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{achievement.description}</p>
              <p className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-neon-green">
                <Swords className="size-3.5" />
                +{achievement.xpReward} XP
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
