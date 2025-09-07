import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/lib/auth-hooks';
import { saveResearchConsent } from '@/lib/consent-api';

const CONSENT_VERSION = 'v1';

export default function ConsentPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const { refreshMe } = useAuth();

  async function decide(consented: boolean) {
    await saveResearchConsent(consented, CONSENT_VERSION);
    await refreshMe();
    const back = (loc.state as { from?: { pathname: string } })?.from?.pathname || '/chat';
    nav(back, { replace: true });
  }

  return (
    <main className="container max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">研究利用に関する同意</h1>
      <p className="mb-4">（同意文面... 版: {CONSENT_VERSION}）</p>
      <div className="grid gap-3">
        <button className="btn btn-primary" onClick={() => decide(true)}>
          同意する
        </button>
        <button className="btn btn-ghost" onClick={() => decide(false)}>
          同意しない
        </button>
      </div>
    </main>
  );
}
