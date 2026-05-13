-- ============================================================
-- LeetCode Prep Tracker — Multi-User Supabase Schema
-- Paste this entire file into Supabase > SQL Editor > Run
-- ============================================================

-- Questions table
create table if not exists questions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null default auth.uid() references auth.users(id),
  name                    text not null,
  slug                    text,
  difficulty              text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  topic                   text not null check (topic in (
    'Arrays','Strings','HashMaps','Two Pointers','Sliding Window',
    'Binary Search','Linked Lists','Stacks','Queues','Trees',
    'Heaps','Graphs','Backtracking','Dynamic Programming',
    'Tries','Intervals','Greedy','Bit Manipulation'
  )),
  result                  text not null check (result in ('Solved', 'Hint', 'Stuck')),
  date_logged             date not null default current_date,
  touch_number            integer not null default 1 check (touch_number in (1, 2, 3)),
  next_review_date        date,
  notes                   text,
  flashcard_touch         integer default 1,
  flashcard_next_review   date,
  xp_awarded              integer not null default 0,
  created_at              timestamptz default now()
);

-- Cheat sheets table (one row per topic per user)
create table if not exists cheat_sheets (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users(id),
  topic              text not null check (topic in (
    'Arrays','Strings','HashMaps','Two Pointers','Sliding Window',
    'Binary Search','Linked Lists','Stacks','Queues','Trees',
    'Heaps','Graphs','Backtracking','Dynamic Programming',
    'Tries','Intervals','Greedy','Bit Manipulation'
  )),
  raw_notes          text not null default '',
  formatted_markdown text,
  last_edited        timestamptz default now(),
  unique (user_id, topic)
);

-- Plan table (one row per day per user)
create table if not exists plan (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null default auth.uid() references auth.users(id),
  date                date not null,
  assigned_questions  jsonb not null default '[]',
  revision_items      jsonb not null default '[]',
  status              text not null default 'On Track' check (status in (
    'On Track','Behind','Ahead','Exam Mode','Rest Day'
  )),
  manually_modified   boolean not null default false,
  unique (user_id, date)
);

-- Settings table (key-value store per user)
create table if not exists settings (
  id    uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  key   text not null,
  value text not null,
  unique (user_id, key)
);

-- Badges table (per user)
create table if not exists badges (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id),
  badge_key  text not null,
  earned_at  timestamptz default now(),
  unique (user_id, badge_key)
);

-- Snippets table (per user)
create table if not exists snippets (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users(id),
  title              text not null,
  content_markdown   text not null default '',
  created_at         timestamptz default now(),
  touch_number       integer not null default 1 check (touch_number in (1, 2, 3)),
  next_review_date   date
);

-- ============================================================
-- Indexes on user_id for performance
-- ============================================================
create index if not exists idx_questions_user    on questions (user_id);
create index if not exists idx_cheat_sheets_user on cheat_sheets (user_id);
create index if not exists idx_plan_user         on plan (user_id);
create index if not exists idx_settings_user     on settings (user_id);
create index if not exists idx_badges_user       on badges (user_id);
create index if not exists idx_snippets_user     on snippets (user_id);

-- ============================================================
-- Row Level Security — each user can only access their own data
-- ============================================================
alter table questions    enable row level security;
alter table cheat_sheets enable row level security;
alter table plan         enable row level security;
alter table settings     enable row level security;
alter table badges       enable row level security;
alter table snippets     enable row level security;

create policy "user owns questions"    on questions    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user owns cheat_sheets" on cheat_sheets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user owns plan"         on plan         for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user owns settings"     on settings     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user owns badges"       on badges       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user owns snippets"     on snippets     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);