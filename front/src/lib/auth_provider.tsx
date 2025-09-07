import React, { useEffect, useMemo, useState } from 'react';

import { getMe } from '@/lib/api';
import { signOut as auth_signOut } from '@/lib/auth';
import { revokeTokens, Token } from '@/lib/oauth';
import type { Me, MeState } from '@/types';

import { AuthContext, type AuthContextType } from './auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<MeState>(undefined);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    try {
      const user = (await getMe()) as Me;
      setMe(user);
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'status' in e && e.status === 401) setMe(null);
      else {
        console.error(e);
        Token.clear();
        setMe(null);
      }
    }
  };

  const signOut = async () => {
    try {
      // 1) DoorkeeperのAT/RTをrevokeしてクライアント側もクリア
      await revokeTokens();
      // 2) 併用中は Devise の Cookie セッションも終了（必要ならCSRF付与）
      await auth_signOut();
    } finally {
      setMe(null);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      await refreshMe();
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const value: AuthContextType = useMemo(
    () => ({ me, setMe, refreshMe, signOut, loading }),
    [me, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
