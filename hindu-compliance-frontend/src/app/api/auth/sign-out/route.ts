import { NextResponse } from 'next/server';
import { getSession, clearSession, getAuthClient } from '@/lib/auth';

/**
 * POST /api/auth/sign-out
 * Signs out user and clears session
 */
export async function POST() {
  try {
    const session = await getSession();

    if (session) {
      // Attempt to revoke tokens with Nandi SSO
      try {
        const authClient = getAuthClient();
        await authClient.logout(session.access_token);
      } catch (error) {
        // Log but don't fail if logout call fails
        console.error('Nandi SSO logout error:', error);
      }
    }

    // Clear session cookie
    await clearSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { error: 'Sign out failed' },
      { status: 500 }
    );
  }
}
