-- Lookup a group by its invite token, bypassing RLS so non-members can resolve the link.
-- Used by /invite/[token] before the user joins.

create or replace function get_group_by_invite_token(token text)
returns table (
  id uuid,
  name text,
  emoji text,
  cover_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select g.id, g.name, g.emoji, g.cover_url
  from groups g
  where g.invite_token = token
$$;

grant execute on function get_group_by_invite_token(text) to authenticated;
