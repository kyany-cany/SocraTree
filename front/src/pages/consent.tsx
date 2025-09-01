import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api"; // 前メッセージのAPI例
import { useAuth } from "../lib/auth_provider";
import { API_BASE } from "@/lib/config";

const CONSENT_VERSION = "v1";

export async function saveResearchConsent(consented: boolean, version = "v1"): Promise<void> {
    const res = await apiFetch(`${API_BASE}/consent`, {
        method: "POST",
        body: JSON.stringify({
            research_consent: consented,
            research_consent_version: version,
        }),
    });
    if (!res.ok) throw new Error(`POST /consent -> ${res.status}`);
    // 204 or 200 どちらでもOK（ボディは読まない）
}

export default function ConsentPage() {
    const nav = useNavigate();
    const loc = useLocation();
    const { refreshMe } = useAuth();

    async function decide(consented: boolean) {
        await saveResearchConsent(consented, CONSENT_VERSION);
        await refreshMe();
        const back = (loc.state as any)?.from?.pathname || "/chat";
        nav(back, { replace: true });
    }

    return (
        <main className="container max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">研究利用に関する同意</h1>
            <p className="mb-4">（同意文面... 版: {CONSENT_VERSION}）</p>
            <div className="grid gap-3">
                <button className="btn btn-primary" onClick={() => decide(true)}>同意する</button>
                <button className="btn btn-ghost" onClick={() => decide(false)}>同意しない</button>
            </div>
        </main>
    );
}
