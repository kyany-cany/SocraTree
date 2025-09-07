import { API_BASE } from '@/config';
import { apiFetch } from '@/lib/api';

export async function saveResearchConsent(consented: boolean, version = 'v1'): Promise<void> {
  const res = await apiFetch(`${API_BASE}/consent`, {
    method: 'POST',
    body: JSON.stringify({
      research_consent: consented,
      research_consent_version: version,
    }),
  });
  if (!res.ok) throw new Error(`POST /consent -> ${res.status}`);
  // 204 or 200 どちらでもOK（ボディは読まない）
}
