# PGManager · Database (Supabase)

**One PostgreSQL database, 19 linked tables** shared by the Expo app (student /
manager / owner) and the admin web console. Everything — role scoping, admin
full-access, the approval queue, the audit trail — is enforced *inside* the
database, not in app code.

## Apply the migrations (one-time, ~2 minutes)

The Supabase CLI is not installed, so use the dashboard:

1. Open https://supabase.com/dashboard → project `mnhwqwlqganjsghqlswt`
2. Go to **SQL Editor → New query**
3. Paste and **Run** each file, strictly in this order:
   1. `migrations/0001_schema.sql`   — enums + 19 tables + FKs + indexes
   2. `migrations/0002_security.sql` — role helpers, RLS policies, triggers
   3. `migrations/0003_functions.sql`— admin RPCs, dashboards, storage buckets

Each file runs as a single transaction; if a step errors, nothing from that
file is half-applied.

## Create your first admin

Admins can never be created through signup (the signup trigger refuses
`role=admin`). Bootstrap one manually:

1. Dashboard → **Authentication → Users → Add user** (email + password)
2. SQL Editor:
   ```sql
   update profiles set role = 'admin', full_name = 'Platform Admin'
   where email = 'you@example.com';
   ```

Then the admin console (`pgmanager-admin`) signs in with those credentials via
`supabase.auth.signInWithPassword`.

## How each surface connects

| Surface | Client | Access |
|---|---|---|
| Expo app | anon key + user JWT | RLS scopes rows to the signed-in student/manager/owner |
| Admin site | anon key + **admin** JWT | RLS `is_admin()` grants full read of every table; mutations go through audited RPCs |
| Webhooks / cron / AI | **service-role key** (server only, never in any client bundle) | bypasses RLS |

### Admin RPCs (each writes `audit_log` in the same transaction)

```js
await supabase.rpc('admin_set_user_active',  { p_user, p_active });
await supabase.rpc('admin_set_pg_status',    { p_pg, p_status: 'approved', p_note });
await supabase.rpc('admin_resolve_approval', { p_approval, p_approve: true, p_note });
await supabase.rpc('admin_stats');           // dashboard numbers
```

### App RPCs

```js
await supabase.rpc('overview');              // role-scoped dashboard (owner/manager/admin)
await supabase.rpc('record_offline_payment', // manager records cash/UPI rent
  { p_pg, p_student, p_amount, p_method: 'cash', p_period: '2026-07-01' });
```

## Built-in automations (triggers)

- signup → `profiles` row created (role from metadata; `admin` refused)
- owner submits KYC → `approvals` queue row appears for admin
- owner sets PG to `pending` → `approvals` queue row appears for admin
- tenancy created/ended → `rooms.occupied` recalculated automatically
- non-admin can never change `profiles.role/active`, PG `status`, or KYC `status`
- `audit_log` is insert-only, admin-readable, written server-side

## What still runs outside the DB (Edge Functions, later)

`razorpay-webhook` (mark payments paid), `kyc-webhook` (provider result),
`ai-assistant` (Claude, key server-side), `rent-due-generator` (monthly cron),
invoice PDF generation. All use the service-role key.
