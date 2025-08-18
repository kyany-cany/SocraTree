import type { Me } from "../types";

export const API_BASE =
    import.meta.env.VITE_API_BASE || "http://localhost:3000";

/** 401 を横取りしてグローバル処理したいとき用のラッパ生成器（任意） */
export function createFetchJSON(onUnauthorized?: () => void) {
    return async function fetchJSON<T = any>(
        input: RequestInfo | URL,
        init: RequestInit = {}
    ): Promise<T> {
        const res = await fetch(input, {
            credentials: "include", // Cookie送受信
            headers: { Accept: "application/json", ...(init.headers || {}) },
            ...init,
        });
        const ct = res.headers.get("content-type") || "";
        const body = ct.includes("application/json")
            ? await res.json()
            : await res.text();

        if (!res.ok) {
            if (res.status === 401 && onUnauthorized) onUnauthorized();
            throw Object.assign(new Error("HTTP " + res.status), {
                status: res.status,
                body,
            });
        }
        return body as T;
    };
}

/** デフォルトの fetchJSON（onUnauthorized なし） */
const fetchJSON = createFetchJSON();

/** CSRFトークン取得（GET /csrf） */
async function getCsrf(): Promise<string> {
    const data = await fetchJSON<{ csrfToken: string }>(`${API_BASE}/csrf`);
    return data.csrfToken;
}

/** ログイン（POST /users/sign_in） */
export async function signIn(email: string, password: string) {
    const csrf = await getCsrf();
    const body = new URLSearchParams();
    body.set("user[email]", email);
    body.set("user[password]", password);
    return fetchJSON(`${API_BASE}/users/sign_in`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-CSRF-Token": csrf,
        },
        body,
    });
}

/** ログアウト（DELETE /users/sign_out） */
export async function signOut() {
    const csrf = await getCsrf();
    return fetchJSON(`${API_BASE}/users/sign_out`, {
        method: "DELETE",
        headers: { "X-CSRF-Token": csrf },
    });
}

/** 現在のユーザー（GET /me） */
export async function getMe(): Promise<Me> {
    return fetchJSON<Me>(`${API_BASE}/me`);
}

/** 401 を null に丸める安全版（初期化で使う用） */
export async function safeGetMe(): Promise<Me | null> {
    try {
        return await getMe();
    } catch (e: any) {
        if (e?.status === 401) return null;
        // ネットワーク断などでも初期化を進めたいなら下行を有効化
        // return null;
        throw e;
    }
}
