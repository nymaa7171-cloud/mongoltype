"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Copy, Play, Radio, RefreshCcw, Search, Sparkles, Trophy, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CountdownRing } from "@/components/race/countdown-ring";
import { RacerRow } from "@/components/race/racer-row";
import { KeyboardVisualizer } from "@/components/typing/keyboard-visualizer";
import TypingText from "../typing/typing-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import type { Difficulty, Race, RacePlayer } from "@/lib/supabase/database.types";
import { useRaceStore } from "@/lib/stores/use-race-store";
import { useUserStore } from "@/lib/stores/use-user-store";
import { evaluateTyping, wordCount } from "@/lib/typing/engine";
import { difficultyLabel, generateMongolianPrompt, splitGlyphs } from "@/lib/typing/mongolian";
import { calculateRaceXp } from "@/lib/xp";
import { clamp, createRoomCode, formatNumber } from "@/lib/utils";

export function RaceRoom() {
  const session = useUserStore((state) => state.session);
  const profile = useUserStore((state) => state.profile);
  const activeRace = useRaceStore((state) => state.activeRace);
  const players = useRaceStore((state) => state.players);
  const draftPrompt = useRaceStore((state) => state.draftPrompt);
  const setActiveRace = useRaceStore((state) => state.setActiveRace);
  const setPlayers = useRaceStore((state) => state.setPlayers);
  const updatePlayer = useRaceStore((state) => state.updatePlayer);
  const regeneratePrompt = useRaceStore((state) => state.regeneratePrompt);
  
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [localInput, setLocalInput] = useState("");
  const [lastWrong, setLastWrong] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [victory, setVictory] = useState(false);
  const completionRef = useRef(false);
  const userId = session?.user.id ?? "demo-user";
  const username = profile?.username ?? session?.user.email?.split("@")[0] ?? "DemoTypist";
  const avatarUrl = profile?.avatar_url ?? null;
  const me = players.find((player) => player.user_id === userId);
  const snapshot = useMemo(
    () => evaluateTyping(activeRace?.prompt ?? draftPrompt, localInput, startedAt),
    [activeRace?.prompt, draftPrompt, localInput, startedAt]
  );
  const sortedPlayers = players.slice().sort((a, b) => b.progress - a.progress || b.wpm - a.wpm);
  const canHost = activeRace?.host_id === userId || !isSupabaseConfigured;
  const allReady = players.length > 0 && players.every((player) => player.ready);
  const raceLive = activeRace?.status === "live";
  const raceWaiting = !activeRace || activeRace.status === "waiting";

  const joinPlayer = useCallback(
    async (race: Race) => {
      const playerPayload = {
        race_id: race.id,
        user_id: userId,
        username,
        avatar_url: avatarUrl,
        ready: false,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        combo: 0
      };

      if (!isSupabaseConfigured) {
        const demoPlayer = {
          id: "demo-player",
          rank: null,
          finished_at: null,
          updated_at: new Date().toISOString(),
          joined_at: new Date().toISOString(),
          ...playerPayload
        } satisfies RacePlayer;
        setPlayers([demoPlayer, createDemoOpponent(race.id, "Саруул", 37), createDemoOpponent(race.id, "Тэмүүлэн", 18)]);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from("race_players")
        .upsert(playerPayload as any, { onConflict: "race_id,user_id" })
        .select("*");

      if (error) {
        throw error;
      }

      if (data) {
        setPlayers(data);
      }
    },
    [avatarUrl, setPlayers, userId, username]
  );

  async function createRoom() {
    setBusy(true);
    completionRef.current = false;
    setVictory(false);
    setLocalInput("");
    setStartedAt(null);

    try {
      const roomCode = createRoomCode();
      const prompt = difficulty === "medium" ? draftPrompt : generateMongolianPrompt(difficulty, difficulty === "expert" ? 1 : 34);

      if (!isSupabaseConfigured) {
        const demoRace = {
          id: "demo-race",
          room_code: roomCode,
          host_id: userId,
          prompt,
          difficulty,
          status: "waiting",
          countdown_started_at: null,
          started_at: null,
          finished_at: null,
          winner_id: null,
          max_players: 6,
          created_at: new Date().toISOString()
        } satisfies Race;
        setActiveRace(demoRace);
        await joinPlayer(demoRace);
        return;
      }

      const { data, error } = await supabase
        .from("races")
        .insert({
          room_code: roomCode,
          host_id: userId,
          prompt,
          difficulty,
          status: "waiting",
          max_players: 6
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      setActiveRace(data);
      await joinPlayer(data);
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom() {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      return;
    }

    setBusy(true);
    try {
      if (!isSupabaseConfigured) {
        await createRoom();
        return;
      }

      const { data, error } = await supabase
        .from("races")
        .select("*")
        .eq("room_code", code)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setActiveRace(data);
        await joinPlayer(data);
      }
    } finally {
      setBusy(false);
    }
  }

  async function toggleReady() {
    if (!activeRace || !me) {
      return;
    }

    const nextReady = !me.ready;
    updatePlayer({ ...me, ready: nextReady, updated_at: new Date().toISOString() });

    if (!isSupabaseConfigured) {
      setPlayers(players.map((player) => ({ ...player, ready: player.user_id === userId ? nextReady : true })));
      return;
    }

    await supabase.from("race_players").update({ ready: nextReady }).eq("id", me.id);
  }

  async function startCountdown() {
    if (!activeRace || !canHost) {
      return;
    }

    const now = new Date().toISOString();

    if (!isSupabaseConfigured) {
      setActiveRace({ ...activeRace, status: "countdown", countdown_started_at: now });
      return;
    }

    await supabase
      .from("races")
      .update({
        status: "countdown",
        countdown_started_at: now
      })
      .eq("id", activeRace.id);
  }

  const setRaceLive = useCallback(async () => {
    if (!activeRace || activeRace.status === "live") {
      return;
    }

    const now = new Date().toISOString();

    if (!isSupabaseConfigured) {
      setActiveRace({ ...activeRace, status: "live", started_at: now });
      setStartedAt(Date.now());
      return;
    }

    if (canHost) {
      await supabase.from("races").update({ status: "live", started_at: now }).eq("id", activeRace.id);
    }
  }, [activeRace, canHost, setActiveRace]);

  async function updateProgress(nextInput: string) {
    if (!activeRace || !me || activeRace.status !== "live") {
      return;
    }

    const targetGlyphs = splitGlyphs(activeRace.prompt);
    const glyphs = splitGlyphs(nextInput).slice(0, targetGlyphs.length);
    const next = glyphs.join("");
    const index = glyphs.length - 1;
    const correct = index < 0 || targetGlyphs[index] === glyphs[index];

    if (!startedAt && next.length > 0) {
      setStartedAt(Date.now());
    }

    setLocalInput(next);
    setLastWrong(correct ? "" : glyphs[index] ?? "");

    const nextSnapshot = evaluateTyping(activeRace.prompt, next, startedAt ?? Date.now());
    const patch = {
      progress: nextSnapshot.progress,
      wpm: nextSnapshot.wpm,
      accuracy: nextSnapshot.accuracy,
      combo: nextSnapshot.combo,
      updated_at: new Date().toISOString(),
      finished_at: nextSnapshot.completed ? new Date().toISOString() : null
    };

    updatePlayer({ ...me, ...patch });

    if (!isSupabaseConfigured) {
      const nextPlayers = players.map((player) => (player.id === me.id ? { ...me, ...patch } : player));
      setPlayers(updateDemoOpponents(nextPlayers, activeRace.id, nextSnapshot.progress));
    } else {
      await supabase.from("race_players").update(patch).eq("id", me.id);
    }

    if (nextSnapshot.completed && !completionRef.current) {
      completionRef.current = true;
      await completeRace(nextSnapshot.wpm, nextSnapshot.accuracy, nextSnapshot.mistakes);
    }
  }

  async function completeRace(wpm: number, accuracy: number, mistakes: number) {
    if (!activeRace) {
      return;
    }

    const placement = players.filter((player) => player.finished_at).length + 1;
    const won = placement === 1;
    const xp = calculateRaceXp({ wpm, accuracy, won, streak: snapshot.combo });
    setVictory(won);

    if (!isSupabaseConfigured) {
      return;
    }

    await supabase.rpc("complete_race_result", {
      race_id_input: activeRace.id,
      user_id_input: userId,
      placement_input: placement,
      wpm_input: wpm,
      accuracy_input: accuracy,
      words_typed_input: wordCount(activeRace.prompt),
      mistakes_input: mistakes,
      xp_input: xp.total
    });
  }

  useEffect(() => {
    if (!activeRace || !isSupabaseConfigured) {
      return;
    }

    const channel = supabase
      .channel(`race:${activeRace.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "races", filter: `id=eq.${activeRace.id}` },
        (payload) => setActiveRace(payload.new as Race)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "race_players", filter: `race_id=eq.${activeRace.id}` },
        async () => {
          const { data } = await supabase.from("race_players").select("*").eq("race_id", activeRace.id);
          setPlayers(data ?? []);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [activeRace, setActiveRace, setPlayers]);

  useEffect(() => {
    if (!activeRace || activeRace.status !== "countdown" || !activeRace.countdown_started_at) {
      setCountdown(0);
      return;
    }

    const started = new Date(activeRace.countdown_started_at).getTime();
    const interval = window.setInterval(() => {
      const remaining = clamp(3 - Math.floor((Date.now() - started) / 1000), 0, 3);
      setCountdown(remaining);
      if (remaining <= 0) {
        window.clearInterval(interval);
        void setRaceLive();
      }
    }, 150);

    return () => window.clearInterval(interval);
  }, [activeRace, setRaceLive]);

  return (
    <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neon-blue">Realtime room</p>
            <h2 className="mt-2 text-2xl font-black text-white">Race control</h2>
          </div>
          <Badge variant={activeRace ? "default" : "muted"}>{activeRace?.status ?? "idle"}</Badge>
        </div>

        <div className="mt-5 space-y-3">
          <Button className="w-full" onClick={createRoom} disabled={busy}>
            <Radio className="size-4" />
            Create room
          </Button>
          <div className="flex gap-2">
            <Input value={joinCode} onChange={(event) => setJoinCode(event.target.value)} placeholder="ROOM CODE" />
            <Button size="icon" variant="secondary" onClick={joinRoom} disabled={busy} aria-label="Join room">
              <Search className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-white/10 bg-black/25 p-4">
          <div className="flex flex-wrap gap-2">
            {(["easy", "medium", "hard", "expert"] as Difficulty[]).map((entry) => (
              <Button key={entry} size="sm" variant={difficulty === entry ? "default" : "secondary"} onClick={() => setDifficulty(entry)}>
                {difficultyLabel(entry)}
              </Button>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{draftPrompt}</p>
          <Button className="mt-4" size="sm" variant="ghost" onClick={regeneratePrompt}>
            <RefreshCcw className="size-4" />
            New text
          </Button>
        </div>

        {activeRace && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.045] p-3">
              <div>
                <p className="text-xs text-muted-foreground">Room code</p>
                <p className="text-2xl font-black tracking-[0.18em] text-white">{activeRace.room_code}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => void navigator.clipboard?.writeText(activeRace.room_code)}
                aria-label="Copy room code"
              >
                <Copy className="size-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant={me?.ready ? "outline" : "secondary"} onClick={toggleReady}>
                <Users className="size-4" />
                {me?.ready ? "Ready" : "Ready up"}
              </Button>
              <Button onClick={startCountdown} disabled={!canHost || !allReady || activeRace.status !== "waiting"}>
                <Play className="size-4" />
                Start
              </Button>
            </div>
          </div>
        )}
      </Card>

      <section className="space-y-5">
        <Card className="relative overflow-hidden p-5">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-green to-transparent" />
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="blue">{activeRace ? difficultyLabel(activeRace.difficulty) : "Waiting"}</Badge>
                <Badge variant="purple">{activeRace ? `${wordCount(activeRace.prompt)} words` : "Live sync"}</Badge>
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-normal text-white md:text-5xl">Neon race lane</h1>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md border border-white/10 bg-black/25 p-3">
                <p className="text-xs text-muted-foreground">WPM</p>
                <p className="text-2xl font-black text-white">{snapshot.wpm}</p>
              </div>
              <div className="rounded-md border border-white/10 bg-black/25 p-3">
                <p className="text-xs text-muted-foreground">ACC</p>
                <p className="text-2xl font-black text-white">{formatNumber(snapshot.accuracy, 0)}%</p>
              </div>
              <div className="rounded-md border border-white/10 bg-black/25 p-3">
                <p className="text-xs text-muted-foreground">COMBO</p>
                <p className="text-2xl font-black text-white">{snapshot.combo}</p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <Progress value={snapshot.progress} />
          </div>

          <div className="mt-5">
            <TypingText target={activeRace?.prompt ?? draftPrompt} input={localInput} />
          </div>

          <textarea
            value={localInput}
            onChange={(event) => void updateProgress(event.target.value)}
            disabled={!raceLive}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="focus-ring mt-4 min-h-24 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-4 font-mono text-lg text-white shadow-inner shadow-black/40 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={raceLive ? "Уралдаан эхэллээ..." : "Ready хийж countdown хүлээнэ үү"}
          />

          <div className="mt-5">
            <KeyboardVisualizer activeGlyph={snapshot.currentGlyph} lastWrong={lastWrong} />
          </div>

          <AnimatePresence>
            {countdown > 0 && (
              <motion.div className="absolute inset-0 grid place-items-center bg-black/[0.55] backdrop-blur-sm" exit={{ opacity: 0 }}>
                <CountdownRing value={countdown} />
              </motion.div>
            )}
            {victory && (
              <motion.div
                className="absolute inset-0 grid place-items-center bg-black/70 p-6 text-center backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div initial={{ scale: 0.86, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md">
                  <Trophy className="mx-auto size-16 text-neon-green" />
                  <h2 className="mt-4 text-4xl font-black text-white">Victory</h2>
                  <p className="mt-2 text-muted-foreground">XP gained, leaderboard synced, streak protected.</p>
                  <Button className="mt-5" onClick={() => setVictory(false)}>
                    <Sparkles className="size-4" />
                    Continue
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <div className="grid gap-3">
          <AnimatePresence>
            {sortedPlayers.map((player, index) => (
              <RacerRow key={player.id} player={player} leader={index === 0} />
            ))}
          </AnimatePresence>
          {raceWaiting && !activeRace && (
            <div className="rounded-lg border border-dashed border-white/15 p-8 text-center text-muted-foreground">
              Create or join a room to light up the race lane.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function createDemoOpponent(raceId: string, username: string, progress: number): RacePlayer {
  return {
    id: `${raceId}-${username}`,
    race_id: raceId,
    user_id: username,
    username,
    avatar_url: null,
    ready: true,
    progress,
    wpm: Math.round(45 + progress / 2),
    accuracy: 93 + progress / 20,
    rank: null,
    finished_at: null,
    combo: Math.round(progress / 4),
    updated_at: new Date().toISOString(),
    joined_at: new Date().toISOString()
  };
}

function updateDemoOpponents(players: RacePlayer[], raceId: string, userProgress: number) {
  return players.map((player) => {
    if (player.user_id === "demo-user") {
      return player;
    }

    const progress = clamp(player.progress + Math.random() * 4 + (userProgress > 70 ? 1.2 : 0.3), 0, 100);

    return {
      ...player,
      progress,
      wpm: Math.round(42 + progress / 1.5),
      accuracy: clamp(player.accuracy - Math.random() * 0.2, 88, 99.8),
      combo: player.combo + 1,
      finished_at: progress >= 100 ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
      race_id: raceId
    };
  });
}