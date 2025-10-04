import type { CollectionConfig } from 'payload'

export const Businesses: CollectionConfig = {
  slug: 'businesses',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'primaryCategory', 'status', 'statistics.averageRating', 'accreditation.accredited'],
    group: 'Content',
  },
  access: {
    read: () => true,
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
}
