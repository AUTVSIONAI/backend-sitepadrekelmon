create extension if not exists pgcrypto;
create type role_type as enum ('admin','editor');
create type post_status as enum ('draft','published');
create type event_type as enum ('missa','evento','reuniao','entrevista');
create type gallery_category as enum ('encontros','eventos','acoes','oficiais');
create or replace function set_updated_at() returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  name text not null,
  email text unique not null,
  role role_type not null default 'admin',
  created_at timestamp with time zone default now()
);
create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  updated_at timestamp with time zone default now()
);
create trigger trg_settings_updated before update on settings for each row execute procedure set_updated_at();
create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('image','video')),
  title text,
  alt_text text,
  url text not null,
  category text,
  published boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
create trigger trg_media_updated before update on media for each row execute procedure set_updated_at();
create index if not exists idx_media_published on media(published);
create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references media(id) on delete cascade,
  category gallery_category not null,
  position int default 0,
  published boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
create trigger trg_gallery_items_updated before update on gallery_items for each row execute procedure set_updated_at();
create index if not exists idx_gallery_category on gallery_items(category);
create index if not exists idx_gallery_published on gallery_items(published);
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text not null,
  status post_status not null default 'draft',
  published_at timestamp with time zone,
  cover_media_id uuid references media(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
create trigger trg_posts_updated before update on posts for each row execute procedure set_updated_at();
create index if not exists idx_posts_status on posts(status);
create index if not exists idx_posts_published_at on posts(published_at);
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date timestamp with time zone not null,
  place text,
  type event_type not null,
  description text,
  published boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
create trigger trg_events_updated before update on events for each row execute procedure set_updated_at();
create index if not exists idx_events_date on events(date);
create index if not exists idx_events_published on events(published);
create table if not exists volunteers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  city text,
  message text,
  source_utm text,
  status text default 'novo',
  created_at timestamp with time zone default now()
);
create index if not exists idx_volunteers_created_at on volunteers(created_at);
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  source_utm text,
  handled boolean default false,
  created_at timestamp with time zone default now()
);
create index if not exists idx_contacts_created_at on contacts(created_at);
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  role text not null check (role in ('user','assistant')),
  message text not null,
  model text,
  metadata jsonb,
  created_at timestamp with time zone default now()
);
alter table app_users enable row level security;
alter table settings enable row level security;
alter table media enable row level security;
alter table gallery_items enable row level security;
alter table posts enable row level security;
alter table events enable row level security;
alter table volunteers enable row level security;
alter table contacts enable row level security;
alter table chat_messages enable row level security;
drop policy if exists anon_insert_volunteers on volunteers;
create policy anon_insert_volunteers on volunteers for insert to anon with check (true);
drop policy if exists anon_insert_contacts on contacts;
create policy anon_insert_contacts on contacts for insert to anon with check (true);
drop policy if exists anon_insert_chat on chat_messages;
create policy anon_insert_chat on chat_messages for insert to anon with check (true);
revoke all on app_users from anon;
revoke all on settings from anon;
revoke all on media from anon;
revoke all on gallery_items from anon;
revoke all on posts from anon;
revoke all on events from anon;
revoke all on volunteers from anon;
revoke all on contacts from anon;
revoke all on chat_messages from anon;