# Hindu Compliance System - Frontend

Next.js 14 frontend application for the Hindu Compliance System, providing public homepage and authenticated dashboard for temple compliance management.

## Features

### Phase 1 (Current)

- **Public Homepage**: 7 sections with BBB-inspired design
  - Hero with search
  - Secondary features
  - Featured content
  - Fourth section (2-column)
  - Business services
  - Testimonials
  - Responsive header & footer

- **Authentication**: OAuth 2.0 via Nandi SSO
  - Sign-in flow
  - Callback handling
  - Token management with httpOnly cookies
  - Protected dashboard routes

- **CMS Integration**: Payload CMS for dynamic content
  - Homepage content
  - Navigation menus
  - Site settings

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack React Query
- **HTTP Client**: Axios
- **Authentication**: Custom OAuth 2.0 (Nandi SSO)
- **CMS**: Payload CMS (REST API)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Nandi SSO credentials
- Payload CMS instance running

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Configure `.env.local`:
```env
NEXT_PUBLIC_NANDI_SSO_URL=https://auth.kailasa.ai
NEXT_PUBLIC_NANDI_CLIENT_ID=your_client_id
NANDI_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_NANDI_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_PAYLOAD_CMS_URL=http://localhost:3001
PAYLOAD_CMS_API_KEY=your_api_key
SESSION_SECRET=your_32_character_secret
```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                  # Next.js App Router
├── components/           # React components
├── hooks/               # Custom hooks
├── lib/                 # Auth, CMS, utilities
├── types/               # TypeScript types
└── styles/              # CSS files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

See `.env.example` for required variables.

## License

Proprietary - Hindu Compliance System
