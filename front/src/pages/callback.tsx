import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/lib/auth-hooks';
import { exchangeCodeForToken, Token } from '@/lib/oauth';

export default function OAuthCallback() {
  const nav = useNavigate();
  const { refreshMe } = useAuth();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    console.log('OAuthCallback useEffect called');
    (async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state') || undefined;
      if (!code) {
        nav('/login', { replace: true });
        return;
      }
      try {
        const json = await exchangeCodeForToken(code, state);
        Token.set(json);
        await refreshMe();
        // URL掃除
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        window.history.replaceState({}, '', url.pathname + url.search);
        nav('/chat', { replace: true });
      } catch (e) {
        console.error(e);
        nav('/login', { replace: true });
      }
    })();
    console.log('OAuthCallback useEffect finished');
  }, [nav, refreshMe]);

  return <div className="p-6">サインイン処理中…</div>;
}
