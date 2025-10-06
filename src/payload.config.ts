import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import path from 'path'
import { fileURLToPath } from 'url'

// Collections
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { BusinessCategories } from './collections/BusinessCategories'
import { Businesses } from './collections/Businesses'
import { Reviews } from './collections/Reviews'
import { Complaints } from './collections/Complaints'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Hindu Compliance System',
    },
  },

  // Database configuration with PostgreSQL
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),

  // Rich text editor
  editor: lexicalEditor({}),

  // Collections
  collections: [Users, Media, BusinessCategories, Businesses, Reviews, Complaints],

  // Plugins
  plugins: [
    formBuilderPlugin({
      fields: {
        text: true,
        textarea: true,
        select: true,
        email: true,
        state: true,
        country: true,
        checkbox: true,
        number: true,
        message: true,
        payment: false,
      },
      formOverrides: {
        admin: {
          group: 'Applications',
        },
      },
      formSubmissionOverrides: {
        admin: {
          group: 'Applications',
        },
      },
      redirectRelationships: ['businesses'],
    }),
  ],

  // TypeScript type generation
  typescript: {
    outputFile: path.resolve(dirname, '../payload-types.ts'),
  },

  // GraphQL configuration
  graphQL: {
    schemaOutputFile: path.resolve(dirname, '../generated-schema.graphql'),
  },

  // Secret key for JWT
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-here',

  // CORS configuration
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  ].filter(Boolean),

  // CSRF protection
  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  ].filter(Boolean),
})
