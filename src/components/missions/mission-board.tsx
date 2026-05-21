"use client";

import { motion } from "framer-motion";
import { CalendarCheck, CheckCircle2, Flame, Gauge, Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import type { Mission } from "@/lib/supabase/database.types";
import { useUserStore } from "@/lib/stores/use-user-store";
import { formatNumber } from "@/lib/utils";

const demoMissions: Mission[] = [
  {
    id: "m1",
    user_id: "demo",
    mission_key: "words-500",
    title: "Type 500 words",
    target: 500,
    progress: 318,
    xp_reward: 350,
    completed: false,
    mission_date: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString()
  },
  {
    id: "m2",
    user_id: "demo",
    mission_key: "win-3",
    title: "Win 3 races",
    target: 3,
    progress: 2,
    xp_reward: 500,
    completed: false,
    mission_date: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString()
  },
  {
    id: "m3",
    user_id: "demo",
    mission_key: "accuracy-95",
    title: "Reach 95% accuracy",
    target: 95,
    progress: 97,
    xp_reward: 420,
    completed: true,
    mission_date: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString()
  },
  {
    id: "m4",
    user_id: "demo",
    mission_key: "streak",
    title: "Maintain streak",
    target: 10,
    progress: 8,
    xp_reward: 300,
    completed: false,
    mission_date: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString()
  }
];

const missionIcons = [Target, Trophy, Gauge, Flame];

export function MissionBoard({ compact = false }: { compact?: boolean }) {
  const user = useUserStore((state) => state.user);
  const [missions, setMissions] = useState<Mission[]>(demoMissions);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) {
      return;
    }

    async function load() {
      // @ts-expect-error: Bypassing type check for Supabase RPC parameter
      await supabase.rpc("seed_daily_missions", { user_id_input: user!.id });
      
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("daily_missions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("mission_date", today)
        .order("created_at", { ascending: true });

      setMissions(data ?? []);
    }

    void load();

    const channel = supabase
      .channel(`missions:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_missions", filter: `user_id=eq.${user.id}` },
        () => void load()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-purple">Daily missions</p>
          <h2 className="mt-2 text-2xl font-black text-white">Today&apos;s rewards</h2>
        </div>
        <Badge variant="purple">
          <CalendarCheck className="mr-1 size-3.5" />
          resets daily
        </Badge>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {missions.slice(0, compact ? 4 : missions.length).map((mission, index) => {
          const Icon = missionIcons[index % missionIcons.length];
          const value = Math.min((mission.progress / mission.target) * 100, 100);

          return (
            <motion.div
              key={mission.id}
              layout
              whileHover={{ y: -3 }}
              className="rounded-lg border border-white/10 bg-white/[0.045] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="grid size-11 place-items-center rounded-md border border-white/10 bg-black/30 text-neon-green shadow-glow">
                  {mission.completed ? <CheckCircle2 className="size-5" /> : <Icon className="size-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="truncate font-bold text-white">{mission.title}</h3>
                    <Badge variant={mission.completed ? "default" : "muted"}>+{mission.xp_reward} XP</Badge>
                  </div>
                  <div className="mt-3">
                    <Progress value={value} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatNumber(mission.progress)} / {formatNumber(mission.target)}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {!compact && (
        <Button className="mt-5" variant="secondary">
          Claim completed rewards
        </Button>
      )}
    </section>
  );
}