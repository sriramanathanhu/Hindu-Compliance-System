import { RootLayout } from '@payloadcms/next/layouts'
import config from '@payload-config'
import React from 'react'

import '@payloadcms/next/css'

const Layout = ({ children }: { children: React.ReactNode }) => (
  <RootLayout config={config}>{children}</RootLayout>
)

export default Layout
