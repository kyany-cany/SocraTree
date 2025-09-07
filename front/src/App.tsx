import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './lib/auth_provider';
import { useAuth } from './lib/auth-hooks';
import OAuthCallback from './pages/callback';
import { ChatPage } from './pages/Chat';
import ConsentPage from './pages/consent';
import SignIn from './pages/sign_in';
import { Splash } from './pages/splash';
import { PrivateRoute } from './private_routes';

function Gate() {
  const { loading } = useAuth();
  if (loading) return <Splash />;
  return <AppRoutes />;
}

function AppRoutes() {
  const { me } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={me ? <Navigate to="/chat" replace /> : <SignIn />} />
      <Route path="/callback" element={<OAuthCallback />} />

      <Route element={<PrivateRoute />}>
        <Route path="/consent" element={<ConsentPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Route>

      <Route path="*" element={<Navigate to={me ? '/chat' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </BrowserRouter>
  );
}
