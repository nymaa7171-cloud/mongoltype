"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TypingTextProps {
  target: string;
  input: string;
  className?: string;
}

export default function TypingText({ target, input, className }: TypingTextProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Хөтөч дээр бүрэн ачаалж дуустал Hydration алдаанаас сэргийлнэ
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Сервер талд анх уншигдахдаа хоосон бүтэц буцааж зөрүү үүсэхээс сэргийлнэ
    return (
      <div className={cn("relative font-mono text-2xl leading-relaxed tracking-wide select-none opacity-50", className)}>
        {target}
      </div>
    );
  }

  const targetChars = target.split("");

  return (
    <div className={cn("relative font-mono text-2xl leading-relaxed tracking-wide select-none whitespace-pre-wrap breakdown-all", className)}>
      {targetChars.map((char, index) => {
        const isTyped = index < input.length;
        const isCurrent = index === input.length;
        const isCorrect = isTyped && input[index] === char;

        return (
          <span key={index} className="relative inline">
            {isCurrent && (
              <motion.span
                layoutId="cursor"
                className="absolute -left-[1px] top-[10%] bottom-[10%] w-[2px] bg-emerald-400"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <span
              className={cn(
                "transition-colors duration-150",
                !isTyped && "text-muted-foreground/40",
                isTyped && isCorrect && "text-foreground font-medium",
                isTyped && !isCorrect && "text-destructive border-b border-destructive/50 bg-destructive/10"
              )}
            >
              {char}
            </span>
          </span>
        );
      })}
    </div>
  );
}