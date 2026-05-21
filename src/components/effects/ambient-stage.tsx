"use client";

import { motion } from "framer-motion";

const glyphs = ["ө", "ү", "ё", "ж", "ң", "ш", "ц", "х", "р", "т", "л", "д"];

export function AmbientStage() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20 grid-mask" />
      <motion.div
        className="absolute left-[-15%] top-[12%] h-28 w-[130%] rotate-[-10deg] bg-gradient-to-r from-transparent via-neon-green/20 to-transparent blur-3xl"
        animate={{ x: ["-8%", "8%", "-8%"], opacity: [0.22, 0.46, 0.22] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[-12%] top-[54%] h-24 w-[120%] rotate-[8deg] bg-gradient-to-r from-transparent via-neon-blue/[0.18] to-transparent blur-3xl"
        animate={{ x: ["6%", "-6%", "6%"], opacity: [0.18, 0.38, 0.18] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(0,0,0,0.74)_78%)]" />
      <div className="absolute inset-0">
        {glyphs.map((glyph, index) => (
          <motion.span
            key={`${glyph}-${index}`}
            className="absolute text-sm font-semibold text-white/10"
            style={{
              left: `${8 + ((index * 17) % 86)}%`,
              top: `${12 + ((index * 23) % 74)}%`
            }}
            animate={{ y: [-8, 10, -8], opacity: [0.05, 0.2, 0.05] }}
            transition={{
              duration: 6 + index * 0.7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.24
            }}
          >
            {glyph}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
