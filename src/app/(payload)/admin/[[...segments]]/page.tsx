import { RootPage } from '@payloadcms/next/views'
import config from '@payload-config'
import type { Metadata } from 'next'

export const generateMetadata = (): Metadata => ({
  title: 'KAILASA Hindu Compliance System',
  description: 'Admin Panel',
})

const Page = (props: any) => <RootPage config={config} {...props} />

export default Page
