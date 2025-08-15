
// src/auth/pkce-utils.ts

import { v4 as uuidv4 } from 'uuid';

function generateRandomString(length: number): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(a: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(a)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function generateCodeVerifier(): string {
  return generateRandomString(128);
}

export function generateCodeChallenge(codeVerifier: string): string {
  return base64urlencode(new Uint8Array(sha256(codeVerifier)));
}

export function generateState(): string {
  return uuidv4();
}
