# Data Model

**Feature**: Hindu Compliance Website UI Design - Phase 1 (Homepage + Auth)
**Date**: 2025-10-07
**Status**: Phase 1 Scope

## Overview

This document defines the data entities and content models for Phase 1 implementation focusing on Homepage and Authentication. Future phases will extend this model with compliance-specific entities.

---

## Phase 1 Entities

### 1. User Session (Authentication)

**Source**: Nandi SSO OAuth 2.0 service
**Storage**: httpOnly cookies + Next.js server-side session

```typescript
interface NandiSession {
  // From Nandi SSO /auth/get-session response
  user: {
    id: string                    // Unique user identifier from Nandi
    email: string                 // User email address
    name?: string                 // Full name (if provided)
    profile_image?: string        // Avatar URL (if provided)
  }
  access_token: string            // OAuth access token
  refresh_token: string           // OAuth refresh token
  expires_at: number              // Unix timestamp for token expiration
  client_id: string               // OAuth client ID
}

// Frontend-accessible session (no tokens exposed)
interface ClientSession {
  user: {
    id: string
    email: string
    name?: string
    profile_image?: string
  }
  isAuthenticated: boolean
  expiresAt: number
}
```

**Relationships**:
- Links to temple administrator profile (future phase)
- Tracks user's compliance submissions (future phase)

**Validation Rules**:
- `email` must be valid email format
- `expires_at` must be future timestamp
- `access_token` and `refresh_token` required for authenticated session

**State Transitions**:
```
Anonymous → [OAuth Login] → Authenticated
Authenticated → [Token Expires] → Token Refresh → Authenticated
Authenticated → [Logout] → Anonymous
```

---

### 2. Homepage Content (CMS-Managed)

**Source**: Payload CMS
**Collection**: `homepage`
**Fetch Strategy**: Server-side at build time (ISR with 1-hour revalidation)

```typescript
interface HomepageContent {
  // Meta
  id: string
  slug: 'homepage'                // Fixed slug for single homepage
  status: 'draft' | 'published'
  updated_at: string              // ISO timestamp

  // Hero Section
  hero: {
    title: string                 // Main headline (e.g., "Find a Better Business")
    subtitle: string              // Supporting text
    background_image: Media       // Hero background image
    search_placeholder: string    // Search input placeholder text
    cta_buttons?: Array<{
      label: string
      href: string
      variant: 'primary' | 'secondary'
    }>
  }

  // Secondary Section (informational)
  secondary_section: {
    title: string
    description: string
    features?: Array<{
      icon: Media
      title: string
      description: string
    }>
  }

  // Featured Content (3rd section)
  featured_content: {
    title: string
    items: Array<{
      id: string
      title: string
      excerpt: string
      image: Media
      link: string
      category?: string
    }>
  }

  // Fourth Section (split into two parts in design)
  fourth_section: {
    part1: {
      title: string
      description: string
      image?: Media
    }
    part2: {
      title: string
      description: string
      image?: Media
    }
  }

  // Business Services Section (5th)
  business_services: {
    title: string
    description: string
    services: Array<{
      icon: Media
      title: string
      description: string
      cta_label: string
      cta_link: string
    }>
  }

  // Testimonials Section (6th)
  testimonials: {
    title: string
    items: Array<{
      id: string
      content: string             // Testimonial text
      author_name: string
      author_title: string        // e.g., "Temple Administrator"
      author_temple: string       // Temple name
      author_image?: Media
      rating?: number             // 1-5 star rating
    }>
  }
}
```

**Payload CMS Collection Schema**:
```javascript
// Payload CMS collection definition
{
  slug: 'homepage',
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'subtitle', type: 'textarea', required: true },
        { name: 'background_image', type: 'upload', relationTo: 'media' },
        { name: 'search_placeholder', type: 'text', defaultValue: 'Find temples, category' }
      ]
    },
    // ... other sections
  ]
}
```

**Validation Rules**:
- `hero.title` required, max 100 characters
- `hero.subtitle` required, max 250 characters
- `featured_content.items` min 3, max 9 items
- `testimonials.items` min 3, max 12 items
- `testimonials.rating` if provided, must be 1-5

