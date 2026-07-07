-- ============================================================================
-- PGManager · 0001_schema.sql
-- One database, 19 linked tables. Apply FIRST (before 0002 and 0003).
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- ENUMS (12)
-- ---------------------------------------------------------------------------
create type user_role        as enum ('student', 'pg_manager', 'pg_owner', 'admin');
create type id_type          as enum ('aadhaar', 'pan', 'driving_license', 'voter_id', 'passport');
create type kyc_status       as enum ('unverified', 'pending', 'verified', 'rejected');
create type pg_status        as enum ('draft', 'pending', 'approved', 'rejected', 'suspended');
create type doc_type         as enum ('identity', 'pg_license', 'police_registration', 'fire_noc',
                                      'fssai', 'electricity_bill', 'property_tax', 'rent_agreement',
                                      'owner_noc', 'other');
create type booking_status   as enum ('pending', 'confirmed', 'cancelled', 'expired');
create type tenancy_status   as enum ('active', 'notice', 'ended');
create type payment_status   as enum ('pending', 'paid', 'failed', 'refunded');
create type payment_type     as enum ('rent', 'token', 'deposit', 'other');
create type complaint_status as enum ('open', 'in_progress', 'resolved', 'rejected');
create type approval_type    as enum ('pg_listing', 'owner_kyc');
create type approval_status  as enum ('pending', 'approved', 'rejected');

-- ===========================================================================
-- DOMAIN 1 · IDENTITY (4 tables)
-- ===========================================================================

-- 1. profiles — one row per auth user; the role lives here.
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        user_role   not null default 'student',
  full_name   text        not null default '',
  phone       text,
  email       text,
  avatar_url  text,
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. owner_kyc — verification state for PG owners.
--    NOTE (compliance): store ONLY masked last-4 + the KYC provider's
--    reference. Never full Aadhaar numbers or document images.
create table public.owner_kyc (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references public.profiles (id) on delete cascade,
  status           kyc_status not null default 'pending',
  id_kind          id_type    not null,
  id_last4         text       not null default '',
  provider_ref     text,                -- KYC provider transaction/verification id
  name_on_id       text,
  dob              date,
  submitted_at     timestamptz not null default now(),
  reviewed_by      uuid references public.profiles (id),
  reviewed_at      timestamptz,
  rejection_reason text,
  updated_at       timestamptz not null default now(),
  unique (owner_id)
);

-- 3. manager_assignments — THE link that scopes a manager to a PG.
--    (pgs is created below; FK added afterwards.)
create table public.manager_assignments (
  id          uuid primary key default gen_random_uuid(),
  pg_id       uuid not null,
  manager_id  uuid not null references public.profiles (id) on delete cascade,
  assigned_by uuid not null references public.profiles (id),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (pg_id, manager_id)
);

-- 4. device_tokens — Expo push tokens per device.
create table public.device_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  token      text not null,
  platform   text not null default 'android',
  created_at timestamptz not null default now(),
  unique (user_id, token)
);

-- ===========================================================================
-- DOMAIN 2 · PROPERTY (4 tables)
-- ===========================================================================

