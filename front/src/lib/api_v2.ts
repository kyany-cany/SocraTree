import { API_BASE } from "./auth";
import { Token, refreshWithDoorkeeper } from "./oauth";

/**
 * API呼び出し（Authorization付与、401時に一度だけrefreshして自動リトライ）
 */
export async function apiV2<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  // 送信直前に最新AccessTokenを確保（あれば付ける）
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");

  let at = await ensureAccessToken();
  if (at) headers.set("Authorization", `Bearer ${at}`);

  let res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: "omit", // Cookie不要
  });

  // 401なら一度だけrefresh→再試行
  if (res.status === 401) {
    const refreshed = await tryRefreshOnce();
    if (refreshed) {
      const headers2 = new Headers(init.headers || {});
      headers2.set("Accept", "application/json");
      const at2 = Token.get();
      if (at2) headers2.set("Authorization", `Bearer ${at2}`);
      res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: headers2,
        credentials: "omit",
      });
    }
  }

  const body = await parseBody(res);
  if (!res.ok) {
    throw Object.assign(new Error("HTTP " + res.status), {
      status: res.status,
      body,
    });
  }
  return body as T;
}

/* ---------- helpers ---------- */

async function ensureAccessToken(): Promise<string | null> {
  // 期限管理をToken側に持たせていない場合は、そのままget()でOK。
  // 将来Token.ensure()を実装したら、ここを置換するだけで全体が賢くなる。
  return Token.get();
}

async function tryRefreshOnce(): Promise<boolean> {
  const refresh = Token.getRefresh?.(); // 既存に無ければ下のコメントの通り追加
  if (!refresh) {
    Token.clear?.();
    return false;
  }
  const tokens = await refreshWithDoorkeeper(refresh); // /oauth/token で refresh
  if (!tokens) {
    Token.clear?.();
    return false;
  }
  Token.set(tokens); // access/refresh/expiry を保存
  return true;
}

async function parseBody(res: Response) {
  // 204や空ボディでも安全に
  const ct = res.headers.get("content-type") || "";
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  return ct.includes("application/json") ? safeJson(text) : text;
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text; // JSON以外（サーバがtext返した等）でも例外にしない
  }
}
