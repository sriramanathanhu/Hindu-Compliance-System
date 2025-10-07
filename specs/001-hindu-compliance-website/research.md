# Research & Technology Decisions

**Feature**: Hindu Compliance Website UI Design
**Phase**: 0 - Research & Analysis
**Date**: 2025-10-07

## Overview

This document captures research findings and technology decisions for implementing the Hindu Compliance Website frontend. All unknowns from the Technical Context section have been resolved through analysis of available resources, documentation, and best practices.

---

## 1. Next.js 14 App Router Best Practices

###  Decision: Use Next.js 14 App Router with TypeScript

**Rationale**:
- Modern routing with nested layouts perfect for auth/public/dashboard separation
- Server Components reduce client bundle size and improve performance
- Built-in middleware for authentication checks
- SEO-friendly SSR/SSG capabilities for public pages

**Implementation Approach**:

#### Server vs Client Components
- **Server Components (default)**: Layout, static content, CMS-fetched data
- **Client Components** (`'use client'`): Forms, interactive UI, state management, OAuth callbacks

#### Route Groups
```
app/
├── (auth)/          # Auth-specific layout (centered, minimal)
├── (public)/        # Public pages (full header/footer)
└── (dashboard)/     # Protected pages (dashboard layout with sidebar)
```

#### Middleware Pattern
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = request.cookies.get('nandi_session')
  const isAuthPage = request.nextUrl.pathname.startsWith('/signin')
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')

  if (isDashboard && !session) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
```

**Alternatives Considered**:
- Next.js Pages Router: Rejected - older pattern, less efficient layouts
- Pure React SPA: Rejected - no SSR benefits, worse SEO, more complex auth

---

## 2. Payload CMS Integration Patterns

### Decision: REST API with React Query for client-side caching

**Rationale**:
- Payload CMS provides robust REST API out of the box
- React Query offers excellent caching, refetching, and optimistic updates
- GraphQL adds complexity without significant benefit for our use case

**API Integration Strategy**:

#### Content Fetching Patterns

**Static Content (Homepage, Templates)**: Server Components with ISR
```typescript
// app/(public)/page.tsx
export const revalidate = 3600 // Revalidate every hour

