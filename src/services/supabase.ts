/**
 * AVRO — Supabase Service
 *
 * Provides a typed Supabase client and query helpers for:
 *   - Properties
 *   - Residents & Rooms
 *   - Rent Payments
 *   - Maintenance Tickets
 *   - Conversations & Messages
 *   - AI Observations
 *   - Funnel Events
 *
 * Authentication: Supabase uses the Firebase JWT (injected via global headers)
 * to enforce Row-Level Security policies. Call `setSupabaseAuthToken(token)`
 * after every Firebase sign-in.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from '../config/env';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PaymentStatus = 'Paid' | 'Partial' | 'Late' | 'Upcoming';
export type PropertyStatus = 'Live' | 'Paused' | 'Draft';
export type TicketStatus = 'Open' | 'In progress' | 'Resolved';
export type RoomType = 'Single' | 'Twin' | 'Triple' | 'Quad';
export type UserRole = 'owner' | 'manager' | 'resident';
export type ObservationTone = 'positive' | 'warning' | 'neutral' | 'critical';
export type FunnelStage = 'Search' | 'Viewed' | 'Saved' | 'Visited' | 'Booked' | 'Moved in';
export type ConversationKind = 'Rent' | 'Maintenance' | 'Resident' | 'Manager';
export type RevenueCat = 'Lost' | 'Recoverable' | 'Potential' | 'Protected';

export interface DbUser {
  uid: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
}

export interface DbProperty {
  id: string;
  owner_uid: string;
  name: string;
  city: string;
  locality: string;
  address?: string;
  pincode?: string;
  occupancy_pct: number;
  health_score: number;
  total_beds: number;
  available_beds: number;
  revenue_monthly: number;
  status: PropertyStatus;
  assured: boolean;
  rating: number;
  created_at: string;
}

export interface DbRoom {
  id: string;
  property_id: string;
  room_number: string;
  room_type: RoomType;
  floor: number;
  price_monthly: number;
  status: 'occupied' | 'available' | 'maintenance';
}

export interface DbResident {
  id: string;
  uid: string;
  property_id: string;
  room_id: string;
  move_in_date: string;
  agreement_end_date: string;
  deposit_amount: number;
  manager_uid: string;
  verification_status: string;
}

export interface DbRentPayment {
  id: string;
  resident_id: string;
  property_id: string;
  amount: number;
  amount_paid: number;
  due_date: string;
  paid_date?: string;
  status: PaymentStatus;
  month: string;
}

export interface DbTicket {
  id: string;
  ticket_number: string;
  property_id: string;
  room_id?: string;
  reported_by?: string;
  category: string;
  description: string;
  status: TicketStatus;
  reported_at: string;
  resolved_at?: string;
}

export interface DbConversation {
  id: string;
  property_id: string;
  participant_uids: string[];
  kind: ConversationKind;
  priority: boolean;
  last_message?: string;
  last_message_at?: string;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  sender_uid: string;
  body: string;
  sent_at: string;
  read_by: string[];
}

export interface DbObservation {
  id: string;
  property_id: string;
  title: string;
  evidence: string;
  tone: ObservationTone;
  icon: string;
  generated_by: string;
  created_at: string;
}

export interface DbRevenueOpportunity {
  id: string;
  property_id: string;
  category: RevenueCat;
  amount: number;
  affected_beds: number;
  description: string;
  status: string;
}

// ── Client singleton ──────────────────────────────────────────────────────────

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
      auth: {
        // We handle auth via Firebase; Supabase only sees the JWT.
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getClient() as any)[prop];
  },
});

/**
 * Inject a Firebase ID token so Supabase RLS can identify the caller.
 * Call this right after every Firebase sign-in / token refresh.
 */
