# Cloudflare Workers Secrets Setup Guide

## Setting Up Secrets

Cloudflare Workers uses different methods for managing secrets and environment variables:

### 1. Environment Variables (Non-sensitive data)
Add to `wrangler.toml`:
```toml
[vars]
NODE_ENV = "production"
APP_NAME = "Staff Management System"
ALLOWED_ORIGINS = "https://yourdomain.com"
```

### 2. Secrets (Sensitive data)
Use Wrangler CLI commands:

```bash
# Database credentials
wrangler secret put DATABASE_URL
wrangler secret put EXTERNAL_DB_API_KEY

# Session management
wrangler secret put SESSION_SECRET

# Google Sheets API
wrangler secret put GOOGLE_SHEETS_PRIVATE_KEY
wrangler secret put GOOGLE_SHEETS_CLIENT_EMAIL

# Cloudflare API
wrangler secret put CLOUDFLARE_API_TOKEN

# Email/Notification APIs
wrangler secret put EMAIL_API_KEY
wrangler secret put WEBHOOK_URL
```

### 3. KV Namespace Setup
```bash
# Create KV namespace for sessions
wrangler kv:namespace create "SESSIONS"
wrangler kv:namespace create "SESSIONS" --preview

# Add the returned IDs to wrangler.toml
```

### 4. D1 Database Setup (Recommended)
```bash
# Create D1 database
wrangler d1 create staff_management_db

# Run schema migration
wrangler d1 execute staff_management_db --file=database/schema.sql

# Add database ID to wrangler.toml
```

### 5. R2 Storage Setup (Optional)
```bash
# Create R2 bucket for file uploads
wrangler r2 bucket create staff-management-assets

# Add bucket name to wrangler.toml
```

## Environment-Specific Secrets

### Development
```bash
wrangler secret put DATABASE_URL --env development
wrangler secret put SESSION_SECRET --env development
```

### Production
```bash
wrangler secret put DATABASE_URL --env production
wrangler secret put SESSION_SECRET --env production
```

## Migration from Current MySQL Setup

### Option 1: Keep External MySQL (Easier)
1. Set up API proxy for database access
2. Use EXTERNAL_DB_API_URL and EXTERNAL_DB_API_KEY
3. Current MySQL database remains unchanged

### Option 2: Migrate to Cloudflare D1 (Recommended)
1. Export current MySQL data
2. Convert to D1-compatible SQL
3. Import to D1 database
4. Update application to use D1

## Quick Setup Commands

```bash
# Login to Cloudflare
wrangler login

# Create KV namespace
wrangler kv:namespace create "SESSIONS"

# Create D1 database (optional)
wrangler d1 create staff_management_db

# Set essential secrets
wrangler secret put SESSION_SECRET
wrangler secret put DATABASE_URL

# Test deployment
npm run workers:dev
```

## Accessing Secrets in Workers

```javascript
// In your Workers code
export default {
  async fetch(request, env, ctx) {
    const dbUrl = env.DATABASE_URL;        // Secret
    const sessionSecret = env.SESSION_SECRET;  // Secret
    const appName = env.APP_NAME;          // Environment variable
    const sessions = env.SESSIONS;        // KV binding
    const db = env.DB;                    // D1 binding
    
    // Use the secrets and bindings
  }
};
```