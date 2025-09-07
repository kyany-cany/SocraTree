import { createContext } from 'react';

import type { MeState } from '@/types';

export type AuthContextType = {
  me: MeState;
  setMe: React.Dispatch<React.SetStateAction<MeState>>;
  refreshMe: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);
