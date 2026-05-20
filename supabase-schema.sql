-- 27 Supabase schema
-- Run this in Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  public_code text unique not null,
  code_visible boolean not null default true,
  display_name text,
  avatar_seed text,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists code_visible boolean not null default true;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.profiles(id) on delete cascade,
  user_b_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz,
  privacy_mode text not null default '5h',
  status text not null default 'active',
  constraint conversations_two_distinct_users check (user_a_id <> user_b_id)
);

alter table public.conversations
  add column if not exists privacy_mode text not null default '5h',
  add column if not exists status text not null default 'active';

create unique index if not exists conversations_unique_pair
  on public.conversations (least(user_a_id, user_b_id), greatest(user_a_id, user_b_id));

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  message_type text not null default 'text',
  privacy_mode text not null default '5h',
  read_at timestamptz,
  burn_after_read boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '5 hours')
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text unique not null,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.messages
  add column if not exists burn_after_read boolean not null default false,
  add column if not exists message_type text not null default 'text',
  add column if not exists privacy_mode text not null default '5h',
  add column if not exists read_at timestamptz;

create table if not exists public.conversation_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint conversation_requests_two_distinct_users check (requester_id <> target_id)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'conversation_requests_requester_id_fkey'
  ) then
    alter table public.conversation_requests
      add constraint conversation_requests_requester_id_fkey
      foreign key (requester_id) references public.profiles(id) on delete cascade;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'conversation_requests_target_id_fkey'
  ) then
    alter table public.conversation_requests
      add constraint conversation_requests_target_id_fkey
      foreign key (target_id) references public.profiles(id) on delete cascade;
  end if;
end $$;

create unique index if not exists conversation_requests_open_pair
  on public.conversation_requests (least(requester_id, target_id), greatest(requester_id, target_id))
  where status = 'pending';

create table if not exists public.temporary_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  token text unique not null,
  link_type text not null check (link_type in ('ask', 'room')),
  max_opens integer not null default 27,
  open_count integer not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '5 hours')
);

create table if not exists public.temporary_rooms (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.temporary_links(id) on delete cascade,
  title text,
  max_members integer not null default 7,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.anonymous_entries (
  id uuid primary key default gen_random_uuid(),
  link_id uuid references public.temporary_links(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete cascade,
  body text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '5 hours')
);

create index if not exists temporary_links_token_idx
  on public.temporary_links (token);

create index if not exists anonymous_entries_owner_status_idx
  on public.anonymous_entries (owner_id, status, created_at);

create table if not exists public.blocked_profiles (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocked_profiles_two_distinct_users check (blocker_id <> blocked_id)
);

create table if not exists public.message_receipts (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  delivered_at timestamptz not null default now(),
  read_at timestamptz,
  primary key (message_id, user_id)
);

create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at);

create index if not exists messages_expires_at_idx
  on public.messages (expires_at);

create index if not exists conversation_requests_target_status_idx
  on public.conversation_requests (target_id, status, created_at);

create index if not exists conversation_requests_requester_status_idx
  on public.conversation_requests (requester_id, status, created_at);

create or replace function public.set_message_expiry()
returns trigger
language plpgsql
as $$
begin
  if new.expires_at is null then
    new.expires_at := coalesce(new.created_at, now()) + interval '5 hours';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_message_expiry on public.messages;
create trigger trg_set_message_expiry
before insert on public.messages
for each row execute function public.set_message_expiry();

create or replace function public.touch_conversation_last_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists trg_touch_conversation_last_message on public.messages;
create trigger trg_touch_conversation_last_message
after insert on public.messages
for each row execute function public.touch_conversation_last_message();

create or replace function public.delete_expired_messages()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.messages
  where expires_at <= now();

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- Suggested scheduled cleanup:
-- Supabase Dashboard -> Database -> Extensions: enable pg_cron if available.
-- Then run, for example:
-- select cron.schedule('delete-expired-27-messages', '*/5 * * * *', 'select public.delete_expired_messages();');
-- If pg_cron is unavailable, call public.delete_expired_messages() from a scheduled Edge Function.

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.conversation_requests enable row level security;
alter table public.temporary_links enable row level security;
alter table public.temporary_rooms enable row level security;
alter table public.anonymous_entries enable row level security;
alter table public.blocked_profiles enable row level security;
alter table public.message_receipts enable row level security;

drop policy if exists "profiles select authenticated" on public.profiles;
create policy "profiles select authenticated"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "push subscriptions manage own" on public.push_subscriptions;
create policy "push subscriptions manage own"
on public.push_subscriptions for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "conversations select participant" on public.conversations;
create policy "conversations select participant"
on public.conversations for select
to authenticated
using (auth.uid() = user_a_id or auth.uid() = user_b_id);

