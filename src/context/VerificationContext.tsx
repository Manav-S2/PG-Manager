import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * Owner verification state.
 *
 * This is UI + local state only. Replace the body of `submit` with a real call
 * to your KYC / document-verification provider (IDfy, Signzy, HyperVerge, Karza,
 * Digio, Setu, etc.) and drive `status` from their webhook/response instead of
 * the demo `approve()` action.
 */
export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export type IdType = 'aadhaar' | 'pan';

export type Gender = 'male' | 'female';

export interface OwnerVerificationData {
  fullName: string;
  dob: string;
  gender: Gender;
  idType: IdType;
  idNumber: string;
  /** ownership-proof document type (pg-license / electricity-bill / rent-agreement) */
  ownershipDoc: string;
  /** keys of the photos the owner attached (identity-front, identity-back, ownership) */
  documents: string[];
  submittedAt: string;
}

interface VerificationContextValue {
  status: VerificationStatus;
  data: OwnerVerificationData | null;
  loading: boolean;
  submit: (data: OwnerVerificationData) => Promise<void>;
  /** Demo only: stands in for an admin / KYC provider approving the owner. */
  approve: () => Promise<void>;
  reset: () => Promise<void>;
}

const STORAGE_KEY = 'pgmanager.ownerVerification';

const VerificationContext = createContext<VerificationContextValue | undefined>(undefined);

export function VerificationProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<VerificationStatus>('unverified');
  const [data, setData] = useState<OwnerVerificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (active && raw) {
          const parsed = JSON.parse(raw) as {
            status?: VerificationStatus;
            data?: OwnerVerificationData | null;
          };
          setStatus(parsed.status ?? 'unverified');
          setData(parsed.data ?? null);
        }
      } catch {
        // corrupt/missing value – start fresh
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(
    async (next: { status: VerificationStatus; data: OwnerVerificationData | null }) => {
      setStatus(next.status);
      setData(next.data);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore persistence failures – state still updates in memory
      }
    },
    [],
  );

  const submit = useCallback(
    (d: OwnerVerificationData) => persist({ status: 'pending', data: d }),
    [persist],
  );

  const approve = useCallback(
    () => persist({ status: 'verified', data }),
    [persist, data],
  );

  const reset = useCallback(() => persist({ status: 'unverified', data: null }), [persist]);

  const value = useMemo(
    () => ({ status, data, loading, submit, approve, reset }),
    [status, data, loading, submit, approve, reset],
  );

  return <VerificationContext.Provider value={value}>{children}</VerificationContext.Provider>;
}

export function useVerification() {
  const ctx = useContext(VerificationContext);
  if (!ctx) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return ctx;
}
