import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./lib/auth_provider";

export function PrivateRoute() {
    const { me, loading } = useAuth();
    if (loading) return <div className="p-6">読み込み中...</div>;
    return me ? <Outlet /> : <Navigate to="/login" replace />;
}