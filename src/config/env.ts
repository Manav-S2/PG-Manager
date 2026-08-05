/**
 * AVRO — Environment Configuration
 * All EXPO_PUBLIC_ variables are inlined at build time by Expo.
 * Never put secrets that should stay server-side here on a React Native client.
 */
export const ENV = {
  // ── Supabase ─────────────────────────────────────────────────────────────
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',

  // ── Firebase ─────────────────────────────────────────────────────────────
  FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',

  // ── AI ───────────────────────────────────────────────────────────────────
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '',
  NVIDIA_API_KEY: process.env.EXPO_PUBLIC_NVIDIA_API_KEY ?? '',
} as const;

/** Returns true only when all critical env vars are set. */
export function isEnvConfigured(): boolean {
  return !!(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY && ENV.FIREBASE_API_KEY);
}
