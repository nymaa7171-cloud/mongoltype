"use client";

import { motion } from "framer-motion";
import { Chrome, KeyRound, Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const redirectTo =
    typeof window === "undefined" ? undefined : `${window.location.origin}/onboarding/`;

  async function handleEmailAuth() {
    if (!isSupabaseConfigured) {
      setMessage("Add Supabase env keys first. The UI is ready; realtime auth needs your project URL and anon key.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
            data: {
              username
            }
          }
        });

        if (error) {
          throw error;
        }

        setMessage("Check your email to confirm, then finish your profile.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }

        router.push("/dashboard");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleAuth() {
    if (!isSupabaseConfigured) {
      setMessage("Configure Supabase first, then Google OAuth will redirect through `/onboarding/`.");
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo
      }
    });
  }

  return (
    <AppShell>
      <div className="container grid min-h-[calc(100vh-4rem)] items-center gap-8 py-10 lg:grid-cols-[1fr_460px]">
        <section className="max-w-3xl">
          <Badge variant="blue">Supabase Auth</Badge>
          <motion.h1
            className="mt-5 text-5xl font-black tracking-normal text-white md:text-7xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Race under your own handle.
          </motion.h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Email, Google OAuth, username creation, avatar profiles, protected routes, and live synced identity are wired for Supabase.
          </p>
        </section>

        <Card className="p-5">
          <div className="flex rounded-md border border-white/10 bg-black/30 p-1">
            <button
              className={`focus-ring h-10 flex-1 rounded text-sm font-bold transition ${mode === "login" ? "bg-white/10 text-white" : "text-muted-foreground"}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`focus-ring h-10 flex-1 rounded text-sm font-bold transition ${mode === "signup" ? "bg-white/10 text-white" : "text-muted-foreground"}`}
              onClick={() => setMode("signup")}
            >
              Signup
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {mode === "signup" && (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white">Username</span>
                <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="temuulen" />
              </label>
            )}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">Email</span>
              <Input value={email} type="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">Password</span>
              <Input value={password} type="password" onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
            </label>
          </div>

          {message && <p className="mt-4 rounded-md border border-neon-blue/20 bg-neon-blue/10 p-3 text-sm text-neon-blue">{message}</p>}

          <div className="mt-5 grid gap-3">
            <Button onClick={handleEmailAuth} disabled={busy}>
              {mode === "login" ? <KeyRound className="size-4" /> : <UserPlus className="size-4" />}
              {mode === "login" ? "Login with email" : "Create account"}
            </Button>
            <Button variant="secondary" onClick={handleGoogleAuth}>
              <Chrome className="size-4" />
              Continue with Google
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">
                <Mail className="size-4" />
                Explore demo arena
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
