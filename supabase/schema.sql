-- ============================================================
-- PES Tournament — Supabase Schema
-- Run this in the Supabase SQL editor (once, on a fresh project)
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────────────
create extension if not exists "pgcrypto";


-- ─── Tables ──────────────────────────────────────────────────────────

-- Players (12 total, created by admin)
create table players (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  badge_url     text,
  primary_color text not null default '#ffffff',
  created_at    timestamptz not null default now(),
  constraint players_name_nonempty check (char_length(trim(name)) > 0),
  constraint players_color_hex check (primary_color ~ '^#[0-9a-fA-F]{6}$')
);

-- Admin config — single row, id always = 1
create table admin_config (
  id                integer primary key default 1,
  tournament_stage  text not null default 'setup',
  constraint single_row check (id = 1),
  constraint valid_stage check (
    tournament_stage in ('setup', 'league', 'knockouts', 'completed')
  )
);

-- Seed the single admin_config row immediately
insert into admin_config (id, tournament_stage) values (1, 'setup');

-- Matches (66 league + up to 3 knockout)
create table matches (
  id              uuid primary key default gen_random_uuid(),
  player_a        uuid not null references players(id),
  player_b        uuid not null references players(id),
  score_a         integer,
  score_b         integer,
  stage           text not null default 'league',
  status          text not null default 'pending',
  walkover_winner uuid references players(id),
  played_at       timestamptz,
  created_at      timestamptz not null default now(),

  constraint different_players check (player_a <> player_b),
  constraint valid_stage check (stage in ('league', 'sf1', 'sf2', 'final')),
  constraint valid_status check (status in ('pending', 'played', 'walkover')),

  -- Scores must be non-negative when present
  constraint score_a_nonneg check (score_a is null or score_a >= 0),
  constraint score_b_nonneg check (score_b is null or score_b >= 0),
  constraint score_range_a  check (score_a is null or score_a <= 20),
  constraint score_range_b  check (score_b is null or score_b <= 20),

  -- Both scores present together or both null
  constraint scores_both_or_neither check (
    (score_a is null) = (score_b is null)
  ),

  -- Knockout stages cannot end in a draw
  constraint no_knockout_draw check (
    stage = 'league'
    or status <> 'played'
    or score_a <> score_b
  ),

  -- Walkover winner must be one of the two players
  constraint walkover_is_participant check (
    walkover_winner is null
    or walkover_winner = player_a
    or walkover_winner = player_b
  ),

  -- Walkover implies no scores; played implies scores present
  constraint walkover_no_scores check (
    status <> 'walkover' or (score_a is null and score_b is null)
  ),
  constraint played_has_scores check (
    status <> 'played' or (score_a is not null and score_b is not null)
  )
);

-- Bracket seeding — populated once when admin advances to knockouts
-- SF1 = seed_1 vs seed_4, SF2 = seed_2 vs seed_3
create table bracket_seeding (
  id         integer primary key default 1,
  seed_1     uuid references players(id),  -- 1st place
  seed_2     uuid references players(id),  -- 2nd place
  seed_3     uuid references players(id),  -- 3rd place
  seed_4     uuid references players(id),  -- 4th place
  seeded_at  timestamptz default now(),
  constraint single_row check (id = 1)
);


-- Tournament settings — single row, seeded with defaults
create table tournament_settings (
  id                    integer primary key default 1,
  league_match_duration integer not null default 10,
  semi_match_duration   integer not null default 12,
  final_match_duration  integer not null default 15,
  constraint single_row check (id = 1),
  constraint league_duration_range check (league_match_duration between 5 and 30),
  constraint semi_duration_range   check (semi_match_duration   between 5 and 30),
  constraint final_duration_range  check (final_match_duration  between 5 and 30)
);

insert into tournament_settings (id) values (1);


-- ─── Indexes ─────────────────────────────────────────────────────────

create index matches_player_a_idx  on matches(player_a);
create index matches_player_b_idx  on matches(player_b);
create index matches_stage_idx     on matches(stage);
create index matches_status_idx    on matches(status);
create index matches_played_at_idx on matches(played_at desc nulls last);


-- ─── Realtime ────────────────────────────────────────────────────────
-- Enable realtime publication for live score updates
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table admin_config;
alter publication supabase_realtime add table bracket_seeding;
alter publication supabase_realtime add table tournament_settings;


-- ─── Row Level Security ──────────────────────────────────────────────

-- players
alter table players enable row level security;

create policy "players: public read"
  on players for select
  using (true);

create policy "players: service role write"
  on players for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- admin_config
alter table admin_config enable row level security;

create policy "admin_config: public read"
  on admin_config for select
  using (true);

create policy "admin_config: service role write"
  on admin_config for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- matches
alter table matches enable row level security;

create policy "matches: public read"
  on matches for select
  using (true);

create policy "matches: service role write"
  on matches for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- bracket_seeding
alter table bracket_seeding enable row level security;

create policy "bracket_seeding: public read"
  on bracket_seeding for select
  using (true);

create policy "bracket_seeding: service role insert"
  on bracket_seeding for insert
  with check (auth.role() = 'service_role');

create policy "bracket_seeding: service role update"
  on bracket_seeding for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


-- tournament_settings
alter table tournament_settings enable row level security;

create policy "tournament_settings: public read"
  on tournament_settings for select
  using (true);

create policy "tournament_settings: service role write"
  on tournament_settings for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


-- ─── Storage bucket (player badges) ─────────────────────────────────
insert into storage.buckets (id, name, public)
values ('badges', 'badges', true)
on conflict do nothing;

-- Anyone can read badge images
create policy "badges: public read"
  on storage.objects for select
  using (bucket_id = 'badges');

-- Only service role can upload / replace badges
create policy "badges: service role write"
  on storage.objects for insert
  with check (
    bucket_id = 'badges'
    and auth.role() = 'service_role'
  );

create policy "badges: service role update"
  on storage.objects for update
  using (
    bucket_id = 'badges'
    and auth.role() = 'service_role'
  );

create policy "badges: service role delete"
  on storage.objects for delete
  using (
    bucket_id = 'badges'
    and auth.role() = 'service_role'
  );
