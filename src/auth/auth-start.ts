

// src/auth/auth-start.ts

import { generateCodeChallenge, generateCodeVerifier, generateState } from './pkce-utils';

const VITE_OAUTH_CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID;
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const startAuthorization = () => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  sessionStorage.setItem('code_verifier', codeVerifier);
  sessionStorage.setItem('state', state);

  const authorizationUrl = `${VITE_API_BASE_URL}/oauth/authorize?client_id=${VITE_OAUTH_CLIENT_ID}&response_type=code&scope=public&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}&redirect_uri=http://localhost:5173/callback`;

  window.location.href = authorizationUrl;
};

