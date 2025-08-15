
// src/auth/callback.tsx

import { useEffect } from 'react';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Callback = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    const storedState = sessionStorage.getItem('state');
    const codeVerifier = sessionStorage.getItem('code_verifier');

    if (state !== storedState || !codeVerifier || !code) {
      console.error('Invalid state or code verifier');
      return;
    }

    const tokenUrl = `${VITE_API_BASE_URL}/oauth/token`;

    const requestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'http://localhost:5173/callback',
      client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
      code_verifier: codeVerifier,
    });

    fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.access_token) {
          sessionStorage.setItem('access_token', data.access_token);
          // Redirect to a protected route or the home page
          window.location.href = '/';
        } else {
          console.error('Failed to retrieve access token', data);
        }
      })
      .catch((error) => {
        console.error('Error exchanging code for token', error);
      });
  }, []);

  return (
    <div>
      <h1>Callback</h1>
      <p>Exchanging code for access token...</p>
    </div>
  );
};

export default Callback;

