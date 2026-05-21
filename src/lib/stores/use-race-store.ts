"use client";

import { create } from "zustand";

import type { Race, RacePlayer } from "@/lib/supabase/database.types";
import { generateMongolianPrompt } from "@/lib/typing/mongolian";

interface RaceState {
  activeRace: Race | null;
  players: RacePlayer[];
  draftPrompt: string;
  lastError: string | null;
  setActiveRace: (race: Race | null) => void;
  setPlayers: (players: RacePlayer[]) => void;
  updatePlayer: (player: RacePlayer) => void;
  setDraftPrompt: (prompt: string) => void;
  regeneratePrompt: () => void;
  setLastError: (error: string | null) => void;
  resetRace: () => void;
}

export const useRaceStore = create<RaceState>((set, get) => ({
  activeRace: null,
  players: [],
  draftPrompt: generateMongolianPrompt("medium", 34),
  lastError: null,
  setActiveRace: (activeRace) => set({ activeRace }),
  setPlayers: (players) =>
    set({
      players: players
        .slice()
        .sort((a, b) => b.progress - a.progress || b.wpm - a.wpm || a.joined_at.localeCompare(b.joined_at))
    }),
  updatePlayer: (player) => {
    const players = get().players.filter((entry) => entry.id !== player.id);
    set({
      players: [...players, player].sort((a, b) => b.progress - a.progress || b.wpm - a.wpm)
    });
  },
  setDraftPrompt: (draftPrompt) => set({ draftPrompt }),
  regeneratePrompt: () => set({ draftPrompt: generateMongolianPrompt("medium", 34) }),
  setLastError: (lastError) => set({ lastError }),
  resetRace: () => set({ activeRace: null, players: [], lastError: null })
}));
