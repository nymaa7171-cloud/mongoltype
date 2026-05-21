"use client";

import { motion } from "framer-motion";
import { Crown, Flag, Gauge } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import type { RacePlayer } from "@/lib/supabase/database.types";
import { formatNumber } from "@/lib/utils";

export function RacerRow({ player, leader }: { player: RacePlayer; leader: boolean }) {
  return (
    <motion.div
      layout
      className="rounded-lg border border-white/10 bg-white/[0.045] p-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
    >
      <div className="flex items-center gap-3">
        <Avatar className="size-10">
          <AvatarImage src={player.avatar_url ?? undefined} alt={player.username} />
          <AvatarFallback>{player.username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-bold text-white">{player.username}</p>
            {leader && <Crown className="size-4 text-neon-green" />}
            {player.finished_at && <Flag className="size-4 text-neon-blue" />}
          </div>
          <div className="mt-2">
            <Progress value={player.progress} />
          </div>
        </div>
        <div className="grid min-w-20 justify-items-end gap-1 text-right">
          <span className="inline-flex items-center gap-1 text-sm font-black text-white">
            <Gauge className="size-3.5 text-neon-blue" />
            {player.wpm}
          </span>
          <span className="text-xs text-muted-foreground">{formatNumber(player.accuracy, 1)}%</span>
        </div>
      </div>
    </motion.div>
  );
}
