import apiClient from '@/lib/apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface SsoConfig {
  membershipUrl: string;
  walletEnabled: boolean;
  configured: boolean;
}

export interface SsoStatus {
  connected: boolean;
  membershipLevel: string | null;
  membershipTier: string | null;
  membershipStatus: string | null;
  canAccessVcard: boolean;
  tokenExpired: boolean;
  lastUpdated: string | null;
}

export const mcomService = {
  async getConfig(): Promise<SsoConfig> {
    const response = await apiClient.get('/auth/sso/config');
    return response.data;
  },

  async startLogin(): Promise<void> {
    const config = await this.getConfig();
    if (!config.configured) {
      throw new Error('MCOM SSO is not configured');
    }
    window.location.href = `${API_URL}/auth/sso/login`;
  },

  async completeLogin(code: string, state: string): Promise<void> {
    await apiClient.get(`/auth/sso/callback`, {
      params: { code, state },
    });
  },

  async refreshSession(userId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post('/auth/sso/refresh', { userId });
    return response.data;
  },

  async getStatus(userId: string, sync = false): Promise<SsoStatus> {
    const response = await apiClient.get(`/auth/sso/status/${userId}`, {
      params: { sync: sync.toString() },
    });
    return response.data;
  },

  async getPermissions(userId: string): Promise<Record<string, boolean>> {
    const response = await apiClient.get('/auth/sso/data/permissions', {
      params: { userId },
    });
    return response.data.permissions;
  },
};

export default mcomService;
