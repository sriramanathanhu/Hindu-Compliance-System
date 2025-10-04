# KAILASA Hindu Compliance System

A comprehensive business compliance platform with BBB-style business listings, customer reviews, complaints management, and KAILASA SSO integration.

## Features

- **Business Listings**: Complete business profiles with BBB-style accreditation
- **Reviews System**: Customer reviews with moderation and rating calculations
- **Complaints Management**: BBB-style complaint filing and tracking
- **Quote Requests**: Dynamic form builder for quote requests
- **KAILASA SSO**: Integrated authentication with auth.kailasa.ai
- **PostgreSQL Database**: Robust data storage
- **Admin Dashboard**: Full-featured Payload CMS admin panel

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **CMS**: Payload CMS 3.x
- **Database**: PostgreSQL
- **Authentication**: KAILASA SSO (Google OAuth)
- **Language**: TypeScript
- **Rich Text**: Lexical Editor

## Prerequisites

- Node.js 18+
- PostgreSQL database
- KAILASA SSO credentials (client_id and client_secret)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sriramanathanhu/Hindu-Compliance-System.git
   cd Hindu-Compliance-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and update with your credentials:
   ```bash
   cp .env.example .env
   ```

   Update the following variables in `.env`:
   ```env
   # Database
   DATABASE_URI=postgresql://user:password@localhost:5432/hindu_compliance

   # Payload
   PAYLOAD_SECRET=your-secure-random-secret-key
   PAYLOAD_PUBLIC_SERVER_URL=https://hcs-dev.ecitizen.media

   # KAILASA SSO
   NEXT_AUTH_URL=https://auth.kailasa.ai
   NEXT_AUTH_CLIENT_ID=your_client_id
   AUTH_CLIENT_SECRET=your_client_secret
   NEXT_BASE_URL=https://hcs-dev.ecitizen.media

   # Environment
   NODE_ENV=production
   ```

4. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE hindu_compliance;
   ```

5. **Generate types** (optional but recommended)
   ```bash
   npm run generate:types
   ```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Admin Panel**: http://localhost:3000/admin
- **API**: http://localhost:3000/api
- **GraphQL**: http://localhost:3000/api/graphql

## Production Build

```bash
npm run build
npm start
```

## Authentication Flow

1. Users click "Sign in with KAILASA SSO"
2. Redirected to auth.kailasa.ai for Google OAuth
3. After successful authentication, redirected to `/api/auth/callback`
4. Callback handler exchanges auth code for session token
5. User is created/updated in Payload CMS
6. Payload JWT token is generated and set as cookie
7. User is redirected to admin dashboard

## Collections

### Users
- Authentication and user management
- SSO integration fields
- Role-based access control

### Businesses
- Complete business profiles
- BBB-style accreditation
- Contact information
- Licensing details
- Statistics (ratings, reviews, complaints)

### Reviews
- Customer reviews with ratings
- Image uploads
- Moderation workflow
- Helpful/Report counts

### Complaints
- BBB-style complaint screening
- Transaction details
- Resolution tracking
- Internal notes

### Business Categories
- Hierarchical categories
- Icon support

### Media
- File uploads
- Image optimization
- Multiple sizes

### Forms (via plugin)
- Dynamic quote request forms
- Email notifications
- Submission management

## API Endpoints

### REST API

- **Businesses**: `/api/businesses`
- **Reviews**: `/api/reviews`
- **Complaints**: `/api/complaints`
- **Users**: `/api/users`
- **Media**: `/api/media`
- **Forms**: `/api/forms`
- **Form Submissions**: `/api/form-submissions`

### GraphQL

GraphQL Playground: `http://localhost:3000/api/graphql`

### Authentication

- **SSO Callback**: `/api/auth/callback`
- **Session Check**: `/api/auth/session`

## Deployment

The application is configured to deploy to:
- **Domain**: hcs-dev.ecitizen.media
- **Repository**: github.com/sriramanathanhu/Hindu-Compliance-System

### Environment Setup

Ensure all production environment variables are set:
- Database connection string
- PAYLOAD_SECRET (generate with: `openssl rand -base64 32`)
- KAILASA SSO credentials
- Correct domain URLs

### Database Migration

Payload CMS will automatically create and migrate database tables on first run.

## Project Structure

```
hindu-compliance-system/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (payload)/         # Payload admin routes
│   │   ├── api/               # API routes
│   │   │   └── auth/          # SSO authentication
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── collections/           # Payload collections
│   │   ├── Users.ts
│   │   ├── Businesses.ts
│   │   ├── Reviews.ts
│   │   ├── Complaints.ts
│   │   ├── BusinessCategories.ts
│   │   └── Media.ts
│   └── payload.config.ts      # Payload configuration
├── .env                       # Environment variables
├── .env.example              # Environment template
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## Access Control

### Public
- View published businesses
- View approved reviews
- See complaint counts

### Authenticated Users
- Submit reviews
- File complaints
- Submit quote requests
- View own submissions

### Business Owners
- Manage business profile
- View reviews for their business
- Respond to complaints
- View quote requests

### Admins
- Full access to all collections
- Moderate reviews
- Manage complaints
- User management
- System configuration

## Support

For issues or questions:
- GitHub Issues: https://github.com/sriramanathanhu/Hindu-Compliance-System/issues
- KAILASA SSO Docs: https://auth.kailasa.ai/docs

## License

ISC
