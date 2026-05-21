"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Sparkles, Volume2, VolumeX, Zap } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { KeyboardVisualizer } from "@/components/typing/keyboard-visualizer";
import TypingText from "./typing-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Difficulty } from "@/lib/supabase/database.types";
import { evaluateTyping, wordCount } from "@/lib/typing/engine";
import { difficultyLabel, generateMongolianPrompt, splitGlyphs } from "@/lib/typing/mongolian";
import { calculateRaceXp } from "@/lib/xp";
import { formatNumber } from "@/lib/utils";

interface TypingArenaProps {
  initialDifficulty?: Difficulty;
  compact?: boolean;
  onComplete?: (result: { wpm: number; accuracy: number; mistakes: number; words: number; xp: number }) => void;
}

export function TypingArena({ initialDifficulty = "medium", compact = false, onComplete }: TypingArenaProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [target, setTarget] = useState(() => generateMongolianPrompt(initialDifficulty, compact ? 18 : 34));
  const [input, setInput] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [lastWrong, setLastWrong] = useState("");
  const [soundOn, setSoundOn] = useState(true);
  const completedRef = useRef(false);
  const snapshot = useMemo(() => evaluateTyping(target, input, startedAt), [input, startedAt, target]);
  const xp = calculateRaceXp({ wpm: snapshot.wpm, accuracy: snapshot.accuracy, won: false, streak: snapshot.combo });

  function reset(nextDifficulty = difficulty) {
    setDifficulty(nextDifficulty);
    setTarget(generateMongolianPrompt(nextDifficulty, compact ? 18 : 34));
    setInput("");
    setStartedAt(null);
    setLastWrong("");
    completedRef.current = false;
  }

  function playTick(correct: boolean) {
    if (!soundOn || typeof window === "undefined") {
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = correct ? 620 : 160;
    gain.gain.value = 0.03;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.035);
  }

  function handleChange(value: string) {
    const glyphs = splitGlyphs(value);
    const targetGlyphs = splitGlyphs(target);
    const next = glyphs.slice(0, targetGlyphs.length).join("");
    const index = glyphs.length - 1;
    const correct = index < 0 || targetGlyphs[index] === glyphs[index];

    if (!startedAt && next.length > 0) {
      setStartedAt(Date.now());
    }

    setInput(next);
    setLastWrong(correct ? "" : glyphs[index] ?? "");
    playTick(correct);

    const nextSnapshot = evaluateTyping(target, next, startedAt ?? Date.now());
    if (nextSnapshot.completed && !completedRef.current) {
      completedRef.current = true;
      const resultXp = calculateRaceXp({
        wpm: nextSnapshot.wpm,
        accuracy: nextSnapshot.accuracy,
        won: false,
        streak: nextSnapshot.combo
      });
      onComplete?.({
        wpm: nextSnapshot.wpm,
        accuracy: nextSnapshot.accuracy,
        mistakes: nextSnapshot.mistakes,
        words: wordCount(target),
        xp: resultXp.total
      });
    }
  }

  return (
    <section className="glass-panel rounded-lg p-4 sm:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>
              <Zap className="mr-1 size-3" />
              {difficultyLabel(difficulty)}
            </Badge>
            <Badge variant="blue">{wordCount(target)} words</Badge>
            <Badge variant="purple">Unicode safe</Badge>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-normal text-white md:text-3xl">Mongolian Cyrillic sprint</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["easy", "medium", "hard", "expert"] as Difficulty[]).map((entry) => (
            <Button
              key={entry}
              size="sm"
              variant={difficulty === entry ? "default" : "secondary"}
              onClick={() => reset(entry)}
            >
              {difficultyLabel(entry)}
            </Button>
          ))}
          <Button size="icon" variant="ghost" onClick={() => setSoundOn((value) => !value)} aria-label="Toggle typing sound">
            {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={() => reset()} aria-label="Reset prompt">
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        {[
          ["WPM", snapshot.wpm],
          ["Accuracy", `${formatNumber(snapshot.accuracy, 1)}%`],
          ["Combo", snapshot.combo],
          ["XP", `+${xp.total}`]
        ].map(([label, value]) => (
          <motion.div
            key={label}
            className="rounded-md border border-white/10 bg-black/25 p-3"
            animate={{ borderColor: label === "Combo" && Number(value) > 8 ? "rgba(84,255,159,0.65)" : "rgba(255,255,255,0.1)" }}
          >
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-black text-white">{value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-5">
        <Progress value={snapshot.progress} />
      </div>

      <div className="mt-5">
        <TypingText target={target} input={input} />
      </div>

      <textarea
        value={input}
        onChange={(event) => handleChange(event.target.value)}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode="text"
        className="focus-ring mt-4 min-h-24 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-4 font-mono text-lg text-white shadow-inner shadow-black/40 placeholder:text-muted-foreground"
        placeholder="Энд бичиж эхлээрэй..."
      />

      <div className="mt-5">
        <KeyboardVisualizer activeGlyph={snapshot.currentGlyph} lastWrong={lastWrong} />
      </div>

      <AnimatePresence>
        {snapshot.combo >= 12 && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            className="mt-5 flex items-center gap-3 rounded-lg border border-neon-green/25 bg-neon-green/10 p-4 text-neon-green shadow-glow"
          >
            <Sparkles className="size-5" />
            <span className="font-bold">{snapshot.combo} combo streak</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