**Caching Strategy**:
- ISR revalidation: 3600 seconds (1 hour)
- Manual revalidation: Available via Payload CMS webhook
- Fallback: Show stale content if revalidation fails

---

### 3. Media Assets (CMS-Managed)

**Source**: Payload CMS media collection
**Storage**: Payload CMS file storage (configured backend)

```typescript
interface Media {
  id: string
  filename: string
  mimeType: string                // e.g., 'image/jpeg', 'image/png'
  filesize: number                // Bytes
  width?: number                  // For images
  height?: number                 // For images
  url: string                     // Full URL to access file
  thumbnailURL?: string           // Smaller version for previews
  alt?: string                    // Alt text for accessibility
  created_at: string
  updated_at: string
}
```

**Usage in Frontend**:
```tsx
// Next.js Image component with Payload CMS media
<Image
  src={media.url}
  alt={media.alt || 'Image'}
  width={media.width || 800}
  height={media.height || 600}
  priority={isAboveFold}
/>
```

**Validation Rules**:
- `mimeType` must be image format (jpeg, png, webp, svg)
- `filesize` max 10MB for images
- `alt` text required for accessibility (WCAG 2.1 AAA)

---

### 4. Navigation Menu (CMS-Managed)

**Source**: Payload CMS
**Collection**: `navigation`
**Fetch Strategy**: Server-side with caching

```typescript
interface NavigationMenu {
  id: string
  slug: 'main-menu' | 'footer-menu'

  items: Array<{
    id: string
    label: string                 // Menu item text
    href: string                  // Link destination
    icon?: Media                  // Optional icon
    order: number                 // Sort order
    parent_id?: string            // For nested menus
    requires_auth: boolean        // Show only when logged in
    mega_menu?: {                 // For complex dropdown menus
      enabled: boolean
      columns: Array<{
        title: string
        links: Array<{
          label: string
          href: string
          description?: string
        }>
      }>
    }
  }>
}
```

**Example Data**:
```javascript
{
  slug: 'main-menu',
  items: [
    {
      label: 'Home',
      href: '/',
      order: 1,
      requires_auth: false
    },
    {
      label: 'Resources for Businesses',
      href: '/resources',
      order: 2,
      requires_auth: false
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      order: 3,
      requires_auth: true  // Only show when logged in
    }
  ]
}
```

**Rendering Logic**:
```typescript
// Filter menu items based on auth status
const visibleMenuItems = menuItems.filter(item =>
  !item.requires_auth || session?.isAuthenticated
)
```

---

### 5. Site Settings (CMS-Managed)

**Source**: Payload CMS globals
**Collection**: `site_settings` (global singleton)

```typescript
interface SiteSettings {
  // Branding
  site_name: string               // e.g., "Hindu Compliance Bureau"
  logo: Media                     // Main logo
  logo_alt: Media                 // Alternate logo (for dark backgrounds)
  favicon: Media

  // Contact Information
  contact: {
    email: string
    phone?: string
    address?: string
  }

  // Social Media
  social_media: {
    facebook?: string
    twitter?: string
    linkedin?: string
    instagram?: string
  }

  // Footer Content
  footer: {
    copyright_text: string
    legal_links: Array<{
      label: string
      href: string
    }>
    description?: string          // Short description for footer
  }

  // Authentication Settings
  auth: {
    nandi_sso_enabled: boolean
    login_required_message: string
    redirect_after_login: string  // Default: '/dashboard'
  }

  // SEO Defaults
  seo: {
    default_title: string
    default_description: string
    default_og_image: Media
  }
}
```

**Usage**:
```typescript
// Access site settings in components
import { getSiteSettings } from '@/lib/cms/site-settings'

const settings = await getSiteSettings()
console.log(settings.site_name) // "Hindu Compliance Bureau"
```

---

## Phase 1 Data Flow

### Homepage Data Loading

