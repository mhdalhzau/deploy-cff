# 🚀 Staff Management System

## One-Click Cloudflare Deployment

```bash
npm run deploy
```

**That's it!** Your enterprise-grade staff management system will be live in ~2 minutes.

## ✨ Features

- 🔐 **Multi-role Management** - Staff, Manager, Admin access levels
- ⏰ **Attendance Tracking** - Clock in/out with real-time monitoring
- 📊 **Sales Reporting** - Comprehensive sales analytics and dashboards
- 💰 **Payroll Processing** - Automated salary calculations and reports
- 📄 **Proposal Management** - Business proposal workflow and approval
- 🏪 **Multi-store Support** - Manage multiple locations and branches
- 💬 **Real-time Updates** - WebSocket-powered live notifications
- 📱 **Mobile Responsive** - Works perfectly on all devices

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Shadcn UI
- **Backend**: Express.js + Cloudflare Workers Runtime
- **Database**: MySQL (Replit Dev) / D1 (Cloudflare Production)
- **Real-time**: WebSocket connections for live updates
- **Deployment**: One-click Cloudflare Workers deployment

## 🚀 Quick Start

### Option 1: Auto-Deploy (Recommended)
```bash
# Clone & install
git clone https://github.com/yourusername/staff-management-system.git
cd staff-management-system
npm install

# Deploy to Cloudflare (one command!)
npm run deploy
```

### Option 2: GitHub Import
1. **Fork** this repository
2. **Connect** to Cloudflare Pages
3. **Set** `CLOUDFLARE_API_TOKEN` in GitHub Secrets
4. **Push** code - auto-deployment handles everything!

### Option 3: Development Mode
```bash
# Run locally with Replit/MySQL
npm run dev

# Or run with Cloudflare Workers emulation
npm run workers:dev
```

## 📋 What Gets Auto-Created

When you run `npm run deploy`, the script automatically:

- ✅ **D1 Database** - `staff_management_db` with full schema
- ✅ **KV Storage** - Session management with `SESSIONS` namespace
- ✅ **Workers** - Production & staging environments
- ✅ **GitHub Actions** - CI/CD pipeline for future updates
- ✅ **SSL Certificates** - Automatic HTTPS with Cloudflare

## 🌍 Live URLs

After deployment:
- **Production**: `https://staff-management-prod.workers.dev`
- **Staging**: `https://staff-management-staging.workers.dev`

## 🔧 Configuration

### Environment Variables (Optional)
```bash
# For external integrations
wrangler secret put SESSION_SECRET
wrangler secret put EXTERNAL_API_KEY
```

### Custom Domain (Optional)
Edit `wrangler.toml`:
```toml
routes = [
  { pattern = "yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

## ⚡ Commands

```bash
# One-click deploy
npm run deploy

# Development 
npm run dev                    # Replit/MySQL mode
npm run workers:dev           # Cloudflare Workers mode

# Deployment
npm run workers:deploy:staging     # Deploy to staging
npm run workers:deploy:production  # Deploy to production

# Database
npm run db:push               # Sync schema changes
npm run db:migrate           # Run migrations

# Monitoring
npm run workers:tail         # View live logs
```

## 🔄 Auto-Updates

**GitHub Actions** configured for:
- ✅ **Main branch** → Production deployment
- ✅ **Other branches** → Staging deployment  
- ✅ **Pull requests** → Preview deployments
- ✅ **Database migrations** → Automatic schema updates

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React SPA     │────│  Express API     │────│   D1 Database   │
│  (Frontend)     │    │   (Backend)      │    │   (SQLite)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                               │
                    ┌──────────────────┐
                    │  Cloudflare      │
                    │  Workers Runtime │
                    └──────────────────┘
                               │
                    ┌──────────────────┐
                    │   KV Storage     │
                    │   (Sessions)     │
                    └──────────────────┘
```

## 🆘 Troubleshooting

### Common Issues:

**Deploy fails with API token error:**
```bash
wrangler login  # Login first
npm run deploy  # Try again
```

**Database connection issues:**
```bash
# Check D1 database
wrangler d1 list
wrangler d1 info staff_management_db
```

**Build errors:**
```bash
# Clean rebuild
rm -rf dist node_modules
npm install
npm run build:workers
```

## 📖 Documentation

- [📚 Deployment Guide](DEPLOY.md) - Detailed deployment instructions
- [🔧 D1 Migration Guide](D1-MIGRATION-COMPLETE.md) - Database migration docs
- [⚙️ Configuration Options](wrangler.toml) - Cloudflare Workers config

## 🎯 Use Cases

Perfect for:
- 🏢 **Small-Medium Businesses** - Complete staff management solution
- 🏪 **Retail Chains** - Multi-store operations and reporting
- 📊 **Service Companies** - Project tracking and payroll management
- 🏭 **Manufacturing** - Shift management and attendance tracking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 Ready to Deploy?

**From zero to production in 2 minutes:**

```bash
npm run deploy
```

Your staff management system will be live at `https://staff-management-prod.workers.dev`

**Questions?** Check [DEPLOY.md](DEPLOY.md) for detailed instructions.

---

Built with ❤️ using **Replit** + **Cloudflare Workers**