-- ============================================================
--  AVRO — Supabase PostgreSQL Schema
--  Run this in the Supabase SQL Editor (Project → SQL Editor → New Query)
--
--  Stack:
--    - Firebase handles authentication (UIDs are Firebase UIDs)
--    - Supabase handles data + realtime + storage
--    - RLS policies use Firebase JWT injected as Authorization header
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Helper: extract Firebase UID from JWT ──────────────────────────────────────
-- Supabase's auth.uid() won't work with Firebase JWTs by default.
-- We create a helper function that reads the 'sub' claim from the JWT.
CREATE OR REPLACE FUNCTION firebase_uid() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::TEXT;
$$ LANGUAGE sql STABLE;

-- ============================================================
--  TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  uid           TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL DEFAULT '',
  phone         TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'resident'
                  CHECK (role IN ('owner', 'manager', 'resident')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own record
CREATE POLICY "users_select_own"  ON public.users FOR SELECT USING (uid = firebase_uid());
CREATE POLICY "users_insert_own"  ON public.users FOR INSERT WITH CHECK (uid = firebase_uid());
CREATE POLICY "users_update_own"  ON public.users FOR UPDATE USING (uid = firebase_uid());

-- ============================================================
--  TABLE: properties
-- ============================================================
CREATE TABLE IF NOT EXISTS public.properties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_uid       TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  city            TEXT NOT NULL,
  locality        TEXT NOT NULL,
  address         TEXT,
  pincode         TEXT,
  occupancy_pct   NUMERIC NOT NULL DEFAULT 0 CHECK (occupancy_pct BETWEEN 0 AND 100),
  health_score    INT NOT NULL DEFAULT 0 CHECK (health_score BETWEEN 0 AND 100),
  total_beds      INT NOT NULL DEFAULT 0,
  available_beds  INT NOT NULL DEFAULT 0,
  revenue_monthly NUMERIC NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'Draft'
                    CHECK (status IN ('Live', 'Paused', 'Draft')),
  assured         BOOLEAN NOT NULL DEFAULT false,
  rating          NUMERIC DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Owners see their own properties
CREATE POLICY "properties_owner_all" ON public.properties FOR ALL
  USING (owner_uid = firebase_uid());

-- Public can see live properties (for listing/search screen)
CREATE POLICY "properties_public_read" ON public.properties FOR SELECT
  USING (status = 'Live');

-- ============================================================
--  TABLE: rooms
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  room_number   TEXT NOT NULL,
  room_type     TEXT NOT NULL CHECK (room_type IN ('Single', 'Twin', 'Triple', 'Quad')),
  floor         INT NOT NULL DEFAULT 0,
  price_monthly NUMERIC NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'available'
                  CHECK (status IN ('occupied', 'available', 'maintenance'))
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Property owners manage rooms; managers and residents can view their property's rooms
CREATE POLICY "rooms_owner_all" ON public.rooms FOR ALL
  USING (
    property_id IN (SELECT id FROM public.properties WHERE owner_uid = firebase_uid())
  );

-- ============================================================
--  TABLE: residents
-- ============================================================
CREATE TABLE IF NOT EXISTS public.residents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid                 TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  property_id         UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  room_id             UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  move_in_date        DATE,
  agreement_end_date  DATE,
  deposit_amount      NUMERIC NOT NULL DEFAULT 0,
  manager_uid         TEXT REFERENCES public.users(uid) ON DELETE SET NULL,
  verification_status TEXT NOT NULL DEFAULT 'Pending'
);

ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;

-- Residents see their own record; owners see residents in their properties
CREATE POLICY "residents_self" ON public.residents FOR SELECT
  USING (uid = firebase_uid());
CREATE POLICY "residents_owner" ON public.residents FOR ALL
  USING (
    property_id IN (SELECT id FROM public.properties WHERE owner_uid = firebase_uid())
  );

-- ============================================================
--  TABLE: rent_payments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rent_payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  amount      NUMERIC NOT NULL,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  due_date    DATE NOT NULL,
  paid_date   DATE,
  status      TEXT NOT NULL DEFAULT 'Upcoming'
                CHECK (status IN ('Paid', 'Partial', 'Late', 'Upcoming')),
  month       TEXT NOT NULL  -- format: 'YYYY-MM'
);

ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;

-- Residents see their own rent; owners see all rent in their properties
CREATE POLICY "rent_self" ON public.rent_payments FOR SELECT
  USING (
    resident_id IN (SELECT id FROM public.residents WHERE uid = firebase_uid())
  );
