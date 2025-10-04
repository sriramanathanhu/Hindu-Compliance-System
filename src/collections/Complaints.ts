import type { CollectionConfig } from 'payload'

export const Complaints: CollectionConfig = {
  slug: 'complaints',
  admin: {
    useAsTitle: 'complaintSummary',
    defaultColumns: ['business', 'complaintType', 'status', 'submittedBy', 'createdAt'],
    group: 'Content',
    description: 'Customer complaints against businesses',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        submittedBy: { equals: user?.id },
      }
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => user?.role === 'admin',
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

    // ===== PRELIMINARY SCREENING QUESTIONS =====
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
          label: "NOT buyer's remorse",
          required: true,
          defaultValue: false,
          admin: {
            description: "Complaint is NOT solely about buyer's remorse",
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

    // ===== ADDITIONAL SCREENING =====
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
        condition: (data) => data.status === 'resolved' || data.status === 'closed',
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
        if (operation === 'create' && req.user) {
          data.submittedBy = req.user.id
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation, previousDoc, context }) => {
        if (
          operation === 'create' ||
          (doc.status !== previousDoc?.status && doc.visibleToPublic)
        ) {
          const payload = context.payload || req.payload

          // Get all visible complaints for this business
          const complaints = await payload.find({
            collection: 'complaints',
            where: {
              business: { equals: doc.business },
              visibleToPublic: { equals: true },
            },
            limit: 1000,
          })

          // Update business complaint count
          await payload.update({
            collection: 'businesses',
            id: typeof doc.business === 'object' ? doc.business.id : doc.business,
            data: {
              'statistics.totalComplaints': complaints.totalDocs,
            },
          })
        }
      },
    ],
  },
}
