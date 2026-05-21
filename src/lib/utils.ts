import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("mn-MN", {
    maximumFractionDigits
  }).format(value);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function percentage(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return clamp((value / total) * 100, 0, 100);
}

export function createRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  globalThis.crypto?.getRandomValues(bytes);

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function compactDate(value: string | Date) {
  return new Intl.DateTimeFormat("mn-MN", {
    month: "short",
    day: "numeric"
  }).format(typeof value === "string" ? new Date(value) : value);
}
