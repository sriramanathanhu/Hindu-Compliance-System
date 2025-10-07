# Business Listing Schema - Data Structure & Planning

## Overview
This document outlines the complete data structure for your business listing platform with BBB-style features including business profiles, reviews, complaints, and quote requests.

---

## Core Collections

### 1. **Businesses Collection** (Main Profile)
The central collection that stores all business information displayed on the "MAIN" tab.

#### Key Sections:
- **Basic Info**: Name, slug, category, description, logo
- **Accreditation**: BBB accreditation status, rating (A+ to F), accreditation date
- **Business Details**: Years in business, incorporation date, entity type, local BBB
- **Location**: Full address, service area description
- **Contact Information**: 
  - Primary phone & email
  - Additional phones (array) - for multiple contact numbers
  - Additional emails (array) - separated by type (sales, technical, customer service)
  - Primary website + additional websites (array)
- **Management**: 
  - Business managers (array) - name + title
  - Principal contacts (array)
  - Customer contacts (array)
- **Social Media**: Facebook, Instagram, Twitter, LinkedIn, YouTube, TikTok
- **Licensing**: 
  - Requires licensing checkbox
  - Licensing note/description
  - License numbers (array) - type, number, authority, expiration
  - Licensing resources (array) - external organizations like CSLB
- **Payment Methods**: Accepted payment methods description
- **Categories**: Multiple categories/tags (relationship to categories collection)
- **Services**: Array of services offered with descriptions
- **Statistics** (Auto-calculated):
  - Average rating (from reviews)
  - Total review count
  - Total complaint count
  - Profile view count
- **Status**: Draft, Published, Under Review, Suspended, Archived
- **Ownership**: Relationship to user who manages the business

---

### 2. **Reviews Collection** (Reviews Tab)
Customer reviews following your screenshot specifications.

#### Structure:
- **Business**: Relationship to businesses collection
- **User**: Who submitted the review (must be logged in)
- **Rating**: 1-5 stars (required)
- **Review Text**: 10-2000 characters (required)
- **Review Images**: Optional array of up to 5 images
- **Terms Accepted**: Checkbox for Customer Review Submission Terms
- **Status**: Pending → Approved/Rejected/Flagged
- **Moderation**: 
  - Moderation notes (internal)
  - Reviewed by (admin user)
  - Reviewed date
- **Engagement**:
  - Helpful count (how many found it useful)
  - Reported count (flagged reviews)

#### Business Rules:
- User must be logged in to submit
- Min 10 words requirement
- Max 2000 characters
- Must accept terms before submission
- Status defaults to "Pending"
- Only "Approved" reviews show publicly
- User can see their own reviews regardless of status
- Reviews update business average rating when approved

---

### 3. **Complaints Collection** (Complaints Tab)
Customer complaints with BBB-style screening questions.

#### Two-Step Screening Process:

**Step 1 - Preliminary Questions** (Must answer "No" to ALL):
- Is this buyer's remorse?
- Is this solely about price comparison?
- Are you only seeking an apology?
- Filing for BBB information only?
- Is this about discrimination/civil rights?

**Step 2 - Additional Screening** (Yes/No questions):
- Employee/employer complaint?
- Seeks criminal penalty?
- Filed in court?
- Business collecting from another business?

#### Complaint Details:
- **Business**: Relationship to business
- **Submitted By**: User who filed (must be logged in)
- **Complaint Type**: Quality, Billing, Customer Service, Contract, Delivery, Advertising, Warranty, Other
- **Summary**: Brief description (max 200 chars)
- **Details**: Full description (min 50 chars)
- **Transaction Details**:
  - Transaction date
  - Amount paid
  - Invoice/order number
  - Product or service name
- **Desired Resolution**:
  - Type: Full refund, partial refund, replacement, repair, apology, other
  - Amount requested (if refund)
  - Resolution details
- **Supporting Documents**: Array of up to 10 attachments
- **Contact Attempts**:
  - Have you contacted the business?
  - Contact method (phone, email, in-person, mail)
  - Date of last contact
  - Business response (if any)
- **Status**: Submitted → Under Review → Forwarded → Business Responded → Resolved/Closed/Rejected
- **Priority**: Low, Medium, High, Urgent
- **Assigned To**: Staff member handling complaint
- **Business Response**:
  - Response date
  - Response text
  - Offer made (yes/no)
  - Offer details
