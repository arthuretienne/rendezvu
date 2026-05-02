-- Fix: groups INSERT...RETURNING was failing with "new row violates RLS"
--
-- Root cause: The original groups_member_read SELECT policy required
-- is_group_member(id), which is only true AFTER the on_group_created
-- AFTER INSERT trigger has added the creator to group_members. But for
-- INSERT...RETURNING, PostgreSQL evaluates the SELECT visibility check
-- on the new row BEFORE the AFTER trigger fires, so the creator can't
-- see their own just-inserted row → RETURNING fails → PostgREST reports
-- it as an RLS violation on the INSERT.
--
-- Fix: extend the SELECT policy so that creators can always see their
-- own groups regardless of group_members state. The on_group_created
-- trigger still runs and properly registers them as members.

drop policy if exists groups_member_read on groups;
create policy groups_member_read on groups for select to authenticated
  using (is_group_member(id) or created_by = auth.uid());
