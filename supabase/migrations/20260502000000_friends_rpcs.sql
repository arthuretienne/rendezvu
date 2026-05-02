-- Friend-finding & request RPCs
-- Profiles default to visibility='private' (no policy lets strangers read them).
-- These security-definer functions punch a controlled hole: stranger search by
-- username and friend-request creation with canonical (user_a < user_b) ordering.

-- ----------------------------------------------------------------------------
-- search_profiles_by_username
-- Lets anyone search for usernames (case-insensitive prefix). Returns minimal
-- public-safe fields. Excludes deleted accounts and the searcher themselves.
-- ----------------------------------------------------------------------------

create or replace function search_profiles_by_username(_query text, _limit int default 10)
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  is_patron boolean
)
language plpgsql stable security definer set search_path = public as $$
begin
  if length(coalesce(_query, '')) < 2 then
    return;
  end if;

  return query
    select p.id, p.username, p.display_name, p.avatar_url, p.is_patron
    from profiles p
    where p.deleted_at is null
      and p.id <> auth.uid()
      and lower(p.username) like lower(_query) || '%'
    order by p.username
    limit least(_limit, 25);
end;
$$;

grant execute on function search_profiles_by_username(text, int) to authenticated;

-- ----------------------------------------------------------------------------
-- send_friend_request
-- Inserts a friendships row with canonical user_a < user_b ordering.
-- Idempotent: if a row already exists between the pair, returns it.
-- ----------------------------------------------------------------------------

create or replace function send_friend_request(_target uuid)
returns friendships
language plpgsql security definer set search_path = public as $$
declare
  caller uuid := auth.uid();
  ua uuid;
  ub uuid;
  result friendships;
begin
  if caller is null then
    raise exception 'not authenticated';
  end if;
  if _target = caller then
    raise exception 'cannot friend yourself';
  end if;
  if not exists (select 1 from profiles where id = _target and deleted_at is null) then
    raise exception 'target profile not found';
  end if;

  if caller < _target then
    ua := caller; ub := _target;
  else
    ua := _target; ub := caller;
  end if;

  insert into friendships (user_a, user_b, status, requested_by)
  values (ua, ub, 'pending', caller)
  on conflict (user_a, user_b) do update set status = friendships.status
  returning * into result;

  return result;
end;
$$;

grant execute on function send_friend_request(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- respond_friend_request
-- Accept or decline. Only the non-requester can respond.
-- ----------------------------------------------------------------------------

create or replace function respond_friend_request(_id uuid, _accept boolean)
returns friendships
language plpgsql security definer set search_path = public as $$
declare
  caller uuid := auth.uid();
  result friendships;
begin
  if caller is null then
    raise exception 'not authenticated';
  end if;

  update friendships
  set status = case when _accept then 'accepted' else 'blocked' end,
      responded_at = now()
  where id = _id
    and status = 'pending'
    and requested_by <> caller
    and (user_a = caller or user_b = caller)
  returning * into result;

  if result.id is null then
    raise exception 'friend request not found or not pending';
  end if;

  return result;
end;
$$;

grant execute on function respond_friend_request(uuid, boolean) to authenticated;

-- ----------------------------------------------------------------------------
-- resolve_profiles
-- Batched lookup of minimal public-safe profile fields by id. Used to hydrate
-- friend-request senders (not yet friends → RLS would hide them). Returns
-- nothing for deleted accounts.
-- ----------------------------------------------------------------------------

create or replace function resolve_profiles(_ids uuid[])
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  is_patron boolean
)
language plpgsql stable security definer set search_path = public as $$
begin
  return query
    select p.id, p.username, p.display_name, p.avatar_url, p.is_patron
    from profiles p
    where p.id = any(_ids) and p.deleted_at is null;
end;
$$;

grant execute on function resolve_profiles(uuid[]) to authenticated;
