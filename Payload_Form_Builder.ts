# Payload Form Builder - Complete Implementation Guide

## Overview
The Form Builder plugin creates two collections automatically:
1. **Forms** - Where admins create and manage form schemas
2. **Form Submissions** - Where all form submissions are stored

## Installation & Setup

### 1. Install the Plugin
```bash
npm install @payloadcms/plugin-form-builder
```

### 2. Configure in payload.config.ts
```typescript
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'

export default buildConfig({
  plugins: [
    formBuilderPlugin({
      // Available field types in the form builder UI
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
        payment: false, // Enable if you need payment processing
      },
      
      // Collections that can be used for redirects after submission
      redirectRelationships: ['posts', 'pages'],
      
      // Customize form collection
      formOverrides: {
        admin: {
          group: 'Applications',
        },
        // Add custom fields to the form collection
        fields: [
          {
            name: 'customField',
            type: 'text',
          },
        ],
      },
      
      // Customize form submissions collection
      formSubmissionOverrides: {
        admin: {
          group: 'Applications',
        },
        // Restrict who can view submissions
        access: {
          read: ({ req: { user } }) => {
            if (user?.role === 'admin') return true
            return false
          },
        },
      },
      
      // Customize email template before sending
      beforeEmail: async (emailsToSend) => {
        return emailsToSend.map(email => ({
          ...email,
          // Add custom HTML template
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2>New Form Submission</h2>
              ${email.html}
              <footer style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ccc;">
                <p style="color: #666;">Sent from Your Business Directory</p>
              </footer>
            </div>
          `,
        }))
      },
      
      // Handle payment processing (optional)
      handlePayment: async ({ form, submissionData }) => {
        // Integrate with Stripe, PayPal, etc.
        // Example:
        // const amount = getPaymentTotal(form.fields, submissionData)
        // const payment = await stripe.charges.create({ amount })
        // return payment
      },
    }),
  ],
})
```

## Creating Forms in Admin Panel

### Step 1: Navigate to Forms Collection
1. Log into Payload admin panel
2. Go to **Forms** collection
3. Click **Create New**

### Step 2: Configure Form
```
Title: Business Registration Form
Submit Button Label: Submit Application
```

### Step 3: Add Fields
The form builder provides a drag-and-drop interface. Available fields:
- **Text** - Single line text input
- **Textarea** - Multi-line text input
- **Select** - Dropdown selection
- **Email** - Email validation
- **Number** - Numeric input
- **Checkbox** - True/false selection
- **Country** - Country selector
- **State** - State/province selector
- **Message** - Display-only text/instructions
- **Payment** - Payment field (if enabled)

### Step 4: Configure Confirmation
Choose one:
- **Message**: Display success message on same page
- **Redirect**: Redirect to another page after submission

### Step 5: Setup Email Notifications
```
Send Email On Submission: ✓
Email To: admin@yourdomain.com
Email From: noreply@yourdomain.com
Email Subject: New Business Registration
Reply To: Email field (select from form fields)
Email Message: Custom message template
```

## Frontend Integration

### Option 1: Using REST API

#### Fetch Form Schema
```typescript
// Fetch form by ID or slug
const response = await fetch('http://localhost:3000/api/forms/FORM_ID')
const form = await response.json()
```

#### Render Form in React
```tsx
'use client'

import { useState } from 'react'

