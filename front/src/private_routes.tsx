import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "./lib/auth_provider";

export function PrivateRoute() {
    const { me } = useAuth();
    return me ? <Outlet /> : <Navigate to="/login" replace />;
}
