/**
 * Server-side session management using httpOnly cookies
 * Provides secure session storage and retrieval
 */

import { cookies } from 'next/headers';
import type { NandiSession } from '@/types';

const SESSION_COOKIE_NAME = 'nandi_session';
const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || '86400000', 10); // 24 hours

/**
 * Encrypt session data (placeholder - implement proper encryption)
 */
function encryptSession(session: NandiSession): string {
  // TODO: Implement proper encryption using crypto
  return Buffer.from(JSON.stringify(session)).toString('base64');
}

/**
 * Decrypt session data (placeholder - implement proper decryption)
 */
function decryptSession(encrypted: string): NandiSession | null {
  try {
    // TODO: Implement proper decryption using crypto
    const json = Buffer.from(encrypted, 'base64').toString('utf-8');
    return JSON.parse(json) as NandiSession;
  } catch {
    return null;
  }
}

/**
 * Set session cookie
 */
export async function setSession(session: NandiSession): Promise<void> {
  const encrypted = encryptSession(session);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE / 1000, // Convert to seconds
    path: '/',
  });
}

/**
 * Get session from cookie
 */
export async function getSession(): Promise<NandiSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  return decryptSession(sessionCookie.value);
}

/**
 * Clear session cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Update session (useful for token refresh)
 */
export async function updateSession(updates: Partial<NandiSession>): Promise<void> {
  const session = await getSession();

  if (!session) {
    throw new Error('No active session to update');
  }

  await setSession({ ...session, ...updates });
}
