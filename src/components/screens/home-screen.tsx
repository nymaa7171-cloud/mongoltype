"use client";

import { motion } from "framer-motion";
import { Activity, Gauge, RadioTower, ShieldCheck, Trophy, Users, Zap } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { LiveLeaderboard } from "@/components/leaderboard/live-leaderboard";
import { MetricCard } from "@/components/metric-card";
import { MissionBoard } from "@/components/missions/mission-board";
import { TypingArena } from "@/components/typing/typing-arena";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function HomeScreen() {
  return (
    <AppShell>
      <div className="container space-y-6 py-8">
        <section className="grid min-h-[calc(100vh-8rem)] items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge>
                <RadioTower className="mr-1 size-3.5" />
                live multiplayer
              </Badge>
              <Badge variant="blue">Cloudflare Pages</Badge>
              <Badge variant="purple">Supabase Realtime</Badge>
            </div>
            <motion.h1
              className="max-w-5xl text-5xl font-black tracking-normal text-white md:text-7xl xl:text-8xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Монгол кирилл хурдыг <span className="text-gradient">уралдаан</span> болго.
            </motion.h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              MongolType turns ө, ү, ё, punctuation, rhythm, and accuracy into realtime races, daily missions, and ranked progression.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/race">
                  <Zap className="size-5" />
                  Start race
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/leaderboard">
                  <Trophy className="size-5" />
                  View ranks
                </Link>
              </Button>
            </div>
          </div>

          <motion.div className="relative" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-r from-neon-green/20 via-neon-blue/20 to-neon-purple/20 blur-2xl" />
            <div className="glass-panel relative overflow-hidden rounded-lg">
              <img src="/brand/mongoltype-grid.png" alt="" className="h-72 w-full object-cover opacity-80 sm:h-96" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/[0.35] to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-md border border-white/10 bg-black/50 p-3 backdrop-blur-xl">
                    <p className="text-xs text-muted-foreground">avg</p>
                    <p className="text-2xl font-black text-white">88</p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-black/50 p-3 backdrop-blur-xl">
                    <p className="text-xs text-muted-foreground">acc</p>
                    <p className="text-2xl font-black text-white">97%</p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-black/50 p-3 backdrop-blur-xl">
                    <p className="text-xs text-muted-foreground">combo</p>
                    <p className="text-2xl font-black text-white">24</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={Users} label="Live rooms" value="32" helper="matchmaking lanes" tone="green" />
          <MetricCard icon={Gauge} label="Peak WPM" value="132" helper="global high today" tone="blue" />
          <MetricCard icon={Activity} label="Accuracy" value="98.8%" helper="top clean run" tone="purple" />
          <MetricCard icon={ShieldCheck} label="RLS" value="ON" helper="Supabase protected" tone="green" />
        </div>

        <TypingArena />

        <div className="grid gap-5 xl:grid-cols-[1fr_440px]">
          <LiveLeaderboard compact />
          <MissionBoard compact />
        </div>
      </div>
    </AppShell>
  );
}
