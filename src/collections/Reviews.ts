import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'reviewText',
    defaultColumns: ['business', 'rating', 'user', 'status', 'createdAt'],
    group: 'Content',
    description: 'Customer reviews for businesses',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user) {
        return {
          or: [
            { status: { equals: 'approved' } },
            { user: { equals: user.id } },
          ],
        }
      }
      return {
        status: { equals: 'approved' },
      }
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        user: { equals: user?.id },
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
        if (operation === 'create' && req.user) {
          data.user = req.user.id
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation, previousDoc, context }) => {
        // Update business rating when review is approved
        if (doc.status === 'approved' && previousDoc?.status !== 'approved') {
          const payload = context.payload || req.payload

          // Get all approved reviews for this business
          const reviews = await payload.find({
            collection: 'reviews',
            where: {
              business: { equals: doc.business },
              status: { equals: 'approved' },
            },
            limit: 1000,
          })

          // Calculate average rating
          const totalRating = reviews.docs.reduce((sum, review) => sum + review.rating, 0)
          const averageRating = reviews.totalDocs > 0 ? totalRating / reviews.totalDocs : 0

          // Update business statistics
          await payload.update({
            collection: 'businesses',
            id: typeof doc.business === 'object' ? doc.business.id : doc.business,
            data: {
              'statistics.averageRating': averageRating,
              'statistics.totalReviews': reviews.totalDocs,
            },
          })
        }
      },
    ],
  },
}
