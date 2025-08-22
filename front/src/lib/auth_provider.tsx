import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Me, MeState } from "../types";
import { signOut as auth_signOut } from "../lib/auth";
import { revokeTokens, Token } from "./oauth";
import { getMe } from "./api";

type AuthContext = {
    me: MeState;
    setMe: React.Dispatch<React.SetStateAction<MeState>>;
    refreshMe: () => Promise<void>;
    signOut: () => Promise<void>;
    loading: boolean;
};

const Ctx = createContext<AuthContext | null>(null);

export const useAuth = () => {
    const c = useContext(Ctx);
    if (!c) throw new Error("useAuth must be used within AuthProvider");
    return c;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [me, setMe] = useState<MeState>(undefined);
    const [loading, setLoading] = useState(true);

    const refreshMe = async () => {
        try {
            const user = (await getMe()) as Me;
            setMe(user);
        } catch (e: any) {
            if (e?.status === 401) setMe(null);
            else {
                console.error(e);
                Token.clear();
                setMe(null);
            }
        }
    };

    const signOut = async () => {
        try {
            // 1) DoorkeeperのAT/RTをrevokeしてクライアント側もクリア
            await revokeTokens();
            // 2) 併用中は Devise の Cookie セッションも終了（必要ならCSRF付与）
            await auth_signOut();
        } finally {
            setMe(null);
        }
    };

    useEffect(() => {
        let alive = true;
        (async () => {
            await refreshMe();
            if (alive) setLoading(false);
        })();
        return () => { alive = false; };
    }, []);

    const value: AuthContext = useMemo(() => ({ me, setMe, refreshMe, signOut, loading }), [me, loading]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}