- **Final Resolution**:
  - Resolution date
  - Resolution summary
  - Customer satisfied (yes/no)
- **Internal Notes**: Array of staff notes (not visible to public)
- **Public Visibility**: Show complaint count on business profile

#### Access Control:
- Anyone can view complaint COUNT on business profile
- Only admins and complaint submitter can view full details
- Only admins can update complaint status
- Complaints update business complaint count

---

### 4. **Quote Requests** (Get A Quote Tab)
Using Payload's Form Builder plugin for dynamic quote request forms.

#### Recommended Implementation:
Create a "Quote Request" form in the Form Builder with fields like:
- Name (text)
- Email (email)
- Phone (text)
- Service Interested In (select)
- Project Description (textarea)
- Preferred Contact Method (select: Phone, Email)
- Timeline (select: Urgent, Within 1 week, Within 1 month, Just browsing)
- Budget Range (select)

#### How It Works:
1. Each business can have a quote request form associated with it
2. Use Form Builder to create the form once
3. Embed the form on business profile pages
4. Submissions go to "Form Submissions" collection
5. Business owner receives email notification
6. Admin can view all quote requests in dashboard

---

## Data Relationships

```
Users
  ├── owns → Businesses (1:many)
  ├── writes → Reviews (1:many)
  ├── files → Complaints (1:many)
  └── submits → Quote Requests (1:many)

Businesses
  ├── has → Reviews (1:many)
  ├── has → Complaints (1:many)
  ├── has → Quote Requests (1:many)
  ├── belongs to → Categories (many:many)
  └── owned by → User (1:1)

Reviews
  ├── for → Business (1:1)
  ├── by → User (1:1)
  └── affects → Business.averageRating

Complaints
  ├── against → Business (1:1)
  ├── by → User (1:1)
  └── affects → Business.complaintCount

Categories
  └── has → Businesses (many:many)
```

---

## Frontend URL Structure

```
/businesses
  └── Search/browse all businesses

/businesses/[category]/[slug]
  ├── /businesses/roofing-contractors/fg-roofing-inc
  │   ├── ?tab=main (default)
  │   ├── ?tab=quote
  │   ├── ?tab=reviews
  │   └── ?tab=complaints

/reviews/submit/[businessId]
  └── Submit review form

/complaints/file/[businessId]
  └── File complaint form
```

---

## API Endpoints (Auto-generated by Payload)

### REST API:
```
GET    /api/businesses
GET    /api/businesses/:id
GET    /api/businesses?where[primaryCategory][equals]=Roofing Contractors
POST   /api/businesses (admin only)
PATCH  /api/businesses/:id (admin only)
DELETE /api/businesses/:id (admin only)

GET    /api/reviews
GET    /api/reviews?where[business][equals]=[businessId]
GET    /api/reviews?where[status][equals]=approved
POST   /api/reviews (authenticated users)
PATCH  /api/reviews/:id (user or admin)
DELETE /api/reviews/:id (admin only)

GET    /api/complaints (admin + submitter only)
GET    /api/complaints?where[business][equals]=[businessId]
POST   /api/complaints (authenticated users)
PATCH  /api/complaints/:id (admin only)
DELETE /api/complaints/:id (admin only)

GET    /api/forms
GET    /api/form-submissions
POST   /api/form-submissions (public)
```

### GraphQL API:
```graphql
# Get business with reviews and complaint count
query GetBusinessProfile($slug: String!) {
  Businesses(where: { slug: { equals: $slug } }) {
    docs {
      id
      name
      primaryCategory
      aboutBusiness
      logo {
        url
        alt
      }
      accreditation {
        accredited
        rating
        accreditedSince
      }
      address {
        city
        state
        zipCode
      }
      contactInfo {
        primaryPhone
        primaryEmail
        website
      }
      statistics {
        averageRating
        totalReviews
        totalComplaints
      }
    }
  }
}

# Get approved reviews for a business
query GetBusinessReviews($businessId: String!) {
  Reviews(
    where: { 
      business: { equals: $businessId }
      status: { equals: "approved" }
    }
    sort: "-createdAt"
    limit: 10
  ) {
    docs {
      rating
      reviewText
      user {
        firstName
        lastName
      }
      createdAt
      helpfulCount
    }
  }
}

# Submit a review
mutation SubmitReview($data: mutationReviewInput!) {
  createReview(data: $data) {
    id
    status
  }
}

# File a complaint
mutation FileComplaint($data: mutationComplaintInput!) {
  createComplaint(data: $data) {
    id
    status
  }
}
```

