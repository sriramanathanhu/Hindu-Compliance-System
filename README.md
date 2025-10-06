# Hindu Compliance System

A comprehensive business compliance platform with BBB-style business listings, customer reviews, complaints management, and user authentication.

## Features

- **Business Listings**: Complete business profiles with BBB-style accreditation
- **Reviews System**: Customer reviews with moderation and rating calculations
- **Complaints Management**: BBB-style complaint filing and tracking
- **Quote Requests**: Dynamic form builder for quote requests
- **User Authentication**: Secure email/password authentication via Payload CMS
- **PostgreSQL Database**: Robust data storage
- **Admin Dashboard**: Full-featured Payload CMS admin panel

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **CMS**: Payload CMS 3.x
- **Database**: PostgreSQL
- **Authentication**: Payload CMS built-in authentication (email/password)
- **Language**: TypeScript
- **Rich Text**: Lexical Editor

## Prerequisites

- Node.js 18+
- PostgreSQL database

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
   PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001

   # Application
   PORT=3001

   # Environment
   NODE_ENV=development
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

Open [http://localhost:3001](http://localhost:3001) in your browser.

- **Admin Panel**: http://localhost:3001/admin
- **API**: http://localhost:3001/api
- **GraphQL**: http://localhost:3001/api/graphql

## Production Build

```bash
npm run build
npm start
```

## Authentication Flow

1. User navigates to `/admin`
2. Payload CMS login form is displayed
3. User submits email and password via `/api/users/login`
4. Payload validates credentials against Users collection (bcrypt hash)
5. On success, Payload generates JWT token (using PAYLOAD_SECRET)
6. JWT stored in httpOnly cookie: `payload-token`
7. Cookie settings: `secure=true` (HTTPS only), `sameSite=strict`, `maxAge=7200s` (2 hours)
8. Subsequent requests include cookie automatically
9. Payload middleware validates JWT on each API request
10. User object populated in `req.user` for access control

### Session Management

- **Session timeout**: 2 hours (tokenExpiration: 7200)
- **Failed login attempts**: Maximum 5 attempts before account lockout
- **Account lockout**: 10 minutes after 5 failed attempts
- **Password reset**: Available through Payload admin panel

## Collections

### Users
- Authentication and user management
- Role-based access control (admin, editor, business_owner, user)
- Account status management

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

GraphQL Playground: `http://localhost:3001/api/graphql`

### Authentication Endpoints

- **Login**: `POST /api/users/login`
- **Logout**: `POST /api/users/logout`
- **Current User**: `GET /api/users/me`
- **Password Reset**: `POST /api/users/forgot-password`

## Deployment

The application is configured to deploy to:
- **Domain**: hcs-dev.ecitizen.media
- **Repository**: github.com/sriramanathanhu/Hindu-Compliance-System

### Environment Setup

Ensure all production environment variables are set:
- `DATABASE_URI`: PostgreSQL connection string
- `PAYLOAD_SECRET`: Secure random key (generate with: `openssl rand -base64 32`)
- `PAYLOAD_PUBLIC_SERVER_URL`: Production domain (e.g., https://hcs-dev.ecitizen.media)
- `PORT`: Application port (default: 3001)
- `NODE_ENV`: Set to `production`

### Database Migration

Payload CMS will automatically create and migrate database tables on first run.

## Project Structure

```
hindu-compliance-system/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (payload)/         # Payload admin routes
│   │   ├── api/               # API routes
│   │   │   ├── [[...slug]]/   # Payload REST API
│   │   │   └── health/        # Health check endpoint
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
- Payload CMS Docs: https://payloadcms.com/docs

## License

ISC
