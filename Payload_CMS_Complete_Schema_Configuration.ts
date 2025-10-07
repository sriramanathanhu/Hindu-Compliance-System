import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import path from 'path'

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Business Directory CMS',
    },
  },
  
  // Database configuration
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),

  // Rich text editor
  editor: lexicalEditor({}),

  // Collections
  collections: [
    // ============================================
    // 1. BUSINESSES COLLECTION
    // ============================================
    {
      slug: 'businesses',
      admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'primaryCategory', 'status', 'rating', 'accredited'],
        group: 'Content',
      },
      access: {
        read: () => true, // Public can read
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => !!user,
      },
      fields: [
        // ===== BASIC INFORMATION =====
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Business name (e.g., FG Roofing, Inc.)',
          },
        },
        {
          name: 'slug',
          type: 'text',
          unique: true,
          required: true,
          admin: {
            description: 'URL-friendly identifier',
          },
          hooks: {
            beforeValidate: [
              ({ value, data }) => {
                if (!value && data?.name) {
                  return data.name
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                }
                return value
              },
            ],
          },
        },
        {
          name: 'primaryCategory',
          type: 'text',
          required: true,
          admin: {
            description: 'Primary business type (e.g., Roofing Contractors)',
          },
        },
        {
          name: 'aboutBusiness',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Short description (e.g., Residential and commercial roofing contractor)',
          },
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          required: false,
          admin: {
            description: 'Business logo',
          },
        },

        // ===== ACCREDITATION & RATINGS =====
        {
          name: 'accreditation',
          type: 'group',
          admin: {
            description: 'BBB or other accreditation information',
          },
          fields: [
            {
              name: 'accredited',
              type: 'checkbox',
              label: 'BBB Accredited',
              defaultValue: false,
            },
            {
              name: 'accreditedSince',
              type: 'date',
              label: 'Accredited Since',
              admin: {
                condition: (data) => data.accreditation?.accredited,
              },
            },
            {
              name: 'rating',
              type: 'select',
              label: 'BBB Rating',
              options: [
                { label: 'A+', value: 'A+' },
                { label: 'A', value: 'A' },
                { label: 'A-', value: 'A-' },
                { label: 'B+', value: 'B+' },
                { label: 'B', value: 'B' },
                { label: 'B-', value: 'B-' },
                { label: 'C+', value: 'C+' },
                { label: 'C', value: 'C' },
                { label: 'C-', value: 'C-' },
                { label: 'D+', value: 'D+' },
                { label: 'D', value: 'D' },
                { label: 'D-', value: 'D-' },
                { label: 'F', value: 'F' },
              ],
            },
            {
              name: 'ratedBy',
              type: 'text',
              label: 'Rated By',
              admin: {
                placeholder: 'BBB',
              },
            },
          ],
        },

        // ===== BUSINESS DETAILS =====
        {
          name: 'businessDetails',
          type: 'group',
          fields: [
            {
              name: 'yearsInBusiness',
              type: 'number',
              label: 'Years in Business',
            },
            {
              name: 'businessStarted',
              type: 'date',
              label: 'Business Started Date',
            },
            {
              name: 'incorporated',
              type: 'date',
              label: 'Date Incorporated',
            },
            {
              name: 'bbbFileOpened',
              type: 'date',
              label: 'BBB File Opened',
            },
            {
              name: 'typeOfEntity',
              type: 'select',
              label: 'Type of Entity',
              options: [
                { label: 'Corporation', value: 'corporation' },
                { label: 'LLC', value: 'llc' },
                { label: 'Partnership', value: 'partnership' },
                { label: 'Sole Proprietorship', value: 'sole_proprietorship' },
                { label: 'Other', value: 'other' },
              ],
            },
            {
              name: 'localBBB',
              type: 'text',
              label: 'Local BBB',
              admin: {
                placeholder: 'BBB Serving the Pacific Southwest, Central & Inland California',
              },
            },
          ],
        },

        // ===== LOCATION & ADDRESS =====
        {
          name: 'address',
          type: 'group',
          fields: [
            {
              name: 'street',
              type: 'text',
            },
            {
              name: 'city',
              type: 'text',
              required: true,
            },
            {
              name: 'state',
              type: 'text',
              required: true,
            },
            {
              name: 'zipCode',
              type: 'text',
              required: true,
            },
            {
              name: 'country',
              type: 'text',
              defaultValue: 'USA',
            },
            {
              name: 'serviceArea',
              type: 'textarea',
              label: 'Service Area Description',
              admin: {
                description: 'Description of areas served',
              },
            },
          ],
        },

        // ===== CONTACT INFORMATION =====
        {
          name: 'contactInfo',
          type: 'group',
          label: 'Contact Information',
          fields: [
            {
              name: 'primaryPhone',
              type: 'text',
              required: true,
              label: 'Primary Phone',
            },
            {
              name: 'additionalPhones',
              type: 'array',
              label: 'Additional Phone Numbers',
              fields: [
                {
                  name: 'phoneLabel',
                  type: 'text',
                  admin: {
                    placeholder: 'Other Phone, Fax, etc.',
                  },
                },
                {
                  name: 'phoneNumber',
                  type: 'text',
                },
              ],
            },
            {
              name: 'primaryEmail',
              type: 'email',
              label: 'Primary Email',
            },
            {
              name: 'additionalEmails',
              type: 'array',
              label: 'Additional Email Addresses',
              fields: [
                {
                  name: 'emailType',
                  type: 'select',
                  options: [
                    { label: 'Sales', value: 'sales' },
                    { label: 'Technical Support', value: 'technical' },
                    { label: 'Customer Service', value: 'customer_service' },
                    { label: 'Billing', value: 'billing' },
                    { label: 'Other', value: 'other' },
                  ],
                },
                {
                  name: 'email',
                  type: 'email',
                },
              ],
            },
            {
              name: 'website',
              type: 'text',
              label: 'Primary Website',
              admin: {
                placeholder: 'https://example.com',
              },
            },
            {
              name: 'additionalWebsites',
              type: 'array',
              label: 'Additional Websites',
              fields: [
                {
                  name: 'url',
                  type: 'text',
                  admin: {
                    placeholder: 'https://example.com',
                  },
                },
                {
                  name: 'description',
                  type: 'text',
                  admin: {
                    placeholder: 'E.g., Portfolio site, Blog, etc.',
                  },
                },
              ],
            },
          ],
        },

        // ===== MANAGEMENT & CONTACTS =====
        {
          name: 'management',
          type: 'group',
          label: 'Business Management',
          fields: [
            {
              name: 'managers',
              type: 'array',
              label: 'Business Management',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  admin: {
                    placeholder: 'President, CEO, Manager, etc.',
                  },
                },
              ],
            },
            {
              name: 'principalContacts',
              type: 'array',
              label: 'Principal Contacts',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'customerContacts',
              type: 'array',
              label: 'Customer Contacts',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },

        // ===== SOCIAL MEDIA =====
        {
          name: 'socialMedia',
          type: 'group',
          label: 'Social Media',
          fields: [
            {
              name: 'facebook',
              type: 'text',
            },
            {
              name: 'instagram',
              type: 'text',
            },
            {
              name: 'twitter',
              type: 'text',
            },
            {
              name: 'linkedin',
              type: 'text',
            },
            {
              name: 'youtube',
              type: 'text',
            },
            {
              name: 'tiktok',
              type: 'text',
            },
          ],
        },

        // ===== LICENSING & PAYMENT =====
        {
          name: 'licensing',
          type: 'group',
          label: 'Licensing Information',
          fields: [
            {
              name: 'requiresLicensing',
              type: 'checkbox',
              label: 'Industry Requires Licensing',
              defaultValue: true,
            },
            {
              name: 'licensingNote',
              type: 'textarea',
              label: 'Licensing Note',
              admin: {
                description: 'Information about licensing requirements',
                placeholder: 'This business is in an industry that may require professional licensing, bonding or registration...',
              },
            },
            {
              name: 'licenseNumbers',
              type: 'array',
              label: 'License Numbers',
              fields: [
                {
                  name: 'licenseType',
                  type: 'text',
                  admin: {
                    placeholder: 'Contractor License, Business License, etc.',
                  },
                },
                {
                  name: 'licenseNumber',
                  type: 'text',
                },
                {
                  name: 'issuingAuthority',
                  type: 'text',
                  admin: {
                    placeholder: 'State Board, County, etc.',
                  },
                },
                {
                  name: 'expirationDate',
                  type: 'date',
                },
              ],
            },
            {
              name: 'licensingResources',
              type: 'array',
              label: 'Other Licensing Resources',
              fields: [
                {
                  name: 'organizationName',
                  type: 'text',
                  admin: {
                    placeholder: 'Contractors State License Board',
                  },
                },
                {
                  name: 'address',
                  type: 'textarea',
                },
                {
                  name: 'phone',
                  type: 'text',
                },
                {
                  name: 'website',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          name: 'paymentMethods',
          type: 'group',
          label: 'Payment Methods',
          fields: [
            {
              name: 'acceptedMethods',
              type: 'textarea',
              label: 'Accepted Payment Methods',
              admin: {
                placeholder: 'Cash, Checks, Zelle and or any other form of online payment',
              },
            },
          ],
        },

        // ===== CATEGORIES & SERVICES =====
        {
          name: 'categories',
          type: 'relationship',
          relationTo: 'business-categories',
          hasMany: true,
          required: true,
          admin: {
            description: 'Select all applicable business categories',
          },
        },
        {
          name: 'services',
          type: 'array',
          label: 'Services Offered',
          fields: [
            {
              name: 'serviceName',
              type: 'text',
            },
            {
              name: 'description',
              type: 'textarea',
            },
          ],
        },

        // ===== STATISTICS & METADATA =====
        {
          name: 'statistics',
          type: 'group',
          admin: {
            position: 'sidebar',
          },
          fields: [
            {
              name: 'averageRating',
              type: 'number',
              label: 'Average Rating',
              min: 0,
              max: 5,
              admin: {
                description: 'Calculated from reviews (0-5)',
                readOnly: true,
              },
            },
            {
              name: 'totalReviews',
              type: 'number',
              label: 'Total Reviews',
              defaultValue: 0,
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'totalComplaints',
              type: 'number',
              label: 'Total Complaints',
              defaultValue: 0,
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'viewCount',
              type: 'number',
              label: 'Profile Views',
              defaultValue: 0,
              admin: {
                readOnly: true,
              },
            },
          ],
        },

        // ===== STATUS & VISIBILITY =====
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Feature this business on homepage',
            position: 'sidebar',
          },
        },
        {
          name: 'verified',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Verified business',
            position: 'sidebar',
          },
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
            { label: 'Under Review', value: 'under_review' },
            { label: 'Suspended', value: 'suspended' },
            { label: 'Archived', value: 'archived' },
          ],
          defaultValue: 'draft',
          required: true,
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'owner',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'Business owner/manager user account',
            position: 'sidebar',
          },
        },
      ],
      timestamps: true,
      hooks: {
        afterChange: [
          async ({ doc, req, operation }) => {
            // Recalculate ratings when business is updated
            if (operation === 'update') {
              // TODO: Trigger rating recalculation
            }
          },
        ],
      },
    },

    // ============================================
    // Business Categories
    // ============================================
    {
      slug: 'business-categories',
      admin: {
        useAsTitle: 'name',
        group: 'Content',
      },
      access: {
        read: () => true,
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          unique: true,
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'parent',
          type: 'relationship',
          relationTo: 'business-categories',
          admin: {
            description: 'Parent category for nested categories',
          },
        },
      ],
    },

    // ============================================
    // 2. BLOG/CONTENT COLLECTION
    // ============================================
    {
      slug: 'posts',
      admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'author', 'status', 'publishedDate'],
        group: 'Content',
      },
      access: {
        read: ({ req: { user } }) => {
          // Published posts are public, drafts only for logged-in users
          if (user) return true
          return {
            status: {
              equals: 'published',
            },
          }
        },
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => !!user,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          unique: true,
          required: true,
          admin: {
            description: 'URL-friendly identifier',
          },
          hooks: {
            beforeValidate: [
              ({ value, data }) => {
                if (!value && data?.title) {
                  return data.title
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                }
                return value
              },
            ],
          },
        },
        {
          name: 'excerpt',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Short summary for previews',
          },
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
        {
          name: 'featuredImage',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'categories',
          type: 'relationship',
          relationTo: 'blog-categories',
          hasMany: true,
          required: true,
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'tags',
          type: 'array',
          label: 'Tags',
          admin: {
            position: 'sidebar',
          },
          fields: [
            {
              name: 'tag',
              type: 'text',
            },
          ],
        },
        {
          name: 'relatedBusinesses',
          type: 'relationship',
          relationTo: 'businesses',
          hasMany: true,
          admin: {
            description: 'Link related businesses to this post',
          },
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
            { label: 'Archived', value: 'archived' },
          ],
          defaultValue: 'draft',
          required: true,
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'publishedDate',
          type: 'date',
          admin: {
            position: 'sidebar',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Feature on homepage',
            position: 'sidebar',
          },
        },
        {
          name: 'seo',
          type: 'group',
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
              admin: {
                placeholder: 'Leave empty to use post title',
              },
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              maxLength: 160,
            },
            {
              name: 'metaImage',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          name: 'viewCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            position: 'sidebar',
          },
        },
      ],
      timestamps: true,
    },

    // ============================================
    // Blog Categories
    // ============================================
    {
      slug: 'blog-categories',
      admin: {
        useAsTitle: 'name',
        group: 'Content',
      },
      access: {
        read: () => true,
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          unique: true,
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'color',
          type: 'text',
          admin: {
            description: 'Hex color code for category badge',
            placeholder: '#3b82f6',
          },
        },
      ],
    },

    // ============================================
    // 3. APPLICATIONS COLLECTION
    // (Using native Form Builder plugin for form creation)
    // This collection stores application submissions
    // ============================================
    {
      slug: 'applications',
      admin: {
        useAsTitle: 'applicantName',
        defaultColumns: ['applicantName', 'email', 'formType', 'status', 'createdAt'],
        group: 'Applications',
      },
      access: {
        read: ({ req: { user } }) => !!user, // Only logged-in users can view
        create: () => true, // Anyone can submit
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => !!user,
      },
      fields: [
        {
          name: 'formType',
          type: 'select',
          options: [
            { label: 'Business Registration', value: 'business_registration' },
            { label: 'Partnership Application', value: 'partnership' },
            { label: 'Vendor Application', value: 'vendor' },
            { label: 'General Inquiry', value: 'general' },
            { label: 'Support Request', value: 'support' },
          ],
          required: true,
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'applicantName',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          required: true,
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
          name: 'message',
          type: 'textarea',
          required: true,
        },
        {
          name: 'formData',
          type: 'json',
          admin: {
            description: 'Additional dynamic form data',
          },
        },
        {
          name: 'attachments',
          type: 'array',
          fields: [
            {
              name: 'file',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'description',
              type: 'text',
            },
          ],
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'New', value: 'new' },
            { label: 'In Review', value: 'in_review' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'On Hold', value: 'on_hold' },
          ],
          defaultValue: 'new',
          required: true,
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'assignedTo',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'Staff member handling this application',
            position: 'sidebar',
          },
        },
        {
          name: 'internalNotes',
          type: 'richText',
          admin: {
            description: 'Internal notes (not visible to applicant)',
          },
        },
        {
          name: 'priority',
          type: 'select',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Urgent', value: 'urgent' },
          ],
          defaultValue: 'medium',
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'reviewedAt',
          type: 'date',
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'reviewedBy',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            position: 'sidebar',
          },
        },
      ],
      timestamps: true,
      hooks: {
        afterChange: [
          async ({ doc, req, operation }) => {
            // Send email notification when application is submitted
            if (operation === 'create') {
              // TODO: Implement email notification
              console.log('New application submitted:', doc.id)
            }
          },
        ],
      },
    },

    // ============================================
    // 4. USERS COLLECTION (with Authentication)
    // ============================================
    {
      slug: 'users',
      auth: {
        // For SSO integration, you'll need to:
        // 1. Set disableLocalStrategy: true if you only want SSO
        // 2. Add custom authentication strategies
        // 3. Handle SSO callbacks in custom routes
        tokenExpiration: 7200, // 2 hours
        verify: true, // Email verification
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
          // Users can read their own profile, admins can read all
          if (user?.role === 'admin') return true
          return {
            id: {
              equals: user?.id,
            },
          }
        },
        create: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => {
          // Users can update their own profile, admins can update all
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
            // Only admins can change roles
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
        {
          name: 'ssoProvider',
          type: 'select',
          options: [
            { label: 'Local', value: 'local' },
            { label: 'Custom SSO', value: 'custom_sso' },
            { label: 'Google', value: 'google' },
            { label: 'Microsoft', value: 'microsoft' },
          ],
          defaultValue: 'local',
          admin: {
            readOnly: true,
            description: 'Authentication provider used',
          },
        },
        {
          name: 'ssoId',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'External SSO identifier',
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
    },

    // ============================================
    // MEDIA COLLECTION (for file uploads)
    // ============================================
    {
      slug: 'media',
      admin: {
        group: 'Media',
      },
      upload: {
        staticDir: 'media',
        imageSizes: [
          {
            name: 'thumbnail',
            width: 400,
            height: 300,
            position: 'centre',
          },
          {
            name: 'card',
            width: 768,
            height: 1024,
            position: 'centre',
          },
          {
            name: 'tablet',
            width: 1024,
            height: undefined,
            position: 'centre',
          },
        ],
        adminThumbnail: 'thumbnail',
        mimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      },
      access: {
        read: () => true,
      },
      fields: [
        {
          name: 'alt',
          type: 'text',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },

    // ============================================
    // REVIEWS COLLECTION
    // ============================================
    {
      slug: 'reviews',
      admin: {
        useAsTitle: 'reviewText',
        defaultColumns: ['business', 'rating', 'user', 'status', 'createdAt'],
        group: 'Content',
        description: 'Customer reviews for businesses',
      },
      access: {
        read: ({ req: { user } }) => {
          // Admins can see all reviews
          if (user?.role === 'admin') return true
          // Logged-in users can see approved reviews
          if (user) {
            return {
              or: [
                { status: { equals: 'approved' } },
                { user: { equals: user.id } }, // Users can see their own reviews
              ],
            }
          }
          // Public can only see approved reviews
          return {
            status: { equals: 'approved' },
          }
        },
        create: ({ req: { user } }) => !!user, // Must be logged in to create
        update: ({ req: { user } }) => {
          if (user?.role === 'admin') return true
          return {
            user: { equals: user?.id }, // Users can only update their own reviews
          }
        },
        delete: ({ req: { user } }) => user?.role === 'admin',
      },
      fields: [
        {
          name: 'business',
          type: 'relationship',
          relationTo: 'businesses',
          required: true,
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          admin: {
            position: 'sidebar',
            readOnly: true,
            description: 'User who submitted the review',
          },
        },
        
        // ===== REVIEW CONTENT =====
        {
          name: 'rating',
          type: 'number',
          min: 1,
          max: 5,
          required: true,
          admin: {
            description: 'Overall experience rating (1-5 stars)',
          },
        },
        {
          name: 'reviewText',
          type: 'textarea',
          required: true,
          minLength: 10,
          maxLength: 2000,
          admin: {
            description: 'Review details (10-2000 characters)',
            placeholder: 'Leave some details to help others...',
          },
        },
        {
          name: 'reviewImages',
          type: 'array',
          label: 'Review Images (Optional)',
          maxRows: 5,
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },

        // ===== TERMS & CONDITIONS =====
        {
          name: 'termsAccepted',
          type: 'checkbox',
          required: true,
          defaultValue: false,
          admin: {
            description: 'User must accept Customer Review Submission Terms',
          },
        },

        // ===== REVIEW STATUS & MODERATION =====
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pending Review', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Flagged', value: 'flagged' },
          ],
          defaultValue: 'pending',
          required: true,
          admin: {
            position: 'sidebar',
            description: 'Review moderation status',
          },
        },
        {
          name: 'moderationNotes',
          type: 'textarea',
          admin: {
            position: 'sidebar',
            description: 'Internal notes for moderation team',
            condition: (data) => data.status === 'rejected' || data.status === 'flagged',
          },
        },
        {
          name: 'reviewedBy',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            position: 'sidebar',
            description: 'Admin who reviewed this submission',
          },
        },
        {
          name: 'reviewedAt',
          type: 'date',
          admin: {
            position: 'sidebar',
          },
        },

        // ===== ENGAGEMENT METRICS =====
        {
          name: 'helpfulCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Number of users who found this helpful',
            position: 'sidebar',
          },
        },
        {
          name: 'reportedCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Number of times this review was reported',
            position: 'sidebar',
          },
        },
      ],
      timestamps: true,
      hooks: {
        beforeChange: [
          async ({ req, data, operation }) => {
            // Auto-assign the logged-in user
            if (operation === 'create' && req.user) {
              data.user = req.user.id
            }
            return data
          },
        ],
        afterChange: [
          async ({ doc, req, operation, previousDoc }) => {
            // Update business rating when review is approved
            if (doc.status === 'approved' && previousDoc?.status !== 'approved') {
              // TODO: Trigger business rating recalculation
              console.log('Review approved for business:', doc.business)
            }
          },
        ],
      },
    },

    // ============================================
    // COMPLAINTS COLLECTION
    // ============================================
    {
      slug: 'complaints',
      admin: {
        useAsTitle: 'complaintSummary',
        defaultColumns: ['business', 'complaintType', 'status', 'submittedBy', 'createdAt'],
        group: 'Content',
        description: 'Customer complaints against businesses',
      },
      access: {
        read: ({ req: { user } }) => {
          // Only admins and the complaint submitter can view
          if (user?.role === 'admin') return true
          return {
            submittedBy: { equals: user?.id },
          }
        },
        create: ({ req: { user } }) => !!user, // Must be logged in
        update: ({ req: { user } }) => user?.role === 'admin', // Only admins can update
        delete: ({ req: { user } }) => user?.role === 'admin',
      },
      fields: [
        {
          name: 'business',
          type: 'relationship',
          relationTo: 'businesses',
          required: true,
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'submittedBy',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          admin: {
            position: 'sidebar',
            readOnly: true,
          },
        },

        // ===== PRELIMINARY SCREENING QUESTIONS (Image 5) =====
        {
          name: 'preliminaryScreening',
          type: 'group',
          label: 'Preliminary Screening',
          admin: {
            description: 'Initial qualification questions',
          },
          fields: [
            {
              name: 'notBuyersRemorse',
              type: 'checkbox',
              label: 'NOT buyer\'s remorse',
              required: true,
              defaultValue: false,
              admin: {
                description: 'Complaint is NOT solely about buyer\'s remorse',
              },
            },
            {
              name: 'notPriceComparison',
              type: 'checkbox',
              label: 'NOT price comparison only',
              required: true,
              defaultValue: false,
              admin: {
                description: 'Complaint is NOT based solely on price comparison',
              },
            },
            {
              name: 'notSeekingApologyOnly',
              type: 'checkbox',
              label: 'NOT seeking apology only',
              required: true,
              defaultValue: false,
              admin: {
                description: 'NOT solely seeking an apology',
              },
            },
            {
              name: 'notForInformationOnly',
              type: 'checkbox',
              label: 'NOT for BBB information only',
              required: true,
              defaultValue: false,
              admin: {
                description: 'NOT filing for BBB information only',
              },
            },
            {
              name: 'notDiscriminationClaim',
              type: 'checkbox',
              label: 'NOT discrimination claim',
              required: true,
              defaultValue: false,
              admin: {
                description: 'NOT solely about discrimination or civil rights violations',
              },
            },
          ],
        },

        // ===== ADDITIONAL SCREENING (Step 2 from Image 5) =====
        {
          name: 'additionalScreening',
          type: 'group',
          label: 'Additional Screening',
          fields: [
            {
              name: 'isEmployeeComplaint',
              type: 'select',
              label: 'Employee/Employer Complaint?',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              required: true,
            },
            {
              name: 'seeksCriminalPenalty',
              type: 'select',
              label: 'Seeks Criminal Penalty?',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              required: true,
            },
            {
              name: 'filedInCourt',
              type: 'select',
              label: 'Filed in Court?',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              required: true,
            },
            {
              name: 'isB2BCollection',
              type: 'select',
              label: 'Business Collecting from Another Business?',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              required: true,
              admin: {
                description: 'Is this a business attempting to collect money from another business?',
              },
            },
          ],
        },

        // ===== COMPLAINT DETAILS =====
        {
          name: 'complaintType',
          type: 'select',
          label: 'Type of Complaint',
          options: [
            { label: 'Product/Service Quality', value: 'quality' },
            { label: 'Billing/Payment Issue', value: 'billing' },
            { label: 'Customer Service', value: 'customer_service' },
            { label: 'Contract Dispute', value: 'contract' },
            { label: 'Delivery/Timing', value: 'delivery' },
            { label: 'False Advertising', value: 'advertising' },
            { label: 'Warranty/Guarantee', value: 'warranty' },
            { label: 'Other', value: 'other' },
          ],
          required: true,
        },
        {
          name: 'complaintSummary',
          type: 'text',
          required: true,
          maxLength: 200,
          admin: {
            description: 'Brief summary of the complaint (max 200 characters)',
          },
        },
        {
          name: 'complaintDetails',
          type: 'textarea',
          required: true,
          minLength: 50,
          admin: {
            description: 'Detailed description of the complaint',
            placeholder: 'Please provide a detailed description of your issue...',
          },
        },

        // ===== TRANSACTION DETAILS =====
        {
          name: 'transactionDetails',
          type: 'group',
          label: 'Transaction Details',
          fields: [
            {
              name: 'transactionDate',
              type: 'date',
              label: 'Date of Transaction',
              required: true,
            },
            {
              name: 'amountPaid',
              type: 'number',
              label: 'Amount Paid ($)',
            },
            {
              name: 'invoiceNumber',
              type: 'text',
              label: 'Invoice/Order Number',
            },
            {
              name: 'productOrService',
              type: 'text',
              label: 'Product or Service',
              required: true,
            },
          ],
        },

        // ===== DESIRED RESOLUTION =====
        {
          name: 'desiredResolution',
          type: 'group',
          label: 'Desired Resolution',
          fields: [
            {
              name: 'resolutionType',
              type: 'select',
              label: 'What resolution are you seeking?',
              options: [
                { label: 'Full Refund', value: 'full_refund' },
                { label: 'Partial Refund', value: 'partial_refund' },
                { label: 'Replacement', value: 'replacement' },
                { label: 'Repair', value: 'repair' },
                { label: 'Apology', value: 'apology' },
                { label: 'Other', value: 'other' },
              ],
              required: true,
            },
            {
              name: 'resolutionAmount',
              type: 'number',
              label: 'Requested Amount ($)',
              admin: {
                condition: (data) => 
                  data.desiredResolution?.resolutionType === 'full_refund' || 
                  data.desiredResolution?.resolutionType === 'partial_refund',
              },
            },
            {
              name: 'resolutionDetails',
              type: 'textarea',
              label: 'Resolution Details',
              admin: {
                placeholder: 'Explain what resolution you are seeking...',
              },
            },
          ],
        },

        // ===== SUPPORTING DOCUMENTS =====
        {
          name: 'attachments',
          type: 'array',
          label: 'Supporting Documents',
          maxRows: 10,
          admin: {
            description: 'Upload receipts, contracts, photos, or other evidence',
          },
          fields: [
            {
              name: 'file',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'description',
              type: 'text',
              admin: {
                placeholder: 'Describe this document (e.g., Receipt, Contract, Photo of damage)',
              },
            },
          ],
        },

        // ===== CONTACT ATTEMPTS =====
        {
          name: 'contactAttempts',
          type: 'group',
          label: 'Contact Attempts with Business',
          fields: [
            {
              name: 'attemptedContact',
              type: 'checkbox',
              label: 'I have attempted to contact the business',
              defaultValue: false,
            },
            {
              name: 'contactMethod',
              type: 'select',
              label: 'How did you contact them?',
              options: [
                { label: 'Phone', value: 'phone' },
                { label: 'Email', value: 'email' },
                { label: 'In Person', value: 'in_person' },
                { label: 'Mail', value: 'mail' },
                { label: 'Other', value: 'other' },
              ],
              admin: {
                condition: (data) => data.contactAttempts?.attemptedContact,
              },
            },
            {
              name: 'contactDate',
              type: 'date',
              label: 'Date of Last Contact',
              admin: {
                condition: (data) => data.contactAttempts?.attemptedContact,
              },
            },
            {
              name: 'businessResponse',
              type: 'textarea',
              label: 'Business Response (if any)',
              admin: {
                condition: (data) => data.contactAttempts?.attemptedContact,
              },
            },
          ],
        },

        // ===== COMPLAINT STATUS & MANAGEMENT =====
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Submitted', value: 'submitted' },
            { label: 'Under Review', value: 'under_review' },
            { label: 'Forwarded to Business', value: 'forwarded' },
            { label: 'Business Responded', value: 'business_responded' },
            { label: 'Resolved', value: 'resolved' },
            { label: 'Closed', value: 'closed' },
            { label: 'Rejected', value: 'rejected' },
          ],
          defaultValue: 'submitted',
          required: true,
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'priority',
          type: 'select',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Urgent', value: 'urgent' },
          ],
          defaultValue: 'medium',
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'assignedTo',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            position: 'sidebar',
            description: 'Staff member handling this complaint',
          },
        },

        // ===== BUSINESS RESPONSE =====
        {
          name: 'businessResponse',
          type: 'group',
          label: 'Business Response',
          admin: {
            condition: (data) => 
              data.status === 'business_responded' || 
              data.status === 'resolved' || 
              data.status === 'closed',
          },
          fields: [
            {
              name: 'responseDate',
              type: 'date',
              label: 'Date of Response',
            },
            {
              name: 'responseText',
              type: 'textarea',
              label: 'Business Response',
            },
            {
              name: 'offerMade',
              type: 'checkbox',
              label: 'Business Made an Offer',
              defaultValue: false,
            },
            {
              name: 'offerDetails',
              type: 'textarea',
              label: 'Offer Details',
              admin: {
                condition: (data) => data.businessResponse?.offerMade,
              },
            },
          ],
        },

        // ===== RESOLUTION =====
        {
          name: 'resolution',
          type: 'group',
          label: 'Final Resolution',
          admin: {
            condition: (data) => 
              data.status === 'resolved' || data.status === 'closed',
          },
          fields: [
            {
              name: 'resolutionDate',
              type: 'date',
              label: 'Resolution Date',
            },
            {
              name: 'resolutionSummary',
              type: 'textarea',
              label: 'Resolution Summary',
            },
            {
              name: 'satisfiedCustomer',
              type: 'checkbox',
              label: 'Customer Satisfied with Resolution',
              defaultValue: false,
            },
          ],
        },

        // ===== INTERNAL NOTES =====
        {
          name: 'internalNotes',
          type: 'array',
          label: 'Internal Notes',
          admin: {
            description: 'Staff notes (not visible to customer or business)',
          },
          fields: [
            {
              name: 'note',
              type: 'textarea',
              required: true,
            },
            {
              name: 'author',
              type: 'relationship',
              relationTo: 'users',
              required: true,
            },
            {
              name: 'noteDate',
              type: 'date',
              defaultValue: () => new Date().toISOString(),
            },
          ],
        },

        // ===== PUBLIC VISIBILITY =====
        {
          name: 'visibleToPublic',
          type: 'checkbox',
          label: 'Show on Business Profile',
          defaultValue: true,
          admin: {
            position: 'sidebar',
            description: 'Display complaint count publicly',
          },
        },
      ],
      timestamps: true,
      hooks: {
        beforeChange: [
          async ({ req, data, operation }) => {
            // Auto-assign the logged-in user
            if (operation === 'create' && req.user) {
              data.submittedBy = req.user.id
            }
            return data
          },
        ],
        afterChange: [
          async ({ doc, req, operation, previousDoc }) => {
            // Update business complaint count
            if (operation === 'create' || 
                (doc.status !== previousDoc?.status && doc.visibleToPublic)) {
              // TODO: Trigger business complaint count recalculation
              console.log('Complaint status changed for business:', doc.business)
            }

            // Send notification to business when complaint is filed
            if (operation === 'create') {
              // TODO: Send email notification to business
              console.log('New complaint filed against business:', doc.business)
            }
          },
        ],
      },
    },
  ],

  // ============================================
  // PLUGINS
  // ============================================
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
      redirectRelationships: ['posts'],
      beforeEmail: async (emailsToSend) => {
        // Customize email template here
        return emailsToSend
      },
    }),
  ],

  // Localization (optional)
  localization: {
    locales: ['en', 'es', 'fr'],
    defaultLocale: 'en',
    fallback: true,
  },

  // TypeScript type generation
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },

  // GraphQL configuration
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
})