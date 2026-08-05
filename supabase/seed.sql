-- ============================================================
--  AVRO — Seed Data
--  Mirrors the hardcoded mock data from HostControlScreen.tsx
--
--  IMPORTANT: Replace the owner_uid values with your actual
--  Firebase UID after signing in for the first time.
--  You can find your UID in: Firebase Console → Authentication → Users
-- ============================================================

-- ── Seed owner user ────────────────────────────────────────────────────────────
-- Replace 'REPLACE_WITH_YOUR_FIREBASE_UID' with your actual Firebase UID
INSERT INTO public.users (uid, email, full_name, role) VALUES
  ('REPLACE_WITH_YOUR_FIREBASE_UID', 'host@email.com', 'Rakesh Mehta', 'owner')
ON CONFLICT (uid) DO UPDATE SET role = 'owner', full_name = EXCLUDED.full_name;

-- ── Seed manager users ────────────────────────────────────────────────────────
INSERT INTO public.users (uid, email, full_name, role) VALUES
  ('manager-rahul-uid', 'rahul@avro.in', 'Rahul Mehra', 'manager'),
  ('manager-simran-uid', 'simran@avro.in', 'Simran Kaur', 'manager'),
  ('manager-priya-uid', 'priya@avro.in', 'Priya Nair', 'manager')
ON CONFLICT (uid) DO NOTHING;

-- ── Seed properties ────────────────────────────────────────────────────────────
INSERT INTO public.properties (id, owner_uid, name, city, locality, occupancy_pct, health_score, total_beds, available_beds, revenue_monthly, status, assured, rating)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'REPLACE_WITH_YOUR_FIREBASE_UID', 'Sai Residency',  'Delhi',     'Kamla Nagar',     92, 91, 74, 6,  428600, 'Live',   true, 4.8),
  ('a1000000-0000-0000-0000-000000000002', 'REPLACE_WITH_YOUR_FIREBASE_UID', 'Ivy House',      'Jalandhar', 'Model Town',       84, 82, 73, 12, 367400, 'Live',   true, 4.6),
  ('a1000000-0000-0000-0000-000000000003', 'REPLACE_WITH_YOUR_FIREBASE_UID', 'The Nook',       'Noida',     'Sector 62',        76, 74, 75, 18, 302800, 'Live',   false, 4.4),
  ('a1000000-0000-0000-0000-000000000004', 'REPLACE_WITH_YOUR_FIREBASE_UID', 'Pine Living',    'Delhi',     'Mukherjee Nagar',  68, 67, 60, 19, 229500, 'Paused', false, 4.2)
ON CONFLICT (id) DO NOTHING;

-- ── Seed rooms for Sai Residency ───────────────────────────────────────────────
INSERT INTO public.rooms (id, property_id, room_number, room_type, floor, price_monthly, status) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', '204', 'Twin',   2, 12500, 'occupied'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', '302', 'Twin',   3, 13000, 'occupied'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', '108', 'Triple', 1, 9800,  'occupied'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', '405', 'Single', 4, 16800, 'occupied'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', '203', 'Twin',   2, 12500, 'occupied'),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', '103', 'Triple', 1, 9800,  'occupied'),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', '205', 'Twin',   2, 12500, 'occupied')
ON CONFLICT (id) DO NOTHING;

-- ── Seed resident users ───────────────────────────────────────────────────────
INSERT INTO public.users (uid, email, full_name, role) VALUES
  ('res-raunak-uid', 'raunak@example.com',  'Raunak Bansal', 'resident'),
  ('res-aisha-uid',  'aisha@example.com',   'Aisha Khan',    'resident'),
  ('res-kabir-uid',  'kabir@example.com',   'Kabir Jain',    'resident'),
  ('res-meher-uid',  'meher@example.com',   'Meher Sood',    'resident'),
  ('res-rishabh-uid','rishabh@example.com', 'Rishabh Verma', 'resident'),
  ('res-tanvi-uid',  'tanvi@example.com',   'Tanvi Rao',     'resident'),
  ('res-harsh-uid',  'harsh@example.com',   'Harsh Kapoor',  'resident')
ON CONFLICT (uid) DO NOTHING;

