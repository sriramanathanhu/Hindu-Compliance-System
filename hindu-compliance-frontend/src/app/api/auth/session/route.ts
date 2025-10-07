import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/**
 * GET /api/auth/session
 * Returns current session data
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ session: null }, { status: 401 });
    }

    // Don't send refresh token to client
    const { refresh_token, ...clientSession } = session;

    return NextResponse.json({ session: clientSession });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