---

## Auto-Calculations & Hooks

### Business Average Rating Calculation:
```typescript
// Triggered when review status changes to "approved"
const updateBusinessRating = async (businessId) => {
  const reviews = await payload.find({
    collection: 'reviews',
    where: {
      business: { equals: businessId },
      status: { equals: 'approved' }
    }
  })
  
  const averageRating = reviews.docs.reduce((sum, review) => 
    sum + review.rating, 0) / reviews.docs.length
  
  await payload.update({
    collection: 'businesses',
    id: businessId,
    data: {
      'statistics.averageRating': averageRating,
      'statistics.totalReviews': reviews.totalDocs
    }
  })
}
```

### Business Complaint Count Update:
```typescript
// Triggered when complaint is created or status changes
const updateComplaintCount = async (businessId) => {
  const complaints = await payload.find({
    collection: 'complaints',
    where: {
      business: { equals: businessId },
      visibleToPublic: { equals: true }
    }
  })
  
  await payload.update({
    collection: 'businesses',
    id: businessId,
    data: {
      'statistics.totalComplaints': complaints.totalDocs
    }
  })
}
```

---

## User Roles & Permissions

### Public (Not Logged In):
- ✅ View published businesses
- ✅ View approved reviews
- ✅ See complaint count
- ❌ Submit reviews
- ❌ File complaints
- ❌ View complaint details

### Authenticated User:
- ✅ Everything public can do
- ✅ Submit reviews
- ✅ File complaints
- ✅ Submit quote requests
- ✅ View their own reviews (any status)
- ✅ View their own complaints

### Business Owner:
- ✅ Everything user can do
- ✅ View/edit their business profile
- ✅ View all reviews for their business
- ✅ View complaints against their business
- ✅ Respond to complaints
- ✅ View quote requests for their business
- ❌ Delete reviews/complaints

### Editor Role:
- ✅ Create/edit business listings
- ✅ Moderate reviews (approve/reject)
- ✅ View and manage complaints
- ✅ Create blog posts
- ❌ Delete businesses
- ❌ Manage users

### Admin:
- ✅ Full access to everything
- ✅ Create/edit/delete all collections
- ✅ Manage users and roles
- ✅ Moderate reviews and complaints
- ✅ View analytics
- ✅ Configure forms and settings

---

## Search & Filtering Strategy

### Business Search Capabilities:

**By Category:**
```javascript
// Search by primary category
GET /api/businesses?where[primaryCategory][equals]=Roofing Contractors

// Search by multiple categories
GET /api/businesses?where[categories][in]=[categoryId1,categoryId2]
```

**By Location:**
```javascript
// Search by city
GET /api/businesses?where[address.city][equals]=California City

// Search by state
GET /api/businesses?where[address.state][equals]=CA

// Search by zip code
GET /api/businesses?where[address.zipCode][equals]=93505
```

**By Rating:**
```javascript
// Businesses with 4+ stars
GET /api/businesses?where[statistics.averageRating][greater_than_equal]=4

// Accredited businesses only
GET /api/businesses?where[accreditation.accredited][equals]=true

// By BBB rating
GET /api/businesses?where[accreditation.rating][equals]=A+
```

**By Status:**
```javascript
// Published businesses only
GET /api/businesses?where[status][equals]=published

// Featured businesses
GET /api/businesses?where[featured][equals]=true

// Verified businesses
GET /api/businesses?where[verified][equals]=true
```

**Full-Text Search:**
```javascript
// Search by name or description
GET /api/businesses?where[or][0][name][contains]=roofing
&where[or][1][aboutBusiness][contains]=roofing
```

**Combined Filters:**
```javascript
// Featured roofing contractors in California with 4+ stars
GET /api/businesses?where[and][0][primaryCategory][equals]=Roofing Contractors
&where[and][1][address.state][equals]=CA
&where[and][2][statistics.averageRating][greater_than_equal]=4
&where[and][3][featured][equals]=true
&where[and][4][status][equals]=published
```

---

## Frontend Components Structure

