import { API_BASE_URL } from './api';

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'GET',
      credentials: 'include', // send HttpOnly refresh cookie
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    const json = await res.json();
    const token = json?.accessToken;
    if (token) localStorage.setItem('247gbs_token', token);
    return token ?? null;
  } catch (err) {
    return null;
  }
}

export default refreshAccessToken;
