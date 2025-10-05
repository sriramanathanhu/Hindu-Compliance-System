import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { ServerFunctionClient } from 'payload'
import config from '@payload-config'
import React from 'react'
import { importMap } from './admin/importMap.js'

import '@payloadcms/next/css'

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: { children: React.ReactNode }) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