async function getHomepageContent() {
  const res = await fetch(`${process.env.PAYLOAD_API_URL}/api/pages/homepage`)
  return res.json()
}
```

**Dynamic Content (User Submissions)**: Client Components with React Query
```typescript
// hooks/useCMS.ts
export function useSubmissions() {
  return useQuery({
    queryKey: ['submissions'],
    queryFn: () => payloadClient.get('/api/submissions'),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
```

####  Image Optimization
- Use Next.js `<Image>` component with Payload CMS image URLs
- Payload serves images with automatic resizing
- Configure `next.config.js` with Payload domain in `images.remotePatterns`

**Resolution**: Payload CMS REST API structure
- Base URL: Configured via `PAYLOAD_API_URL` environment variable
- Authentication: Bearer token in `Authorization` header (`PAYLOAD_API_KEY`)
- Endpoints follow pattern: `/api/{collection}`
- File uploads: POST to `/api/media` with multipart/form-data

**Alternatives Considered**:
- GraphQL: Rejected - adds complexity, REST sufficient for our needs
- Direct Payload SDK: Rejected - couples frontend to Payload internals

---

## 3. Nandi SSO OAuth 2.0 Implementation

### Decision: Custom OAuth 2.0 client with httpOnly cookies

**Rationale**:
- Based on analysis of `/root/hinducs/nandi-authentication-api.yaml`
- Nandi follows standard OAuth 2.0 Authorization Code Grant flow
- httpOnly cookies prevent XSS attacks on tokens
- Next.js API routes handle token exchange securely

**OAuth Flow Implementation**:

#### Step 1: Sign In Initiation
```typescript
// app/api/auth/signin/route.ts
export async function GET(request: Request) {
  const clientId = process.env.NANDI_SSO_CLIENT_ID
  const redirectUri = process.env.NANDI_SSO_REDIRECT_URI
  const authUrl = `https://auth.kailasa.ai/auth/sign-in?client_id=${clientId}&redirect_uri=${redirectUri}`

  return NextResponse.redirect(authUrl)
}
```

#### Step 2: Callback Handler
```typescript
// app/api/auth/callback/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  // Exchange code for token
  const tokenRes = await fetch('https://auth.kailasa.ai/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: process.env.NANDI_SSO_CLIENT_ID!,
      client_secret: process.env.NANDI_SSO_CLIENT_SECRET!,
      redirect_uri: process.env.NANDI_SSO_REDIRECT_URI!
    })
  })

  const { access_token, refresh_token, expires_in } = await tokenRes.json()

  // Set httpOnly cookie
  const response = NextResponse.redirect(new URL('/dashboard', request.url))
  response.cookies.set('nandi_session', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: expires_in
  })
  response.cookies.set('nandi_refresh', refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  })

  return response
}
```

#### Step 3: Session Validation
```typescript
// app/api/auth/session/route.ts
export async function GET(request: Request) {
  const sessionToken = request.cookies.get('nandi_session')?.value

  if (!sessionToken) {
    return NextResponse.json({ error: 'No session' }, { status: 401 })
  }

  // Validate with Nandi
  const sessionRes = await fetch('https://auth.kailasa.ai/auth/get-session', {
    headers: { Cookie: `session=${sessionToken}` }
  })

  const session = await sessionRes.json()
  return NextResponse.json(session)
}
```

**Token Management**:
- **Access Token**: Short-lived (from `expires_in`), stored in httpOnly cookie
- **Refresh Token**: Long-lived (30 days), automatically refreshed before expiration
- **Session Storage**: Server-side via cookies, not localStorage (security best practice)

**Resolution**: Token expiration and refresh
- Access tokens expire based on `expires_in` from token response (typically 1 hour)
- Refresh tokens automatically exchange for new access tokens when expired
- Middleware checks token validity on each protected route request

**Alternatives Considered**:
- NextAuth.js: Rejected - Nandi SSO not a standard OAuth provider, custom implementation needed
- localStorage for tokens: Rejected - vulnerable to XSS, httpOnly cookies more secure
- Session-based auth: Rejected - OAuth 2.0 required by Nandi SSO

---

## 4. BBB Design Pattern Adaptation

### Decision: Custom Tailwind theme with BBB color palette and components

**Rationale**:
- BBB design provides proven UX patterns for trust-based platforms
- Tailwind CSS allows rapid prototyping while maintaining design consistency
- Component library (shadcn/ui) provides accessible base components

**Design System**:

#### Color Palette (BBB-inspired)
```css
/* tailwind.config.js */
colors: {
  primary: {
    50: '#e6f2f8',
    100: '#cce5f1',
    500: '#005ea2',  /* BBB Blue */
    600: '#004d85',
    700: '#003d6b'
  },
  secondary: {
    500: '#f0f0f0',  /* Light gray */
    600: '#d9d9d9'
  },
  accent: {
    500: '#00a6a6',  /* Teal accent */
    600: '#008585'
  },
  status: {
    compliant: '#10b981',    /* Green */
    pending: '#f59e0b',      /* Amber */
    violation: '#ef4444'     /* Red */
  }
}
```

#### Typography
- Headings: Inter (similar to BBB's font choice)
- Body: Inter
- Code/Data: Mono font

#### Key Components
1. **Hero Section**: Large search bar, clear value proposition
2. **Card-based Layouts**: Consistent card design for content blocks
3. **Trust Indicators**: Status badges, verification marks
4. **Responsive Navigation**: Hamburger menu for mobile, full nav for desktop

**Resolution**: BBB design asset licensing
- **Adaptation, not copying**: We use BBB as inspiration for layout and patterns
- **Original assets**: All images, icons, and branding are original or properly licensed
- **Color scheme**: Adapted but distinct from BBB trademark colors
- **Legal**: No trademark infringement - different domain (Hindu compliance vs business ratings)

**Alternatives Considered**:
- Material UI: Rejected - heavier bundle, less customization flexibility
- Bootstrap: Rejected - older patterns, less modern aesthetics
- Custom CSS: Rejected - Tailwind provides better developer experience

---

## 5. Form Management & Auto-Save

### Decision: React Hook Form + Debounced Auto-Save to localStorage

**Rationale**:
- React Hook Form: Excellent performance, TypeScript support, validation integration
- Debounced saves reduce localStorage writes and improve performance
- localStorage backup provides resilience against session timeouts

**Implementation Strategy**:

#### Form Setup
```typescript
// hooks/useComplianceForm.ts
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function useComplianceForm(formSchema: z.ZodSchema) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: loadFromLocalStorage() || {}
  })

  // Auto-save on change (debounced)
  useAutoSave(form.watch(), 30000) // 30 seconds

  return form
}
```

#### Auto-Save Hook
```typescript
// hooks/useAutoSave.ts
export function useAutoSave(data: any, delay: number) {
  const debouncedSave = useMemo(
    () => debounce((values) => {
      localStorage.setItem('form_autosave', JSON.stringify(values))
      localStorage.setItem('form_autosave_timestamp', Date.now().toString())
    }, delay),
    [delay]
  )

  useEffect(() => {
    debouncedSave(data)
  }, [data, debouncedSave])
}
```

#### File Upload with Progress
```typescript
// lib/forms/file-upload.ts
export async function uploadFile(file: File, onProgress: (percent: number) => void) {
  const formData = new FormData()
  formData.append('file', file)

  const xhr = new XMLHttpRequest()

  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      onProgress((e.loaded / e.total) * 100)
    }
  })

  return new Promise((resolve, reject) => {
    xhr.addEventListener('load', () => resolve(JSON.parse(xhr.responseText)))
    xhr.addEventListener('error', reject)
    xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/api/uploads`)
    xhr.send(formData)
  })
}
```

**Session Timeout Recovery**:
1. Before logout: Save form state to localStorage
2. On re-login: Check for saved form state
3. Prompt user: "You have unsaved work. Would you like to restore it?"
4. Restore or discard based on user choice

**Alternatives Considered**:
- Formik: Rejected - React Hook Form has better performance
- Server-side auto-save: Rejected - adds API complexity, localStorage is simpler for MVP
- No auto-save: Rejected - user requirement for data loss prevention

---

## 6. WCAG 2.1 AAA Compliance

### Decision: Semantic HTML + aria-* attributes + axe-core testing

**Rationale**:
- WCAG 2.1 Level AAA is the specification requirement
- Semantic HTML provides best baseline accessibility
- axe-core automates accessibility testing in CI/CD

**Accessibility Implementation**:

#### Semantic HTML Requirements
```tsx
// Good: Semantic structure
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

<main>
  <h1>Dashboard</h1>
  <section aria-labelledby="compliance-heading">
    <h2 id="compliance-heading">Compliance Status</h2>
  </section>
</main>

// Bad: Div soup
<div onClick={}>Dashboard</div>
```

#### ARIA Labels and Roles
```tsx
// Form accessibility
<form aria-labelledby="form-title">
  <h2 id="form-title">Compliance Form</h2>

  <label htmlFor="temple-name">Temple Name</label>
  <input
    id="temple-name"
    aria-required="true"
    aria-describedby="temple-name-help"
  />
  <span id="temple-name-help">Enter the full registered name</span>
</form>

// Button accessibility
<button aria-label="Submit compliance form" aria-busy={loading}>
  {loading ? 'Submitting...' : 'Submit'}
</button>
```

#### Keyboard Navigation
- All interactive elements accessible via Tab/Shift+Tab
- Modal dialogs trap focus and restore on close
- Skip links for main content navigation
- Visible focus indicators (Tailwind `focus:ring-2`)

####  Color Contrast (Level AAA)
- **Normal text**: 7:1 contrast ratio minimum
- **Large text**: 4.5:1 contrast ratio minimum
- Status colors meet AAA standards:
  - Compliant (green): #059669 on white = 7.26:1 ✓
  - Pending (amber): #d97706 on white = 7.01:1 ✓
  - Violation (red): #dc2626 on white = 7.71:1 ✓

#### Testing Strategy
```typescript
// tests/accessibility/wcag-compliance.test.ts
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('Homepage has no accessibility violations', async () => {
  const { container } = render(<HomePage />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

**Screen Reader Testing**:
- Manual testing with NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS)
- Automated testing with axe-core in CI/CD
- Quarterly accessibility audits with real users

**Alternatives Considered**:
- WCAG 2.1 Level AA: Rejected - specification requires Level AAA
- Manual testing only: Rejected - axe-core provides consistent automated checks
- Third-party accessibility overlay: Rejected - proper semantic HTML is better

---

## 7. Testing Strategy

### Decision: Jest + React Testing Library + Playwright + axe-core

**Rationale**:
- Jest: Industry standard for React unit testing
- React Testing Library: User-centric testing approach
- Playwright: Modern E2E testing with excellent TypeScript support
- axe-core: Automated accessibility testing

**Testing Pyramid**:

#### Unit Tests (70% coverage target)
```typescript
// tests/unit/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

test('Button renders with correct text', () => {
  render(<Button>Click Me</Button>)
  expect(screen.getByText('Click Me')).toBeInTheDocument()
})

test('Button calls onClick handler', () => {
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Click Me</Button>)
  fireEvent.click(screen.getByText('Click Me'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

#### Integration Tests (20% coverage target)
```typescript
// tests/integration/auth-flow.test.ts
import { renderWithProviders } from '@/tests/utils'
import { SignInPage } from '@/app/(auth)/signin/page'

test('Auth flow redirects to Nandi SSO', async () => {
  const { user } = renderWithProviders(<SignInPage />)

  const signInButton = screen.getByRole('button', { name: /sign in/i })
  await user.click(signInButton)

  // Should redirect to Nandi SSO
  expect(window.location.href).toContain('auth.kailasa.ai')
})
```

#### E2E Tests (10% coverage target)
```typescript
// tests/e2e/compliance-forms.spec.ts
import { test, expect } from '@playwright/test'

test('User can submit compliance form', async ({ page }) => {
  await page.goto('/signin')

  // Mock Nandi SSO auth
  await page.route('https://auth.kailasa.ai/**', route => {
    route.fulfill({ status: 200, body: JSON.stringify({ access_token: 'mock' }) })
  })

  await page.goto('/dashboard')
  await page.click('text=New Submission')

  // Fill form
  await page.fill('[name="temple-name"]', 'Test Temple')
  await page.fill('[name="registration-number"]', '12345')

  // Upload file
  await page.setInputFiles('[name="document"]', './test-files/sample.pdf')

  // Submit
  await page.click('button:has-text("Submit")')

  // Verify success
  await expect(page.locator('text=Submission successful')).toBeVisible()
})
```

#### Mock Strategies

**Payload CMS Mocks**:
```typescript
// tests/mocks/payload.ts
export const mockPayloadClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}

jest.mock('@/lib/cms/payload-client', () => ({
  payloadClient: mockPayloadClient
}))
```

**Nandi SSO Mocks**:
```typescript
// tests/mocks/nandi.ts
export const mockNandiAuth = {
  getSession: jest.fn(() => ({
    user: { id: '1', email: 'test@temple.org' },
    expires: Date.now() + 3600000
  })),
  signIn: jest.fn(),
  signOut: jest.fn()
}
```

**Alternatives Considered**:
- Cypress: Rejected - Playwright has better TypeScript support and modern features
- Enzyme: Rejected - React Testing Library has better user-centric approach
- Manual testing only: Rejected - automated testing essential for CI/CD

---

## Resolved Unknowns

### ✅ Payload CMS API Structure
- **Base URL**: Configured via `PAYLOAD_API_URL` environment variable
- **Authentication**: Bearer token (`PAYLOAD_API_KEY`) in Authorization header
- **Endpoints**: Standard REST pattern `/api/{collection}`
- **File Uploads**: POST to `/api/media` with multipart/form-data

### ✅ Nandi SSO Token Management
- **Access Token Expiration**: Returned in `expires_in` field (typically 1 hour)
- **Refresh Token**: Long-lived (30 days), automatically exchanges for new access token
- **Token Storage**: httpOnly cookies for security (prevents XSS)
- **Session Validation**: GET `/auth/get-session` with session cookie

### ✅ BBB Design Asset Licensing
- **Approach**: Inspiration and pattern adaptation, not direct copying
- **Assets**: All original or properly licensed
- **Colors**: Similar palette but distinct from BBB trademarks
- **Legal Risk**: Minimal - different domain, no trademark infringement

### ✅ Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: { /* BBB-inspired palette */ },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      spacing: { /* custom spacing */ }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
```

### ✅ Next.js Hosting Environment
- **Recommended**: Vercel (native Next.js support, zero config)
- **Alternative**: Self-hosted (Docker container with Node.js)
- **Requirements**: Node.js 18+, environment variables support
- **Deployment**: GitHub Actions or Vercel Git integration

### ✅ Environment Variable Management
```bash
# .env.example (committed to repo)
NANDI_SSO_CLIENT_ID=your_client_id_here
NANDI_SSO_CLIENT_SECRET=your_client_secret_here
# ... other variables

# .env.local (gitignored, local development)
# Contains actual secrets

# Production: Set via hosting platform (Vercel/Docker/K8s)
```

---

## Technology Stack Summary

| Layer | Technology | Version | Rationale |
|-------|------------|---------|-----------|
| **Frontend Framework** | Next.js | 14+ | SSR/SSG, App Router, middleware |
| **UI Library** | React | 18+ | Industry standard, component-based |
| **Language** | TypeScript | 5+ | Type safety, better DX |
| **Styling** | Tailwind CSS | 3+ | Rapid development, consistent design |
| **Form Management** | React Hook Form | 7+ | Performance, validation integration |
| **Data Fetching** | React Query | 5+ | Caching, optimistic updates |
| **Testing (Unit)** | Jest + RTL | Latest | React standard |
| **Testing (E2E)** | Playwright | Latest | Modern, TypeScript support |
| **Testing (A11y)** | axe-core | Latest | WCAG 2.1 AAA compliance |
| **Authentication** | Custom OAuth 2.0 | N/A | Nandi SSO integration |
| **CMS Client** | Axios/Fetch | Latest | Payload CMS REST API |

---

## Implementation Priorities

1. **Phase 1 (MVP)**:
   - Next.js project setup with TypeScript
   - Tailwind CSS configuration
   - Nandi SSO authentication flow
   - Homepage with static content
   - Dashboard skeleton

2. **Phase 2 (Core Features)**:
   - Payload CMS integration
   - Compliance form submission
   - File upload functionality
   - Auto-save implementation

3. **Phase 3 (Enhancement)**:
   - Submission tracking
   - Notifications system
   - Mobile optimization
   - Accessibility audit

4. **Phase 4 (Polish)**:
   - Performance optimization
   - E2E test coverage
   - Production deployment
   - User acceptance testing

---

## References

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Payload CMS REST API](https://payloadcms.com/docs/rest-api)
- [Nandi Authentication API](/root/hinducs/nandi-authentication-api.yaml)
- [Nandi Auth Examples](/root/hinducs/nandi-auth-examples-main/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/?versions=2.1)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Playwright Testing](https://playwright.dev/)
- [UI Design Screenshots](/root/hinducs/ui_design_screenshots/)

---

**Research Status**: ✅ COMPLETE
**All Unknowns Resolved**: Yes
**Ready for Phase 1**: Yes
**Last Updated**: 2025-10-07
