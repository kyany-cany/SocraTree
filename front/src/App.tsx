import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/sign_in";
import { ChatPage } from "./pages/Chat";
import { PrivateRoute } from "./private_routes";
import { AuthProvider, useAuth } from "./lib/auth_provider";

function AppRoutes() {
  const { me, setMe } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={me ? <Navigate to="/chat" replace /> : <SignIn />}
      />

      {/* ここから下はログイン必須 */}
      <Route element={<PrivateRoute />}>
        <Route path="/chat" element={<ChatPage />} />
      </Route>

      {/* どのURLでもログイン状態に応じてデフォルトへ */}
      <Route path="*" element={<Navigate to={me ? "/chat" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
