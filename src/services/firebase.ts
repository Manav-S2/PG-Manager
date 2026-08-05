/**
 * AVRO — Firebase Service
 *
 * Provides:
 *  - signIn(email, password)
 *  - signUp(email, password, fullName)
 *  - signInWithGoogle()  ← web only (popup); native uses redirect
 *  - signOut()
 *  - onAuthChanged(callback)
 *  - getIdToken()  ← used to authenticate Supabase requests via RLS
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { Platform } from 'react-native';
import { ENV } from '../config/env';

// ── Firebase app init (singleton) ────────────────────────────────────────────

const firebaseConfig = {
  apiKey: ENV.FIREBASE_API_KEY,
  authDomain: ENV.FIREBASE_AUTH_DOMAIN,
  projectId: ENV.FIREBASE_PROJECT_ID,
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.FIREBASE_APP_ID,
};

const app = ENV.FIREBASE_API_KEY ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]) : null;
export const auth = app ? getAuth(app) : ({} as any);

// ── Auth helpers ──────────────────────────────────────────────────────────────

/**
 * Sign in with email + password.
 */
export async function signIn(email: string, password: string): Promise<UserCredential> {
  if (!app) throw new Error('Firebase not configured');
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Create a new account and set the display name.
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
): Promise<UserCredential> {
  if (!app) throw new Error('Firebase not configured');
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: fullName });
  return credential;
}

/**
 * Google OAuth — popup on web, alert on native (implement expo-auth-session if needed).
 */
export async function signInWithGoogle(): Promise<UserCredential | null> {
  if (!app) throw new Error('Firebase not configured');
  if (Platform.OS !== 'web') {
    console.warn('[AVRO] Google Sign-In on native requires expo-auth-session. Skipping.');
    return null;
  }
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  return signInWithPopup(auth, provider);
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  if (!app) return;
  return firebaseSignOut(auth);
}

/**
 * Subscribe to auth state changes.
 * @returns Unsubscribe function
 */
export function onAuthChanged(callback: (user: User | null) => void): () => void {
  if (!app) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current user's Firebase ID token.
 * Used to authenticate Supabase requests via custom JWT.
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  if (!app) return null;
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}

/**
 * Get a plain user session object compatible with the existing UserSession type.
 */
export function toUserSession(user: User): import('../types').UserSession {
  return {
    user: {
      id: user.uid,
      email: user.email ?? '',
      user_metadata: {
        full_name: user.displayName ?? '',
        avatar_url: user.photoURL ?? undefined,
        is_host: false, // Roles are fetched from Supabase users table
      },
    },
  };
}
