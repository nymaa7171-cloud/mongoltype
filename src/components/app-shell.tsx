"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Bolt,
  CalendarCheck,
  Crown,
  Keyboard,
  LogIn,
  LogOut,
  RadioTower,
  Swords,
  User
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { useUserStore } from "@/lib/stores/use-user-store";

const navItems = [
  { href: "/", label: "Arena", icon: Keyboard },
  { href: "/race", label: "Race", icon: Swords },
  { href: "/leaderboard", label: "Ranks", icon: Crown },
  { href: "/missions", label: "Daily", icon: CalendarCheck },
  { href: "/profile", label: "Profile", icon: User }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const session = useUserStore((state) => state.session);
  const onlineUsers = useUserStore((state) => state.onlineUsers);
  const setSession = useUserStore((state) => state.setSession);
  const setProfile = useUserStore((state) => state.setProfile);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    router.push("/");
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/[0.35] backdrop-blur-2xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              className="grid size-9 place-items-center rounded-md border border-neon-green/30 bg-neon-green/10 shadow-glow"
              whileHover={{ rotate: -6, scale: 1.04 }}
            >
              <Bolt className="size-5 text-neon-green" />
            </motion.div>
            <div className="leading-none">
              <div className="text-base font-black tracking-normal text-white">MongolType</div>
              <div className="mt-1 hidden text-[10px] uppercase tracking-[0.28em] text-muted-foreground sm:block">
                Cyrillic speed lab
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "focus-ring inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:bg-white/[0.07] hover:text-white",
                    active && "bg-white/[0.09] text-white"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Badge variant="blue" className="hidden gap-2 sm:inline-flex">
              <RadioTower className="size-3.5" />
              {isSupabaseConfigured ? `${onlineUsers} live` : "demo"}
            </Badge>
            {session ? (
              <>
                <Link href="/profile" className="hidden items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] p-1 pr-3 md:flex">
                  <Avatar className="size-8">
                    <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.username ?? "Profile"} />
                    <AvatarFallback>{profile?.username?.slice(0, 2).toUpperCase() ?? "MT"}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold text-white">{profile?.username ?? "Player"}</span>
                </Link>
                <Button size="icon" variant="ghost" onClick={signOut} aria-label="Sign out">
                  <LogOut className="size-4" />
                </Button>
              </>
            ) : (
              <Button asChild size="sm" variant="secondary">
                <Link href="/auth">
                  <LogIn className="size-4" />
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {children}

      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-lg border border-white/10 bg-black/70 p-1 backdrop-blur-2xl lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "focus-ring flex h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold text-muted-foreground transition",
                active && "bg-white/[0.09] text-neon-green"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
