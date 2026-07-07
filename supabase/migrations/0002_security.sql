-- ============================================================================
-- PGManager · 0002_security.sql
-- Role helpers, Row-Level Security for all 19 tables, automation triggers.
-- Apply AFTER 0001_schema.sql.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- ROLE HELPERS
-- SECURITY DEFINER so policy checks bypass RLS on the tables they consult
-- (prevents recursive policy evaluation).
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles
                  where id = auth.uid() and role = 'admin' and active) $$;

create or replace function public.has_role(r user_role)
returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles
                  where id = auth.uid() and role = r and active) $$;

create or replace function public.owns_pg(p_pg uuid)
returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from pgs
                  where id = p_pg and owner_id = auth.uid()) $$;

create or replace function public.manages_pg(p_pg uuid)
returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from manager_assignments
                  where pg_id = p_pg and manager_id = auth.uid() and active) $$;

-- staff = owner or manager of the PG (or platform admin)
create or replace function public.staff_of_pg(p_pg uuid)
returns boolean language sql stable security definer set search_path = public as
$$ select public.owns_pg(p_pg) or public.manages_pg(p_pg) or public.is_admin() $$;

-- ---------------------------------------------------------------------------
-- ENABLE RLS EVERYWHERE (no policy = denied by default)
-- ---------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.owner_kyc           enable row level security;
alter table public.manager_assignments enable row level security;
alter table public.device_tokens       enable row level security;
alter table public.pgs                 enable row level security;
alter table public.pg_documents        enable row level security;
alter table public.rooms               enable row level security;
alter table public.beds                enable row level security;
alter table public.bookings            enable row level security;
alter table public.tenancies           enable row level security;
alter table public.payments            enable row level security;
alter table public.expenses            enable row level security;
alter table public.invoices            enable row level security;
alter table public.complaints          enable row level security;
alter table public.notices             enable row level security;
alter table public.notifications       enable row level security;
alter table public.support_tickets     enable row level security;
alter table public.approvals           enable row level security;
alter table public.audit_log           enable row level security;

-- ---------------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------------
create policy profiles_select on public.profiles for select using (
  id = auth.uid()
  or is_admin()
  -- staff can see profiles of tenants staying in their PGs
  or exists (select 1 from tenancies t
             where t.student_id = profiles.id
               and (owns_pg(t.pg_id) or manages_pg(t.pg_id)))
  -- owners can see their managers' profiles
  or exists (select 1 from manager_assignments ma
             where ma.manager_id = profiles.id and owns_pg(ma.pg_id))
);
create policy profiles_update_self on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on public.profiles for all
  using (is_admin()) with check (is_admin());

-- users must not self-promote: block role/active changes by non-admins
create or replace function public.guard_profile_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not is_admin()
     and (new.role is distinct from old.role
          or new.active is distinct from old.active) then
    raise exception 'only an admin can change role or active';
  end if;
  return new;
end $$;
create trigger trg_guard_profile before update on public.profiles
  for each row execute function public.guard_profile_fields();

-- ---------------------------------------------------------------------------
-- OWNER_KYC
-- ---------------------------------------------------------------------------
create policy kyc_select on public.owner_kyc for select
  using (owner_id = auth.uid() or is_admin());
create policy kyc_insert on public.owner_kyc for insert
  with check (owner_id = auth.uid() and has_role('pg_owner'));
create policy kyc_update_own on public.owner_kyc for update
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy kyc_admin_all on public.owner_kyc for all
  using (is_admin()) with check (is_admin());

-- owner edits always re-enter review; only admin RPCs set verified/rejected
create or replace function public.guard_kyc()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then
    new.status := 'pending';
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.rejection_reason := null;
  end if;
  return new;
end $$;
create trigger trg_guard_kyc before insert or update on public.owner_kyc
  for each row execute function public.guard_kyc();

