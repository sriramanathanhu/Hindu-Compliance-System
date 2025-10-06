import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    // Check database connectivity by running a simple query
    await payload.db.pool.query('SELECT 1')

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'healthy',
        application: 'healthy',
      },
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'unhealthy',
          application: 'degraded',
        },
        error: errorMessage,
      },
      { status: 503 }
    )
  }
}
