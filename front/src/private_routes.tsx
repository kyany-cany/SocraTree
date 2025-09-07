import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from './lib/auth-hooks';

const CONSENT_VERSION = 'v1'; // 文面更新時に上げる

export function PrivateRoute() {
  const { me } = useAuth();
  const loc = useLocation();

  if (!me) return <Navigate to="/login" replace state={{ from: loc }} />;

  const needsConsent =
    me.research_consent === null || (me.research_consent_version ?? '') !== CONSENT_VERSION;

  // /consent 自身へのアクセスは許可（無限リダイレクト回避）
  if (needsConsent && loc.pathname !== '/consent') {
    return <Navigate to="/consent" replace state={{ from: loc }} />;
  }

  return <Outlet />;
}