drop policy if exists "conversations insert participant" on public.conversations;
create policy "conversations insert participant"
on public.conversations for insert
to authenticated
with check (auth.uid() = user_a_id or auth.uid() = user_b_id);

drop policy if exists "conversations update participant" on public.conversations;
create policy "conversations update participant"
on public.conversations for update
to authenticated
using (auth.uid() = user_a_id or auth.uid() = user_b_id)
with check (auth.uid() = user_a_id or auth.uid() = user_b_id);

drop policy if exists "conversations delete participant" on public.conversations;
create policy "conversations delete participant"
on public.conversations for delete
to authenticated
using (auth.uid() = user_a_id or auth.uid() = user_b_id);

drop policy if exists "requests select participant" on public.conversation_requests;
create policy "requests select participant"
on public.conversation_requests for select
to authenticated
using (auth.uid() = requester_id or auth.uid() = target_id);

drop policy if exists "requests insert requester" on public.conversation_requests;
create policy "requests insert requester"
on public.conversation_requests for insert
to authenticated
with check (
  auth.uid() = requester_id
  and not exists (
    select 1 from public.blocked_profiles b
    where (b.blocker_id = target_id and b.blocked_id = requester_id)
       or (b.blocker_id = requester_id and b.blocked_id = target_id)
  )
);

drop policy if exists "requests update target" on public.conversation_requests;
create policy "requests update target"
on public.conversation_requests for update
to authenticated
using (auth.uid() = target_id or auth.uid() = requester_id)
with check (auth.uid() = target_id or auth.uid() = requester_id);

drop policy if exists "temporary links select active" on public.temporary_links;
create policy "temporary links select active"
on public.temporary_links for select
to authenticated
using (expires_at > now() and open_count < max_opens);

drop policy if exists "temporary links insert own" on public.temporary_links;
create policy "temporary links insert own"
on public.temporary_links for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "temporary links update own" on public.temporary_links;
create policy "temporary links update own"
on public.temporary_links for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "temporary rooms select active link" on public.temporary_rooms;
create policy "temporary rooms select active link"
on public.temporary_rooms for select
to authenticated
using (
  exists (
    select 1 from public.temporary_links l
    where l.id = temporary_rooms.link_id
      and l.link_type = 'room'
      and l.expires_at > now()
  )
);

drop policy if exists "temporary rooms insert own link" on public.temporary_rooms;
create policy "temporary rooms insert own link"
on public.temporary_rooms for insert
to authenticated
with check (
  exists (
    select 1 from public.temporary_links l
    where l.id = temporary_rooms.link_id
      and l.owner_id = auth.uid()
      and l.link_type = 'room'
  )
);

drop policy if exists "anonymous entries select owner" on public.anonymous_entries;
create policy "anonymous entries select owner"
on public.anonymous_entries for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "anonymous entries insert active link" on public.anonymous_entries;
create policy "anonymous entries insert active link"
on public.anonymous_entries for insert
to authenticated
with check (
  exists (
    select 1 from public.temporary_links l
    where l.id = anonymous_entries.link_id
      and l.owner_id = anonymous_entries.owner_id
      and l.link_type = 'ask'
      and l.expires_at > now()
      and l.open_count < l.max_opens
  )
);

drop policy if exists "blocks manage own" on public.blocked_profiles;
create policy "blocks manage own"
on public.blocked_profiles for all
to authenticated
using (blocker_id = auth.uid())
with check (blocker_id = auth.uid());

drop policy if exists "receipts select conversation participant" on public.message_receipts;
create policy "receipts select conversation participant"
on public.message_receipts for select
to authenticated
using (
  exists (
    select 1
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
    where m.id = message_receipts.message_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
  )
);

drop policy if exists "receipts upsert own" on public.message_receipts;
create policy "receipts upsert own"
on public.message_receipts for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "receipts update own" on public.message_receipts;
create policy "receipts update own"
on public.message_receipts for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "messages select conversation participant" on public.messages;
create policy "messages select conversation participant"
on public.messages for select
to authenticated
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
  )
);

drop policy if exists "messages insert conversation participant" on public.messages;
create policy "messages insert conversation participant"
on public.messages for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
  )
);

drop policy if exists "messages delete conversation participant" on public.messages;
create policy "messages delete conversation participant"
on public.messages for delete
to authenticated
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
  )
);

drop policy if exists "messages update conversation participant" on public.messages;
create policy "messages update conversation participant"
on public.messages for update
to authenticated
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
  )
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'conversation_requests'
  ) then
    alter publication supabase_realtime add table public.conversation_requests;
  end if;
end $$;
