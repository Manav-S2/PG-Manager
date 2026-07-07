import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { navigationRef } from '@/navigation/navigationRef';

/**
 * Auth layer.
 *
 * This is a MOCK backed by local storage so you can develop against a real
 * "current user" without wiring Firebase yet. The shape (`user | null`,
 * `initializing`, `signOut`) mirrors Firebase Auth, so swapping to real auth is
 * a change to THIS FILE ONLY — screens keep calling `useAuth()`.
 *
 * To go real later:
 *   - replace the AsyncStorage restore in useEffect with
 *     `onAuthStateChanged(auth, (fbUser) => setUser(mapFirebaseUser(fbUser)))`
 *   - replace `signInAs` with `signInWithEmailAndPassword` / phone OTP
 *   - replace `signOut` with `firebaseSignOut(auth)`
 * Everything else in the app stays the same.
 */
export type UserRole = 'owner' | 'manager' | 'student';

export interface AuthUser {
  /** Firebase calls this `uid` — match the name now so nothing renames later. */
  uid: string;
  role: UserRole;
  displayName: string;
  phone?: string;
  email?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** true until the persisted session has been checked (mirrors Firebase's first onAuthStateChanged). */
  initializing: boolean;
  /** DEV mock sign-in. Replace with a real Firebase sign-in method later. */
  signInAs: (role: UserRole, overrides?: Partial<AuthUser>) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

const STORAGE_KEY = 'pgmanager.auth.user';

/** Stand-in accounts, one per role, used until real auth exists. */
const MOCK_USERS: Record<UserRole, AuthUser> = {
  owner: { uid: 'dev-owner-1', role: 'owner', displayName: 'Sandeep Singh', phone: '+919000000001' },
  manager: { uid: 'dev-manager-1', role: 'manager', displayName: 'Ravi Kumar', phone: '+919000000002' },
  student: { uid: 'dev-student-1', role: 'student', displayName: 'Aman Verma', phone: '+919000000003' },
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Restore the persisted session on startup (your "memory for the app").
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (active && raw) setUser(JSON.parse(raw) as AuthUser);
      } catch {
        // corrupt/missing value – start signed out
      } finally {
        if (active) setInitializing(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const signInAs = useCallback(async (role: UserRole, overrides?: Partial<AuthUser>) => {
    const next: AuthUser = { ...MOCK_USERS[role], ...overrides };
    setUser(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // persistence failure – state still updates in memory
    }
    return next;
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    // Return to role selection and clear the authed stack so Back can't re-enter it.
    // Handled here so EVERY logout button works, regardless of nested navigator.
    if (navigationRef.isReady()) {
      navigationRef.reset({ index: 0, routes: [{ name: 'RoleSelect' }] });
    }
  }, []);

  const value = useMemo(
    () => ({ user, initializing, signInAs, signOut }),
    [user, initializing, signInAs, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