-- queue for admin: KYC submission -> approvals row
create or replace function public.queue_kyc_approval()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'pending' and not exists (
    select 1 from approvals
    where kind = 'owner_kyc' and subject_id = new.id and status = 'pending'
  ) then
    insert into approvals (kind, subject_id, submitted_by)
    values ('owner_kyc', new.id, new.owner_id);
  end if;
  return new;
end $$;
create trigger trg_queue_kyc after insert or update on public.owner_kyc
  for each row execute function public.queue_kyc_approval();

-- ---------------------------------------------------------------------------
-- MANAGER_ASSIGNMENTS
-- ---------------------------------------------------------------------------
create policy assign_select on public.manager_assignments for select
  using (manager_id = auth.uid() or owns_pg(pg_id) or is_admin());
create policy assign_owner_write on public.manager_assignments for insert
  with check (owns_pg(pg_id) and assigned_by = auth.uid());
create policy assign_owner_update on public.manager_assignments for update
  using (owns_pg(pg_id)) with check (owns_pg(pg_id));
create policy assign_owner_delete on public.manager_assignments for delete
  using (owns_pg(pg_id));
create policy assign_admin_all on public.manager_assignments for all
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- DEVICE_TOKENS
-- ---------------------------------------------------------------------------
create policy tokens_own on public.device_tokens for all
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- ---------------------------------------------------------------------------
-- PGS
-- ---------------------------------------------------------------------------
create policy pgs_select on public.pgs for select using (
  status = 'approved'            -- anyone signed-in can browse approved PGs
  or owner_id = auth.uid()
  or manages_pg(id)
  or is_admin()
);
create policy pgs_owner_insert on public.pgs for insert
  with check (owner_id = auth.uid() and has_role('pg_owner'));
create policy pgs_owner_update on public.pgs for update
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy pgs_admin_all on public.pgs for all
  using (is_admin()) with check (is_admin());

-- owners may only hold draft/pending; approve/reject/suspend is admin-only
create or replace function public.guard_pg_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() and new.status not in ('draft', 'pending') then
    if tg_op = 'INSERT' or new.status is distinct from old.status then
      raise exception 'only an admin can set PG status to %', new.status;
    end if;
  end if;
  return new;
end $$;
create trigger trg_guard_pg_status before insert or update on public.pgs
  for each row execute function public.guard_pg_status();

-- queue for admin: PG submitted for listing -> approvals row
create or replace function public.queue_pg_approval()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'pending' and not exists (
    select 1 from approvals
    where kind = 'pg_listing' and subject_id = new.id and status = 'pending'
  ) then
    insert into approvals (kind, subject_id, submitted_by)
    values ('pg_listing', new.id, new.owner_id);
  end if;
  return new;
end $$;
create trigger trg_queue_pg after insert or update on public.pgs
  for each row execute function public.queue_pg_approval();

-- ---------------------------------------------------------------------------
-- PG_DOCUMENTS
-- ---------------------------------------------------------------------------
create policy pgdocs_select on public.pg_documents for select
  using (staff_of_pg(pg_id));
create policy pgdocs_write on public.pg_documents for insert
  with check (staff_of_pg(pg_id) and uploaded_by = auth.uid());
create policy pgdocs_update on public.pg_documents for update
  using (staff_of_pg(pg_id)) with check (staff_of_pg(pg_id));
create policy pgdocs_delete on public.pg_documents for delete
  using (owns_pg(pg_id) or is_admin());

-- ---------------------------------------------------------------------------
-- ROOMS + BEDS
-- ---------------------------------------------------------------------------
create policy rooms_select on public.rooms for select using (
  staff_of_pg(pg_id)
  or exists (select 1 from pgs p where p.id = rooms.pg_id and p.status = 'approved')
);
create policy rooms_write on public.rooms for insert with check (staff_of_pg(pg_id));
create policy rooms_update on public.rooms for update
  using (staff_of_pg(pg_id)) with check (staff_of_pg(pg_id));
