# Implementation Tasks: Hindu Compliance Website - Phase 1 (Homepage + Auth)

**Feature**: Hindu Compliance Website UI Design
**Branch**: `001-hindu-compliance-website`
**Phase 1 Scope**: Public Homepage + Nandi SSO Authentication Flow
**Generated**: 2025-10-07

## Phase 1 Scope Definition

**IN SCOPE** for Phase 1:
- ✅ Public homepage with 7 sections (hero, secondary, featured content, fourth section parts 1&2, business services, testimonials, footer)
- ✅ Responsive header with navigation
- ✅ Footer with legal links and contact info
- ✅ Nandi SSO authentication flow (sign-in, callback, session management, sign-out)
- ✅ Protected route middleware
- ✅ Payload CMS integration for homepage content
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ WCAG 2.1 AAA accessibility compliance

**OUT OF SCOPE** for Phase 1 (Future Phases):
- ❌ Dashboard (temple administrator compliance overview)
- ❌ Compliance forms and submissions
- ❌ Status tracking
- ❌ Notifications system
- ❌ Help/guidance system

---

## Task Organization

Tasks are organized into phases:
1. **Setup**: Project initialization and configuration
2. **Foundational**: Core infrastructure needed by all features
3. **Homepage Implementation**: Public homepage with CMS content
4. **Authentication Implementation**: Nandi SSO OAuth 2.0 flow
5. **Polish & Integration**: Cross-cutting concerns and final touches

**Parallel Execution**: Tasks marked with `[P]` can be executed in parallel with other `[P]` tasks in the same phase.

---

## Phase 1: Setup & Project Initialization

### T001: Initialize Next.js 14 Project with TypeScript
**File**: `package.json`, `tsconfig.json`, `next.config.js`
**Description**: Create new Next.js 14 project with TypeScript, App Router, and Tailwind CSS
**Commands**:
```bash
npx create-next-app@latest hindu-compliance-website --typescript --tailwind --app --no-src-dir
cd hindu-compliance-website
```
**Acceptance**: Project builds successfully with `npm run dev`

### T002: Configure Project Structure
**Files**: Multiple directories
**Description**: Create the project directory structure following the plan
**Commands**:
```bash
mkdir -p src/{app,components,lib,hooks,types,styles}
mkdir -p src/components/{layout,homepage,ui}
mkdir -p src/lib/{auth,cms,utils}
mkdir -p src/app/{(auth),(public),(dashboard),api}
mkdir -p public/{images,icons}
```
**Acceptance**: All directories exist and are properly structured

### T003: Install Core Dependencies
**File**: `package.json`
**Description**: Install required npm packages
**Packages**:
- `react-hook-form` + `@hookform/resolvers` + `zod`
- `@tanstack/react-query`
- `axios`
- `clsx` + `tailwind-merge`
- Dev: `@types/node`, `@types/react`, `eslint-config-next`
**Commands**:
```bash
npm install react-hook-form @hookform/resolvers zod @tanstack/react-query axios clsx tailwind-merge
npm install -D @playwright/test jest @testing-library/react @testing-library/jest-dom axe-core @axe-core/react
```
**Acceptance**: All packages installed, no dependency conflicts

### T004: Configure Tailwind CSS with BBB-Inspired Theme
**Files**: `tailwind.config.js`, `src/styles/globals.css`
**Description**: Set up Tailwind with custom color palette, typography, and spacing
**Theme Configuration**:
```javascript
colors: {
  primary: { 50: '#e6f2f8', 500: '#005ea2', 700: '#003d6b' },
  secondary: { 500: '#f0f0f0', 600: '#d9d9d9' },
  accent: { 500: '#00a6a6' },
  status: {
    compliant: '#10b981',
    pending: '#f59e0b',
    violation: '#ef4444'
  }
}
```
**Acceptance**: Tailwind builds with custom theme, global styles load correctly

### T005: Set Up Environment Variables Template
**Files**: `.env.example`, `.env.local` (gitignored)
**Description**: Create environment variable templates for configuration
**Variables**:
```bash
# Nandi SSO
NANDI_SSO_CLIENT_ID=
NANDI_SSO_CLIENT_SECRET=
NANDI_SSO_REDIRECT_URI=
NANDI_SSO_AUTH_URL=https://auth.kailasa.ai

# Payload CMS
PAYLOAD_API_URL=
PAYLOAD_API_KEY=

# Next.js
NEXT_PUBLIC_APP_URL=
NODE_ENV=development
```
**Acceptance**: `.env.example` committed, `.env.local` in `.gitignore`

