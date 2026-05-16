-- 27 Supabase schema
-- Run this in Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  public_code text unique not null,
  display_name text,
  avatar_seed text,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.profiles(id) on delete cascade,
  user_b_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz,
  constraint conversations_two_distinct_users check (user_a_id <> user_b_id)
);

create unique index if not exists conversations_unique_pair
  on public.conversations (least(user_a_id, user_b_id), greatest(user_a_id, user_b_id));

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
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
  add column if not exists burn_after_read boolean not null default false;

create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at);

create index if not exists messages_expires_at_idx
  on public.messages (expires_at);

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