```typescript
// app/(public)/page.tsx - Server Component
export async function generateMetadata() {
  const settings = await getSiteSettings()
  return {
    title: settings.seo.default_title,
    description: settings.seo.default_description
  }
}

export default async function HomePage() {
  // Fetch from Payload CMS at build time
  const content = await getHomepageContent()
  const navigation = await getNavigationMenu('main-menu')

  return (
    <>
      <Header navigation={navigation} />
      <HeroSection data={content.hero} />
      <SecondarySection data={content.secondary_section} />
      <FeaturedContent data={content.featured_content} />
      {/* ... other sections */}
      <Footer />
    </>
  )
}
```

### Authentication Flow Data

```typescript
// 1. User clicks "Sign In"
// app/api/auth/signin/route.ts
export async function GET() {
  const authUrl = new URL('https://auth.kailasa.ai/auth/sign-in')
  authUrl.searchParams.set('client_id', process.env.NANDI_SSO_CLIENT_ID!)
  authUrl.searchParams.set('redirect_uri', process.env.NANDI_SSO_REDIRECT_URI!)

  return NextResponse.redirect(authUrl)
}

// 2. Nandi SSO redirects back with code
// app/api/auth/callback/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  // Exchange code for tokens
  const tokenResponse = await fetch('https://auth.kailasa.ai/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code!,
      client_id: process.env.NANDI_SSO_CLIENT_ID!,
      client_secret: process.env.NANDI_SSO_CLIENT_SECRET!,
      redirect_uri: process.env.NANDI_SSO_REDIRECT_URI!
    })
  })

  const tokens = await tokenResponse.json()

  // Get user info
  const sessionResponse = await fetch('https://auth.kailasa.ai/auth/get-session', {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  })

  const sessionData = await sessionResponse.json()

  // Set httpOnly cookies
  const response = NextResponse.redirect(new URL('/dashboard', request.url))
  response.cookies.set('nandi_session', tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokens.expires_in
  })

  return response
}

// 3. Access session in components
// app/(dashboard)/layout.tsx
import { getServerSession } from '@/lib/auth/session'

export default async function DashboardLayout({ children }) {
  const session = await getServerSession()

  if (!session) {
    redirect('/signin')
  }

  return (
    <div>
      <DashboardNav user={session.user} />
      {children}
    </div>
  )
}
```

---

## TypeScript Type Definitions

**Location**: `src/types/cms.ts`

```typescript
// Export all CMS types for use throughout application
export type {
  HomepageContent,
  Media,
  NavigationMenu,
  SiteSettings,
  NandiSession,
  ClientSession
}

// Helper types
export type MediaWithAlt = Media & Required<Pick<Media, 'alt'>>
export type AuthenticatedSession = Required<ClientSession>
```

---

## API Contracts Reference

For detailed API contracts, see:
- **Nandi SSO**: [contracts/nandi-sso.yaml](./contracts/nandi-sso.yaml)
- **Payload CMS**: [contracts/payload-cms.yaml](./contracts/payload-cms.yaml)

---

## Future Phase Entities (Not in Phase 1)

These entities will be defined in future specifications:

- **Temple Profile**: Full temple information, compliance history
- **Compliance Submission**: Form submissions, documents, status tracking
- **Compliance Requirement**: Regulatory requirements, deadlines
- **Notification**: User alerts and notifications
- **Payment Transaction**: Payment processing (if applicable)
- **Audit Log**: User activity tracking

---

## Data Model Summary

| Entity | Source | Phase 1 Scope | Storage |
|--------|--------|---------------|---------|
| User Session | Nandi SSO | ✅ Full | httpOnly cookies |
| Homepage Content | Payload CMS | ✅ Full | ISR cache |
| Media Assets | Payload CMS | ✅ Full | CMS storage |
| Navigation Menu | Payload CMS | ✅ Full | ISR cache |
| Site Settings | Payload CMS | ✅ Full | ISR cache |
| Temple Profile | Payload CMS | ❌ Future | N/A |
| Compliance Submission | Backend API | ❌ Future | N/A |
| Notification | Backend API | ❌ Future | N/A |

---

**Data Model Status**: ✅ COMPLETE for Phase 1
**Last Updated**: 2025-10-07
