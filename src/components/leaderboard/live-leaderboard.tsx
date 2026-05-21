"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Crown, Flame, Gauge, Medal, Percent, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import type { LeaderboardRow } from "@/lib/supabase/database.types";
import { cn, formatNumber } from "@/lib/utils";

type LeaderboardCategory = "highest_wpm" | "highest_accuracy" | "highest_level" | "longest_streak";

const categories: Array<{ key: LeaderboardCategory; label: string; icon: typeof Gauge; suffix: string }> = [
  { key: "highest_wpm", label: "WPM", icon: Gauge, suffix: " wpm" },
  { key: "highest_accuracy", label: "Accuracy", icon: Percent, suffix: "%" },
  { key: "highest_level", label: "Level", icon: Crown, suffix: "" },
  { key: "longest_streak", label: "Streak", icon: Flame, suffix: "" }
];

const demoRows: LeaderboardRow[] = [
  {
    id: "demo-1",
    user_id: "u1",
    username: "Suld",
    avatar_url: null,
    highest_wpm: 132,
    highest_accuracy: 99.2,
    highest_level: 51,
    longest_streak: 17,
    races_won: 82,
    updated_at: new Date().toISOString()
  },
  {
    id: "demo-2",
    user_id: "u2",
    username: "Anar",
    avatar_url: null,
    highest_wpm: 121,
    highest_accuracy: 98.8,
    highest_level: 37,
    longest_streak: 13,
    races_won: 64,
    updated_at: new Date().toISOString()
  },
  {
    id: "demo-3",
    user_id: "u3",
    username: "Tsetseg",
    avatar_url: null,
    highest_wpm: 116,
    highest_accuracy: 99.9,
    highest_level: 42,
    longest_streak: 22,
    races_won: 71,
    updated_at: new Date().toISOString()
  }
];

export function LiveLeaderboard({ compact = false }: { compact?: boolean }) {
  const [rows, setRows] = useState<LeaderboardRow[]>(demoRows);
  const [category, setCategory] = useState<LeaderboardCategory>("highest_wpm");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    async function load() {
      const { data } = await supabase.from("leaderboard").select("*").order(category, { ascending: false }).limit(24);
      setRows(data?.length ? data : []);
    }

    void load();

    const channel = supabase
      .channel("leaderboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "leaderboard" }, () => void load())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [category]);

  const visibleRows = useMemo(
    () => rows.slice().sort((a, b) => Number(b[category]) - Number(a[category])).slice(0, compact ? 5 : 24),
    [category, compact, rows]
  );

  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-green">Realtime leaderboard</p>
          <h2 className="mt-2 text-2xl font-black text-white">Global ranks</h2>
        </div>
        <Badge variant={isSupabaseConfigured ? "default" : "muted"}>
          <BadgeCheck className="mr-1 size-3.5" />
          {isSupabaseConfigured ? "Supabase live" : "Demo feed"}
        </Badge>
      </div>

      <Tabs value={category} onValueChange={(value) => setCategory(value as LeaderboardCategory)} className="mt-5">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
          {categories.map((entry) => {
            const Icon = entry.icon;
            return (
              <TabsTrigger key={entry.key} value={entry.key} className="gap-2">
                <Icon className="size-4" />
                {entry.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <TabsContent value={category} className="mt-4">
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {visibleRows.map((row, index) => {
                const selected = categories.find((entry) => entry.key === category)!;
                const value = row[category];

                return (
                  <motion.div
                    layout
                    key={row.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.045] p-3",
                      index === 0 && "border-neon-green/30 bg-neon-green/10 shadow-glow"
                    )}
                  >
                    <div className="grid size-9 place-items-center rounded-md border border-white/10 bg-black/30 text-sm font-black text-white">
                      {index === 0 ? <Trophy className="size-4 text-neon-green" /> : index + 1}
                    </div>
                    <Avatar className="size-10">
                      <AvatarImage src={row.avatar_url ?? undefined} alt={row.username} />
                      <AvatarFallback>{row.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-white">{row.username}</p>
                      <p className="text-xs text-muted-foreground">{row.races_won} wins</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-white">
                        {formatNumber(Number(value), category === "highest_accuracy" ? 1 : 0)}
                        {selected.suffix}
                      </p>
                      <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Medal className="size-3" />
                        {selected.label}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
