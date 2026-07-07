-- ============================================================================
-- PGManager · 0003_functions.sql
-- Admin RPCs (with mandatory audit trail), dashboard aggregations,
-- manager payment recording, storage buckets + policies.
-- Apply AFTER 0002_security.sql.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- internal: write one audit row (called inside every privileged RPC)
-- ---------------------------------------------------------------------------
create or replace function public._audit(
  p_action text, p_table text, p_id text, p_meta jsonb default '{}'
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into audit_log (actor_id, actor_role, action, target_table, target_id, meta)
  select auth.uid(), p.role, p_action, p_table, p_id, p_meta
  from profiles p where p.id = auth.uid();
end $$;

-- ---------------------------------------------------------------------------
-- ADMIN · activate / deactivate any user
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_user_active(p_user uuid, p_active boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'admin only'; end if;
  update profiles set active = p_active where id = p_user;
  perform _audit(
    case when p_active then 'reactivate_user' else 'deactivate_user' end,
    'profiles', p_user::text, '{}'::jsonb
  );
end $$;

-- ---------------------------------------------------------------------------
-- ADMIN · set PG status (approve / reject / suspend), syncing the queue
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_pg_status(
  p_pg uuid, p_status pg_status, p_note text default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'admin only'; end if;
  update pgs set status = p_status where id = p_pg;
  update approvals
     set status     = case when p_status = 'approved' then 'approved' else 'rejected' end::approval_status,
         decided_by = auth.uid(), decided_at = now(), note = p_note
   where kind = 'pg_listing' and subject_id = p_pg and status = 'pending';
  perform _audit('set_pg_status', 'pgs', p_pg::text,
                 jsonb_build_object('status', p_status, 'note', p_note));
end $$;

-- ---------------------------------------------------------------------------
-- ADMIN · resolve any approval-queue item (PG listing or owner KYC)
-- ---------------------------------------------------------------------------
create or replace function public.admin_resolve_approval(
  p_approval uuid, p_approve boolean, p_note text default null
) returns void language plpgsql security definer set search_path = public as $$
declare a approvals%rowtype;
begin
  if not is_admin() then raise exception 'admin only'; end if;

  select * into a from approvals where id = p_approval and status = 'pending';
  if not found then raise exception 'approval not found or already decided'; end if;

  update approvals
     set status     = case when p_approve then 'approved' else 'rejected' end::approval_status,
         decided_by = auth.uid(), decided_at = now(), note = p_note
   where id = p_approval;

  if a.kind = 'pg_listing' then
    update pgs
       set status = case when p_approve then 'approved' else 'rejected' end::pg_status
     where id = a.subject_id;
  elsif a.kind = 'owner_kyc' then
    update owner_kyc
       set status = case when p_approve then 'verified' else 'rejected' end::kyc_status,
           reviewed_by = auth.uid(), reviewed_at = now(),
           rejection_reason = case when p_approve then null else p_note end
     where id = a.subject_id;
  end if;

  perform _audit(
    case when p_approve then 'approve_' else 'reject_' end || a.kind::text,
    'approvals', p_approval::text, jsonb_build_object('note', p_note)
  );
end $$;

-- ---------------------------------------------------------------------------
-- STAFF · record an offline (cash/UPI-direct) payment — the only client path
-- that can create money records. Gateway payments come via webhooks.
-- ---------------------------------------------------------------------------
create or replace function public.record_offline_payment(
  p_pg uuid, p_student uuid, p_amount numeric,
  p_type payment_type default 'rent',
  p_method text default 'cash',
  p_period date default null,
  p_tenancy uuid default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  if not (owns_pg(p_pg) or manages_pg(p_pg) or is_admin()) then
    raise exception 'not authorized for this PG';
  end if;
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;

  insert into payments (pg_id, student_id, tenancy_id, amount, pay_type,
                        status, method, period_month, paid_at, receipt_no)
  values (p_pg, p_student, p_tenancy, p_amount, p_type,
          'paid', p_method, p_period, now(),
          'RCT-' || to_char(now(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 8))
  returning id into pid;

  perform _audit('record_offline_payment', 'payments', pid::text,
                 jsonb_build_object('pg', p_pg, 'student', p_student,
                                    'amount', p_amount, 'method', p_method));
  return pid;
end $$;

-- ---------------------------------------------------------------------------
-- DASHBOARDS · one call per dashboard instead of N parallel queries
-- ---------------------------------------------------------------------------

-- role-scoped overview for the Expo app (owner sees own PGs, manager sees
-- assigned PGs, admin sees all)
create or replace function public.overview()
returns json language plpgsql stable security definer set search_path = public as $$
declare
  scope uuid[];
  m date := date_trunc('month', now())::date;
begin
  select case
    when is_admin() then array(select id from pgs)
    when has_role('pg_owner') then array(select id from pgs where owner_id = auth.uid())
    else array(select pg_id from manager_assignments
               where manager_id = auth.uid() and active)
  end into scope;

  return json_build_object(
    'totalPgs',      coalesce(array_length(scope, 1), 0),
    'totalBeds',     (select coalesce(sum(capacity), 0) from rooms where pg_id = any(scope)),
    'occupiedBeds',  (select coalesce(sum(occupied), 0) from rooms where pg_id = any(scope)),
    'collection',    (select coalesce(sum(amount), 0) from payments
                      where pg_id = any(scope) and status = 'paid' and paid_at >= m),
    'pendingRent',   (select coalesce(sum(amount), 0) from payments
                      where pg_id = any(scope) and status = 'pending'),
    'openComplaints',(select count(*) from complaints
                      where pg_id = any(scope) and status in ('open', 'in_progress'))
  );
end $$;

-- platform-wide stats for the admin console (matches src/lib/types.ts shapes)
create or replace function public.admin_stats()
returns json language plpgsql stable security definer set search_path = public as $$
declare m date := date_trunc('month', now())::date;
begin
  if not is_admin() then raise exception 'admin only'; end if;
  return json_build_object(
    'totalPGs',          (select count(*) from pgs),
    'approvedPGs',       (select count(*) from pgs where status = 'approved'),
    'pendingApprovals',  (select count(*) from approvals where status = 'pending'),
    'totalUsers',        (select count(*) from profiles),
    'usersByRole',       (select json_object_agg(role, n) from
                            (select role, count(*) n from profiles group by role) r),
    'monthlyCollection', (select coalesce(sum(amount), 0) from payments
                          where status = 'paid' and paid_at >= m)
  );
end $$;

-- ---------------------------------------------------------------------------
-- STORAGE · 3 buckets + access policies
--   pg-photos : public read; staff of the PG write   (path: <pg_id>/...)
--   documents : private; user-scoped                 (path: <user_id>/...)
--   receipts  : private; server writes, parties read (path: <payment_id>.pdf)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('pg-photos', 'pg-photos', true),
       ('documents', 'documents', false),
       ('receipts',  'receipts',  false)
on conflict (id) do nothing;

create policy photos_public_read on storage.objects for select
  using (bucket_id = 'pg-photos');
create policy photos_staff_write on storage.objects for insert
  with check (
    bucket_id = 'pg-photos'
    and staff_of_pg(((storage.foldername(name))[1])::uuid)
  );
create policy photos_staff_delete on storage.objects for delete
  using (
    bucket_id = 'pg-photos'
    and staff_of_pg(((storage.foldername(name))[1])::uuid)
  );

create policy docs_own_rw on storage.objects for all
  using (
    bucket_id = 'documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or is_admin())
  )
  with check (
    bucket_id = 'documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or is_admin())
  );

create policy receipts_admin_read on storage.objects for select
  using (bucket_id = 'receipts' and is_admin());
-- receipts are written by Edge Functions (service role bypasses RLS);
-- students/staff get them through short-lived signed URLs.
