import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const authCode = searchParams.get('auth_code')

  try {
    if (!authCode) {
      console.error('No auth_code found in query parameters')
      return new Response('Missing auth_code', { status: 400 })
    }

    // Exchange auth code for session token
    const res = await fetch(`${process.env.NEXT_AUTH_URL}/auth/session/exchange-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_AUTH_CLIENT_ID,
        client_secret: process.env.AUTH_CLIENT_SECRET,
        code: authCode,
      }),
    })

    const data = await res.json()

    if (res.status !== 200) {
      console.error('Token exchange failed:', data)
      return new Response(data.message || 'Authentication failed', { status: 500 })
    }

    // Get user session from KAILASA auth server
    const sessionRes = await fetch(
      `${process.env.NEXT_AUTH_URL}/auth/get-session?client_id=${process.env.NEXT_AUTH_CLIENT_ID}`,
      {
        headers: {
          'Content-Type': 'application/json',
          cookie: `nandi_session=${data.session_token}`,
        },
      },
    )

    const sessionData = await sessionRes.json()

    if (sessionRes.status !== 200) {
      console.error('Session fetch failed:', sessionData)
      return new Response(sessionData.message || 'Session fetch failed', { status: 500 })
    }

    const payload = await getPayload({ config })

    // Find or create user in Payload
    let user = await payload.find({
      collection: 'users',
      where: {
        ssoId: {
          equals: sessionData.user.id || sessionData.user.sub,
        },
      },
      limit: 1,
    })

    if (user.docs.length === 0) {
      // Create new user from SSO data
      const newUser = await payload.create({
        collection: 'users',
        data: {
          email: sessionData.user.email,
          firstName: sessionData.user.first_name || sessionData.user.given_name || 'User',
          lastName: sessionData.user.last_name || sessionData.user.family_name || '',
          ssoProvider: 'kailasa_sso',
          ssoId: sessionData.user.id || sessionData.user.sub,
          ssoData: sessionData.user,
          lastLogin: new Date().toISOString(),
          // Generate a random password for SSO users (won't be used)
          password: crypto.randomBytes(32).toString('hex'),
        },
      })
      user.docs.push(newUser)
    } else {
      // Update existing user
      await payload.update({
        collection: 'users',
        id: user.docs[0].id,
        data: {
          lastLogin: new Date().toISOString(),
          ssoData: sessionData.user,
        },
      })
    }

    const payloadUser = user.docs[0]

    // Generate Payload JWT token
    const token = await payload.login({
      collection: 'users',
      data: {
        email: payloadUser.email,
        password: '', // Not needed for already authenticated user
      },
      req: {
        user: payloadUser,
      } as any,
    })

    const cookieStore = await cookies()

    // Set Payload auth cookie
    cookieStore.set({
      name: 'payload-token',
      value: token.token,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
    })

    // Also store KAILASA session token for future reference
    cookieStore.set({
      name: 'kailasa_session_token',
      value: data.session_token,
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
    })

    // Redirect to admin panel after successful authentication
    return Response.redirect(`${process.env.NEXT_BASE_URL}/admin`, 302)
  } catch (error) {
    console.error('SSO callback error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
