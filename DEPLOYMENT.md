# Deployment Guide

## Prerequisites

1. **PostgreSQL Database**
   - Create a PostgreSQL database for the application
   - Note the connection string

2. **KAILASA SSO Credentials**
   - Obtain `NEXT_AUTH_CLIENT_ID` from KAILASA admin
   - Obtain `AUTH_CLIENT_SECRET` from KAILASA admin
   - Register callback URL: `https://hcs-dev.ecitizen.media/api/auth/callback`

3. **Domain Configuration**
   - Domain: `hcs-dev.ecitizen.media`
   - SSL certificate configured
   - DNS pointing to server

## Environment Variables

Create `.env` file with the following (see `.env.example`):

```env
# Database - Update with actual credentials
DATABASE_URI=postgresql://username:password@host:5432/hindu_compliance

# Payload - Generate secure secret
PAYLOAD_SECRET=$(openssl rand -base64 32)
PAYLOAD_PUBLIC_SERVER_URL=https://hcs-dev.ecitizen.media

# KAILASA SSO - Obtain from KAILASA admin
NEXT_AUTH_URL=https://auth.kailasa.ai
NEXT_AUTH_CLIENT_ID=your_actual_client_id
AUTH_CLIENT_SECRET=your_actual_client_secret
NEXT_BASE_URL=https://hcs-dev.ecitizen.media

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

### 8. Configure Reverse Proxy (Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name hcs-dev.ecitizen.media;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name hcs-dev.ecitizen.media;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Post-Deployment

### 1. Test SSO Authentication

1. Go to homepage: `https://hcs-dev.ecitizen.media`
2. Click "Sign in with KAILASA SSO"
3. Authenticate with Google via auth.kailasa.ai
4. Verify redirect back to admin panel

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
