"use client";

import { motion } from "framer-motion";

import { keyboardRows } from "@/lib/typing/mongolian";
import { cn } from "@/lib/utils";

export function KeyboardVisualizer({ activeGlyph, lastWrong }: { activeGlyph: string; lastWrong?: string }) {
  const active = activeGlyph.toLocaleLowerCase("mn-MN");

  return (
    <div className="space-y-2">
      {keyboardRows.map((row, rowIndex) => (
        <div key={row.join("")} className={cn("flex justify-center gap-1.5", rowIndex === 1 && "pl-4", rowIndex === 2 && "pl-10")}>
          {row.map((glyph) => {
            const isActive = glyph === active;
            const isWrong = glyph === lastWrong?.toLocaleLowerCase("mn-MN");

            return (
              <motion.div
                key={glyph}
                className={cn(
                  "grid h-9 min-w-8 place-items-center rounded border border-white/10 bg-white/[0.045] px-2 text-sm font-bold text-muted-foreground transition sm:h-10 sm:min-w-10",
                  isActive && "border-neon-green/70 bg-neon-green/15 text-neon-green shadow-glow",
                  isWrong && "border-red-400/70 bg-red-500/15 text-red-100"
                )}
                animate={isActive ? { y: [0, -3, 0], scale: [1, 1.05, 1] } : isWrong ? { x: [0, -3, 3, 0] } : {}}
                transition={{ duration: 0.25 }}
              >
                {glyph}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
