-- ============================================================
-- MIGRATION: Multi-group support
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. groups table
create table if not exists groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  emoji text not null default '🎬',
  invite_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  created_by uuid references profiles(id) on delete set null,
  frequency text not null default 'biweekly' check (frequency in ('weekly', 'biweekly', 'monthly')),
  next_draw_date timestamptz,
  created_at timestamptz default now()
);

-- 2. group_members table
create table if not exists group_members (
  group_id uuid references groups(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

-- 3. add group_id to movies and messages (nullable first)
alter table movies add column if not exists group_id uuid references groups(id) on delete cascade;
alter table messages add column if not exists group_id uuid references groups(id) on delete cascade;

-- 4. migrate existing data into a default group
do $$
declare
  v_group_id uuid;
  v_creator_id uuid;
  v_frequency text;
  v_next_draw_date timestamptz;
begin
  -- grab existing settings if table exists
  begin
    select frequency, next_draw_date
    into v_frequency, v_next_draw_date
    from settings limit 1;
  exception when undefined_table then
    v_frequency := 'biweekly';
    v_next_draw_date := null;
  end;

  -- oldest profile becomes creator
  select id into v_creator_id from profiles order by created_at asc limit 1;

  -- only migrate if there's no group yet
  if not exists (select 1 from groups limit 1) and v_creator_id is not null then
    insert into groups (name, emoji, created_by, frequency, next_draw_date)
    values ('Our Cinema Club', '🎬', v_creator_id, coalesce(v_frequency, 'biweekly'), v_next_draw_date)
    returning id into v_group_id;

    -- add all existing users as members
    insert into group_members (group_id, user_id)
    select v_group_id, id from profiles
    on conflict do nothing;

    -- migrate existing movies and messages
    update movies set group_id = v_group_id where group_id is null;
    update messages set group_id = v_group_id where group_id is null;
  end if;
end $$;

-- 5. enforce not null now that data is migrated
alter table movies alter column group_id set not null;
alter table messages alter column group_id set not null;

-- 6. drop old settings table (data now lives on groups)
drop table if exists settings;

-- 7. indexes
create index if not exists idx_movies_group_id on movies(group_id);
create index if not exists idx_messages_group_id on messages(group_id);
create index if not exists idx_group_members_user_id on group_members(user_id);
create index if not exists idx_groups_invite_token on groups(invite_token);

-- ============================================================
-- HELPER FUNCTION (avoids RLS recursion)
-- ============================================================
create or replace function is_group_member(p_group_id uuid, p_user_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from group_members
    where group_id = p_group_id and user_id = p_user_id
  );
$$;

-- Public invite lookup (no auth required — used by invite page)
create or replace function get_group_by_invite_token(token text)
returns table (id uuid, name text, emoji text, member_count bigint)
language sql security definer stable set search_path = public as $$
  select g.id, g.name, g.emoji, count(gm.user_id)::bigint as member_count
  from groups g
  left join group_members gm on gm.group_id = g.id
  where g.invite_token = token
  group by g.id, g.name, g.emoji;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table groups enable row level security;
alter table group_members enable row level security;

-- GROUPS
drop policy if exists "Members can read their groups" on groups;
create policy "Members can read their groups"
  on groups for select to authenticated
  using (is_group_member(id, auth.uid()));

drop policy if exists "Authenticated users can create groups" on groups;
create policy "Authenticated users can create groups"
  on groups for insert to authenticated
  with check (auth.uid() = created_by);

drop policy if exists "Group creator can update" on groups;
create policy "Group creator can update"
  on groups for update to authenticated
  using (auth.uid() = created_by);

drop policy if exists "Group creator can delete" on groups;
create policy "Group creator can delete"
  on groups for delete to authenticated
  using (auth.uid() = created_by);

-- GROUP_MEMBERS
drop policy if exists "Members can see group members" on group_members;
create policy "Members can see group members"
  on group_members for select to authenticated
  using (is_group_member(group_id, auth.uid()));

drop policy if exists "Users can join a group" on group_members;
create policy "Users can join a group"
  on group_members for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can leave a group" on group_members;
create policy "Users can leave a group"
  on group_members for delete to authenticated
  using (auth.uid() = user_id);

-- MOVIES (update to group-scoped)
drop policy if exists "Auth users can read movies" on movies;
drop policy if exists "Auth users can insert movies" on movies;
drop policy if exists "Auth users can update movies" on movies;
drop policy if exists "Auth users can delete own movies" on movies;

create policy "Group members can read movies"
  on movies for select to authenticated
  using (is_group_member(group_id, auth.uid()));

create policy "Group members can insert movies"
  on movies for insert to authenticated
  with check (auth.uid() = added_by and is_group_member(group_id, auth.uid()));

create policy "Group members can update movies"
  on movies for update to authenticated
  using (is_group_member(group_id, auth.uid()));

create policy "Movie owner can delete"
  on movies for delete to authenticated
  using (auth.uid() = added_by);

-- MESSAGES (update to group-scoped)
drop policy if exists "Auth users can read messages" on messages;
drop policy if exists "Auth users can insert messages" on messages;

create policy "Group members can read messages"
  on messages for select to authenticated
  using (is_group_member(group_id, auth.uid()));

create policy "Group members can insert messages"
  on messages for insert to authenticated
  with check (auth.uid() = user_id and is_group_member(group_id, auth.uid()));

-- ============================================================
-- GRANTS (required for tables created via SQL Editor)
-- ============================================================
grant select, insert, update, delete on groups to authenticated;
grant select, insert, delete on group_members to authenticated;

-- ============================================================
-- REALTIME
-- ============================================================
alter publication supabase_realtime add table groups;
alter publication supabase_realtime add table group_members;
