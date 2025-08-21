import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeCodeForToken } from "../lib/oauth";
import { useAuth } from "../lib/auth_provider";

export default function OAuthCallback() {
    const nav = useNavigate();
    const { refreshMe } = useAuth();

    useEffect(() => {
        (async () => {
            const url = new URL(window.location.href);
            const code = url.searchParams.get("code");
            const state = url.searchParams.get("state") || undefined;
            if (!code) {
                nav("/login", { replace: true });
                return;
            }
            try {
                await exchangeCodeForToken(code, state);
                await refreshMe(); // Bearerで /me を取得して me を確定
                // URL掃除
                url.searchParams.delete("code");
                url.searchParams.delete("state");
                window.history.replaceState({}, "", url.pathname + url.search);
                nav("/chat", { replace: true });
            } catch (e) {
                console.error(e);
                nav("/login", { replace: true });
            }
        })();
    }, [nav, refreshMe]);

    return <div style={{ padding: 24 }}>サインイン処理中…</div>;
}