export async function setSupabaseAuthToken(firebaseIdToken: string): Promise<void> {
  // Supabase custom JWT auth: set the Authorization header globally
  // The Supabase client will use this token for all subsequent requests.
  _client = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${firebaseIdToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/** Clear the authenticated client (on sign-out). */
export function clearSupabaseAuth(): void {
  _client = null;
}

// ── Query Helpers ─────────────────────────────────────────────────────────────

/** Upsert a user record on first login. */
export async function upsertUser(user: DbUser): Promise<void> {
  const { error } = await supabase.from('users').upsert(user, { onConflict: 'uid' });
  if (error) throw error;
}

/** Fetch the user's role from the database. */
export async function fetchUserRole(uid: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('uid', uid)
    .single();
  if (error) return null;
  return data?.role ?? null;
}

/** Fetch all properties owned by the current user. */
export async function fetchProperties(ownerUid: string): Promise<DbProperty[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_uid', ownerUid)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Fetch all live properties for the home listing screen (public view). */
export async function fetchPublicListings(city?: string): Promise<DbProperty[]> {
  let query = supabase
    .from('properties')
    .select('*')
    .eq('status', 'Live')
    .order('rating', { ascending: false });
  if (city) query = query.eq('city', city);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Fetch residents for a property. */
export async function fetchResidents(propertyId: string): Promise<DbResident[]> {
  const { data, error } = await supabase
    .from('residents')
    .select('*, users(full_name, email, phone, avatar_url), rooms(room_number, room_type, floor)')
    .eq('property_id', propertyId);
  if (error) throw error;
  return data ?? [];
}

/** Fetch rent records for a property (current month). */
export async function fetchRentPayments(
  propertyId: string,
  month?: string,
): Promise<DbRentPayment[]> {
  const targetMonth = month ?? new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const { data, error } = await supabase
    .from('rent_payments')
    .select('*')
    .eq('property_id', propertyId)
    .eq('month', targetMonth);
  if (error) throw error;
  return data ?? [];
}

/** Update a rent payment's status. */
export async function updateRentPayment(
  id: string,
  patch: Partial<Pick<DbRentPayment, 'amount_paid' | 'status' | 'paid_date'>>,
): Promise<void> {
  const { error } = await supabase.from('rent_payments').update(patch).eq('id', id);
  if (error) throw error;
}

/** Fetch maintenance tickets for a property. */
export async function fetchTickets(propertyId: string): Promise<DbTicket[]> {
  const { data, error } = await supabase
    .from('maintenance_tickets')
    .select('*')
    .eq('property_id', propertyId)
    .order('reported_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Create a new maintenance ticket. */
export async function createTicket(
  ticket: Omit<DbTicket, 'id' | 'reported_at' | 'resolved_at'>,
): Promise<DbTicket> {
  const { data, error } = await supabase
    .from('maintenance_tickets')
    .insert(ticket)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Fetch conversations for a property. */
export async function fetchConversations(propertyId: string): Promise<DbConversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('property_id', propertyId)
    .order('last_message_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Fetch messages in a conversation. */
export async function fetchMessages(conversationId: string): Promise<DbMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Send a message in a conversation. */
export async function sendMessage(
  conversationId: string,
  senderUid: string,
  body: string,
): Promise<DbMessage> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_uid: senderUid, body, read_by: [senderUid] })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Subscribe to real-time messages in a conversation. */
export function subscribeToMessages(
  conversationId: string,
  onMessage: (msg: DbMessage) => void,
) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => onMessage(payload.new as DbMessage),
    )
    .subscribe();
}

/** Fetch AI observations for a property (latest 10). */
export async function fetchObservations(propertyId: string): Promise<DbObservation[]> {
  const { data, error } = await supabase
    .from('ai_observations')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return data ?? [];
}

/** Save a batch of AI-generated observations. */
export async function saveObservations(
  observations: Omit<DbObservation, 'id' | 'created_at'>[],
): Promise<void> {
  const { error } = await supabase.from('ai_observations').insert(observations);
  if (error) throw error;
}

/** Fetch revenue opportunity breakdown for a property. */
export async function fetchRevenueOpportunities(
  propertyId: string,
): Promise<DbRevenueOpportunity[]> {
  const { data, error } = await supabase
    .from('revenue_opportunities')
    .select('*')
    .eq('property_id', propertyId)
    .eq('status', 'active');
  if (error) throw error;
  return data ?? [];
}

/** Log a funnel event (e.g., a user viewed a property listing). */
export async function logFunnelEvent(
  propertyId: string,
  stage: import('./supabase').FunnelStage,
  options: { sourceChannel?: string; userId?: string; sessionId?: string } = {},
): Promise<void> {
  await supabase.from('funnel_events').insert({
    property_id: propertyId,
    stage,
    source_channel: options.sourceChannel,
    user_id: options.userId,
    session_id: options.sessionId,
  });
}