export default function DynamicForm({ form }) {
  const [formData, setFormData] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('http://localhost:3000/api/form-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form: form.id,
          submissionData: formData,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({})
        
        // Handle redirect if configured
        if (form.redirect?.url) {
          window.location.href = form.redirect.url
        }
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field) => {
    switch (field.blockType) {
      case 'text':
      case 'email':
        return (
          <div key={field.name} style={{ width: field.width ? `${field.width}%` : '100%' }}>
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span style={{ color: 'red' }}>*</span>}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.blockType}
              required={field.required}
              defaultValue={field.defaultValue}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>
        )

      case 'textarea':
        return (
          <div key={field.name} style={{ width: field.width ? `${field.width}%` : '100%' }}>
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span style={{ color: 'red' }}>*</span>}
            </label>
            <textarea
              id={field.name}
              name={field.name}
              required={field.required}
              defaultValue={field.defaultValue}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              rows={4}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>
        )

      case 'select':
        return (
          <div key={field.name} style={{ width: field.width ? `${field.width}%` : '100%' }}>
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span style={{ color: 'red' }}>*</span>}
            </label>
            <select
              id={field.name}
              name={field.name}
              required={field.required}
              defaultValue={field.defaultValue}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            >
              <option value="">Select...</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.name} style={{ width: field.width ? `${field.width}%` : '100%' }}>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <input
                type="checkbox"
                name={field.name}
                required={field.required}
                defaultChecked={field.defaultValue}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                style={{ marginRight: '8px' }}
              />
              {field.label}
              {field.required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
            </label>
          </div>
        )

      case 'number':
        return (
          <div key={field.name} style={{ width: field.width ? `${field.width}%` : '100%' }}>
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span style={{ color: 'red' }}>*</span>}
            </label>
            <input
              id={field.name}
              name={field.name}
              type="number"
              required={field.required}
              defaultValue={field.defaultValue}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>
        )

      case 'message':
        return (
          <div key={field.name} style={{ width: field.width ? `${field.width}%` : '100%', marginBottom: '16px' }}>
            <p>{field.message}</p>
          </div>
        )

      default:
        return null
    }
  }

  if (success && form.confirmationType === 'message') {
    return (
      <div style={{ padding: '20px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px' }}>
        <p>{form.confirmationMessage || 'Thank you for your submission!'}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>{form.title}</h2>
      
      {form.fields?.map(renderField)}

      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.6 : 1,
        }}
      >
        {submitting ? 'Submitting...' : form.submitButtonLabel || 'Submit'}
      </button>
    </form>
  )
}
```

#### Page Implementation
```tsx
// app/forms/[slug]/page.tsx
export default async function FormPage({ params }) {
  const form = await fetch(`http://localhost:3000/api/forms?where[slug][equals]=${params.slug}`)
    .then(res => res.json())
    .then(data => data.docs[0])

  if (!form) {
    return <div>Form not found</div>
  }

  return <DynamicForm form={form} />
}
```

### Option 2: Using GraphQL

#### Query Form
```graphql
query GetForm($id: String!) {
  Form(id: $id) {
    id
    title
    fields {
      blockType
      name
      label
      required
      width
      defaultValue
      ... on SelectField {
        options {
          label
          value
        }
      }
    }
    submitButtonLabel
    confirmationType
    confirmationMessage
    redirect {
      url
    }
  }
}
```

#### Submit Form
```graphql
mutation SubmitForm($form: String!, $submissionData: JSON!) {
  createFormSubmission(data: {
    form: $form
    submissionData: $submissionData
  }) {
    id
  }
}
```

## Adding Custom Field Types

If you need custom fields beyond the built-in types:

```typescript
// payload.config.ts
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { DateOfBirth } from './customFields/DateOfBirth'

export default buildConfig({
  plugins: [
    formBuilderPlugin({
      fields: {
        // ... standard fields
        dateOfBirth: {
          slug: 'dateOfBirth',
          labels: {
            singular: 'Date of Birth',
            plural: 'Date of Birth Fields',
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Name',
              required: true,
            },
            {
              name: 'label',
              type: 'text',
              label: 'Label',
              required: true,
            },
            {
              name: 'required',
              type: 'checkbox',
              label: 'Required',
            },
          ],
        },
      },
    }),
  ],
})
```

## Email Configuration

### Setup NodeMailer
```typescript
// payload.config.ts
export default buildConfig({
  email: {
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    fromName: 'Your Business Directory',
    fromAddress: 'noreply@yourdomain.com',
  },
})
```

### Environment Variables
```bash
# .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Form Submission Management

