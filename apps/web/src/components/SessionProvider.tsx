'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CurrentUserResponse } from '@btf/contracts';
import { getCurrentUser } from '../lib/auth-client';

type SessionUser = CurrentUserResponse['user'];

interface SessionValue {
  user: SessionUser;
  googleEnabled: boolean;
  /** Null while the first check is in flight — distinguishes "not signed in" from "not known yet",
   * so the header does not flash "Sign in" at someone who is already signed in. */
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (user: SessionUser) => void;
}

const SessionContext = createContext<SessionValue>({
  user: null,
  googleEnabled: false,
  loading: true,
  refresh: async () => {},
  setUser: () => {},
});

export function useSession(): SessionValue {
  return useContext(SessionContext);
}

/**
 * Holds who is signed in, fetched once on mount rather than server-rendered.
 *
 * Deliberately client-side: the session cookie belongs to the API's origin, and having every
 * server-rendered page forward it would make each of them uncacheable for the sake of one line in
 * the header. The cost is a brief `loading` state, which the header handles by showing nothing.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser>(null);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const result = await getCurrentUser();
      setUser(result.user);
      setGoogleEnabled(result.googleEnabled);
    } catch {
      // An unreachable API is not "signed out" in any meaningful sense, but treating it as such
      // is the only safe render: the alternative is showing a bookmark button that cannot work.
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SessionContext.Provider value={{ user, googleEnabled, loading, refresh, setUser }}>
      {children}
    </SessionContext.Provider>
  );
}
