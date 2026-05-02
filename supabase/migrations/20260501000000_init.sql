-- Rendezvu — initial schema (v1)
-- Apply to a fresh Supabase project. Replaces the legacy Cinephile Starter schema.

-- ============================================================================
-- Extensions
-- ============================================================================

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists vector;

-- ============================================================================
-- Helper functions (security definer to break RLS recursion on member checks)
-- plpgsql, not sql — defers table reference resolution to invocation time so
-- the migration can declare these before the tables they query.
-- ============================================================================

create or replace function is_group_member(_group_id uuid)
returns boolean language plpgsql stable security definer set search_path = public as $$
begin
  return exists (
    select 1 from group_members
    where group_id = _group_id
      and user_id = auth.uid()
      and left_at is null
  );
end;
$$;

create or replace function are_friends(_other uuid)
returns boolean language plpgsql stable security definer set search_path = public as $$
begin
  return exists (
    select 1 from friendships
    where status = 'accepted'
      and ((user_a = auth.uid() and user_b = _other)
        or (user_b = auth.uid() and user_a = _other))
  );
end;
$$;

-- ============================================================================
-- profiles
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name text not null,
  avatar_url text,
  bio text,
  country text,
  timezone text not null default 'UTC',
  locale text not null default 'en',
  visibility text not null default 'private'
    check (visibility in ('private','friends','public')),
  is_patron boolean not null default false,
  patron_since timestamptz,
  cinetype text,
  taste_vector vector(64),
  cinetype_computed_at timestamptz,
  discover_opt_in boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_username_lower_idx on profiles (lower(username));
create index profiles_visibility_idx on profiles (visibility) where deleted_at is null;

alter table profiles enable row level security;

create policy "profiles_self_read" on profiles for select to authenticated
  using (id = auth.uid());
create policy "profiles_public_read" on profiles for select to authenticated
  using (visibility = 'public' and deleted_at is null);
create policy "profiles_friends_read" on profiles for select to authenticated
  using (visibility in ('friends','public') and are_friends(id) and deleted_at is null);
create policy "profiles_self_update" on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_username text;
  candidate text;
  i int := 0;