### Business Profile Page Component Hierarchy:

```
BusinessProfilePage
├── BusinessHeader
│   ├── BusinessLogo
│   ├── BusinessName
│   ├── AccreditationBadge (BBB Accredited + Rating)
│   ├── CategoryTag
│   └── ActionButtons (Share, Visit Website, Call, Write Review)
│
├── TabNavigation (MAIN, GET A QUOTE, REVIEWS, COMPLAINTS)
│
├── TabContent
│   │
│   ├── MainTab (default)
│   │   ├── OverviewSection
│   │   │   ├── BusinessName
│   │   │   ├── Address
│   │   │   ├── ViewServiceArea
│   │   │   └── BBBAccreditationInfo
│   │   │
│   │   ├── AboutSection
│   │   │   ├── AboutDescription
│   │   │   ├── AccreditedSince
│   │   │   └── YearsInBusiness
│   │   │
│   │   └── BusinessDetailsSection
│   │       ├── LocalBBB
│   │       ├── BBBFileOpened
│   │       ├── BusinessStarted
│   │       ├── BusinessIncorporated
│   │       ├── TypeOfEntity
│   │       ├── BusinessManagement (array)
│   │       ├── AdditionalContactInfo
│   │       │   ├── PrincipalContacts
│   │       │   ├── CustomerContacts
│   │       │   ├── AdditionalPhones
│   │       │   ├── AdditionalEmails
│   │       │   └── AdditionalWebsites
│   │       ├── SocialMedia
│   │       ├── LicensingInformation
│   │       │   ├── LicensingNote
│   │       │   └── OtherResources (CSLB, etc.)
│   │       ├── AdditionalInformation
│   │       │   └── PaymentMethods
│   │       └── BusinessCategories
│   │
│   ├── GetQuoteTab
│   │   └── DynamicForm (from Form Builder)
│   │       ├── FormIntro (optional)
│   │       └── FormFields (rendered dynamically)
│   │
│   ├── ReviewsTab
│   │   ├── ReviewsSummary
│   │   │   ├── AverageRating (stars)
│   │   │   ├── TotalReviews
│   │   │   └── RatingDistribution (5★, 4★, 3★, 2★, 1★)
│   │   │
│   │   ├── WriteReviewButton
│   │   │
│   │   └── ReviewsList
│   │       └── ReviewCard (each review)
│   │           ├── UserAvatar
│   │           ├── UserName
│   │           ├── Rating (stars)
│   │           ├── ReviewDate
│   │           ├── ReviewText
│   │           ├── ReviewImages (if any)
│   │           └── HelpfulButton (X people found this helpful)
│   │
│   └── ComplaintsTab
│       ├── ComplaintCount ("This business has X complaints")
│       ├── SubmitComplaintButton
│       └── ComplaintsList (if user has permission)
│           └── ComplaintCard
│               ├── ComplaintType
│               ├── ComplaintDate
│               ├── Status
│               └── Summary

```

### Review Submission Form:

```
LeaveReviewForm
├── FormHeader ("Leave a Review")
├── RatingInput
│   ├── Label ("Overall experience")
│   └── StarRating (1-5 clickable stars)
│
├── ReviewTextInput
│   ├── Label ("Leave some details to help others")
│   ├── CharacterCount ("10 words minimum", "2000 characters remaining")
│   └── Textarea
│
├── ImageUpload (optional)
│   └── ImagePreview (up to 5 images)
│
├── TermsCheckbox
│   └── "I have read and agree to the Customer Review Submission Terms"
│
└── SubmitButton ("Next")
```

### Complaint Filing Form:

