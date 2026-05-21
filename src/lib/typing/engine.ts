import { clamp, percentage } from "@/lib/utils";
import { glyphEquals, splitGlyphs } from "@/lib/typing/mongolian";

export interface TypingSnapshot {
  target: string;
  input: string;
  cursor: number;
  correctChars: number;
  mistakes: number;
  progress: number;
  accuracy: number;
  wpm: number;
  combo: number;
  completed: boolean;
  elapsedSeconds: number;
  currentGlyph: string;
}

export function evaluateTyping(target: string, input: string, startedAt: number | null, now = Date.now()): TypingSnapshot {
  const targetGlyphs = splitGlyphs(target);
  const inputGlyphs = splitGlyphs(input).slice(0, targetGlyphs.length);
  let correctChars = 0;
  let mistakes = 0;
  let combo = 0;

  inputGlyphs.forEach((glyph, index) => {
    if (glyphEquals(targetGlyphs[index] ?? "", glyph)) {
      correctChars += 1;
      combo += 1;
    } else {
      mistakes += 1;
      combo = 0;
    }
  });

  const elapsedSeconds = startedAt ? Math.max((now - startedAt) / 1000, 1) : 0;
  const typedWords = correctChars / 5;
  const wpm = elapsedSeconds > 0 ? Math.round((typedWords / elapsedSeconds) * 60) : 0;
  const progress = percentage(inputGlyphs.length, targetGlyphs.length);
  const accuracy = inputGlyphs.length === 0 ? 100 : clamp((correctChars / inputGlyphs.length) * 100, 0, 100);
  const cursor = inputGlyphs.length;

  return {
    target,
    input: inputGlyphs.join(""),
    cursor,
    correctChars,
    mistakes,
    progress,
    accuracy,
    wpm,
    combo,
    completed: inputGlyphs.length === targetGlyphs.length && mistakes === 0,
    elapsedSeconds,
    currentGlyph: targetGlyphs[cursor] ?? ""
  };
}

export function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
