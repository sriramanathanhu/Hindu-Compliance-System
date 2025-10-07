/**
 * Nandi SSO Authentication Types
 * Based on nandi-authentication-api.yaml
 */

export interface NandiUser {
  id: string;
  email: string;
  name?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface NandiTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

export interface NandiSession {
  user: NandiUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface NandiAuthError {
  error: string;
  error_description?: string;
  error_uri?: string;
}

export interface AuthState {
  session: NandiSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: NandiAuthError | null;
}

export interface SignInParams {
  redirect_uri?: string;
  state?: string;
}

export interface TokenExchangeParams {
  code: string;
  redirect_uri: string;
}
