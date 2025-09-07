import React, { useState } from "react";
import { signIn } from "@/lib/auth";
import { beginOAuth, getRememberMe, setRememberMe } from "@/lib/oauth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function SignIn() {
    const [email, setEmail] = useState("test@example.com");
    const [password, setPassword] = useState("password");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [remember, setRemember] = useState(getRememberMe());

    async function onLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // 1) Devise で Cookie セッション確立
            await signIn(email, password);

            // 2) すぐに Doorkeeper 認可へ（code発行→/callbackでtoken交換）
            beginOAuth();

            // 以降は遷移するため setLoading を戻す必要なし
            setRememberMe(remember);
        } catch (e: any) {
            setError(e?.body?.error || e.message);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl shadow p-6 space-y-6">
                <h1 className="text-2xl font-bold">ログイン</h1>
                <form onSubmit={onLogin} className="space-y-4">
                    <label className="block">
                        <span className="text-sm">Email</span>
                        <Input
                            className="mt-1 w-full rounded-xl border px-3 py-2"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="test@example.com"
                            type="email"
                            autoComplete="username"
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm">Password</span>
                        <Input
                            className="mt-1 w-full rounded-xl border px-3 py-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="password"
                            type="password"
                            autoComplete="current-password"
                        />
                    </label>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl border px-4 py-2 disabled:opacity-50"
                    >
                        {loading ? "送信中..." : "ログイン"}
                    </Button>
                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="remember"
                            checked={remember}
                            onCheckedChange={(checked) => setRemember(!!checked)}
                            className="h-4 w-4"
                        />
                        <label
                            htmlFor="remember"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Remember me
                        </label>
                    </div>
                </form>
                {error && <div className="p-3 rounded-xl text-sm border">{String(error)}</div>}
            </div>
        </div>
    );
}
