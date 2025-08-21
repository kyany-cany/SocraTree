import { API_BASE } from "./auth";

const CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID ?? "Nea5B3HT2rapVdGQ9pHTFlc4Mh4q8uLAzbjF2UG5UPU";
const REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI ?? "http://localhost:5173/callback";

export const OAUTH = {
    authorizeUrl: `${API_BASE}/oauth/authorize`,
    tokenUrl: `${API_BASE}/oauth/token`,
    revokeUrl: `${API_BASE}/oauth/revoke`,
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    scope: "user",
};

// ---- PKCE ----
function b64url(buf: ArrayBuffer | Uint8Array) {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let s = ""; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export async function createPkce() {
    const rnd = crypto.getRandomValues(new Uint8Array(32));
    const verifier = b64url(rnd);
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
    const challenge = b64url(digest);
    return { verifier, challenge };
}

// ---- Token（メモリ + sessionStorageでrefresh保持、期限先読み）----
type TokenSet = {
    access_token: string;
    refresh_token?: string;
    expires_in: number; // seconds
    created_at?: number; // epoch seconds
};

const RT_KEY = "oauth_refresh_token";
let accessToken: string | null = null;
let expiresAtMs = 0; // epoch ms（leeway込み）

export const Token = {
    set(t: TokenSet | string | null) {
        if (t === null) { accessToken = null; expiresAtMs = 0; sessionStorage.removeItem(RT_KEY); return; }
        if (typeof t === "string") { accessToken = t; return; }
        accessToken = t.access_token;
        const nowSec = Math.floor(Date.now() / 1000);
        const created = t.created_at ?? nowSec;
        const leeway = 60; // 60秒前に失効扱い
        expiresAtMs = (created + t.expires_in - leeway) * 1000;
        if (t.refresh_token) sessionStorage.setItem(RT_KEY, t.refresh_token);
    },
    get() { return accessToken; },
    getRefresh() { return sessionStorage.getItem(RT_KEY); },
    isExpired() { return !accessToken || Date.now() >= expiresAtMs; },
    clear() { accessToken = null; expiresAtMs = 0; sessionStorage.removeItem(RT_KEY); },
};

// ---- 1) 認可へリダイレクト ----
export async function beginOAuth() {
    const { verifier, challenge } = await createPkce();
    sessionStorage.setItem("pkce_verifier", verifier);

    // CSRF対策: state を付与
    const stateBytes = crypto.getRandomValues(new Uint8Array(16));
    const state = b64url(stateBytes);
    sessionStorage.setItem("oauth_state", state);

    const u = new URL(OAUTH.authorizeUrl);
    u.searchParams.set("response_type", "code");
    u.searchParams.set("client_id", OAUTH.clientId);
    u.searchParams.set("redirect_uri", OAUTH.redirectUri);
    u.searchParams.set("scope", OAUTH.scope);
    u.searchParams.set("code_challenge", challenge);
    u.searchParams.set("code_challenge_method", "S256");
    u.searchParams.set("state", state);

    window.location.href = u.toString();
}

// ---- 2) code→token 交換 ----
export async function exchangeCodeForToken(code: string, stateFromUrl?: string) {
    // state 検証（任意だが推奨）
    if (stateFromUrl) {
        const expected = sessionStorage.getItem("oauth_state");
        if (!expected || expected !== stateFromUrl) throw new Error("invalid state");
    }

    const verifier = sessionStorage.getItem("pkce_verifier");
    if (!verifier) throw new Error("PKCE verifier missing");

    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: OAUTH.clientId,
        redirect_uri: OAUTH.redirectUri,
        code_verifier: verifier,
    });

    const res = await fetch(OAUTH.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body, // ← これが必要！
        credentials: "omit",
    });
    if (!res.ok) throw new Error("token exchange failed");

    const json: TokenSet = await res.json();
    Token.set(json);

    // 一度きりのデータを掃除
    sessionStorage.removeItem("pkce_verifier");
    sessionStorage.removeItem("oauth_state");

    return json;
}

// ---- 3) リフレッシュ ----
export async function refreshWithDoorkeeper(refresh_token?: string | null) {
    const rt = refresh_token ?? Token.getRefresh();
    if (!rt) return null;

    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: rt,
        client_id: OAUTH.clientId,
    });
    const res = await fetch(OAUTH.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        credentials: "omit",
    });
    if (!res.ok) return null;
    const json: TokenSet = await res.json();
    Token.set(json);
    return json;
}

// ---- 4) トークン保証（期限切れなら自動refresh）----
let refreshing: Promise<void> | null = null;
export async function ensureAccessToken(): Promise<string | null> {
    if (!Token.isExpired()) return Token.get();

    const rt = Token.getRefresh();
    if (!rt) return null;

    if (!refreshing) {
        refreshing = (async () => {
            const ok = await refreshWithDoorkeeper(rt);
            if (!ok) Token.clear();
        })().finally(() => { refreshing = null; });
    }
    await refreshing;
    return Token.get();
}

// ---- 5) 失効（任意）----
export async function revoke(token: string) {
    const body = new URLSearchParams({ token, client_id: OAUTH.clientId });
    await fetch(OAUTH.revokeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        credentials: "omit",
    });
    Token.clear();
}
