import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const payloadToken = cookieStore.get('payload-token')
    const kailasaToken = cookieStore.get('kailasa_session_token')

    if (!payloadToken) {
      return new Response(JSON.stringify({ message: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const payload = await getPayload({ config })

    // Verify Payload token and get user
    const { user } = await payload.auth({ headers: new Headers({ cookie: `payload-token=${payloadToken.value}` }) })

    if (!user) {
      return new Response(JSON.stringify({ message: 'Invalid session' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Optionally verify with KAILASA auth server
    if (kailasaToken && user.ssoProvider === 'kailasa_sso') {
      const kailasaRes = await fetch(
        `${process.env.NEXT_AUTH_URL}/auth/get-session?client_id=${process.env.NEXT_AUTH_CLIENT_ID}`,
        {
          headers: {
            'Content-Type': 'application/json',
            cookie: `nandi_session=${kailasaToken.value}`,
          },
        },
      )

      if (kailasaRes.status !== 200) {
        // KAILASA session expired, clear cookies
        cookieStore.delete('payload-token')
        cookieStore.delete('kailasa_session_token')
        return new Response(JSON.stringify({ message: 'Session expired' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Session check error:', error)
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