### View Submissions in Admin
1. Navigate to **Form Submissions** collection
2. Filter by form, date, or status
3. Export submissions as CSV

### Access Submissions via API

#### REST API
```javascript
// Get all submissions for a form
const submissions = await fetch('http://localhost:3000/api/form-submissions?where[form][equals]=FORM_ID')
  .then(res => res.json())

// Get single submission
const submission = await fetch('http://localhost:3000/api/form-submissions/SUBMISSION_ID')
  .then(res => res.json())
```

#### Local API (Server-side)
```typescript
import { getPayload } from 'payload'

const payload = await getPayload({ config })

const submissions = await payload.find({
  collection: 'form-submissions',
  where: {
    form: {
      equals: 'FORM_ID',
    },
  },
  limit: 100,
  sort: '-createdAt',
})
```

## Embedding Forms in Pages

### Using Block Pattern
```typescript
// collections/Pages.ts
export const Pages = {
  slug: 'pages',
  fields: [
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        {
          slug: 'formBlock',
          fields: [
            {
              name: 'form',
              type: 'relationship',
              relationTo: 'forms',
              required: true,
            },
            {
              name: 'enableIntro',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'introContent',
              type: 'richText',
              admin: {
                condition: (data) => data.enableIntro,
              },
            },
          ],
        },
      ],
    },
  ],
}
```

### Render Block in Frontend
```tsx
// components/blocks/FormBlock.tsx
import DynamicForm from '../DynamicForm'

export default function FormBlock({ form, enableIntro, introContent }) {
  return (
    <div className="form-block">
      {enableIntro && introContent && (
        <div className="intro" dangerouslySetInnerHTML={{ __html: introContent }} />
      )}
      <DynamicForm form={form} />
    </div>
  )
}
```

## Security Considerations

### 1. Rate Limiting
```typescript
// Add rate limiting to prevent spam
formSubmissionOverrides: {
  hooks: {
    beforeValidate: [
      async ({ req, data }) => {
        // Check submission rate from same IP
        const recentSubmissions = await payload.find({
          collection: 'form-submissions',
          where: {
            and: [
              { 'req.ip': { equals: req.ip } },
              { createdAt: { greater_than: new Date(Date.now() - 60000) } } // Last minute
            ]
          }
        })
        
        if (recentSubmissions.docs.length > 5) {
          throw new Error('Too many submissions. Please try again later.')
        }
      }
    ]
  }
}
```

### 2. CAPTCHA Integration
```typescript
fields: [
  {
    name: 'recaptchaToken',
    type: 'text',
    admin: {
      hidden: true,
    },
  },
],
hooks: {
  beforeValidate: [
    async ({ data }) => {
      // Verify reCAPTCHA token
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET,
          response: data.recaptchaToken,
        }),
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error('reCAPTCHA verification failed')
      }
    },
  ],
}
```

### 3. Sanitize Input
All form inputs are automatically sanitized by Payload, but you can add additional validation:

```typescript
formSubmissionOverrides: {
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Additional sanitization
        if (data.submissionData) {
          Object.keys(data.submissionData).forEach(key => {
            if (typeof data.submissionData[key] === 'string') {
              // Remove HTML tags, scripts, etc.
              data.submissionData[key] = data.submissionData[key]
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .trim()
            }
          })
        }
        return data
      }
    ]
  }
}
```

## Best Practices

1. **Always validate on backend** - Never trust client-side validation alone
2. **Use HTTPS** - Always use secure connections for form submissions
3. **Implement rate limiting** - Prevent spam and abuse
4. **Store sensitive data securely** - Encrypt sensitive information in submissions
5. **Regular backups** - Backup form submissions regularly
6. **Monitor submissions** - Set up alerts for new submissions
7. **GDPR compliance** - Add privacy policy acceptance and data retention policies
8. **Accessibility** - Ensure forms are accessible (labels, ARIA attributes)
9. **Error handling** - Provide clear error messages to users
10. **Testing** - Test forms thoroughly before deployment