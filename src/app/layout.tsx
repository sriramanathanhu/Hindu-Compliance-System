import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hindu Compliance System',
  description: 'Hindu Compliance System for business listings, reviews, and complaints',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
