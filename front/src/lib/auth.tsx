// src/lib/auth.ts
import type { Me } from "../types";

export const API_BASE =
    import.meta.env.VITE_API_BASE || "http://localhost:3000";

async function fetchJSON(input: RequestInfo | URL, init: RequestInit = {}) {
    const res = await fetch(input, {
        credentials: "include",
        headers: { Accept: "application/json", ...(init.headers || {}) },
        ...init,
    });
    const ct = res.headers.get("content-type") || "";
    const body = ct.includes("application/json") ? await res.json() : await res.text();
    if (!res.ok) throw Object.assign(new Error("HTTP " + res.status), { status: res.status, body });
    return body;
}

async function getCsrf(): Promise<string> {
    const data = await fetchJSON(`${API_BASE}/csrf`);
    return (data as any).csrfToken as string;
}

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

export async function signOut() {
    const csrf = await getCsrf();
    return fetchJSON(`${API_BASE}/users/sign_out`, {
        method: "DELETE",
        headers: { "X-CSRF-Token": csrf },
    });
}

export async function getMe(): Promise<Me> {
    return fetchJSON(`${API_BASE}/me`);
}

export async function safeGetMe(): Promise<Me | null> {
    try {
        return await getMe();
    } catch (e: any) {
        if (e?.status === 401) return null;
        throw e;
    }
}
