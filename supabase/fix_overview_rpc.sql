-- ============================================================================
-- FIX: Apply this in Supabase Dashboard → SQL Editor
-- Creates the public.overview() RPC that the OverviewCard dashboard calls.
-- Run this if you get PGRST202 "Could not find function public.overview".
-- ============================================================================

-- Helper role-check functions (safe to re-run)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from profiles where id = auth.uid()), false)
$$;

create or replace function public.has_role(p_role text)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role::text = p_role from profiles where id = auth.uid()), false)
$$;

-- Main dashboard aggregation RPC — role-scoped (owner/manager/admin)
create or replace function public.overview()
returns json language plpgsql stable security definer set search_path = public as $$
declare
  scope uuid[];
  m date := date_trunc('month', now())::date;
begin
  -- Build scope: admin sees all PGs, owner sees own, manager sees assigned
  select case
    when is_admin()
      then array(select id from pgs)
    when has_role('pg_owner')
      then array(select id from pgs where owner_id = auth.uid())
    else
      array(select pg_id from manager_assignments
            where manager_id = auth.uid() and active)
  end into scope;

  return json_build_object(
    'totalPgs',       coalesce(array_length(scope, 1), 0),
    'totalBeds',      (select coalesce(sum(capacity), 0)  from rooms    where pg_id = any(scope)),
    'occupiedBeds',   (select coalesce(sum(occupied), 0)  from rooms    where pg_id = any(scope)),
    'collection',     (select coalesce(sum(amount),   0)  from payments
                       where pg_id = any(scope) and status = 'paid' and paid_at >= m),
    'pendingRent',    (select coalesce(sum(amount),   0)  from payments
                       where pg_id = any(scope) and status = 'pending'),
    'openComplaints', (select count(*)                    from complaints
                       where pg_id = any(scope) and status in ('open', 'in_progress'))
  );
end $$;

-- Grant execute to authenticated users (RLS inside the function handles scoping)
grant execute on function public.overview() to authenticated;

-- Notify PostgREST to reload its schema cache immediately
notify pgrst, 'reload schema';
