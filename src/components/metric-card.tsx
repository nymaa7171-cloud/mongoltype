"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "green" | "blue" | "purple";
}

const toneClasses = {
  green: "text-neon-green shadow-glow",
  blue: "text-neon-blue shadow-blue-glow",
  purple: "text-neon-purple shadow-purple-glow"
};

export function MetricCard({ label, value, helper, icon: Icon, tone = "green" }: MetricCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-black tracking-normal text-white">{value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
          </div>
          <div className={cn("grid size-11 place-items-center rounded-md border border-white/10 bg-white/[0.06]", toneClasses[tone])}>
            <Icon className="size-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
