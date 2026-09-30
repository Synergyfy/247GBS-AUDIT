// Single source of truth: NEXT_PUBLIC_API_BASE_URL (see apps/web/.env).
// Defaults match apps/api/.env (9008).
function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[247GBS] NEXT_PUBLIC_API_BASE_URL is not set. Falling back to http://localhost:9008/api/v1');
      return 'http://localhost:9008/api/v1';
    }
    console.warn('[247GBS] NEXT_PUBLIC_API_BASE_URL is not set. Falling back to production URL.');
    return 'https://247gbsaudit-api.centralhubsolution.com/api/v1';
  }
  return url;
}

export const API_BASE_URL = getApiBaseUrl();
