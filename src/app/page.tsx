import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>KAILASA Hindu Compliance System</h1>
      <p style={{ margin: '1rem 0' }}>
        Welcome to the Hindu Compliance System - A comprehensive platform for business listings, reviews, and complaints.
      </p>

      <div style={{ margin: '2rem 0' }}>
        <h2>Quick Links</h2>
        <ul style={{ marginTop: '1rem' }}>
          <li style={{ margin: '0.5rem 0' }}>
            <Link href="/admin">Admin Dashboard</Link>
          </li>
          <li style={{ margin: '0.5rem 0' }}>
            <a
              href={`${process.env.NEXT_AUTH_URL}/auth/sign-in/google?client_id=${process.env.NEXT_AUTH_CLIENT_ID}&redirect_uri=${process.env.NEXT_BASE_URL}/api/auth/callback`}
            >
              Sign in with KAILASA SSO
            </a>
          </li>
        </ul>
      </div>

      <div style={{ margin: '2rem 0', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
        <h3>System Features:</h3>
        <ul style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
          <li>Business Listings with BBB-style profiles</li>
          <li>Customer Reviews & Ratings</li>
          <li>Complaint Management System</li>
          <li>Quote Request Forms</li>
          <li>KAILASA SSO Integration</li>
        </ul>
      </div>
    </div>
  )
}
