


// src/utils/api.ts

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const callApi = async (endpoint: string, options: RequestInit = {}) => {
  const accessToken = sessionStorage.getItem('access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${VITE_API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  return response.json();
};


