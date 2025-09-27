# D1 Migration Guide

## 🎯 Migration from MySQL to Cloudflare D1

Panduan lengkap untuk migrasi database dari MySQL ke Cloudflare D1.

## Prerequisites

1. **Cloudflare API Token**
   - Dapatkan token di: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/
   - Set environment variable: `CLOUDFLARE_API_TOKEN=your-token`

2. **Current MySQL Access**
   - Pastikan connection ke MySQL masih aktif
   - Environment variable `DATABASE_URL` atau `MYSQL_DATABASE_URL`

## Step 1: Setup Cloudflare API Token

```bash
# Set your Cloudflare API token
export CLOUDFLARE_API_TOKEN=your-api-token-here

# Atau add ke .env file
echo "CLOUDFLARE_API_TOKEN=your-token" >> .env
```

## Step 2: Create D1 Database

```bash
# Create D1 database
wrangler d1 create staff_management_db

# Response akan memberikan database ID, copy untuk wrangler.toml
```

## Step 3: Update wrangler.toml

Edit file `wrangler.toml` dan uncomment bagian D1:

```toml
[[d1_databases]]
binding = "DB"
database_name = "staff_management_db"
database_id = "your-database-id-from-step-2"
```

## Step 4: Create D1 Schema

```bash
# Create tables in D1
wrangler d1 execute staff_management_db --file=migrations/d1/schema.sql
```

## Step 5: Export MySQL Data

```bash
# Export data from MySQL to D1 format
node migrations/d1/data-export.js
```

## Step 6: Import Data to D1

```bash
# Import data to D1
wrangler d1 execute staff_management_db --file=migrations/d1/data-import.sql
```

## Step 7: Update Application Configuration

### 7.1 Update Workers Code

File `workers/index.js` sudah disiapkan untuk D1, hanya perlu update database binding.

### 7.2 Update Schema Import (Optional)

Jika ingin menggunakan D1 schema di development:

```typescript
// Ganti import di file yang relevan
import * as schema from "@shared/schema-d1"; // Use D1 schema
```

### 7.3 Update Environment Variables

```bash
# Set secrets untuk Workers
wrangler secret put SESSION_SECRET
# Tidak perlu DATABASE_URL lagi karena menggunakan D1
```

## Step 8: Test D1 Integration

```bash
# Test locally dengan D1
npm run workers:dev

# Check D1 data
wrangler d1 execute staff_management_db --command="SELECT COUNT(*) FROM users"
```

## Step 9: Deploy to Production

```bash
# Deploy ke staging
npm run workers:deploy:staging

# Test staging
# curl https://your-worker-staging.workers.dev/api/health

# Deploy ke production
npm run workers:deploy:production
```

## Verification Steps

### 1. Check Table Creation
```bash
wrangler d1 execute staff_management_db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### 2. Check Data Import
```bash
# Check record counts
wrangler d1 execute staff_management_db --command="
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 
  'stores' as table_name, COUNT(*) as count FROM stores
UNION ALL
SELECT 
  'sales' as table_name, COUNT(*) as count FROM sales
"
```

### 3. Test API Endpoints
```bash
# Test health endpoint
curl https://your-worker.workers.dev/api/health

# Test user authentication (should work after setting up)
curl -X POST https://your-worker.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Rollback Plan

Jika ada masalah, aplikasi existing masih running di Replit:

1. **Keep Current MySQL**: Aplikasi Replit tetap berjalan dengan MySQL
2. **Fix D1 Issues**: Debug masalah D1 tanpa mempengaruhi production
3. **Gradual Migration**: Test D1 di staging dulu sebelum production

## Performance Benefits

Setelah migrasi ke D1:

- ✅ **Global Edge Deployment** - Latency rendah worldwide
- ✅ **Auto-scaling** - Scale otomatis based on traffic
- ✅ **No Connection Limits** - Tidak ada limit connection seperti MySQL
- ✅ **Integrated with Workers** - Native integration tanpa external dependencies
- ✅ **Cost Effective** - Pay per request, bukan per connection

## Troubleshooting

### Common Issues

1. **API Token Issues**
   ```bash
   # Check token
   wrangler whoami
   ```

2. **Schema Errors**
   ```bash
   # Drop and recreate if needed
   wrangler d1 execute staff_management_db --command="DROP TABLE IF EXISTS table_name"
   ```

3. **Data Type Issues**
   - D1 uses SQLite, beda dengan MySQL
   - DECIMAL menjadi REAL
   - TIMESTAMP menjadi TEXT (ISO format)
   - Boolean menjadi INTEGER (0/1)

4. **Large Data Import**
   ```bash
   # Split large files if needed
   split -l 1000 data-import.sql data-import-part-
   wrangler d1 execute staff_management_db --file=data-import-part-aa
   ```

## Migration Verification Checklist

- [ ] D1 database created and accessible
- [ ] All tables created successfully
- [ ] Data imported correctly (check counts)
- [ ] Workers deployment successful
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Business logic functioning
- [ ] Performance acceptable
- [ ] Error handling working

Migration siap! 🚀