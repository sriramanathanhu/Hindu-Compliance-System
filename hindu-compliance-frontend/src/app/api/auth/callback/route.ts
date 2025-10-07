import { NextRequest, NextResponse } from 'next/server';
import { getAuthClient, setSession } from '@/lib/auth';

/**
 * POST /api/auth/callback
 * Handles OAuth callback, exchanges code for tokens
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, state } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      );
    }

    const authClient = getAuthClient();

    // Exchange code for tokens
    const tokens = await authClient.exchangeCodeForTokens({
      code,
      redirect_uri: process.env.NEXT_PUBLIC_NANDI_REDIRECT_URI!,
    });

    // Get user info
    const user = await authClient.getSession(tokens.access_token);

    // Create session object
    const session = authClient.createSession(user, tokens);

    // Store session in httpOnly cookie
    await setSession(session);

    // Parse state to get redirect URL
    let redirectUrl = '/dashboard';
    if (state) {
      try {
        const stateData = JSON.parse(
          Buffer.from(state, 'base64').toString('utf-8')
        );
        if (stateData.redirect) {
          redirectUrl = stateData.redirect;
        }
      } catch {
        // Invalid state, use default redirect
      }
    }

    return NextResponse.json({ success: true, redirect: redirectUrl });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    );
  }
}
