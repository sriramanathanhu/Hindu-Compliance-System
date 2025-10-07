import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient } from '@/lib/auth';

/**
 * GET /api/auth/sign-in
 * Initiates OAuth 2.0 flow by redirecting to Nandi SSO
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const redirect = searchParams.get('redirect');

  const authClient = getAuthClient();

  // Generate state for CSRF protection (in production, store this securely)
  const state = redirect
    ? Buffer.from(JSON.stringify({ redirect })).toString('base64')
    : undefined;

  // Get OAuth sign-in URL
  const signInUrl = authClient.getSignInUrl({ state });

  // Redirect to Nandi SSO
  return NextResponse.redirect(signInUrl);
}