### T006: Configure TypeScript Paths and Imports
**Files**: `tsconfig.json`
**Description**: Set up path aliases for clean imports
**Configuration**:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```
**Acceptance**: Path aliases work, imports resolve correctly

---

## Phase 2: Foundational Infrastructure

### T007: Create TypeScript Type Definitions
**Files**: `src/types/cms.ts`, `src/types/auth.ts`, `src/types/api.ts`
**Description**: Define TypeScript interfaces for CMS content, auth session, and API responses
**Based On**: `data-model.md`
**Types to Define**:
- `HomepageContent` (hero, sections, testimonials)
- `Media` (images, metadata)
- `NavigationMenu` (menu items, structure)
- `SiteSettings` (global configuration)
- `NandiSession` (OAuth session data)
- `ClientSession` (frontend-accessible session)
**Acceptance**: All types compile without errors, match data-model.md

### T008: Implement Payload CMS API Client [P]
**Files**: `src/lib/cms/payload-client.ts`, `src/lib/cms/content-types.ts`
**Description**: Create API client for fetching content from Payload CMS
**Based On**: `contracts/payload-cms.yaml`
**Functions**:
- `getHomepageContent()` - Fetch homepage data
- `getNavigationMenu(slug)` - Fetch menu by slug
- `getSiteSettings()` - Fetch global settings
- `getMediaById(id)` - Fetch media file
**Error Handling**: Graceful fallbacks, retry logic
**Acceptance**: Can fetch homepage content from Payload CMS successfully

### T009: Implement Nandi SSO OAuth Client [P]
**Files**: `src/lib/auth/nandi-sso.ts`, `src/lib/auth/session.ts`
**Description**: Create OAuth 2.0 client for Nandi SSO authentication
**Based On**: `contracts/nandi-sso.yaml`, `/root/hinducs/nandi-authentication-api.yaml`
**Functions**:
- `getAuthorizationUrl()` - Generate sign-in URL
- `exchangeCodeForTokens(code)` - Exchange auth code for tokens
- `refreshAccessToken(refreshToken)` - Refresh expired token
- `validateSession(accessToken)` - Validate current session
- `revokeSession()` - Sign out and clear session
**Security**: httpOnly cookies, CSRF protection
**Acceptance**: OAuth flow completes successfully with Nandi SSO

### T010: Create Next.js API Routes for Authentication
**Files**: `src/app/api/auth/signin/route.ts`, `src/app/api/auth/callback/route.ts`, `src/app/api/auth/session/route.ts`, `src/app/api/auth/signout/route.ts`
**Description**: Implement Next.js API routes for OAuth flow
**Routes**:
- `GET /api/auth/signin` - Redirect to Nandi SSO
- `GET /api/auth/callback` - Handle OAuth callback, set cookies
- `GET /api/auth/session` - Return current session
- `POST /api/auth/signout` - Clear session, redirect to homepage
**Based On**: `research.md` OAuth implementation patterns
**Acceptance**: All auth routes functional, cookies set correctly

### T011: Implement Auth Middleware for Protected Routes
**Files**: `src/middleware.ts`, `src/lib/auth/middleware.ts`
**Description**: Create Next.js middleware to protect dashboard routes
**Logic**:
- Check for `nandi_session` cookie
- If missing and accessing `/dashboard/*` → redirect to `/signin`
- If present and accessing `/signin` → redirect to `/dashboard`
- Allow public routes without auth
**Acceptance**: Protected routes require authentication, public routes accessible

### T012: Create Base UI Components [P]
**Files**: `src/components/ui/Button.tsx`, `src/components/ui/Input.tsx`, `src/components/ui/Modal.tsx`
**Description**: Build reusable UI components with accessibility
**Components**:
- `Button` - Primary, secondary, outline variants, loading states
- `Input` - Text input with label, error states, validation
- `Modal` - Accessible dialog with focus trap
**Accessibility**: ARIA labels, keyboard navigation, focus management
**Acceptance**: Components render correctly, pass axe-core accessibility tests

---

## Phase 3: Homepage Implementation

**Goal**: Build public homepage with CMS-managed content (BBB-inspired design)

**Independent Test**: Public users can access homepage, view all sections with content from Payload CMS, search functionality works

### T013: Create Homepage Layout and Root Structure
**Files**: `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`, `src/app/layout.tsx`
**Description**: Set up homepage with Server Component pattern, fetch CMS content
**Features**:
- Root layout with fonts, metadata, providers
- Public layout with header/footer
- Homepage fetches content from Payload CMS at build time (ISR)
**Revalidation**: ISR with 3600 seconds (1 hour)
**Acceptance**: Homepage loads with CMS content, proper SEO metadata

### T014: Implement Responsive Header Component [P]
**Files**: `src/components/layout/Header.tsx`, `src/components/layout/Navigation.tsx`, `src/components/layout/LocationSelector.tsx`
**Description**: Build responsive header with navigation and location selector
**Features**:
- Logo and site branding
- Main navigation (desktop: horizontal, mobile: hamburger menu)
- Location selector dropdown
- "Resources for Businesses" link
- "Sign In" button (visible when not authenticated)
- Responsive breakpoints (mobile, tablet, desktop)
**Based On**: `ui_design_screenshots/Hero_section_with_menu.png`
**Accessibility**: Keyboard navigation, ARIA labels, skip links
**Acceptance**: Header adapts to screen sizes, navigation works, accessible

### T015: Implement Footer Component [P]
**Files**: `src/components/layout/Footer.tsx`
**Description**: Build footer with navigation, legal links, social media, contact info
**Features**:
- Site navigation links
- Legal links (Privacy Policy, Terms of Service, Accessibility)
- Social media icons and links
- Contact information (email, phone, address)
- Copyright text
- Responsive grid layout
**Based On**: `ui_design_screenshots/footer.png`
**Accessibility**: Proper heading hierarchy, link labels
**Acceptance**: Footer displays correctly, all links functional

### T016: Implement Hero Section with Search [P]
**Files**: `src/components/homepage/HeroSection.tsx`, `src/components/homepage/SearchBar.tsx`
**Description**: Build hero section with main headline, subtitle, background image, and search functionality
**Features**:
- Dynamic title and subtitle from CMS
- Background image with overlay
- Search bar with two inputs (Find: business/category, Near: location)
- Country selector (e.g., US flag dropdown)
- "Search" button
- Responsive layout
**Based On**: `ui_design_screenshots/Hero_section_with_menu.png`
**CMS Fields**: `hero.title`, `hero.subtitle`, `hero.background_image`, `hero.search_placeholder`
**Acceptance**: Hero renders with CMS content, search inputs functional

### T017: Implement Secondary Section [P]
**Files**: `src/components/homepage/SecondarySection.tsx`
**Description**: Build secondary informational section highlighting key service benefits
**Features**:
- Section title and description from CMS
- Feature cards with icons, titles, descriptions
- Responsive grid layout (1 column mobile, 3 columns desktop)
**Based On**: `ui_design_screenshots/second_section.png`
**CMS Fields**: `secondary_section.title`, `secondary_section.description`, `secondary_section.features[]`
**Acceptance**: Section displays features from CMS in responsive grid

### T018: Implement Featured Content Section (3rd) [P]
**Files**: `src/components/homepage/FeaturedContent.tsx`
**Description**: Build featured content cards showcasing temples or compliance success stories
**Features**:
- Section title from CMS
- Content cards with image, title, excerpt, link
- Card grid (1 column mobile, 2-3 columns desktop)
- Hover effects
**Based On**: `ui_design_screenshots/featured_content_3rd_section.png`
**CMS Fields**: `featured_content.title`, `featured_content.items[]`
**Acceptance**: Featured items display in card grid, images load correctly

### T019: Implement Fourth Section (Parts 1 & 2) [P]
**Files**: `src/components/homepage/FourthSection.tsx`
**Description**: Build fourth section split into two parts with text and images
**Features**:
- Part 1: Title, description, optional image
- Part 2: Title, description, optional image
- Two-column layout (stacked on mobile)
**Based On**: `ui_design_screenshots/fourth_section.png`, `ui_design_screenshots/fourth_section_part_2.png`
**CMS Fields**: `fourth_section.part1`, `fourth_section.part2`
**Acceptance**: Both parts render side-by-side on desktop, stack on mobile

### T020: Implement Business Services Section (5th) [P]
**Files**: `src/components/homepage/BusinessServices.tsx`
**Description**: Build business services section with CTAs for accreditation, application, listing
**Features**:
- Section title and description from CMS
- Service cards with icon, title, description, CTA button
- Horizontal layout (stack on mobile)
- "BBB Accreditation", "Apply for Accreditation", "List Your Business for Free" CTAs
**Based On**: `ui_design_screenshots/featured_content_for_businesses_fifth_section.png`
**CMS Fields**: `business_services.title`, `business_services.services[]`
**Acceptance**: Service cards display with CTAs, responsive layout

### T021: Implement Testimonials Section (6th) [P]
**Files**: `src/components/homepage/Testimonials.tsx`
**Description**: Build testimonials section with user reviews and ratings
**Features**:
- Section title from CMS
- Testimonial cards with content, author, title, temple, rating
- Optional author image
- Carousel or grid layout
- Star rating display (1-5 stars)
**Based On**: Design patterns (no specific screenshot provided)
**CMS Fields**: `testimonials.title`, `testimonials.items[]`
**Acceptance**: Testimonials display with ratings, author info

### T022: Integrate All Homepage Sections
**Files**: `src/app/(public)/page.tsx`
**Description**: Compose all homepage sections into single page
**Order**:
1. Hero Section
2. Secondary Section
3. Featured Content (3rd)
4. Fourth Section (parts 1 & 2)
5. Business Services (5th)
6. Testimonials (6th)
**Layout**: Proper spacing, section dividers, responsive padding
**Acceptance**: All sections display in correct order, content flows well

### T023: Implement Next.js Image Optimization for CMS Images
**Files**: `next.config.js`, all component files using images
**Description**: Configure Next.js Image component for Payload CMS media
**Configuration**:
```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: process.env.PAYLOAD_CMS_DOMAIN,
    },
  ],
}
```
**Usage**: Replace `<img>` with `<Image>` from `next/image`
**Acceptance**: Images load with optimization, proper sizes, lazy loading

---

## Phase 4: Authentication Implementation

**Goal**: Implement Nandi SSO OAuth 2.0 authentication flow for temple administrators

**Independent Test**: Users can sign in via Nandi SSO, session persists, can sign out

### T024: Create Sign-In Page
**Files**: `src/app/(auth)/signin/page.tsx`, `src/app/(auth)/layout.tsx`
**Description**: Build sign-in page with Nandi SSO button
**Features**:
- Centered layout (minimal header, no footer)
- Site branding/logo
- "Sign In with Nandi SSO" button
- Privacy notice or terms link
- Button redirects to `/api/auth/signin`
**Accessibility**: Proper focus, screen reader labels
**Acceptance**: Sign-in page displays, button redirects to Nandi SSO

### T025: Create OAuth Callback Page
**Files**: `src/app/(auth)/callback/page.tsx`
**Description**: Handle OAuth callback from Nandi SSO
**Flow**:
1. Receive authorization code from query params
2. Call `/api/auth/callback` to exchange code for tokens
3. Display loading state during exchange
4. Redirect to `/dashboard` on success
5. Show error message on failure with retry option
**Error Handling**: Invalid code, expired code, network errors
**Acceptance**: Callback processes successfully, redirects to dashboard

### T026: Create useAuth Hook
**Files**: `src/hooks/useAuth.ts`
**Description**: Custom React hook for authentication state and actions
**Functions**:
- `useAuth()` → returns `{ user, isAuthenticated, isLoading, signIn, signOut }`
- Fetches session from `/api/auth/session`
- Handles loading and error states
- Provides sign-in and sign-out actions
**Integration**: Uses React Query for caching
**Acceptance**: Hook provides auth state, works in components

### T027: Add "Sign In" Button to Header
**Files**: `src/components/layout/Header.tsx`
**Description**: Update header to show sign-in status and button
**Logic**:
- If not authenticated: Show "Sign In" button
- If authenticated: Show user name/email + dropdown with "Dashboard", "Sign Out"
- Button links to `/signin`
**Responsive**: Adapt for mobile menu
**Acceptance**: Header reflects auth status, sign-in/out works

### T028: Create Dashboard Placeholder Page (Protected)
**Files**: `src/app/(dashboard)/dashboard/page.tsx`, `src/app/(dashboard)/layout.tsx`
**Description**: Create basic dashboard page to test auth protection
**Features**:
- Dashboard layout with sidebar navigation placeholder
- Welcome message with user name
- "Coming Soon" message for dashboard features
- Sign-out button
**Protected**: Requires authentication via middleware
**Acceptance**: Dashboard accessible only when authenticated, displays user info

### T029: Implement Token Refresh Logic
**Files**: `src/lib/auth/session.ts`, `src/app/api/auth/refresh/route.ts`
**Description**: Auto-refresh access tokens before expiration
**Logic**:
- Check token expiration on each request
- If expiring soon (< 5 minutes), refresh automatically
- Use refresh token to get new access token
- Update cookies with new tokens
**Background**: Runs in middleware or API route
**Acceptance**: Tokens refresh automatically, no session interruption

### T030: Implement Sign-Out Functionality
**Files**: `src/app/api/auth/signout/route.ts`
**Description**: Complete sign-out flow with session cleanup
**Steps**:
1. Clear `nandi_session` and `nandi_refresh` cookies
2. Optionally call Nandi SSO `/auth/logout` endpoint
3. Redirect to homepage
**Client-Side**: `useAuth().signOut()` calls API route
**Acceptance**: Sign-out clears session, redirects to homepage

---

## Phase 5: Polish & Integration

**Goal**: Cross-cutting concerns, accessibility, performance optimization

### T031: Implement Responsive Design Breakpoints [P]
**Files**: All component files
**Description**: Ensure all components adapt to mobile, tablet, desktop
**Breakpoints**:
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md, lg)
- Desktop: > 1024px (xl, 2xl)
**Testing**: Test on various screen sizes
**Acceptance**: All pages responsive, no horizontal scroll on mobile

### T032: Implement Loading States and Skeletons [P]
**Files**: `src/app/(public)/loading.tsx`, component loading states
**Description**: Add loading states for better UX
**Components**:
- Homepage sections: Skeleton loaders
- Navigation: Loading indicator
- Auth: Loading spinner during OAuth
**Patterns**: Suspense boundaries, skeleton components
**Acceptance**: Smooth loading experience, no content jumps

### T033: Add Error Boundaries and Error Pages [P]
**Files**: `src/app/(public)/error.tsx`, `src/app/(public)/not-found.tsx`
**Description**: Handle errors gracefully with custom error pages
**Pages**:
- `error.tsx` - General error page with retry
- `not-found.tsx` - 404 page with helpful links
- `global-error.tsx` - Fallback for critical errors
**Accessibility**: Proper headings, descriptive messages
**Acceptance**: Errors display friendly messages, recovery options

### T034: Implement SEO Optimization
**Files**: `src/app/layout.tsx`, `src/app/(public)/page.tsx`, metadata generation
**Description**: Add SEO metadata for homepage and public pages
**Metadata**:
- Title: Dynamic from CMS or default
- Description: From CMS SEO fields
- Open Graph tags for social sharing
- Canonical URLs
- Robots meta tags
**Based On**: Site Settings from Payload CMS
**Acceptance**: SEO metadata present, validates with tools

### T035: Run Accessibility Audit and Fixes
**Files**: All components
**Description**: Comprehensive WCAG 2.1 AAA accessibility audit
**Tools**: axe-core, Lighthouse, manual testing
**Checks**:
- Color contrast ratios (7:1 for normal text)
- Keyboard navigation (all interactive elements)
- Screen reader compatibility (NVDA, JAWS, VoiceOver)
- ARIA labels and roles
- Semantic HTML
- Focus management
**Acceptance**: Zero critical accessibility issues, WCAG 2.1 AAA compliant

### T036: Performance Optimization
**Files**: `next.config.js`, component optimizations
**Description**: Optimize for performance targets
**Optimizations**:
- Enable Next.js compression
- Optimize images (WebP, lazy loading)
- Code splitting (dynamic imports)
- Bundle analysis and tree-shaking
- Minimize JavaScript bundle
**Targets**:
- Lighthouse Performance > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
**Acceptance**: Lighthouse scores meet targets

### T037: Set Up Testing Infrastructure [P]
**Files**: `jest.config.js`, `playwright.config.ts`, test setup files
**Description**: Configure testing frameworks
**Setup**:
- Jest + React Testing Library for components
- Playwright for E2E tests
- axe-core for accessibility tests
- Mock Nandi SSO and Payload CMS for tests
**Acceptance**: Test runners configured, can run `npm test` and `npm run test:e2e`

### T038: Write Component Unit Tests [P] (OPTIONAL - only if TDD requested)
**Files**: `src/components/**/*.test.tsx`
**Description**: Write unit tests for UI components
**Coverage**:
- Homepage components (Hero, Featured Content, etc.)
- Layout components (Header, Footer, Navigation)
- UI components (Button, Input, Modal)
**Tests**: Rendering, user interactions, accessibility
**Acceptance**: >80% component test coverage

### T039: Write E2E Tests [P] (OPTIONAL - only if TDD requested)
**Files**: `tests/e2e/homepage.spec.ts`, `tests/e2e/auth.spec.ts`
**Description**: End-to-end tests for critical flows
**Scenarios**:
- **Homepage**: Load homepage, verify all sections, test search
- **Auth**: Sign in flow, OAuth callback, session persistence, sign out
**Mocks**: Mock Nandi SSO responses
**Acceptance**: E2E tests pass, critical flows verified

### T040: Create Developer Documentation
**Files**: `README.md`, `CONTRIBUTING.md`
**Description**: Document setup, development, and deployment
**Sections**:
- Prerequisites (Node.js, npm)
- Local setup instructions
- Environment variables
- Running development server
- Running tests
- Building for production
- Deployment guide
**Acceptance**: Documentation complete, new developers can set up project

---

## Dependency Graph

```
Phase 1 (Setup) → Phase 2 (Foundational)
                     ↓
    ┌────────────────┴────────────────┐
    ↓                                 ↓
