import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200, // 2 hours
    verify: false, // Disable email verification for SSO users
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 minutes
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'role', 'accountStatus'],
    group: 'Admin',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Business Owner', value: 'business_owner' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
      required: true,
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'company',
      type: 'text',
    },
    {
      name: 'accountStatus',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' },
      ],
      defaultValue: 'active',
      required: true,
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    // SSO-specific fields
    {
      name: 'ssoProvider',
      type: 'select',
      options: [
        { label: 'Local', value: 'local' },
        { label: 'KAILASA SSO', value: 'kailasa_sso' },
      ],
      defaultValue: 'local',
      admin: {
        readOnly: true,
        description: 'Authentication provider used',
        position: 'sidebar',
      },
    },
    {
      name: 'ssoId',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        description: 'External SSO identifier',
        position: 'sidebar',
      },
      index: true,
    },
    {
      name: 'ssoData',
      type: 'json',
      admin: {
        readOnly: true,
        description: 'Additional data from SSO provider',
      },
    },
    {
      name: 'preferences',
      type: 'group',
      fields: [
        {
          name: 'emailNotifications',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'marketingEmails',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'language',
          type: 'select',
          options: [
            { label: 'English', value: 'en' },
            { label: 'Spanish', value: 'es' },
            { label: 'French', value: 'fr' },
          ],
          defaultValue: 'en',
        },
      ],
    },
    {
      name: 'lastLogin',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create' || operation === 'update') {
          data.lastLogin = new Date().toISOString()
        }
        return data
      },
    ],
  },
}
