"use client";

import { motion } from "framer-motion";

export function CountdownRing({ value }: { value: number }) {
  return (
    <motion.div
      className="grid size-28 place-items-center rounded-full border border-neon-green/30 bg-neon-green/10 text-5xl font-black text-neon-green shadow-glow"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: [0.9, 1.04, 1], opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {value}
    </motion.div>
  );
}
