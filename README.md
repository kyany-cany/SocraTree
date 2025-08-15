# README

This is a README file for the project.

## Purpose

This project aims to ... (Describe the project's purpose here)

## Usage

(Explain how to use the project)

## Contributing

(Explain how others can contribute to the project)

# OAuth 2.0 with PKCE Implementation Guide

## Setup

### Rails Setup

1.  **Configure Doorkeeper:**
    *   Ensure `authorization_code` is in `grant_flows` in `config/initializers/doorkeeper.rb`.
    *   Ensure `use_pkce` is enabled in `config/initializers/doorkeeper.rb`.
    *   Ensure `force_ssl_in_redirect_uri` is set to `!Rails.env.development?` in `config/initializers/doorkeeper.rb`.
    *   Verify `resource_owner_authenticator` uses `current_user` in `config/initializers/doorkeeper.rb`.
2.  **Configure CORS:**
    *   Ensure the SPA URL (`http://localhost:5173`) is in `origins` in `config/initializers/cors.rb`.
    *   Ensure all HTTP methods are allowed in `config/initializers/cors.rb`.
    *   Ensure `credentials` is set to `true` in `config/initializers/cors.rb`.
3.  **Configure Session Store:**
    *   Ensure `same_site` is set to `:lax` in `config/initializers/session_store.rb`.
    *   Ensure `secure` is set to `Rails.env.production?` in `config/initializers/session_store.rb`.
4.  **Doorkeeper Application:**
    *   Manually verify that the `redirect_uri` in the Doorkeeper application is an exact match (`http://localhost:5173/callback`).
    *   Manually verify that `confidential` is set to `false` in the Doorkeeper application.
    *   Manually verify that the `scope` is set to `public` in the Doorkeeper application.
5.  **Environment Variables:**
    *   Set `CORS_ORIGINS="http://localhost:5173"` in the Rails `.env` file.

### React Setup

1.  **Create Authentication Files:**
    *   Create `src/auth/auth-start.ts` with the authorization start function.
    *   Create `src/auth/callback.tsx` with the callback page component.
    *   Create `src/utils/api.ts` with the API utility.
    *   Create `src/auth/pkce-utils.ts` with the PKCE utility functions.
2.  **Environment Variables:**
    *   Set `VITE_API_BASE_URL="http://localhost:3000"` in the Vite `.env` file.
    *   Set `VITE_OAUTH_CLIENT_ID="REPLACE_WITH_UID"` in the Vite `.env` file.  Replace `"REPLACE_WITH_UID"` with the actual client ID.

## Verification

### Rails Verification

1.  **Start the Rails server:** `rails server`
2.  **Access the `/oauth/authorize` endpoint:** After logging in with Devise, navigate to `http://localhost:3000/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&scope=public&code_challenge=YOUR_CODE_CHALLENGE&code_challenge_method=S256&state=YOUR_STATE&redirect_uri=http://localhost:5173/callback` (replace with your actual client ID, code challenge, and state).
3.  **Verify the redirect:** You should be redirected to `http://localhost:5173/callback?code=...&state=...`.
4.  **Check the logs:** Verify that the access token is being generated correctly in the Rails logs.

### React Verification

1.  **Start the React development server:** `npm start` or `yarn start`
2.  **Initiate the authorization flow:** Click a button or link that calls the `startAuthorization` function in `src/auth/auth-start.ts`.
3.  **Verify the redirect:** You should be redirected to the Rails `/oauth/authorize` endpoint and then back to `http://localhost:5173/callback`.
4.  **Check the console:** Verify that the access token is being stored in `sessionStorage` in `src/auth/callback.tsx`.
5.  **Call the API:** Use the `callApi` function in `src/utils/api.ts` to make a request to a protected API endpoint. Verify that the request is successful and returns the expected data.

## Troubleshooting

### Rails Troubleshooting

*   **`invalid_grant` error:**
    *   Verify that the `redirect_uri` in the Doorkeeper application is an exact match.
    *   Verify that the `code_verifier` and `state` are being generated and stored correctly in the React application.
*   **CORS failure:**
    *   Verify that the SPA URL is included in the `origins` in `config/initializers/cors.rb`.
    *   Verify that all HTTP methods are allowed in `config/initializers/cors.rb`.
    *   Verify that `credentials` is set to `true` in `config/initializers/cors.rb`.
*   **Cookie not being sent:**
    *   Verify that `same_site` is set to `:lax` in `config/initializers/session_store.rb`.
    *   Verify that `secure` is set to `true` in production and `false` in development in `config/initializers/session_store.rb`.
    *   Verify that the domain is consistent across the Rails API and the React SPA.
    *   Verify that HTTPS is being used in production.
*   **Token exchange error:**
    *   Verify that the `client_id` is correct in the React application.
    *   Verify that the `grant_type` is set to `authorization_code` in the token request.
    *   Verify that the `code_verifier` is being sent correctly in the token request.
    *   Verify that the `Content-Type` is set to `application/x-www-form-urlencoded` in the token request.

### React Troubleshooting

*   **Authorization redirect failing:**
    *   Verify that the `VITE_API_BASE_URL` and `VITE_OAUTH_CLIENT_ID` environment variables are set correctly in the Vite `.env` file.
    *   Verify that the `/oauth/authorize` endpoint is accessible from the React application.
*   **Callback failing:**
    *   Verify that the `code` and `state` parameters are being passed correctly in the callback URL.
    *   Verify that the `code_verifier` is being retrieved correctly from `sessionStorage`.
*   **API calls failing:**
    *   Verify that the access token is being stored correctly in `sessionStorage`.
    *   Verify that the `Authorization` header is being set correctly with the `Bearer` token.
    *   Verify that the API endpoint is accessible from the React application.

