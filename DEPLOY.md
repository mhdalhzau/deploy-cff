# 🚀 One-Click Cloudflare Deployment

## Instant Deploy (3 Methods)

### Method 1: Auto-Setup Script (Recommended)
```bash
npm run deploy
```
**That's it!** Script otomatis akan:
- ✅ Setup D1 database
- ✅ Create KV storage  
- ✅ Build & deploy aplikasi
- ✅ Configure semua resources

### Method 2: GitHub Import (Zero Config)
1. **Fork/Import** repository ini ke GitHub
2. **Connect** ke Cloudflare Pages
3. **Set Environment Variable**: `CLOUDFLARE_API_TOKEN`
4. **Deploy** - GitHub Actions akan handle semuanya otomatis

### Method 3: Manual Deploy
```bash
# Login sekali saja
wrangler login

# Deploy langsung
npm run workers:deploy
```

## 🎯 What Happens Automatically

### Resources Auto-Created:
- ✅ **D1 Database** - `staff_management_db`
- ✅ **KV Storage** - `SESSIONS` namespace
- ✅ **R2 Bucket** - `staff-management-assets` (optional)
- ✅ **Workers** - Production & staging environments

### Deployment URLs:
- **Production**: `https://staff-management-prod.workers.dev`
- **Staging**: `https://staff-management-staging.workers.dev`

## 🔧 Environment Setup (Optional)

Only needed if using external services:

```bash
# Set secrets (optional)
wrangler secret put SESSION_SECRET
wrangler secret put EXTERNAL_API_KEY
```

## ⚡ Quick Commands

```bash
# One-click deploy
npm run deploy

# Development mode
npm run workers:dev

# Deploy to staging
npm run workers:deploy:staging

# Deploy to production  
npm run workers:deploy:production

# View logs
npm run workers:tail
```

## 🔄 Auto-Updates

**GitHub Actions** configured untuk auto-deploy pada:
- ✅ Push ke `main`/`master` → Production
- ✅ Push ke branches lain → Staging
- ✅ Pull requests → Preview deployment

## 🆘 Troubleshooting

### Common Issues:

**1. API Token Missing**
```bash
# Get token: https://dash.cloudflare.com/profile/api-tokens
wrangler login
```

**2. Resource Already Exists**
```bash
# Check existing resources
wrangler d1 list
wrangler kv:namespace list
```

**3. Build Errors**
```bash
# Clean rebuild
rm -rf dist node_modules
npm install
npm run build:workers
```

## 🌍 Custom Domain (Optional)

1. **Add domain** di Cloudflare Dashboard
2. **Update wrangler.toml**:
```toml
routes = [
  { pattern = "yourdomain.com/*", zone_name = "yourdomain.com" }
]
```
3. **Redeploy**: `npm run deploy`

---

## 🎉 Done!

Aplikasi siap pakai dengan:
- 🌍 **Global edge deployment**
- 🔄 **Auto-scaling**
- 💾 **Managed database**
- 🔒 **Built-in security**

**Deploy time**: ~2 menit dari zero to hero! 🚀