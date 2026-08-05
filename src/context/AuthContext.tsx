/**
 * AVRO — AuthContext
 *
 * Global auth state powered by Firebase Auth.
 * After sign-in, injects Firebase JWT into Supabase so RLS policies work.
 *
 * Usage:
 *   // Wrap your app:
 *   <AuthProvider><App /></AuthProvider>
 *
 *   // Consume anywhere:
 *   const { user, session, role, loading, signIn, signUp, signOut, signInWithGoogle } = useAuth();
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';

import {
  onAuthChanged,
  signIn as fbSignIn,
  signUp as fbSignUp,
  signOut as fbSignOut,
  signInWithGoogle as fbSignInWithGoogle,
  getIdToken,
  toUserSession,
} from '../services/firebase';
import {
  setSupabaseAuthToken,
  clearSupabaseAuth,
  upsertUser,
  fetchUserRole,
  UserRole,
} from '../services/supabase';
import type { UserSession } from '../types';

const SESSION_STORAGE_KEY = 'avro_session';

// ── Context shape ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Firebase User object (null when signed out). */
  user: User | null;
  /** AVRO UserSession — compatible with existing screen props. */
  session: UserSession | null;
  /** User's role: 'owner' | 'manager' | 'resident' | null */
  role: UserRole | null;
  /** True while auth state is being determined on mount. */
  loading: boolean;
  /** Sign in with email + password. Throws on failure. */
  signIn(email: string, password: string): Promise<void>;
  /** Create account. Throws on failure. */
  signUp(email: string, password: string, fullName: string): Promise<void>;
  /** Google OAuth (web popup / native redirect). */
  signInWithGoogle(): Promise<void>;
  /** Sign out and clear all local state. */
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const tokenRefreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /** After every Firebase sign-in, wire up Supabase + persist session. */
  const handleFirebaseUser = useCallback(async (fbUser: User | null) => {
    if (!fbUser) {
      // Signed out
      clearSupabaseAuth();
      setUser(null);
      setSession(null);
      setRole(null);
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      if (tokenRefreshTimer.current) clearInterval(tokenRefreshTimer.current);
      return;
    }

    // Get Firebase ID token and inject into Supabase
    const token = await getIdToken();
    if (token) {
      await setSupabaseAuthToken(token);
    }

    // Upsert user in Supabase (no-op if already exists)
    await upsertUser({
      uid: fbUser.uid,
      email: fbUser.email ?? '',
      full_name: fbUser.displayName ?? '',
      avatar_url: fbUser.photoURL ?? undefined,
      role: 'resident', // Default; owner status is set manually in Supabase
      created_at: new Date().toISOString(),
    }).catch((e) => console.warn('[AVRO Auth] upsertUser failed:', e));

    // Fetch the real role from Supabase
    const userRole = await fetchUserRole(fbUser.uid).catch(() => null);

    // Build the legacy UserSession compatible shape
    const legacySession: UserSession = {
      ...toUserSession(fbUser),
      user: {
        ...toUserSession(fbUser).user,
        user_metadata: {
          ...toUserSession(fbUser).user.user_metadata,
          is_host: userRole === 'owner',
        },
      },
    };

    setUser(fbUser);
    setSession(legacySession);
    setRole(userRole);
    await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(legacySession));

    // Refresh token every 50 minutes (Firebase tokens expire at 60 min)
    if (tokenRefreshTimer.current) clearInterval(tokenRefreshTimer.current);
    tokenRefreshTimer.current = setInterval(async () => {
      const refreshed = await getIdToken(true).catch(() => null);
      if (refreshed) await setSupabaseAuthToken(refreshed);
    }, 50 * 60 * 1000);
  }, []);

  // Subscribe to Firebase auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthChanged(async (fbUser) => {
      await handleFirebaseUser(fbUser);
      setLoading(false);
    });
    return () => {
      unsubscribe();
      if (tokenRefreshTimer.current) clearInterval(tokenRefreshTimer.current);
    };
  }, [handleFirebaseUser]);

  // ── Auth Actions ────────────────────────────────────────────────────────────

  const signIn = useCallback(async (email: string, password: string) => {
    const credential = await fbSignIn(email, password);
    await handleFirebaseUser(credential.user);
  }, [handleFirebaseUser]);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const credential = await fbSignUp(email, password, fullName);
      await handleFirebaseUser(credential.user);
    },
    [handleFirebaseUser],
  );

  const signInWithGoogle = useCallback(async () => {
    const credential = await fbSignInWithGoogle();
    if (credential) await handleFirebaseUser(credential.user);
  }, [handleFirebaseUser]);

  const signOut = useCallback(async () => {
    await fbSignOut();
    // handleFirebaseUser(null) will be called by onAuthChanged
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, session, role, loading, signIn, signUp, signInWithGoogle, signOut }),
    [user, session, role, loading, signIn, signUp, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