CREATE POLICY "rent_owner" ON public.rent_payments FOR ALL
  USING (
    property_id IN (SELECT id FROM public.properties WHERE owner_uid = firebase_uid())
  );

-- ============================================================
--  TABLE: maintenance_tickets
-- ============================================================
CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  property_id   UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  room_id       UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  reported_by   UUID REFERENCES public.residents(id) ON DELETE SET NULL,
  category      TEXT NOT NULL,
  description   TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'Open'
                  CHECK (status IN ('Open', 'In progress', 'Resolved')),
  reported_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at   TIMESTAMPTZ
);

ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tickets_reporter" ON public.maintenance_tickets FOR SELECT
  USING (
    reported_by IN (SELECT id FROM public.residents WHERE uid = firebase_uid())
  );
CREATE POLICY "tickets_owner" ON public.maintenance_tickets FOR ALL
  USING (
    property_id IN (SELECT id FROM public.properties WHERE owner_uid = firebase_uid())
  );

-- ============================================================
--  TABLE: conversations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  participant_uids TEXT[] NOT NULL DEFAULT '{}',
  kind            TEXT NOT NULL CHECK (kind IN ('Rent', 'Maintenance', 'Resident', 'Manager')),
  priority        BOOLEAN NOT NULL DEFAULT false,
  last_message    TEXT,
  last_message_at TIMESTAMPTZ
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Participants can read; owners can manage
CREATE POLICY "conv_participant" ON public.conversations FOR SELECT
  USING (firebase_uid() = ANY(participant_uids));
CREATE POLICY "conv_owner" ON public.conversations FOR ALL
  USING (
    property_id IN (SELECT id FROM public.properties WHERE owner_uid = firebase_uid())
  );

-- ============================================================
--  TABLE: messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_uid      TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  body            TEXT NOT NULL,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_by         TEXT[] NOT NULL DEFAULT '{}'
);

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Sender or conversation participant can read; sender can insert
CREATE POLICY "msg_participant" ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE firebase_uid() = ANY(participant_uids)
    )
  );
CREATE POLICY "msg_insert_sender" ON public.messages FOR INSERT
  WITH CHECK (sender_uid = firebase_uid());

-- ============================================================
--  TABLE: ai_observations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_observations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  evidence      TEXT NOT NULL,
  tone          TEXT NOT NULL CHECK (tone IN ('positive', 'warning', 'neutral', 'critical')),
  icon          TEXT NOT NULL DEFAULT 'star',
  generated_by  TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "obs_owner" ON public.ai_observations FOR ALL
  USING (
    property_id IN (SELECT id FROM public.properties WHERE owner_uid = firebase_uid())
  );

-- ============================================================
--  TABLE: funnel_events
-- ============================================================
CREATE TABLE IF NOT EXISTS public.funnel_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id    UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  stage          TEXT NOT NULL
                   CHECK (stage IN ('Search', 'Viewed', 'Saved', 'Visited', 'Booked', 'Moved in')),
  source_channel TEXT,
  user_id        TEXT,
  session_id     TEXT,
  occurred_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "funnel_owner" ON public.funnel_events FOR ALL
  USING (
    property_id IN (SELECT id FROM public.properties WHERE owner_uid = firebase_uid())
  );

-- Anyone can insert a funnel event (anonymous tracking)
CREATE POLICY "funnel_insert_anon" ON public.funnel_events FOR INSERT
  WITH CHECK (true);

-- ============================================================
--  TABLE: revenue_opportunities
-- ============================================================
CREATE TABLE IF NOT EXISTS public.revenue_opportunities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  category      TEXT NOT NULL CHECK (category IN ('Lost', 'Recoverable', 'Potential', 'Protected')),
  amount        NUMERIC NOT NULL DEFAULT 0,
  affected_beds INT NOT NULL DEFAULT 0,
  description   TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active'
);

ALTER TABLE public.revenue_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rev_opp_owner" ON public.revenue_opportunities FOR ALL
  USING (
    property_id IN (SELECT id FROM public.properties WHERE owner_uid = firebase_uid())
  );

-- ============================================================
--  Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_properties_owner ON public.properties(owner_uid);
CREATE INDEX IF NOT EXISTS idx_properties_city   ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_residents_property ON public.residents(property_id);
CREATE INDEX IF NOT EXISTS idx_rent_property_month ON public.rent_payments(property_id, month);
CREATE INDEX IF NOT EXISTS idx_tickets_property ON public.maintenance_tickets(property_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON public.messages(conversation_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_observations_prop ON public.ai_observations(property_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_funnel_prop ON public.funnel_events(property_id, occurred_at DESC);
