import type { OAuthClientEndpoints, TokenSet } from '@/types';

// ---- Token（メモリ + sessionStorageでrefresh保持、期限先読み）----
let CLIENT: OAuthClientEndpoints | null = null;
export function configureOAuthClient(cfg: OAuthClientEndpoints) {
  CLIENT = cfg;
}

const RT_KEY = 'oauth_refresh_token';
const REMEMBER_KEY = 'oauth_remember_me';

function getRefreshStorage(): Storage {
  try {
    return localStorage.getItem(REMEMBER_KEY) === '1' ? localStorage : sessionStorage;
  } catch {
    return sessionStorage;
  }
}
export function setRememberMe(on: boolean) {
  try {
    localStorage.setItem(REMEMBER_KEY, on ? '1' : '0');
    (on ? sessionStorage : localStorage).removeItem(RT_KEY);
  } catch {}
}
export function getRememberMe(): boolean {
  try {
    return localStorage.getItem(REMEMBER_KEY) === '1';
  } catch {
    return false;
  }
}

let accessToken: string | null = null;
let expiresAtMs = 0;

export const Token = {
  set(t: TokenSet | string | null) {
    if (t === null) {
      accessToken = null;
      expiresAtMs = 0;
      try {
        sessionStorage.removeItem(RT_KEY);
        localStorage.removeItem(RT_KEY);
      } catch {}
      return;
    }
    if (typeof t === 'string') {
      accessToken = t;
      return;
    }

    accessToken = t.access_token;
    const nowSec = Math.floor(Date.now() / 1000);
    const created = t.created_at ?? nowSec;
    const leeway = 60;
    expiresAtMs = (created + t.expires_in - leeway) * 1000;

    if (t.refresh_token) {
      const store = getRefreshStorage();
      const other = store === localStorage ? sessionStorage : localStorage;
      store.setItem(RT_KEY, t.refresh_token);
      // 逆側の残骸を削除（Remember=0 なら localStorage をここでも消す）
      try {
        other.removeItem(RT_KEY);
      } catch {}
    }
  },
  get() {
    return accessToken;
  },
  getRefresh() {
    const primary = getRefreshStorage().getItem(RT_KEY);
    if (primary) return primary;
    // 設定変更の残骸も拾う
    return (getRefreshStorage() === localStorage ? sessionStorage : localStorage).getItem(RT_KEY);
  },
  isExpired() {
    return !accessToken || Date.now() >= expiresAtMs;
  },
  clear() {
    accessToken = null;
    expiresAtMs = 0;
    try {
      sessionStorage.removeItem(RT_KEY);
      localStorage.removeItem(RT_KEY);
    } catch {}
  },
};

// ---- リフレッシュ / 付随ユーティリティ ----
export async function refreshWithOAuth(refresh_token?: string | null) {
  if (!CLIENT) throw new Error('OAuth client is not configured');
  const rt = refresh_token ?? Token.getRefresh();
  if (!rt) return null;

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: rt,
    client_id: CLIENT.clientId,
  });

  const res = await fetch(CLIENT.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    credentials: 'omit',
  });
  if (!res.ok) return null;
  const json: TokenSet = await res.json();
  Token.set(json);
  return json;
}

let refreshing: Promise<void> | null = null;
export async function ensureAccessToken(): Promise<string | null> {
  if (!Token.isExpired()) return Token.get();

  const rt = Token.getRefresh();
  if (!rt) return null;

  if (!refreshing) {
    refreshing = (async () => {
      const ok = await refreshWithOAuth(rt);
      if (!ok) Token.clear();
    })().finally(() => {
      refreshing = null;
    });
  }
  await refreshing;
  return Token.get();
}

async function revokeRaw(token: string) {
  if (!CLIENT) throw new Error('OAuth client is not configured');
  const body = new URLSearchParams({ token, client_id: CLIENT.clientId });
  await fetch(CLIENT.revokeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    credentials: 'omit',
  });
}

export async function revokeTokens(): Promise<void> {
  const at = Token.get();
  const rt = Token.getRefresh();
  try {
    if (at) await revokeRaw(at);
    if (rt) await revokeRaw(rt);
  } finally {
    Token.clear();
  }
}
