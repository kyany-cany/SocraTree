// ユーザー情報
export type Me = {
  id: number;
  email: string;
  research_consent: boolean;
  research_consent_version: string;
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

export type Chat = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  branched_from_message_id?: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  updated_at: string;
};

export type Metrics = {
  token_in: number | null;
  token_out: number | null;
  latency_ms: number | null;
};

export type MessageResponse = {
  chat: Chat;
  user_msg: Pick<Message, 'id' | 'created_at' | 'updated_at'>;
  assistant_msg: Message;
  metrics: Metrics;
};

export type BranchResponse = {
  chat: Chat;
  messages: Message[];
};