create policy rooms_delete on public.rooms for delete
  using (owns_pg(pg_id) or is_admin());

create policy beds_select on public.beds for select using (
  exists (select 1 from rooms r where r.id = beds.room_id and (
    staff_of_pg(r.pg_id)
    or exists (select 1 from pgs p where p.id = r.pg_id and p.status = 'approved')
  ))
);
create policy beds_write on public.beds for all using (
  exists (select 1 from rooms r where r.id = beds.room_id and staff_of_pg(r.pg_id))
) with check (
  exists (select 1 from rooms r where r.id = beds.room_id and staff_of_pg(r.pg_id))
);

-- ---------------------------------------------------------------------------
-- BOOKINGS
-- ---------------------------------------------------------------------------
create policy bookings_select on public.bookings for select
  using (student_id = auth.uid() or staff_of_pg(pg_id));
create policy bookings_student_insert on public.bookings for insert
  with check (
    student_id = auth.uid()
    and has_role('student')
    and exists (select 1 from pgs p where p.id = pg_id and p.status = 'approved')
  );
create policy bookings_student_update on public.bookings for update
  using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy bookings_staff_update on public.bookings for update
  using (staff_of_pg(pg_id)) with check (staff_of_pg(pg_id));

-- ---------------------------------------------------------------------------
-- TENANCIES  (writes: staff only; occupancy sync trigger below)
-- ---------------------------------------------------------------------------
create policy tenancies_select on public.tenancies for select
  using (student_id = auth.uid() or staff_of_pg(pg_id));
create policy tenancies_staff_write on public.tenancies for insert
  with check (staff_of_pg(pg_id));
create policy tenancies_staff_update on public.tenancies for update
  using (staff_of_pg(pg_id)) with check (staff_of_pg(pg_id));

-- keep rooms.occupied = count of active tenancies, always
create or replace function public.sync_room_occupancy()
returns trigger language plpgsql security definer set search_path = public as $$
declare r uuid;
begin
  foreach r in array array_remove(array[
      case when tg_op <> 'INSERT' then old.room_id end,
      case when tg_op <> 'DELETE' then new.room_id end
    ], null)
  loop
    update rooms set occupied = (
      select count(*) from tenancies t
      where t.room_id = r and t.status = 'active'
    ) where id = r;
  end loop;
  return coalesce(new, old);
end $$;
create trigger trg_sync_occupancy
  after insert or update or delete on public.tenancies
  for each row execute function public.sync_room_occupancy();

-- ---------------------------------------------------------------------------
-- PAYMENTS  (read-only for clients; mutations via RPCs/webhooks only)
-- ---------------------------------------------------------------------------
create policy payments_select on public.payments for select
  using (student_id = auth.uid() or staff_of_pg(pg_id));
-- no insert/update/delete policies on purpose: money state changes only
-- through record_offline_payment() / gateway webhooks (service role).

-- ---------------------------------------------------------------------------
-- EXPENSES
-- ---------------------------------------------------------------------------
create policy expenses_select on public.expenses for select
  using (staff_of_pg(pg_id));
create policy expenses_insert on public.expenses for insert
  with check (staff_of_pg(pg_id) and created_by = auth.uid());
create policy expenses_update on public.expenses for update
  using (created_by = auth.uid() or owns_pg(pg_id) or is_admin())
  with check (staff_of_pg(pg_id));
create policy expenses_delete on public.expenses for delete
  using (created_by = auth.uid() or owns_pg(pg_id) or is_admin());

-- ---------------------------------------------------------------------------
-- INVOICES
-- ---------------------------------------------------------------------------
create policy invoices_select on public.invoices for select using (
  is_admin() or exists (
    select 1 from payments p
    where p.id = invoices.payment_id
      and (p.student_id = auth.uid() or staff_of_pg(p.pg_id))
  )
);
-- writes: server-side only.

