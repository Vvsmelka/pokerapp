-- Run this in Supabase SQL editor

create table if not exists rooms (
  code        text primary key,
  host_id     text not null,
  status      text not null default 'waiting',
  max_players int  not null default 6,
  players     jsonb not null default '[]',
  game_state  jsonb,
  created_at  timestamptz default now()
);

-- Enable row-level security (open for MVP — lock down for production)
alter table rooms enable row level security;
create policy "allow all" on rooms for all using (true) with check (true);

-- Enable Realtime
alter publication supabase_realtime add table rooms;
