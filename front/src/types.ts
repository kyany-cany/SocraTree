// ユーザー情報
export type Me = {
  id: number;
  email: string;
};

// me の状態を親が扱う場合の型
export type MeState = Me | null | undefined;

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
