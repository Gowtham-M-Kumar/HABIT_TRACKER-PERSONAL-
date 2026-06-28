-- ─────────────────────────────────────────────────────────────────────────────
-- HABIT TRACKER — Supabase Schema
-- Run this once in your Supabase project SQL Editor (Database → SQL Editor)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Habits ───────────────────────────────────────────────────────────────────
create table if not exists public.habits (
  id           text primary key,              -- client-generated UUID
  user_id      uuid references auth.users(id) on delete cascade not null,
  name         text not null,
  color        text not null default '#A8D8EA',
  goal         integer not null default 21,
  icon_emoji   text not null default '⭐',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  active       boolean default true,
  completed    boolean default false,
  due_date     date,
  sort_order   integer default 0
);

-- ── Completion Logs ───────────────────────────────────────────────────────────
create table if not exists public.completion_logs (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references auth.users(id) on delete cascade not null,
  habit_id  text references public.habits(id) on delete cascade not null,
  year      integer not null,
  month     integer not null,
  day       integer not null,
  completed boolean default false,
  unique (user_id, habit_id, year, month, day)
);

-- ── User Profiles ─────────────────────────────────────────────────────────────
create table if not exists public.user_profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  name             text default '',
  affirmation_text text default '',
  photo_url        text default '',
  created_at       timestamptz default now()
);

-- ── User Settings ─────────────────────────────────────────────────────────────
create table if not exists public.user_settings (
  id                uuid primary key references auth.users(id) on delete cascade,
  dark_mode         boolean default false,
  accent_color      text default '#F4A0B8',
  show_weekends     boolean default true,
  start_day_of_week integer default 1,
  app_version       text default '1.0.0'
);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table public.habits         enable row level security;
alter table public.completion_logs enable row level security;
alter table public.user_profiles   enable row level security;
alter table public.user_settings   enable row level security;

-- Habits: users can only see/edit their own habits
create policy "habits_user_isolation" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Logs: users can only see/edit their own logs
create policy "logs_user_isolation" on public.completion_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Profiles: users can only see/edit their own profile
create policy "profiles_user_isolation" on public.user_profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Settings: users can only see/edit their own settings
create policy "settings_user_isolation" on public.user_settings
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- ── Auto-create profile & settings on signup ──────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id, name)
    values (new.id, coalesce(new.raw_user_meta_data->>'name', ''))
    on conflict (id) do nothing;
  insert into public.user_settings (id)
    values (new.id)
    on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Indexes for performance ───────────────────────────────────────────────────
create index if not exists idx_habits_user_id      on public.habits(user_id);
create index if not exists idx_logs_user_id        on public.completion_logs(user_id);
create index if not exists idx_logs_habit_id       on public.completion_logs(habit_id);
create index if not exists idx_logs_year_month     on public.completion_logs(user_id, year, month);
