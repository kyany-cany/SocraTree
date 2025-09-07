import { API_BASE } from '@/config';
import type { TokenSet } from '@/types';

import {
  configureOAuthClient,
  ensureAccessToken,
  getRememberMe,
  refreshWithOAuth,
  revokeTokens,
  setRememberMe,
  Token,
} from './token';

const CLIENT_ID =
  import.meta.env.VITE_OAUTH_CLIENT_ID ?? 'Nea5B3HT2rapVdGQ9pHTFlc4Mh4q8uLAzbjF2UG5UPU';
const REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI ?? 'http://localhost:5173/callback';

export const OAUTH = {
  authorizeUrl: `${API_BASE}/oauth/authorize`,
  tokenUrl: `${API_BASE}/oauth/token`,
  revokeUrl: `${API_BASE}/oauth/revoke`,
  clientId: CLIENT_ID,
  redirectUri: REDIRECT_URI,
  scope: 'user',
};

// token.ts にエンドポイントを通知（循環依存を防ぐ）
configureOAuthClient({
  tokenUrl: OAUTH.tokenUrl,
  revokeUrl: OAUTH.revokeUrl,
  clientId: OAUTH.clientId,
});

// ---- PKCE ----
function b64url(buf: ArrayBuffer | Uint8Array) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export async function createPkce() {
  const rnd = crypto.getRandomValues(new Uint8Array(32));
  const verifier = b64url(rnd);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = b64url(digest);
  return { verifier, challenge };
}

// ---- 認可 → リダイレクト ----
export async function beginOAuth() {
  const { verifier, challenge } = await createPkce();
  sessionStorage.setItem('pkce_verifier', verifier);

  const stateBytes = crypto.getRandomValues(new Uint8Array(16));
  const state = b64url(stateBytes);
  sessionStorage.setItem('oauth_state', state);

  const u = new URL(OAUTH.authorizeUrl);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('client_id', OAUTH.clientId);
  u.searchParams.set('redirect_uri', OAUTH.redirectUri);
  u.searchParams.set('scope', OAUTH.scope);
  u.searchParams.set('code_challenge', challenge);
  u.searchParams.set('code_challenge_method', 'S256');
  u.searchParams.set('state', state);

  console.log('[authorize] url', u.toString());
  window.location.href = u.toString();
}

// ---- code→token 交換 ----
export async function exchangeCodeForToken(code: string, stateFromUrl?: string) {
  if (stateFromUrl) {
    const expected = sessionStorage.getItem('oauth_state');
    if (!expected || expected !== stateFromUrl) throw new Error('invalid state');
  }

  const verifier = sessionStorage.getItem('pkce_verifier');
  if (!verifier) throw new Error('PKCE verifier missing');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: OAUTH.clientId,
    redirect_uri: OAUTH.redirectUri,
    code_verifier: verifier,
  });

  const res = await fetch(OAUTH.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    credentials: 'omit',
  });
  if (!res.ok) {
    const ct = res.headers.get('content-type') || '';
    const detail = ct.includes('json') ? await res.json() : await res.text();
    throw new Error(`token exchange failed: status=${res.status}, body=${JSON.stringify(detail)}`);
  }
  const json: TokenSet = await res.json();
  console.log('[auth] token exchange success', {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
    createdAt: json.created_at,
  });
  // Token.set(json);

  sessionStorage.removeItem('pkce_verifier');
  sessionStorage.removeItem('oauth_state');

  return json;
}

// ---- 再エクスポート（他モジュールで使えるように）
export {
  ensureAccessToken,
  getRememberMe,
  refreshWithOAuth as refreshWithDoorkeeper,
  revokeTokens,
  setRememberMe,
  Token,
};