-- 5. pgs — a property. Students only ever see status='approved' (RLS).
create table public.pgs (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references public.profiles (id) on delete restrict,
  name          text not null,
  address       text not null default '',
  city          text not null default '',
  state         text not null default '',
  pincode       text not null default '',
  lat           double precision,
  lng           double precision,
  gender_policy text not null default 'coliving',   -- male | female | coliving
  meals         boolean not null default false,
  amenities     jsonb not null default '[]',
  photos        text[] not null default '{}',
  status        pg_status not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.manager_assignments
  add constraint manager_assignments_pg_fk
  foreign key (pg_id) references public.pgs (id) on delete cascade;

-- 6. pg_documents — the state-aware compliance checklist per PG.
create table public.pg_documents (
  id           uuid primary key default gen_random_uuid(),
  pg_id        uuid not null references public.pgs (id) on delete cascade,
  doc_kind     doc_type not null,
  storage_path text not null,           -- path in the private "documents" bucket
  license_no   text,
  expires_at   date,
  verified     boolean not null default false,
  uploaded_by  uuid not null references public.profiles (id),
  created_at   timestamptz not null default now()
);

-- 7. rooms — capacity/occupied match what the app already queries.
--    `occupied` is maintained by a trigger from tenancies, never by clients.
create table public.rooms (
  id           uuid primary key default gen_random_uuid(),
  pg_id        uuid not null references public.pgs (id) on delete cascade,
  number       text not null,
  floor        int  not null default 0,
  room_type    text not null default 'double',      -- single | double | triple | dorm
  capacity     int  not null default 2 check (capacity > 0),
  occupied     int  not null default 0 check (occupied >= 0),
  rent_monthly numeric(10,2) not null default 0,
  deposit      numeric(10,2) not null default 0,
  amenities    jsonb not null default '[]',
  photos       text[] not null default '{}',
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (pg_id, number)
);

-- 8. beds — optional bed-level granularity (phase 2; safe to leave empty).
create table public.beds (
  id       uuid primary key default gen_random_uuid(),
  room_id  uuid not null references public.rooms (id) on delete cascade,
  label    text not null,
  active   boolean not null default true,
  unique (room_id, label)
);

-- ===========================================================================
-- DOMAIN 3 · COMMERCE (5 tables)
-- ===========================================================================

-- 9. bookings — a student's request for a room.
create table public.bookings (
  id                 uuid primary key default gen_random_uuid(),
  pg_id              uuid not null references public.pgs (id) on delete cascade,
  room_id            uuid not null references public.rooms (id) on delete cascade,
  student_id         uuid not null references public.profiles (id) on delete cascade,
  status             booking_status not null default 'pending',
  token_amount       numeric(10,2) not null default 0,
  requested_checkin  date,
  expires_at         timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- 10. tenancies — an actual stay. Powers "My Stay" and rooms.occupied.
create table public.tenancies (
  id            uuid primary key default gen_random_uuid(),
  pg_id         uuid not null references public.pgs (id) on delete restrict,
  room_id       uuid not null references public.rooms (id) on delete restrict,
  bed_id        uuid references public.beds (id),
  student_id    uuid not null references public.profiles (id) on delete restrict,
  booking_id    uuid references public.bookings (id),
  rent_monthly  numeric(10,2) not null default 0,
  deposit_paid  numeric(10,2) not null default 0,
  checkin       date not null default current_date,
  checkout      date,
  status        tenancy_status not null default 'active',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
-- one ACTIVE stay per student
create unique index one_active_tenancy_per_student
  on public.tenancies (student_id) where (status = 'active');

-- 11. payments — money records. Mutated ONLY by server functions/webhooks.
create table public.payments (
  id                 uuid primary key default gen_random_uuid(),
  pg_id              uuid not null references public.pgs (id) on delete restrict,
  student_id         uuid not null references public.profiles (id) on delete restrict,
  tenancy_id         uuid references public.tenancies (id),
  booking_id         uuid references public.bookings (id),
  amount             numeric(10,2) not null check (amount >= 0),
  pay_type           payment_type   not null default 'rent',
  status             payment_status not null default 'pending',
  method             text,                          -- upi | cash | card | bank
  period_month       date,                          -- first of month, for rent
  due_date           date,
  paid_at            timestamptz,
  gateway_order_id   text,
  gateway_payment_id text,
  receipt_no         text unique,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- 12. expenses — manager/owner entered; feeds P&L.
create table public.expenses (
  id           uuid primary key default gen_random_uuid(),
  pg_id        uuid not null references public.pgs (id) on delete cascade,
  category     text not null default 'other',   -- electricity | groceries | staff | repairs | ...
  amount       numeric(10,2) not null check (amount >= 0),
  note         text,
  receipt_path text,
  expense_date date not null default current_date,
  created_by   uuid not null references public.profiles (id),
  created_at   timestamptz not null default now()
);

-- 13. invoices — one per paid payment; PDF generated server-side.
create table public.invoices (
  id         uuid primary key default gen_random_uuid(),
  payment_id uuid not null unique references public.payments (id) on delete cascade,
  number     text not null unique,
  pdf_path   text,
  issued_at  timestamptz not null default now()
);

-- ===========================================================================
-- DOMAIN 4 · OPERATIONS (4 tables)
-- ===========================================================================

-- 14. complaints
create table public.complaints (
  id              uuid primary key default gen_random_uuid(),
  pg_id           uuid not null references public.pgs (id) on delete cascade,
  student_id      uuid not null references public.profiles (id) on delete cascade,
  category        text not null default 'other',  -- water | electricity | food | cleaning | wifi | other
  title           text not null,
  description     text not null default '',
  photos          text[] not null default '{}',
  status          complaint_status not null default 'open',
  assigned_to     uuid references public.profiles (id),
  resolution_note text,
  created_at      timestamptz not null default now(),
  resolved_at     timestamptz,
  updated_at      timestamptz not null default now()
);

-- 15. notices — pg_id NULL = platform-wide (admin only, enforced by RLS).
create table public.notices (
  id         uuid primary key default gen_random_uuid(),
  pg_id      uuid references public.pgs (id) on delete cascade,
  title      text not null,
  body       text not null default '',
  created_by uuid not null references public.profiles (id),
  publish_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- 16. notifications — in-app inbox (push fan-out reads device_tokens).
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  title      text not null,
  body       text not null default '',
  data       jsonb not null default '{}',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- 17. support_tickets — backs the student Support screen.
create table public.support_tickets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  subject    text not null,
  message    text not null default '',
  status     text not null default 'open',       -- open | replied | closed
  created_at timestamptz not null default now()
);

-- ===========================================================================
-- DOMAIN 5 · PLATFORM / ADMIN (2 tables)
-- ===========================================================================

-- 18. approvals — the admin review queue (auto-filled by triggers).
create table public.approvals (
  id           uuid primary key default gen_random_uuid(),
  kind         approval_type not null,
  subject_id   uuid not null,                    -- pgs.id or owner_kyc.id
  submitted_by uuid not null references public.profiles (id) on delete cascade,
  status       approval_status not null default 'pending',
  decided_by   uuid references public.profiles (id),
  decided_at   timestamptz,
  note         text,
  created_at   timestamptz not null default now()
);

-- 19. audit_log — insert-only trail of privileged actions.
create table public.audit_log (
  id           bigint generated always as identity primary key,
  actor_id     uuid references public.profiles (id),
  actor_role   user_role,
  action       text not null,
  target_table text not null,
  target_id    text not null,
  meta         jsonb not null default '{}',
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- INDEXES on every foreign key used in lookups
-- ---------------------------------------------------------------------------
create index idx_kyc_owner            on public.owner_kyc (owner_id);
create index idx_assign_manager       on public.manager_assignments (manager_id) where active;
create index idx_assign_pg            on public.manager_assignments (pg_id) where active;
create index idx_pgs_owner            on public.pgs (owner_id);
create index idx_pgs_status_city      on public.pgs (status, city);
create index idx_pgdocs_pg            on public.pg_documents (pg_id);
create index idx_rooms_pg             on public.rooms (pg_id);
create index idx_beds_room            on public.beds (room_id);
create index idx_bookings_student     on public.bookings (student_id);
create index idx_bookings_pg_status   on public.bookings (pg_id, status);
create index idx_tenancies_student    on public.tenancies (student_id);
create index idx_tenancies_pg_status  on public.tenancies (pg_id, status);
create index idx_tenancies_room       on public.tenancies (room_id);
create index idx_payments_pg_status   on public.payments (pg_id, status);
create index idx_payments_student     on public.payments (student_id);
create index idx_payments_period      on public.payments (period_month);
create index idx_expenses_pg_date     on public.expenses (pg_id, expense_date);
create index idx_complaints_pg_status on public.complaints (pg_id, status);
create index idx_complaints_student   on public.complaints (student_id);
create index idx_notices_pg           on public.notices (pg_id);
create index idx_notifications_user   on public.notifications (user_id, read);
create index idx_tickets_user         on public.support_tickets (user_id);
create index idx_approvals_status     on public.approvals (status, kind);
create index idx_audit_created        on public.audit_log (created_at desc);
