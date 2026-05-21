-- MongolType Supabase schema
-- Run in Supabase SQL editor after creating the project.

create extension if not exists pgcrypto;

do $$ begin
  create type public.difficulty as enum ('easy', 'medium', 'hard', 'expert');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.race_status as enum ('waiting', 'countdown', 'live', 'finished', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.match_result as enum ('win', 'podium', 'finished');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 24),
  display_name text,
  avatar_url text,
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  title text not null default 'Шинэхэн',
  profile_glow text not null default 'neon-green',
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  best_wpm integer not null default 0,
  best_accuracy numeric(5,2) not null default 0,
  races_won integer not null default 0,
  races_played integer not null default 0,
  words_typed integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.races (
  id uuid primary key default gen_random_uuid(),
  room_code text not null,
  host_id uuid not null references public.profiles(id) on delete cascade,
  prompt text not null,
  difficulty public.difficulty not null default 'medium',
  status public.race_status not null default 'waiting',
  countdown_started_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  winner_id uuid references public.profiles(id) on delete set null,
  max_players integer not null default 6 check (max_players between 2 and 12),
  created_at timestamptz not null default now()
);

create table if not exists public.race_players (
  id uuid primary key default gen_random_uuid(),
  race_id uuid not null references public.races(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  username text not null,
  avatar_url text,
  ready boolean not null default false,
  progress numeric(5,2) not null default 0 check (progress between 0 and 100),
  wpm integer not null default 0 check (wpm >= 0),
  accuracy numeric(5,2) not null default 100 check (accuracy between 0 and 100),
  rank integer,
  finished_at timestamptz,
  combo integer not null default 0,
  updated_at timestamptz not null default now(),
  joined_at timestamptz not null default now(),
  unique (race_id, user_id)
);

create table if not exists public.typing_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  race_id uuid references public.races(id) on delete set null,
  prompt text not null,
  difficulty public.difficulty not null,
  wpm integer not null check (wpm >= 0),
  accuracy numeric(5,2) not null check (accuracy between 0 and 100),
  words_typed integer not null check (words_typed >= 0),
  mistakes integer not null check (mistakes >= 0),
  xp_earned integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  xp_reward integer not null default 0,
  icon text not null default 'Trophy',
  created_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

create table if not exists public.daily_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mission_key text not null,
  title text not null,
  target integer not null check (target > 0),
  progress integer not null default 0 check (progress >= 0),
  xp_reward integer not null default 0,
  completed boolean not null default false,
  mission_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, mission_date, mission_key)
);

create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  username text not null,
  avatar_url text,
  highest_wpm integer not null default 0,
  highest_accuracy numeric(5,2) not null default 0,
  highest_level integer not null default 1,
  longest_streak integer not null default 0,
  races_won integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.match_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  race_id uuid not null references public.races(id) on delete cascade,
  placement integer not null check (placement > 0),
  wpm integer not null check (wpm >= 0),
  accuracy numeric(5,2) not null check (accuracy between 0 and 100),
  xp_earned integer not null default 0,
  result public.match_result not null default 'finished',
  created_at timestamptz not null default now(),
  unique (user_id, race_id)
);