Phase 3 (Homepage)              Phase 4 (Auth)
    ↓                                 ↓
    └────────────────┬────────────────┘
                     ↓
             Phase 5 (Polish)
```

**Critical Path**:
1. Setup (T001-T006) → Must complete first
2. Foundational (T007-T012) → Must complete before Phase 3 & 4
3. Homepage (T013-T023) → Can run parallel with Auth
4. Auth (T024-T030) → Can run parallel with Homepage
5. Polish (T031-T040) → Depends on Phase 3 & 4

**Parallel Execution Opportunities**:
- Within Foundational: T008 (CMS client) || T009 (Auth client) || T012 (UI components)
- Within Homepage: T014-T021 (all homepage components in parallel)
- Homepage Phase 3 || Auth Phase 4 (independent implementations)
- Within Polish: T031-T034, T037-T039 (various optimizations in parallel)

---

## Implementation Strategy

### MVP (Minimum Viable Product) - Week 1
**Goal**: Publicly accessible homepage with static content

**Tasks**: T001-T006 (Setup), T007-T008 (Types + CMS), T013-T023 (Homepage)

**Deliverable**: Public can visit homepage, see all sections, content managed via Payload CMS

### Phase 1 Complete - Week 2-3
**Goal**: Add authentication for temple administrators

**Tasks**: T009-T011 (Auth infrastructure), T024-T030 (Auth flow)

**Deliverable**: Temple administrators can sign in via Nandi SSO, access protected dashboard placeholder

### Polish & Launch - Week 3-4
**Goal**: Production-ready application

**Tasks**: T031-T040 (Optimization, testing, documentation)

**Deliverable**: Performant, accessible, tested application ready for deployment

---

## Success Criteria

### Homepage Success
- ✅ All 7 homepage sections render from Payload CMS
- ✅ Responsive on mobile, tablet, desktop
- ✅ Images optimized with Next.js Image
- ✅ Lighthouse Performance > 90
- ✅ WCAG 2.1 AAA compliant

### Authentication Success
- ✅ Nandi SSO OAuth flow completes successfully
- ✅ Session persists across page reloads
- ✅ Token refresh works automatically
- ✅ Sign-out clears session completely
- ✅ Protected routes require authentication

### Overall Success
- ✅ Zero critical bugs
- ✅ SEO metadata present and valid
- ✅ Public users can browse without login
- ✅ Temple administrators can authenticate
- ✅ Ready for Phase 2 (Dashboard & Forms)

---

## Task Summary

**Total Tasks**: 40
- **Setup** (Phase 1): 6 tasks
- **Foundational** (Phase 2): 6 tasks
- **Homepage** (Phase 3): 11 tasks
- **Authentication** (Phase 4): 7 tasks
- **Polish** (Phase 5): 10 tasks

**Parallel Opportunities**: 18 tasks marked `[P]` for parallel execution

**Estimated Timeline**:
- Setup & Foundational: 2-3 days
- Homepage Implementation: 4-5 days
- Authentication Implementation: 3-4 days
- Polish & Testing: 3-4 days
- **Total**: 12-16 days (2-3 weeks)

---

**Tasks Status**: ✅ READY FOR IMPLEMENTATION
**Last Updated**: 2025-10-07