begin
  base_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    '[^a-z0-9_]', '', 'g'));
  if length(base_username) < 3 then
    base_username := 'user' || substring(new.id::text, 1, 8);
  end if;
  candidate := base_username;
  while exists (select 1 from profiles where username = candidate) loop
    i := i + 1;
    candidate := base_username || i::text;
  end loop;
  insert into profiles (id, username, display_name)
  values (
    new.id,
    candidate,
    coalesce(new.raw_user_meta_data->>'display_name',
             new.raw_user_meta_data->>'name',
             split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- friendships (canonical user_a < user_b ordering dedupes pairs)
-- ============================================================================

create table friendships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references profiles(id) on delete cascade,
  user_b uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending','accepted','blocked')),
  requested_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (user_a < user_b),
  unique (user_a, user_b)
);

create index friendships_user_a_idx on friendships (user_a) where status = 'accepted';
create index friendships_user_b_idx on friendships (user_b) where status = 'accepted';

alter table friendships enable row level security;

create policy "friendships_participants_read" on friendships for select to authenticated
  using (user_a = auth.uid() or user_b = auth.uid());
create policy "friendships_request" on friendships for insert to authenticated
  with check (
    requested_by = auth.uid()
    and (user_a = auth.uid() or user_b = auth.uid())
  );
create policy "friendships_respond" on friendships for update to authenticated
  using (user_a = auth.uid() or user_b = auth.uid())
  with check (user_a = auth.uid() or user_b = auth.uid());
create policy "friendships_delete" on friendships for delete to authenticated
  using (user_a = auth.uid() or user_b = auth.uid());

-- ============================================================================
-- groups
-- ============================================================================

create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text not null default '🎬',
  cover_url text,
  kind text not null default 'movie' check (kind in ('movie')),
  visibility text not null default 'private'
    check (visibility in ('private','unlisted','public')),
  rules jsonb not null default jsonb_build_object(
    'draw_mode', 'random',
    'spoiler_blur', 'until_watched',
    'frequency', 'biweekly'
  ),
  next_draw_at timestamptz,
  invite_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index groups_visibility_idx on groups (visibility);

alter table groups enable row level security;

create policy "groups_member_read" on groups for select to authenticated
  using (is_group_member(id));
create policy "groups_public_read" on groups for select to authenticated
  using (visibility = 'public');
create policy "groups_create" on groups for insert to authenticated
  with check (created_by = auth.uid());
create policy "groups_member_update" on groups for update to authenticated
  using (is_group_member(id)) with check (is_group_member(id));

-- ============================================================================
-- group_members
-- ============================================================================

create table group_members (
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (group_id, user_id)
);

create index group_members_user_idx on group_members (user_id) where left_at is null;

alter table group_members enable row level security;

create policy "group_members_self_read" on group_members for select to authenticated
  using (user_id = auth.uid());
create policy "group_members_group_read" on group_members for select to authenticated
  using (is_group_member(group_id));
create policy "group_members_join" on group_members for insert to authenticated
  with check (user_id = auth.uid());
create policy "group_members_leave" on group_members for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function add_creator_to_group()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.created_by is not null then
    insert into group_members (group_id, user_id) values (new.id, new.created_by);
  end if;
  return new;
end;
$$;

create trigger on_group_created
  after insert on groups
  for each row execute function add_creator_to_group();

-- ============================================================================
-- items (TMDB-backed, deduped globally; ready for kind='tv' later)
-- ============================================================================

create table items (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'movie' check (kind in ('movie','tv')),
  tmdb_id integer not null,
  title text not null,
  year int,
  poster_path text,
  overview text,
  runtime int,
  genres text[],
  metadata jsonb not null default '{}'::jsonb,
  providers jsonb not null default '{}'::jsonb,
  providers_updated_at timestamptz,
  created_at timestamptz not null default now(),
  unique (kind, tmdb_id)
);

create index items_title_trgm on items using gin (title gin_trgm_ops);

alter table items enable row level security;

create policy "items_authenticated_read" on items for select to authenticated using (true);
create policy "items_authenticated_insert" on items for insert to authenticated with check (true);
create policy "items_authenticated_update" on items for update to authenticated using (true);

-- ============================================================================
-- list_entries (one row per movie per group; uniqueness prevents dupes)
-- ============================================================================

create table list_entries (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  added_by uuid references profiles(id) on delete set null,
  status text not null default 'bucket'
    check (status in ('bucket','selected','watched_by_some','watched_by_all')),
  selected_at timestamptz,
  watched_at timestamptz,
  draw_count int not null default 0,
  added_at timestamptz not null default now(),
  unique (group_id, item_id)
);

create index list_entries_group_status_idx on list_entries (group_id, status);

alter table list_entries enable row level security;

create policy "list_entries_member_read" on list_entries for select to authenticated
  using (is_group_member(group_id));
create policy "list_entries_member_insert" on list_entries for insert to authenticated
  with check (is_group_member(group_id) and added_by = auth.uid());
create policy "list_entries_member_update" on list_entries for update to authenticated
  using (is_group_member(group_id)) with check (is_group_member(group_id));
create policy "list_entries_member_delete" on list_entries for delete to authenticated
  using (is_group_member(group_id));

-- ============================================================================
-- watches (per-member watch state; first watch flips the entry out of the draw pool)
-- ============================================================================

create table watches (
  id uuid primary key default gen_random_uuid(),
  list_entry_id uuid not null references list_entries(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  watched_at timestamptz not null default now(),
  source text not null default 'manual' check (source in ('manual','import','party')),
  unique (list_entry_id, user_id)
);

create index watches_user_idx on watches (user_id);

alter table watches enable row level security;

create policy "watches_member_read" on watches for select to authenticated
  using (exists (
    select 1 from list_entries le
    where le.id = list_entry_id and is_group_member(le.group_id)
  ));
create policy "watches_self_insert" on watches for insert to authenticated
  with check (user_id = auth.uid() and exists (
    select 1 from list_entries le
    where le.id = list_entry_id and is_group_member(le.group_id)
  ));
create policy "watches_self_delete" on watches for delete to authenticated
  using (user_id = auth.uid());

create or replace function update_entry_status_on_watch()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_group_id uuid;
  total_active_members int;
  total_watched int;
begin
  select group_id into v_group_id from list_entries where id = new.list_entry_id;
  select count(*) into total_active_members
    from group_members where group_id = v_group_id and left_at is null;
  select count(*) into total_watched
    from watches where list_entry_id = new.list_entry_id;
  if total_watched >= total_active_members then
    update list_entries set status = 'watched_by_all', watched_at = now()
    where id = new.list_entry_id;
  else
    update list_entries set status = 'watched_by_some'
    where id = new.list_entry_id and status in ('bucket','selected');
  end if;
  return new;
end;
$$;

create trigger on_watch_inserted
  after insert on watches
  for each row execute function update_entry_status_on_watch();

-- ============================================================================
-- reviews
-- ============================================================================

create table reviews (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  group_id uuid references groups(id) on delete set null,
  rating int not null check (rating between 1 and 10),
  body text,
  contains_spoilers boolean not null default false,
  is_rewatch boolean not null default false,
  edit_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reviews_item_idx on reviews (item_id);
create index reviews_user_idx on reviews (user_id);
create index reviews_group_idx on reviews (group_id);

alter table reviews enable row level security;

create policy "reviews_self_read" on reviews for select to authenticated
  using (user_id = auth.uid());
create policy "reviews_group_read" on reviews for select to authenticated
  using (group_id is not null and is_group_member(group_id));
create policy "reviews_friends_read" on reviews for select to authenticated
  using (are_friends(user_id) and exists (
    select 1 from profiles p
    where p.id = user_id and p.visibility in ('friends','public') and p.deleted_at is null
  ));
create policy "reviews_public_read" on reviews for select to authenticated
  using (exists (
    select 1 from profiles p
    where p.id = user_id and p.visibility = 'public' and p.deleted_at is null
  ));
create policy "reviews_self_insert" on reviews for insert to authenticated
  with check (user_id = auth.uid());
create policy "reviews_self_update" on reviews for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "reviews_self_delete" on reviews for delete to authenticated
  using (user_id = auth.uid());

-- ============================================================================
-- review_threads (comments on reviews)
-- ============================================================================

create table review_threads (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  parent_id uuid references review_threads(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index review_threads_review_idx on review_threads (review_id);

alter table review_threads enable row level security;

create policy "review_threads_read" on review_threads for select to authenticated
  using (exists (
    select 1 from reviews r where r.id = review_id and (
      r.user_id = auth.uid()
      or (r.group_id is not null and is_group_member(r.group_id))
      or are_friends(r.user_id)
      or exists (select 1 from profiles p
                 where p.id = r.user_id and p.visibility = 'public' and p.deleted_at is null)
    )
  ));
create policy "review_threads_self_insert" on review_threads for insert to authenticated
  with check (user_id = auth.uid());
create policy "review_threads_self_update" on review_threads for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "review_threads_self_delete" on review_threads for delete to authenticated
  using (user_id = auth.uid());

-- ============================================================================
-- review_reactions (one row per (review, user, emoji))
-- ============================================================================

create table review_reactions (
  review_id uuid not null references reviews(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id, emoji)
);

alter table review_reactions enable row level security;

create policy "review_reactions_read" on review_reactions for select to authenticated
  using (exists (
    select 1 from reviews r where r.id = review_id and (
      r.user_id = auth.uid()
      or (r.group_id is not null and is_group_member(r.group_id))
      or are_friends(r.user_id)
      or exists (select 1 from profiles p
                 where p.id = r.user_id and p.visibility = 'public' and p.deleted_at is null)
    )
  ));
create policy "review_reactions_self_insert" on review_reactions for insert to authenticated
  with check (user_id = auth.uid());
create policy "review_reactions_self_delete" on review_reactions for delete to authenticated
  using (user_id = auth.uid());

-- ============================================================================
-- messages (group chat; no expiry — donations don't gate functionality)
-- ============================================================================

create table messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  body text,
  attachments jsonb not null default '[]'::jsonb,
  reply_to uuid references messages(id) on delete set null,
  reactions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

create index messages_group_created_idx on messages (group_id, created_at desc);

alter table messages enable row level security;

create policy "messages_member_read" on messages for select to authenticated
  using (is_group_member(group_id) and deleted_at is null);
create policy "messages_member_insert" on messages for insert to authenticated
  with check (is_group_member(group_id) and user_id = auth.uid());
create policy "messages_self_update" on messages for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- invites (token-based group joins; QR code wraps the token)
-- ============================================================================

create table invites (
  token text primary key,
  group_id uuid not null references groups(id) on delete cascade,
  created_by uuid references profiles(id) on delete set null,
  expires_at timestamptz,
  max_uses int,
  uses int not null default 0,
  created_at timestamptz not null default now()
);

alter table invites enable row level security;

create policy "invites_member_manage" on invites for all to authenticated
  using (is_group_member(group_id)) with check (is_group_member(group_id));

-- ============================================================================
-- imports (Letterboxd CSV / username)
-- ============================================================================

create table imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  source text not null check (source in ('letterboxd_csv','letterboxd_username')),
  status text not null default 'pending'
    check (status in ('pending','running','succeeded','failed')),
  stats jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table imports enable row level security;

create policy "imports_self_all" on imports for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- notifications & preferences
-- ============================================================================

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  channel text not null check (channel in ('email','web_push','in_app')),
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_unread_idx on notifications (user_id, created_at desc)
  where read_at is null;

alter table notifications enable row level security;

create policy "notifications_self_read" on notifications for select to authenticated
  using (user_id = auth.uid());
create policy "notifications_self_update" on notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create table notification_prefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  group_id uuid references groups(id) on delete cascade,
  kind text not null,
  channel text not null check (channel in ('email','web_push','in_app')),
  enabled boolean not null default true
);

create unique index nprefs_global on notification_prefs (user_id, kind, channel)
  where group_id is null;
create unique index nprefs_per_group on notification_prefs (user_id, group_id, kind, channel)
  where group_id is not null;

alter table notification_prefs enable row level security;

create policy "nprefs_self_all" on notification_prefs for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- donations (Stripe-driven; client reads own only, writes via service role)
-- ============================================================================

create table donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  stripe_session_id text unique,
  stripe_subscription_id text,
  stripe_customer_id text,
  amount_cents int not null,
  currency text not null default 'eur',
  kind text not null check (kind in ('one_time','monthly','yearly')),
  status text not null,
  created_at timestamptz not null default now()
);

alter table donations enable row level security;

create policy "donations_self_read" on donations for select to authenticated
  using (user_id = auth.uid());

-- ============================================================================
-- audit_events (service role only; GDPR + moderation trail)
-- ============================================================================

create table audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_events_actor_idx on audit_events (actor_id, created_at desc);

alter table audit_events enable row level security;

-- ============================================================================
-- Realtime publication
-- ============================================================================

alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table list_entries;
alter publication supabase_realtime add table watches;
alter publication supabase_realtime add table review_threads;
alter publication supabase_realtime add table review_reactions;
