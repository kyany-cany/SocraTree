import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./lib/auth_provider";

export function PrivateRoute() {
    const { me, loading } = useAuth();
    const loc = useLocation();

    if (loading) return <div style={{ padding: 24 }}>読み込み中…</div>;
    if (!me) return <Navigate to="/login" state={{ from: loc }} replace />;
    return <Outlet />;
}
