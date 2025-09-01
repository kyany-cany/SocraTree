// ユーザー情報
export type Me = {
  id: number;
  email: string;
  research_consent: boolean;
  research_consent_version: string;
};

// me の状態を親が扱う場合の型
export type MeState = Me | null | undefined;

export type Chat = {
  id: string;
  title: string;
  created_at: string; // ISO 8601 format
  updated_at: string; // ISO 8601 format
};

export type TokenSet = {
  access_token: string;
  refresh_token?: string;
  expires_in: number; // seconds
  created_at?: number; // epoch seconds
};

export type OAuthClientEndpoints = {
  tokenUrl: string;
  revokeUrl: string;
  clientId: string;
};
