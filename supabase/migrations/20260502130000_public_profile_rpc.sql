-- get_profile_by_username: exact lookup respecting visibility.
-- Returns the row if the caller is allowed to see it (public, friend, self),
-- otherwise returns nothing.

create or replace function get_profile_by_username(_username text)
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  bio text,
  is_patron boolean,
  visibility text,
  created_at timestamptz,
  is_self boolean,
  is_friend boolean,
  can_view boolean
)
language plpgsql stable security definer set search_path = public as $$
declare
  caller uuid := auth.uid();
  found_id uuid;
  found_visibility text;
begin
  select p.id, p.visibility into found_id, found_visibility
  from profiles p
  where lower(p.username) = lower(_username) and p.deleted_at is null;

  if found_id is null then
    return;
  end if;

  return query
    select
      p.id,
      p.username,
      p.display_name,
      case when allowed.ok then p.avatar_url else null end,
      case when allowed.ok then p.bio else null end,
      p.is_patron,
      p.visibility,
      p.created_at,
      (caller is not null and caller = p.id) as is_self,
      (caller is not null and caller <> p.id and exists (
        select 1 from friendships f
        where f.status = 'accepted'
          and ((f.user_a = caller and f.user_b = p.id)
            or (f.user_b = caller and f.user_a = p.id))
      )) as is_friend,
      allowed.ok as can_view
    from profiles p
    cross join lateral (
      select (
        p.visibility = 'public'
        or (caller is not null and caller = p.id)
        or (
          p.visibility = 'friends'
          and caller is not null
          and exists (
            select 1 from friendships f
            where f.status = 'accepted'
              and ((f.user_a = caller and f.user_b = p.id)
                or (f.user_b = caller and f.user_a = p.id))
          )
        )
      ) as ok
    ) as allowed
    where p.id = found_id;
end;
$$;

grant execute on function get_profile_by_username(text) to authenticated, anon;
