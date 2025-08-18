// ユーザー情報
export type Me = {
  id: number;
  email: string;
};

// me の状態を親が扱う場合の型
export type MeState = Me | null | undefined;
