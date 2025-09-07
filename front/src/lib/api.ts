import type { Me } from "@/types";
import { API_BASE } from "@/config";
import { ensureAccessToken, Token } from "./oauth";

export async function apiFetch(input: string | URL, init: RequestInit = {}) {
  const at = await ensureAccessToken();
  if (!at) {
    const e: any = new Error("not authenticated");
    e.status = 401;
    throw e;
  }

  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${Token.get()}`);
  // JSON送信時のみContent-Typeを自動付与（GET等に余計なヘッダを付けない）
  if (init.body && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const res = await fetch(input, { ...init, headers, credentials: "omit" });

  // ごく稀な競合で401になった場合のワンリトライ（任意）
  if (res.status === 401) {
    const again = await ensureAccessToken();
    if (again) {
      headers.set("Authorization", `Bearer ${Token.get()}`);
      return fetch(input, { ...init, headers, credentials: "omit" });
    }
  }
  return res;
}

// JSONユーティリティ（あると便利）
export async function apiGetJson<T>(path: string): Promise<T> {
  const res = await apiFetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPostJson<T>(path: string, body: any): Promise<T> {
  const res = await apiFetch(`${API_BASE}${path}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPatchJson<T>(
  path: string,
  body: any = {}
): Promise<T> {
  const res = await apiFetch(`${API_BASE}${path}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiDeleteJson(path: string): Promise<void> {
  const res = await apiFetch(`${API_BASE}${path}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`DELETE ${path} -> ${res.status}`);
}

// ---- ユーザー情報取得 ----
export async function getMe(): Promise<Me> {
  return apiGetJson<Me>("/me");
}

// ---- チャット削除操作 ----
export async function archiveChat(
  chatId: string
): Promise<{ id: string; archived: boolean; archived_at: string }> {
  return apiPatchJson(`/chats/${chatId}/archive`);
}

export async function restoreChat(
  chatId: string
): Promise<{ id: string; archived: boolean; restored_at: string }> {
  return apiPatchJson(`/chats/${chatId}/restore`);
}

export async function deleteChat(chatId: string): Promise<void> {
  return apiDeleteJson(`/chats/${chatId}`);
}