```
FileComplaintForm
├── FormHeader ("File a Complaint against [Business Name]")
│
├── Step1: PreliminaryScreening
│   ├── ScreeningQuestions
│   │   ├── Q1: Buyer's remorse?
│   │   ├── Q2: Price comparison only?
│   │   ├── Q3: Seeking apology only?
│   │   ├── Q4: BBB information only?
│   │   └── Q5: Discrimination/civil rights?
│   └── RadioGroup ("Yes to ANY" or "No to ALL")
│
├── Step2: AdditionalScreening
│   ├── Q1: Employee/employer complaint? (Yes/No)
│   ├── Q2: Seeks criminal penalty? (Yes/No)
│   ├── Q3: Filed in court? (Yes/No)
│   └── Q4: Business collecting from business? (Yes/No)
│
├── Step3: ComplaintDetails
│   ├── ComplaintType (dropdown)
│   ├── ComplaintSummary (text, max 200 chars)
│   └── ComplaintDetails (textarea, min 50 chars)
│
├── Step4: TransactionDetails
│   ├── TransactionDate (date picker)
│   ├── AmountPaid (number)
│   ├── InvoiceNumber (text)
│   └── ProductOrService (text)
│
├── Step5: DesiredResolution
│   ├── ResolutionType (dropdown)
│   ├── RequestedAmount (if refund selected)
│   └── ResolutionDetails (textarea)
│
├── Step6: SupportingDocuments
│   └── FileUpload (up to 10 documents)
│       └── FileDescription (for each)
│
├── Step7: ContactAttempts
│   ├── AttemptedContact (checkbox)
│   ├── ContactMethod (conditional)
│   ├── ContactDate (conditional)
│   └── BusinessResponse (conditional)
│
└── SubmitButton
```

---

## Email Notifications

### Review Submitted:
**To: Business Owner**
```
Subject: New Review for [Business Name]

A customer has left a review for your business:
Rating: ⭐⭐⭐⭐⭐
Review: [excerpt...]

View full review in your dashboard: [link]
```

**To: Admin (for moderation)**
```
Subject: New Review Pending Approval

Business: [Business Name]
Rating: [X] stars
Status: Pending Review

Moderate this review: [link to admin panel]
```

### Complaint Filed:
**To: Business Owner**
```
Subject: Complaint Filed Against [Business Name]

A customer has filed a complaint:
Type: [Complaint Type]
Summary: [Brief summary]
Status: Under Review

You will have an opportunity to respond once the complaint is reviewed.
View details: [link]
```

**To: Customer**
```
Subject: Your Complaint Has Been Received

Thank you for filing a complaint against [Business Name].

Reference Number: [ID]
Status: Under Review

We will review your complaint and notify you of next steps within 2-3 business days.

View complaint status: [link]
```

**To: Admin**
```
Subject: New Complaint Requires Review

Business: [Business Name]
Complaint Type: [Type]
Priority: [Priority Level]

Review complaint: [link to admin panel]
```

### Quote Request:
**To: Business Owner**
```
Subject: New Quote Request for [Business Name]

You have received a new quote request:

From: [Name]
Email: [Email]
Phone: [Phone]
Service: [Service]
Details: [Description]

Submitted: [Date/Time]

Respond to this request: [link]
```

---

## Dashboard Views

### Admin Dashboard:
```
Dashboard Overview
├── Statistics Cards
│   ├── Total Businesses
│   ├── Pending Reviews
│   ├── Active Complaints
│   └── Quote Requests Today
│
├── Recent Activity
│   ├── Latest Reviews (pending approval)
│   ├── New Complaints (requiring attention)
│   └── New Businesses (pending verification)
│
└── Quick Actions
    ├── Moderate Reviews
    ├── Manage Complaints
    ├── Approve Businesses
    └── View Analytics
```

### Business Owner Dashboard:
```
Business Dashboard
├── My Business Profile
│   ├── Edit Profile
│   ├── View Public Profile
│   └── Statistics
│       ├── Profile Views
│       ├── Average Rating
│       ├── Total Reviews
│       └── Quote Requests
│
├── Reviews
│   ├── Recent Reviews
│   ├── Average Rating Trend
│   └── Respond to Reviews
│
├── Complaints
│   ├── Active Complaints
│   ├── Response Required
│   └── Resolved Complaints
│
└── Quote Requests
    ├── New Requests
    ├── In Progress
    └── Completed
```

---

## SEO & Meta Data

### Business Profile SEO:
```typescript
// Dynamically generated meta tags
<head>
  <title>[Business Name] - [Primary Category] in [City, State]</title>
  <meta name="description" content="[About Business excerpt]. BBB Accredited with [Rating] rating. [Years in Business] years serving [Service Area]." />
  
  {/* Open Graph */}
  <meta property="og:title" content="[Business Name]" />
  <meta property="og:description" content="[About Business]" />
  <meta property="og:image" content="[Logo URL]" />
  <meta property="og:type" content="business.business" />
  
  {/* Structured Data - LocalBusiness Schema */}
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "[Business Name]",
    "image": "[Logo URL]",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "[Street]",
      "addressLocality": "[City]",
      "addressRegion": "[State]",
      "postalCode": "[Zip]",
      "addressCountry": "US"
    },
    "telephone": "[Phone]",
    "url": "[Website]",
    "priceRange": "[Price Range]",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "[Average Rating]",
      "reviewCount": "[Total Reviews]"
    }
  }
  </script>
</head>
```

