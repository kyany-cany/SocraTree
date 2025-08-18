export function createFetchJSON(onUnauthorized?: () => void) {
  return async function fetchJSON(
    input: RequestInfo | URL,
    init: RequestInit = {}
  ) {
    const res = await fetch(input, {
      credentials: "include",
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
    return body;
  };
}