-- ---------------------------------------------------------------------------
-- COMPLAINTS
-- ---------------------------------------------------------------------------
create policy complaints_select on public.complaints for select
  using (student_id = auth.uid() or staff_of_pg(pg_id));
create policy complaints_student_insert on public.complaints for insert
  with check (
    student_id = auth.uid()
    and exists (select 1 from tenancies t
                where t.student_id = auth.uid()
                  and t.pg_id = pg_id and t.status = 'active')
  );
create policy complaints_staff_update on public.complaints for update
  using (staff_of_pg(pg_id)) with check (staff_of_pg(pg_id));

-- ---------------------------------------------------------------------------
-- NOTICES
-- ---------------------------------------------------------------------------
create policy notices_select on public.notices for select using (
  (pg_id is null and auth.uid() is not null)         -- platform-wide
  or staff_of_pg(pg_id)
  or exists (select 1 from tenancies t
             where t.pg_id = notices.pg_id
               and t.student_id = auth.uid() and t.status = 'active')
);
create policy notices_staff_insert on public.notices for insert
  with check (
    created_by = auth.uid()
    and ((pg_id is not null and staff_of_pg(pg_id))   -- staff: own PG only
         or (pg_id is null and is_admin()))           -- platform-wide: admin only
  );
create policy notices_manage on public.notices for update
  using (created_by = auth.uid() or (pg_id is not null and owns_pg(pg_id)) or is_admin())
  with check (created_by = auth.uid() or (pg_id is not null and owns_pg(pg_id)) or is_admin());
create policy notices_delete on public.notices for delete
  using (created_by = auth.uid() or (pg_id is not null and owns_pg(pg_id)) or is_admin());

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS / SUPPORT / APPROVALS / AUDIT
-- ---------------------------------------------------------------------------
create policy notif_select on public.notifications for select
  using (user_id = auth.uid() or is_admin());
create policy notif_mark_read on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy tickets_select on public.support_tickets for select
  using (user_id = auth.uid() or is_admin());
create policy tickets_insert on public.support_tickets for insert
  with check (user_id = auth.uid());
create policy tickets_admin_update on public.support_tickets for update
  using (is_admin()) with check (is_admin());

create policy approvals_select on public.approvals for select
  using (submitted_by = auth.uid() or is_admin());
-- writes: triggers + admin RPCs only.

create policy audit_admin_read on public.audit_log for select
  using (is_admin());
-- insert-only via SECURITY DEFINER functions; no update/delete for anyone.

-- ---------------------------------------------------------------------------
-- NEW-USER BOOTSTRAP: auth.users -> profiles
-- Role may come from signup metadata but can NEVER be 'admin' this way.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare requested text := coalesce(new.raw_user_meta_data ->> 'role', 'student');
begin
  if requested not in ('student', 'pg_manager', 'pg_owner') then
    requested := 'student';
  end if;
  insert into public.profiles (id, role, full_name, phone, email)
  values (
    new.id,
    requested::user_role,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.phone,
    new.email
  );
  return new;
end $$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as
$$ begin new.updated_at := now(); return new; end $$;

create trigger trg_touch_profiles   before update on public.profiles   for each row execute function public.touch_updated_at();
create trigger trg_touch_kyc        before update on public.owner_kyc  for each row execute function public.touch_updated_at();
create trigger trg_touch_pgs        before update on public.pgs        for each row execute function public.touch_updated_at();
create trigger trg_touch_rooms      before update on public.rooms      for each row execute function public.touch_updated_at();
create trigger trg_touch_bookings   before update on public.bookings   for each row execute function public.touch_updated_at();
create trigger trg_touch_tenancies  before update on public.tenancies  for each row execute function public.touch_updated_at();
create trigger trg_touch_payments   before update on public.payments   for each row execute function public.touch_updated_at();
create trigger trg_touch_complaints before update on public.complaints for each row execute function public.touch_updated_at();