create index if not exists profiles_username_idx on public.profiles using btree (lower(username));
create index if not exists races_room_code_idx on public.races (room_code, created_at desc);
create index if not exists races_status_idx on public.races (status, created_at desc);
create index if not exists race_players_race_progress_idx on public.race_players (race_id, progress desc, wpm desc);
create index if not exists race_players_user_idx on public.race_players (user_id, joined_at desc);
create index if not exists typing_stats_user_created_idx on public.typing_stats (user_id, created_at desc);
create index if not exists leaderboard_wpm_idx on public.leaderboard (highest_wpm desc);
create index if not exists leaderboard_accuracy_idx on public.leaderboard (highest_accuracy desc);
create index if not exists leaderboard_level_idx on public.leaderboard (highest_level desc);
create index if not exists leaderboard_streak_idx on public.leaderboard (longest_streak desc);
create index if not exists missions_user_date_idx on public.daily_missions (user_id, mission_date);
create index if not exists match_history_user_created_idx on public.match_history (user_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists race_players_touch_updated_at on public.race_players;
create trigger race_players_touch_updated_at
before update on public.race_players
for each row execute function public.touch_updated_at();

create or replace function public.level_from_xp(xp_input integer)
returns integer
language plpgsql
immutable
as $$
declare
  next_level integer := 1;
begin
  while xp_input >= round(450 * power(next_level, 1.42)) loop
    next_level := next_level + 1;
  end loop;

  return greatest(next_level, 1);
end;
$$;

create or replace function public.level_title(level_input integer)
returns text
language sql
immutable
as $$
  select case
    when level_input >= 50 then 'Keyboard Master'
    when level_input >= 25 then 'Төмөр хуруу'
    when level_input >= 10 then 'Хурдан гар'
    else 'Шинэхэн'
  end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
begin
  base_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1), 'typist');
  base_username := regexp_replace(lower(base_username), '[^a-z0-9_]', '_', 'g');
  base_username := left(base_username, 20) || substr(new.id::text, 1, 4);

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    base_username,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.leaderboard (user_id, username, avatar_url)
  values (new.id, base_username, new.raw_user_meta_data->>'avatar_url')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.seed_daily_missions(user_id_input uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or auth.uid() <> user_id_input then
    raise exception 'Not allowed';
  end if;

  insert into public.daily_missions (user_id, mission_key, title, target, xp_reward, mission_date)
  values
    (user_id_input, 'words-500', 'type 500 words', 500, 350, current_date),
    (user_id_input, 'win-3', 'win 3 races', 3, 500, current_date),
    (user_id_input, 'accuracy-95', 'reach 95% accuracy', 95, 420, current_date),
    (user_id_input, 'streak-10', 'maintain streak', 10, 300, current_date)
  on conflict (user_id, mission_date, mission_key) do nothing;
end;
$$;

create or replace function public.unlock_achievement(user_id_input uuid, slug_input text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  achievement_id_input uuid;
begin
  select id into achievement_id_input from public.achievements where slug = slug_input;

  if achievement_id_input is not null then
    insert into public.user_achievements (user_id, achievement_id)
    values (user_id_input, achievement_id_input)
    on conflict do nothing;
  end if;
end;
$$;

create or replace function public.complete_race_result(
  race_id_input uuid,
  user_id_input uuid,
  placement_input integer,
  wpm_input integer,
  accuracy_input numeric,
  words_typed_input integer,
  mistakes_input integer,
  xp_input integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  race_record public.races%rowtype;
  new_xp integer;
  new_level integer;
  profile_words integer;
  profile_streak integer;
  profile_current_streak integer;
  won boolean := placement_input = 1;
begin
  if auth.uid() is null or auth.uid() <> user_id_input then
    raise exception 'Not allowed';
  end if;

  select * into race_record from public.races where id = race_id_input;
  if race_record.id is null then
    raise exception 'Race not found';
  end if;

  update public.race_players
  set
    progress = 100,
    wpm = wpm_input,
    accuracy = accuracy_input,
    rank = placement_input,
    finished_at = coalesce(finished_at, now())
  where race_id = race_id_input and user_id = user_id_input;

  insert into public.typing_stats (
    user_id,
    race_id,
    prompt,
    difficulty,
    wpm,
    accuracy,
    words_typed,
    mistakes,
    xp_earned
  )
  values (
    user_id_input,
    race_id_input,
    race_record.prompt,
    race_record.difficulty,
    wpm_input,
    accuracy_input,
    words_typed_input,
    mistakes_input,
    xp_input
  );

  insert into public.match_history (user_id, race_id, placement, wpm, accuracy, xp_earned, result)
  values (
    user_id_input,
    race_id_input,
    placement_input,
    wpm_input,
    accuracy_input,
    xp_input,
    case when placement_input = 1 then 'win'::public.match_result when placement_input <= 3 then 'podium'::public.match_result else 'finished'::public.match_result end
  )
  on conflict (user_id, race_id) do update set
    placement = excluded.placement,
    wpm = excluded.wpm,
    accuracy = excluded.accuracy,
    xp_earned = excluded.xp_earned,
    result = excluded.result;

  update public.profiles
  set
    xp = xp + xp_input,
    races_played = races_played + 1,
    races_won = races_won + case when won then 1 else 0 end,
    words_typed = words_typed + words_typed_input,
    best_wpm = greatest(best_wpm, wpm_input),
    best_accuracy = greatest(best_accuracy, accuracy_input),
    longest_streak = greatest(longest_streak, case when won then current_streak + 1 else 0 end),
    current_streak = case when won then current_streak + 1 else 0 end
  where id = user_id_input
  returning xp into new_xp;

  new_level := public.level_from_xp(new_xp);

  update public.profiles
  set level = new_level, title = public.level_title(new_level)
  where id = user_id_input;

  select words_typed, longest_streak, current_streak
  into profile_words, profile_streak, profile_current_streak
  from public.profiles
  where id = user_id_input;

  insert into public.leaderboard (
    user_id,
    username,
    avatar_url,
    highest_wpm,
    highest_accuracy,
    highest_level,
    longest_streak,
    races_won
  )
  select
    id,
    username,
    avatar_url,
    best_wpm,
    best_accuracy,
    level,
    longest_streak,
    races_won
  from public.profiles
  where id = user_id_input
  on conflict (user_id) do update set
    username = excluded.username,
    avatar_url = excluded.avatar_url,
    highest_wpm = greatest(public.leaderboard.highest_wpm, excluded.highest_wpm),
    highest_accuracy = greatest(public.leaderboard.highest_accuracy, excluded.highest_accuracy),
    highest_level = greatest(public.leaderboard.highest_level, excluded.highest_level),
    longest_streak = greatest(public.leaderboard.longest_streak, excluded.longest_streak),
    races_won = excluded.races_won,
    updated_at = now();

  update public.daily_missions
  set progress = least(target, progress + words_typed_input), completed = progress + words_typed_input >= target
  where user_id = user_id_input and mission_date = current_date and mission_key = 'words-500';

  update public.daily_missions
  set progress = least(target, progress + case when won then 1 else 0 end), completed = progress + case when won then 1 else 0 end >= target
  where user_id = user_id_input and mission_date = current_date and mission_key = 'win-3';

  update public.daily_missions
  set progress = greatest(progress, floor(accuracy_input)::integer), completed = accuracy_input >= target
  where user_id = user_id_input and mission_date = current_date and mission_key = 'accuracy-95';

  update public.daily_missions
  set progress = greatest(progress, profile_current_streak), completed = profile_current_streak >= target
  where user_id = user_id_input and mission_date = current_date and mission_key = 'streak-10';

  if won then
    update public.races
    set winner_id = coalesce(winner_id, user_id_input)
    where id = race_id_input;
    perform public.unlock_achievement(user_id_input, 'first-win');
  end if;

  if profile_words >= 1000 then
    perform public.unlock_achievement(user_id_input, 'one-thousand-words');
  end if;

  if wpm_input >= 120 then
    perform public.unlock_achievement(user_id_input, 'one-twenty-wpm');
  end if;

  if accuracy_input = 100 then
    perform public.unlock_achievement(user_id_input, 'perfect-accuracy');
  end if;

  if profile_streak >= 10 then
    perform public.unlock_achievement(user_id_input, 'ten-win-streak');
  end if;
end;
$$;

insert into public.achievements (slug, name, description, xp_reward, icon)
values
  ('first-win', 'First Win', 'Win your first realtime race.', 250, 'Trophy'),
  ('one-thousand-words', '1000 Words Typed', 'Type 1000 Mongolian words across races and drills.', 500, 'Keyboard'),
  ('one-twenty-wpm', '120 WPM', 'Reach 120 WPM in a completed challenge.', 800, 'Zap'),
  ('perfect-accuracy', 'Perfect Accuracy', 'Finish a prompt with 100% accuracy.', 450, 'BadgeCheck'),
  ('ten-win-streak', '10 Win Streak', 'Win 10 races without breaking your streak.', 1200, 'Flame')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  xp_reward = excluded.xp_reward,
  icon = excluded.icon;

alter table public.profiles enable row level security;
alter table public.races enable row level security;
alter table public.race_players enable row level security;
alter table public.typing_stats enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.daily_missions enable row level security;
alter table public.leaderboard enable row level security;
alter table public.match_history enable row level security;

drop policy if exists "profiles are public" on public.profiles;
create policy "profiles are public" on public.profiles for select using (true);
drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "authenticated read races" on public.races;
create policy "authenticated read races" on public.races for select using (auth.role() = 'authenticated');
drop policy if exists "hosts create races" on public.races;
create policy "hosts create races" on public.races for insert with check (auth.uid() = host_id);
drop policy if exists "hosts update races" on public.races;
create policy "hosts update races" on public.races for update using (auth.uid() = host_id) with check (auth.uid() = host_id);

drop policy if exists "authenticated read race players" on public.race_players;
create policy "authenticated read race players" on public.race_players for select using (auth.role() = 'authenticated');
drop policy if exists "users join as themselves" on public.race_players;
create policy "users join as themselves" on public.race_players for insert with check (auth.uid() = user_id);
drop policy if exists "users update own race row" on public.race_players;
create policy "users update own race row" on public.race_players for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users read own stats" on public.typing_stats;
create policy "users read own stats" on public.typing_stats for select using (auth.uid() = user_id);
drop policy if exists "users insert own stats" on public.typing_stats;
create policy "users insert own stats" on public.typing_stats for insert with check (auth.uid() = user_id);

drop policy if exists "achievements are public" on public.achievements;
create policy "achievements are public" on public.achievements for select using (true);
drop policy if exists "users read own achievements" on public.user_achievements;
create policy "users read own achievements" on public.user_achievements for select using (auth.uid() = user_id);
drop policy if exists "users insert own achievements" on public.user_achievements;
create policy "users insert own achievements" on public.user_achievements for insert with check (auth.uid() = user_id);

drop policy if exists "users read own missions" on public.daily_missions;
create policy "users read own missions" on public.daily_missions for select using (auth.uid() = user_id);
drop policy if exists "users update own missions" on public.daily_missions;
create policy "users update own missions" on public.daily_missions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "leaderboard public read" on public.leaderboard;
create policy "leaderboard public read" on public.leaderboard for select using (true);
drop policy if exists "users insert own leaderboard" on public.leaderboard;
create policy "users insert own leaderboard" on public.leaderboard for insert with check (auth.uid() = user_id);
drop policy if exists "users update own leaderboard" on public.leaderboard;
create policy "users update own leaderboard" on public.leaderboard for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users read own match history" on public.match_history;
create policy "users read own match history" on public.match_history for select using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = true;

drop policy if exists "avatars are public" on storage.objects;
create policy "avatars are public" on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "users upload own avatars" on storage.objects;
create policy "users upload own avatars" on storage.objects for insert with check (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
drop policy if exists "users update own avatars" on storage.objects;
create policy "users update own avatars" on storage.objects for update using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);

alter table public.races replica identity full;
alter table public.race_players replica identity full;
alter table public.leaderboard replica identity full;
alter table public.daily_missions replica identity full;
alter table public.match_history replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.races;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.race_players;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.leaderboard;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.daily_missions;
exception when duplicate_object then null;
end $$;