-- ── Seed residents ────────────────────────────────────────────────────────────
INSERT INTO public.residents (id, uid, property_id, room_id, move_in_date, agreement_end_date, deposit_amount, manager_uid, verification_status) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'res-raunak-uid',  'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '2025-09-01', '2026-08-31', 12500, 'manager-rahul-uid', 'Verified'),
  ('c1000000-0000-0000-0000-000000000002', 'res-aisha-uid',   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', '2025-09-14', '2026-09-14', 13000, 'manager-rahul-uid', 'Verified'),
  ('c1000000-0000-0000-0000-000000000003', 'res-kabir-uid',   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', '2025-08-20', '2026-08-20', 9800,  'manager-rahul-uid', 'Verified'),
  ('c1000000-0000-0000-0000-000000000004', 'res-meher-uid',   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', '2025-11-04', '2026-11-04', 16800, 'manager-rahul-uid', 'Verified'),
  ('c1000000-0000-0000-0000-000000000005', 'res-rishabh-uid', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', '2025-08-17', '2026-08-17', 12500, 'manager-rahul-uid', 'Verified'),
  ('c1000000-0000-0000-0000-000000000006', 'res-tanvi-uid',   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006', '2025-12-11', '2026-12-11', 9800,  'manager-rahul-uid', 'Verified'),
  ('c1000000-0000-0000-0000-000000000007', 'res-harsh-uid',   'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', '2025-09-05', '2026-09-05', 12500, 'manager-rahul-uid', 'Verified')
ON CONFLICT (id) DO NOTHING;

-- ── Seed rent payments (July 2026) ────────────────────────────────────────────
INSERT INTO public.rent_payments (id, resident_id, property_id, amount, amount_paid, due_date, status, month) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 12500, 12500, '2026-07-01', 'Paid',     '2026-07'),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 13000, 6500,  '2026-07-01', 'Partial',  '2026-07'),
  ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 9800,  0,     '2026-07-01', 'Late',     '2026-07'),
  ('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 16800, 0,     '2026-08-04', 'Upcoming', '2026-07'),
  ('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 12500, 0,     '2026-07-01', 'Late',     '2026-07'),
  ('d1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 9800,  9800,  '2026-08-01', 'Paid',     '2026-07'),
  ('d1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 12500, 0,     '2026-08-05', 'Upcoming', '2026-07')
ON CONFLICT (id) DO NOTHING;

-- ── Seed maintenance tickets ──────────────────────────────────────────────────
INSERT INTO public.maintenance_tickets (id, ticket_number, property_id, room_id, reported_by, category, description, status) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'M-241', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'Plumbing',    'Bathroom tap is leaking.', 'In progress'),
  ('e1000000-0000-0000-0000-000000000002', 'M-240', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'Electrical',  'Fan not working.', 'Open')
ON CONFLICT (id) DO NOTHING;

-- ── Seed revenue opportunities ─────────────────────────────────────────────────
INSERT INTO public.revenue_opportunities (property_id, category, amount, affected_beds, description) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Lost',        24300,  2, 'Revenue lost from vacant beds this month'),
  ('a1000000-0000-0000-0000-000000000001', 'Recoverable', 6500,   1, 'Partial payment outstanding from Aisha Khan'),
  ('a1000000-0000-0000-0000-000000000001', 'Potential',   42000,  3, 'Beds available for conversion to premium tier'),
  ('a1000000-0000-0000-0000-000000000001', 'Protected',   428600, 68, 'Current occupied bed revenue secured')
ON CONFLICT DO NOTHING;

-- ── Seed conversations ────────────────────────────────────────────────────────
INSERT INTO public.conversations (id, property_id, participant_uids, kind, priority, last_message, last_message_at) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', ARRAY['REPLACE_WITH_YOUR_FIREBASE_UID', 'res-aisha-uid'],  'Rent',        true,  'I have uploaded the payment screenshot.', '2026-07-31 12:36:00+00'),
  ('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', ARRAY['REPLACE_WITH_YOUR_FIREBASE_UID', 'res-kabir-uid'],  'Maintenance', true,  'The bathroom tap is leaking again.',       '2026-07-31 11:12:00+00'),
  ('f1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', ARRAY['REPLACE_WITH_YOUR_FIREBASE_UID', 'res-meher-uid'],  'Resident',    false, 'Can my mother visit this Sunday?',         '2026-07-30 09:00:00+00')
ON CONFLICT (id) DO NOTHING;
