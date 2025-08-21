type TokenSet = {
  access_token: string;
  refresh_token?: string;
  expires_in: number; // seconds
  created_at?: number; // epoch seconds (ifサーバ返却)
};

const REFRESH_KEY = "oauth_refresh_token"; // sessionStorage 推奨
let accessToken: string | null = null;
let expiresAt = 0; // epoch ms

export function setTokens(t: TokenSet) {
  accessToken = t.access_token;
  const nowSec = Math.floor(Date.now() / 1000);
  const created = t.created_at ?? nowSec;
  const leeway = 60; // 期限60秒前に失効扱い
  expiresAt = (created + t.expires_in - leeway) * 1000;
  if (t.refresh_token) {
    sessionStorage.setItem(REFRESH_KEY, t.refresh_token);
  }
}

export function clearTokens() {
  accessToken = null;
  expiresAt = 0;
  sessionStorage.removeItem(REFRESH_KEY);
}

export function getStoredRefreshToken() {
  return sessionStorage.getItem(REFRESH_KEY) || null;
}

export function getAccessTokenSync() {
  return accessToken;
}

let refreshing: Promise<void> | null = null;

export async function ensureAccessToken(
  getNewByRefresh: (refresh: string) => Promise<TokenSet | null>
) {
  const now = Date.now();
  if (accessToken && now < expiresAt) return accessToken;

  const refresh = getStoredRefreshToken();
  if (!refresh) return null;

  if (!refreshing) {
    refreshing = (async () => {
      const tokens = await getNewByRefresh(refresh);
      if (tokens) setTokens(tokens);
      else clearTokens();
    })().finally(() => (refreshing = null));
  }
  await refreshing;
  return accessToken;
}
