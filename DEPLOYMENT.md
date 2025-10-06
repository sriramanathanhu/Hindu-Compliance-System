# Deployment Guide

## Prerequisites

1. **PostgreSQL Database**
   - Create a PostgreSQL database for the application
   - Note the connection string

2. **Domain Configuration**
   - Domain: `hcs-dev.ecitizen.media`
   - SSL certificate configured (Caddy handles automatically with Let's Encrypt)
   - DNS pointing to server

3. **Server Requirements**
   - Node.js 18+
   - PostgreSQL 15+
   - Caddy web server (for reverse proxy and automatic HTTPS)

## Environment Variables

Create `.env` file with the following (see `.env.example`):

```env
# Database - Update with actual credentials
DATABASE_URI=postgresql://username:password@host:5432/hindu_compliance

# Payload CMS - Generate secure secret
PAYLOAD_SECRET=$(openssl rand -base64 32)
PAYLOAD_PUBLIC_SERVER_URL=https://hcs-dev.ecitizen.media

# Application Configuration
PORT=3001

# Environment
NODE_ENV=production
```

## Deployment Steps

### 1. Clone Repository

```bash
git clone https://github.com/sriramanathanhu/Hindu-Compliance-System.git
cd Hindu-Compliance-System
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with actual values
nano .env
```

### 4. Build Application

```bash
npm run build
```

### 5. Run Database Migrations

Payload CMS will automatically create database tables on first run.

### 6. Create Admin User

On first run, access the admin panel to create the first admin user:
```
https://hcs-dev.ecitizen.media/admin
```

Or use Payload CLI:
```bash
npx payload create-first-user
```

### 7. Start Production Server

```bash
npm start
```

Or use a process manager like PM2:
```bash
npm install -g pm2
pm2 start npm --name "hindu-compliance" -- start
pm2 save
pm2 startup
```

### 8. Configure Reverse Proxy (Caddy)

Create or update `/etc/caddy/Caddyfile`:

```caddyfile
hcs-dev.ecitizen.media {
    reverse_proxy localhost:3001

    encode gzip

    log {
        output file /var/log/caddy/hcs-dev.log
    }
}
```

Reload Caddy configuration:

```bash
sudo systemctl reload caddy
```

**Note**: Caddy automatically handles:
- HTTP to HTTPS redirect
- Let's Encrypt SSL certificate provisioning and renewal
- HTTP/2 support

## Post-Deployment

### 1. Test Authentication

1. Navigate to admin panel: `https://hcs-dev.ecitizen.media/admin`
2. Login with admin credentials (email/password)
3. Verify access to admin dashboard
4. Test creating a new user account

### 2. Create Initial Data

1. **Business Categories**
   - Navigate to Business Categories
   - Add initial categories (e.g., Roofing Contractors, Plumbing, etc.)

2. **Create Quote Request Form**
   - Navigate to Forms
   - Create a new form with fields:
     - Name (text)
     - Email (email)
     - Phone (text)
     - Service Needed (select)
     - Description (textarea)
   - Configure email notifications

### 3. Configure Email (Optional)

For form notifications and user emails, configure SMTP in `payload.config.ts`:

```typescript
email: {
  transport: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  fromAddress: 'noreply@ecitizen.media',
  fromName: 'Hindu Compliance System',
}
```

## Monitoring & Maintenance

### Health Checks

- Application: `https://hcs-dev.ecitizen.media`
- Admin Panel: `https://hcs-dev.ecitizen.media/admin`
- API: `https://hcs-dev.ecitizen.media/api`
- GraphQL: `https://hcs-dev.ecitizen.media/api/graphql`

### Logs

View application logs:
```bash
pm2 logs hindu-compliance
```

### Backup Database

Regular PostgreSQL backups:
```bash
pg_dump -U username hindu_compliance > backup_$(date +%Y%m%d).sql
```

### Updates

To update the application:
```bash
git pull origin main
npm install
npm run build
pm2 restart hindu-compliance
```

## Troubleshooting

### SSO Authentication Issues

1. **Verify callback URL** is registered with KAILASA:
   - URL: `https://hcs-dev.ecitigen.media/api/auth/callback`

2. **Check environment variables**:
   ```bash
   echo $NEXT_AUTH_CLIENT_ID
   echo $NEXT_AUTH_URL
   ```

3. **Review logs** for authentication errors:
   ```bash
   pm2 logs hindu-compliance --lines 100
   ```

### Database Connection Issues

1. **Test connection**:
   ```bash
   psql $DATABASE_URI
   ```

2. **Check PostgreSQL is running**:
   ```bash
   systemctl status postgresql
   ```

### Build Errors

1. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run build
   ```

2. **Regenerate types**:
   ```bash
   npm run generate:types
   ```

## Security Checklist

- [ ] Strong `PAYLOAD_SECRET` generated and configured
- [ ] Database credentials secured and not exposed
- [ ] HTTPS/SSL certificate installed and valid
- [ ] KAILASA SSO secrets stored securely
- [ ] File upload limits configured
- [ ] Rate limiting enabled (if applicable)
- [ ] Regular security updates scheduled
- [ ] Database backups automated
- [ ] Admin panel access restricted

## Support

- **Repository**: https://github.com/sriramanathanhu/Hindu-Compliance-System
- **Issues**: https://github.com/sriramanathanhu/Hindu-Compliance-System/issues
- **KAILASA SSO**: https://auth.kailasa.ai/docs
