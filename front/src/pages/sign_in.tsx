import React, { useState } from "react";
import { signIn, getMe, API_BASE } from "../lib/auth";
import { useAuth } from "../lib/auth_provider";
import { beginOAuth } from "../lib/oauth";

export default function SignIn() {
    const { me, setMe } = useAuth();
    const [email, setEmail] = useState("test@example.com");
    const [password, setPassword] = useState("password");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function onAuthLogin(e: React.FormEvent) {
        console.log("OAuthログイン開始");
        e.preventDefault();
        beginOAuth();
    }

    async function onLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await signIn(email, password);
            const m = await getMe();
            setMe(m); // 親の状態を更新
            console.log("ログイン成功", me);
            beginOAuth(); // OAuthログインを開始
        } catch (e: any) {
            setError(e?.body?.error || e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl shadow p-6 space-y-6">
                <h1 className="text-2xl font-bold">ログイン</h1>
                <form onSubmit={onLogin} className="space-y-4">
                    <label className="block">
                        <span className="text-sm text-gray-700">Email</span>
                        <input
                            className="mt-1 w-full rounded-xl border px-3 py-2"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="test@example.com"
                            type="email"
                            autoComplete="username"
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm text-gray-700">Password</span>
                        <input
                            className="mt-1 w-full rounded-xl border px-3 py-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="password"
                            type="password"
                            autoComplete="current-password"
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl border px-4 py-2 disabled:opacity-50"
                    >
                        {loading ? "送信中..." : "ログイン"}
                    </button>
                </form>
                {error && <div className="p-3 rounded-xl text-sm border">{String(error)}</div>}
                <div className="text-xs text-gray-500">
                    API_BASE: <code>{API_BASE}</code>
                </div>
            </div>
        </div>
    );
}
