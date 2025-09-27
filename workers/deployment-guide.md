# Cloudflare Workers Deployment Guide

## 🚀 Ready to Deploy!

Project Anda sekarang sudah siap untuk deployment ke Cloudflare Workers. Berikut langkah-langkah lengkapnya:

## Setup Awal

### 1. Login ke Cloudflare
```bash
npm run workers:login
# atau
wrangler login
```

### 2. Buat KV Namespace untuk Sessions
```bash
wrangler kv:namespace create "SESSIONS"
wrangler kv:namespace create "SESSIONS" --preview
```

Tambahkan ID yang diberikan ke `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "SESSIONS"
id = "your-actual-kv-id"
preview_id = "your-preview-kv-id"
```

### 3. Setup Database (Pilih salah satu)

#### Option A: Cloudflare D1 (Recommended)
```bash
# Buat database D1
wrangler d1 create staff_management_db

# Export data dari MySQL saat ini
mysqldump -h your-host -u user -p database_name > backup.sql

# Convert dan import ke D1
wrangler d1 execute staff_management_db --file=backup.sql
```

#### Option B: Keep MySQL dengan External API
Setup proxy API untuk akses database dari Workers
```bash
wrangler secret put EXTERNAL_DB_API_URL
wrangler secret put EXTERNAL_DB_API_KEY
```

### 4. Set Environment Secrets
```bash
wrangler secret put SESSION_SECRET
wrangler secret put DATABASE_URL  # jika menggunakan external API
```

## Deployment Commands

### Development/Testing
```bash
# Test local
npm run workers:dev

# Deploy ke staging
npm run workers:deploy:staging
```

### Production
```bash
# Deploy ke production
npm run workers:deploy:production
```

## Konfigurasi Domain (Optional)

Edit `wrangler.toml` untuk custom domain:
```toml
routes = [
  { pattern = "yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

## Features yang Sudah Disiapkan

✅ **Express.js to Workers Adapter** - Routing otomatis teradaptasi
✅ **Database Layer** - Support D1 dan External API  
✅ **Session Management** - KV-based sessions
✅ **Build Pipeline** - Optimized untuk Workers
✅ **Environment Configuration** - Multi-environment support
✅ **Error Handling** - JSON responses untuk API routes
✅ **Static Asset Serving** - SPA routing support

## Monitoring & Debugging

```bash
# Lihat logs real-time
npm run workers:tail

# Check deployment status
wrangler deployments list

# Rollback jika perlu
wrangler rollback
```

## Performance Benefits

- **Global Edge Deployment** - Latency rendah worldwide
- **Auto-scaling** - Scale otomatis berdasarkan traffic
- **No Cold Starts** - Response time konsisten
- **Cost Effective** - Pay per request model

## Migration Checklist

- [ ] Login ke Cloudflare (`wrangler login`)
- [ ] Create KV namespace untuk sessions
- [ ] Setup database (D1 atau external API)
- [ ] Configure secrets dan environment variables
- [ ] Test deployment (`npm run workers:dev`)
- [ ] Deploy ke staging (`npm run workers:deploy:staging`)
- [ ] Verify functionality
- [ ] Deploy ke production (`npm run workers:deploy:production`)
- [ ] Setup custom domain (optional)
- [ ] Configure monitoring

## Troubleshooting

### Build Issues
```bash
# Clear cache dan rebuild
rm -rf dist/
npm run build:workers
```

### Database Connection Issues
```bash
# Test D1 connection
wrangler d1 info staff_management_db

# List secrets
wrangler secret list
```

### Performance Issues
```bash
# Check bundle size
npm run build:workers
# Output akan menampilkan size analysis
```

## Support

Dokumentasi lengkap: [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

Project siap deploy! 🎉