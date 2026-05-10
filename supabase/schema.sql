-- ============================================================
-- LeetCode Prep Tracker — Supabase Schema
-- Paste this entire file into Supabase > SQL Editor > Run
-- ============================================================

-- Questions table
create table if not exists questions (
  id                      uuid primary key default gen_random_uuid(),
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

-- Cheat sheets table (one row per topic, upserted)
create table if not exists cheat_sheets (
  id                 uuid primary key default gen_random_uuid(),
  topic              text not null unique check (topic in (
    'Arrays','Strings','HashMaps','Two Pointers','Sliding Window',
    'Binary Search','Linked Lists','Stacks','Queues','Trees',
    'Heaps','Graphs','Backtracking','Dynamic Programming',
    'Tries','Intervals','Greedy','Bit Manipulation'
  )),
  raw_notes          text not null default '',
  formatted_markdown text,
  last_edited        timestamptz default now()
);

-- Plan table (one row per day)
create table if not exists plan (
  id                  uuid primary key default gen_random_uuid(),
  date                date not null unique,
  assigned_questions  jsonb not null default '[]',
  revision_items      jsonb not null default '[]',
  status              text not null default 'On Track' check (status in (
    'On Track','Behind','Ahead','Exam Mode','Rest Day'
  )),
  manually_modified   boolean not null default false
);

-- Settings table (key-value store)
create table if not exists settings (
  id    uuid primary key default gen_random_uuid(),
  key   text not null unique,
  value text not null
);

-- Badges table
create table if not exists badges (
  id         uuid primary key default gen_random_uuid(),
  badge_key  text not null unique,
  earned_at  timestamptz default now()
);

-- Snippets table
create table if not exists snippets (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  content_markdown   text not null default '',
  created_at         timestamptz default now(),
  touch_number       integer not null default 1 check (touch_number in (1, 2, 3)),
  next_review_date   date
);

-- ============================================================
-- Default settings
-- ============================================================
insert into settings (key, value) values
  ('timer_duration',       '20'),
  ('revision_preference',  'Let AI decide'),
  ('exam_start',           '2026-12-01'),
  ('exam_end',             '2026-12-31'),
  ('daily_target_normal',  '2'),
  ('daily_target_exam',    '1'),
  ('daily_target_holiday', '4'),
  ('sound_enabled',        'true')
on conflict (key) do nothing;

-- ============================================================
-- Row Level Security (open for single-user personal use)
-- Enable RLS but allow all operations via anon key
-- ============================================================
alter table questions    enable row level security;
alter table cheat_sheets enable row level security;
alter table plan         enable row level security;
alter table settings     enable row level security;
alter table badges       enable row level security;
alter table snippets     enable row level security;

create policy "allow all questions"    on questions    for all using (true) with check (true);
create policy "allow all cheat_sheets" on cheat_sheets for all using (true) with check (true);
create policy "allow all plan"         on plan         for all using (true) with check (true);
create policy "allow all settings"     on settings     for all using (true) with check (true);
create policy "allow all badges"       on badges       for all using (true) with check (true);
create policy "allow all snippets"     on snippets     for all using (true) with check (true);
