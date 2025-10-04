import { generatePageMetadata } from '@payloadcms/next/utilities'
import { RootPage, generateMetadata } from '@payloadcms/next/views'
import config from '@payload-config'
import React from 'react'

export { generateMetadata }

const Page = (props: any) => <RootPage config={config} {...props} />

export default Page
