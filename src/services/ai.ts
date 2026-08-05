/**
 * AVRO — AI Service
 *
 * Primary:  Gemini 2.5 Flash  (Google AI Studio — free tier)
 * Fallback: NVIDIA NIM Llama 3.3 70B  (free 1 000 credits / month)
 *
 * Use Cases:
 *  1. generateInsights()   → ObservationFeed cards in HostControlScreen
 *  2. summariseChat()      → One-line conversation preview
 *  3. rankSearchResults()  → Smart reranking in InteractiveSearchBar
 *  4. assessRentRisk()     → Risk score + recommended action for a resident
 */

import { ENV } from '../config/env';
import type { DbProperty, DbRentPayment, DbObservation, ObservationTone } from './supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Observation {
  title: string;
  evidence: string;
  tone: ObservationTone;
  icon: string;
}

export interface RentRiskResult {
  score: number;         // 0–100, higher = more risk
  label: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendation: string;
}

export interface SearchRankResult {
  propertyId: string;
  reason: string;
  relevanceScore: number;
}

// ── Gemini 2.5 Flash ──────────────────────────────────────────────────────────

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(`${GEMINI_URL}?key=${ENV.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }

  const json = await res.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ── NVIDIA NIM (Llama 3.3 70B) ────────────────────────────────────────────────

const NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

async function callNvidia(prompt: string): Promise<string> {
  const res = await fetch(NVIDIA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ENV.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta/llama-3.3-70b-instruct',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI assistant for AVRO, a PG (paying-guest accommodation) management platform in India. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`NVIDIA NIM error ${res.status}: ${err}`);
  }

  const json = await res.json();
  return json?.choices?.[0]?.message?.content ?? '';
}

/**
 * Call Gemini first; fall back to NVIDIA if Gemini fails.
 */
async function callAI(prompt: string): Promise<string> {
  try {
    if (ENV.GEMINI_API_KEY) return await callGemini(prompt);
  } catch (e) {
    console.warn('[AVRO AI] Gemini failed, falling back to NVIDIA NIM.', e);
  }
  if (ENV.NVIDIA_API_KEY) return await callNvidia(prompt);
  throw new Error('[AVRO AI] No AI API key configured. Set EXPO_PUBLIC_GEMINI_API_KEY or EXPO_PUBLIC_NVIDIA_API_KEY.');
}

// ── Prompt Builders ───────────────────────────────────────────────────────────

function buildInsightPrompt(property: DbProperty, rentPayments: DbRentPayment[]): string {
  const paidCount = rentPayments.filter((r) => r.status === 'Paid').length;
  const lateCount = rentPayments.filter((r) => r.status === 'Late').length;
  const partialCount = rentPayments.filter((r) => r.status === 'Partial').length;
  const outstanding = rentPayments.reduce((sum, r) => sum + (r.amount - r.amount_paid), 0);

  return `
You are an AI insights engine for AVRO, a PG management platform in India.
Given the following property snapshot, return a JSON array of 3–5 actionable observations.

Property: ${JSON.stringify({
    name: property.name,
    city: property.city,
    occupancy_pct: property.occupancy_pct,
    health_score: property.health_score,
    total_beds: property.total_beds,
    available_beds: property.available_beds,
    revenue_monthly: property.revenue_monthly,
    status: property.status,
  })}

Rent Summary: ${JSON.stringify({ paidCount, lateCount, partialCount, outstanding })}

Return ONLY a valid JSON array in this exact format:
[
  {
    "title": "Short insight title (max 8 words)",
    "evidence": "One sentence explaining why this matters with specific numbers.",
    "tone": "positive" | "warning" | "neutral" | "critical",
    "icon": "trending-up" | "alert-circle" | "checkmark-circle" | "cash" | "people" | "star"
  }
]
`.trim();
}

function buildChatSummaryPrompt(messages: string[]): string {
  return `
Summarise the following conversation in ONE short sentence (max 12 words) for a notification preview.
Messages (oldest first):
${messages.slice(-10).join('\n')}

Return ONLY a JSON object: { "summary": "..." }
`.trim();
}

function buildSearchRankPrompt(query: string, properties: DbProperty[]): string {
  return `
A user is searching for a PG stay with this query: "${query}"

Rank the following properties from most to least relevant. Return ONLY a JSON array:
[{ "propertyId": "...", "relevanceScore": 0-100, "reason": "..." }]

Properties:
${JSON.stringify(
  properties.map((p) => ({
    id: p.id,
    name: p.name,
    city: p.city,
    locality: p.locality,
    occupancy_pct: p.occupancy_pct,
    rating: p.rating,
    available_beds: p.available_beds,
    revenue_monthly: p.revenue_monthly,
  })),
)}
`.trim();
}

function buildRentRiskPrompt(residentName: string, payments: DbRentPayment[]): string {
  return `
Assess the rent payment risk for PG resident: "${residentName}"

Payment history (last 6 months):
${JSON.stringify(payments.map((p) => ({ month: p.month, status: p.status, amount: p.amount, paid: p.amount_paid })))}

Return ONLY a JSON object:
{ "score": 0-100, "label": "Low"|"Medium"|"High"|"Critical", "recommendation": "..." }
`.trim();
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate ObservationFeed insights for a property.
 */
export async function generateInsights(
  property: DbProperty,
  rentPayments: DbRentPayment[],
): Promise<Observation[]> {
  const raw = await callAI(buildInsightPrompt(property, rentPayments));
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.error('[AVRO AI] Failed to parse insights JSON:', raw);
    return [];
  }
}

/**
 * Summarise the last 10 messages of a conversation into a single preview line.
 */
export async function summariseChat(messages: string[]): Promise<string> {
  if (!messages.length) return '';
  const raw = await callAI(buildChatSummaryPrompt(messages));
  try {
    return JSON.parse(raw)?.summary ?? messages[messages.length - 1];
  } catch {
    return messages[messages.length - 1];
  }
}

/**
 * Re-rank property listings based on a free-text search query.
 */
export async function rankSearchResults(
  query: string,
  properties: DbProperty[],
): Promise<SearchRankResult[]> {
  if (!properties.length || !query.trim()) return [];
  const raw = await callAI(buildSearchRankPrompt(query, properties));
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Assess rent payment risk for a resident given their payment history.
 */
export async function assessRentRisk(
  residentName: string,
  payments: DbRentPayment[],
): Promise<RentRiskResult | null> {
  if (!payments.length) return null;
  const raw = await callAI(buildRentRiskPrompt(residentName, payments));
  try {
    return JSON.parse(raw) as RentRiskResult;
  } catch {
    return null;
  }
}