---

## Performance Optimization

### Caching Strategy:
```typescript
// Cache business listings for 5 minutes
const businesses = await fetchWithCache('/api/businesses', {
  cacheTime: 300 // 5 minutes
})

// Cache individual business profiles for 10 minutes
const business = await fetchWithCache(`/api/businesses/${slug}`, {
  cacheTime: 600 // 10 minutes
})

// Don't cache user-specific data (reviews/complaints)
const userReviews = await fetch('/api/reviews', {
  headers: { Authorization: `Bearer ${token}` }
}) // No cache
```

### Pagination:
```typescript
// Limit results for performance
const businesses = await payload.find({
  collection: 'businesses',
  limit: 20, // Show 20 per page
  page: currentPage,
  sort: '-statistics.averageRating' // Sort by rating
})

// Infinite scroll for reviews
const reviews = await payload.find({
  collection: 'reviews',
  where: { business: { equals: businessId } },
  limit: 10,
  page: currentPage
})
```

### Image Optimization:
```typescript
// Payload automatically generates multiple sizes
// Use appropriate size for context
<img 
  src={business.logo.sizes.thumbnail.url} // For listings
  alt={business.logo.alt}
/>

<img 
  src={business.logo.sizes.card.url} // For profile header
  alt={business.logo.alt}
/>
```

---

## Analytics & Tracking

### Metrics to Track:
1. **Business Metrics:**
   - Profile views
   - Quote request conversion rate
   - Average rating over time
   - Review velocity (reviews per month)
   - Complaint resolution rate

2. **User Engagement:**
   - Search queries
   - Most viewed businesses
   - Review submission rate
   - Complaint filing rate

3. **Platform Metrics:**
   - Total businesses
   - Active vs inactive businesses
   - Average reviews per business
   - Complaint response time

### Implementation:
```typescript
// Track profile views
hooks: {
  afterRead: [
    async ({ doc, req }) => {
      if (!req.user || req.user.role !== 'admin') {
        // Increment view count for public views
        await payload.update({
          collection: 'businesses',
          id: doc.id,
          data: {
            'statistics.viewCount': (doc.statistics.viewCount || 0) + 1
          }
        })
      }
    }
  ]
}
```

---

## Summary of Key Collections

| Collection | Purpose | Public Access | Authenticated Access |
|------------|---------|---------------|---------------------|
| **Businesses** | Main business profiles | View published | Create/Edit (if owner/admin) |
| **Reviews** | Customer reviews | View approved | Submit, View own |
| **Complaints** | Customer complaints | View count only | File, View own |
| **Quote Requests** | Quote request forms | Submit form | View own submissions |
| **Users** | User accounts | N/A | Profile management |
| **Categories** | Business categories | View all | N/A |
| **Media** | File uploads | View public | Upload (authenticated) |
| **Form Submissions** | Quote form data | N/A | View own (business owner sees theirs) |

---

## Next Steps for Implementation

1. **Setup Payload CMS**
   - Install Payload with PostgreSQL adapter
   - Configure the schema using the provided code
   - Set up database connection

2. **Configure Form Builder**
   - Install form builder plugin
   - Create "Quote Request" form template
   - Configure email notifications

3. **Build Frontend**
   - Create business listing page with search/filters
   - Build business profile page with 4 tabs
   - Implement review submission form
   - Implement complaint filing form
   - Add quote request form integration

4. **Implement SSO**
   - Set up custom SSO routes
   - Configure user creation/matching
   - Handle JWT token generation
   - Test authentication flow

5. **Testing**
   - Test all CRUD operations
   - Test access control permissions
   - Test email notifications
   - Test form submissions
   - Test rating calculations

6. **Launch**
   - Deploy to production
   - Set up monitoring
   - Configure backups
   - Train administrators

This comprehensive data structure plan should give you everything you need to build your business listing platform with Payload CMS!