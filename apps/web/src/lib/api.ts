function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[247GBS] NEXT_PUBLIC_API_BASE_URL is not set. Falling back to http://localhost:3001/api/v1');
      return 'http://localhost:3001/api/v1';
    }
    console.warn('[247GBS] NEXT_PUBLIC_API_BASE_URL is not set. Falling back to production URL.');
    return 'https://247-gbs-audit-backend.vercel.app/api/v1';
  }
  return url;
}

export const API_BASE_URL = getApiBaseUrl();
