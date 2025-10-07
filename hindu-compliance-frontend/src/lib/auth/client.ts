/**
 * Nandi SSO Authentication Client
 * OAuth 2.0 Authorization Code Grant Flow
 * Based on nandi-authentication-api.yaml
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  NandiUser,
  NandiTokenResponse,
  NandiSession,
  NandiAuthError,
  SignInParams,
  TokenExchangeParams,
} from '@/types';

class NandiAuthClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_NANDI_SSO_URL || 'https://auth.kailasa.ai';
    this.clientId = process.env.NEXT_PUBLIC_NANDI_CLIENT_ID || '';
    this.clientSecret = process.env.NANDI_CLIENT_SECRET || '';
    this.redirectUri = process.env.NEXT_PUBLIC_NANDI_REDIRECT_URI || '';

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<NandiAuthError>) => {
        const authError = error.response?.data;
        if (authError?.error) {
          throw new Error(authError.error_description || authError.error);
        }
        throw new Error(error.message || 'Authentication request failed');
      }
    );
  }

  /**
   * Generate sign-in URL for OAuth flow
   */
  getSignInUrl(params?: SignInParams): string {
    const searchParams = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: params?.redirect_uri || this.redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      ...(params?.state && { state: params.state }),
    });

    return `${this.baseUrl}/auth/sign-in?${searchParams.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    params: TokenExchangeParams
  ): Promise<NandiTokenResponse> {
    const response = await this.client.post<NandiTokenResponse>('/auth/token', {
      grant_type: 'authorization_code',
      code: params.code,
      redirect_uri: params.redirect_uri,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<NandiTokenResponse> {
    const response = await this.client.post<NandiTokenResponse>('/auth/token', {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    return response.data;
  }

  /**
   * Get current session from access token
   */
  async getSession(accessToken: string): Promise<NandiUser> {
    const response = await this.client.get<NandiUser>('/auth/get-session', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  }

  /**
   * Logout and revoke tokens
   */
  async logout(accessToken: string): Promise<void> {
    await this.client.post(
      '/auth/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  }

  /**
   * Create session object from token response
   */
  createSession(user: NandiUser, tokens: NandiTokenResponse): NandiSession {
    return {
      user,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + tokens.expires_in * 1000,
    };
  }

  /**
   * Check if session is expired
   */
  isSessionExpired(session: NandiSession): boolean {
    return Date.now() >= session.expires_at;
  }

  /**
   * Check if session is about to expire (within 5 minutes)
   */
  shouldRefreshSession(session: NandiSession): boolean {
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() >= session.expires_at - fiveMinutes;
  }
}

// Singleton instance (server-side only)
let authClientInstance: NandiAuthClient | null = null;

export function getAuthClient(): NandiAuthClient {
  if (!authClientInstance) {
    authClientInstance = new NandiAuthClient();
  }
  return authClientInstance;
}

// Export for testing or custom instances
export default NandiAuthClient;
