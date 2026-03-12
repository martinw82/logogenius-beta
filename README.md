# LogoGenius Beta

AI-powered logo and brand identity generation platform.

## 🚀 Current Status (Updated: 2026-03-12)

### ✅ What's Working
- **Admin Authentication** - Login with JWT tokens (no database required)
- **Admin Dashboard** - UI loads, navigation works
- **Landing Page** - Main site accessible
- **Health Check** - `/api/health` endpoint for diagnostics

### ⚠️ Temporarily Disabled (Database Issues)
Due to **TiDB Cloud SSL connection issues**, the following are currently mocked/disabled:
- Order creation
- Order listing in dashboard
- Logo generation
- PDF/ZIP generation
- Customer dashboard

**The database layer returns empty data** to allow UI testing while we fix the SSL connection.

---

## 📋 Project Sprints

| Sprint | Status | Tasks |
|--------|--------|-------|
| 1: Foundation | ✅ Complete | Database, admin auth, tier forms |
| 2: Brand Guide Generation | ⚠️ Partial | Genkit flows ready, but DB disabled |
| 3: PDF/ZIP + Admin | ⚠️ Partial | UI ready, generation disabled |
| 4: Logo Mockup + Quality Gate | ⚠️ Partial | UI ready, processing disabled |
| 5: Dashboard + Revisions | ⚠️ Partial | UI ready, DB disabled |
| 6: Advanced Templates | ⏳ Pending | Figma/Canva templates |

---

## 🛠️ Environment Variables

Required in Vercel (Settings → Environment Variables):

```
DATABASE_URL=mysql://user:pass@host:port/database?sslmode=require
ADMIN_PASSWORD=your-admin-password
JWT_SECRET=your-random-secret-min-32-chars
```

**Note:** For TiDB Cloud, make sure `sslmode=require` is in the URL.

---

## 🧪 Testing the Deployment

### Admin Login
1. Visit: `https://your-app.vercel.app/admin/login`
2. Username: `admin`
3. Password: (set in `ADMIN_PASSWORD` env var)
4. Should redirect to dashboard

### Health Check
```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "env": {
    "hasJwtSecret": true,
    "hasAdminPassword": true,
    "hasDatabaseUrl": true
  }
}
```

---

## 🔧 Next Steps

### Option A: Fix Database Connection
1. Verify `DATABASE_URL` includes `?sslmode=require`
2. Update `src/lib/database.ts` to use real Prisma client
3. Test creating an order
4. Restore full functionality

### Option B: Add Demo Data
1. Add sample orders to database.ts mock
2. Test UI flows with fake data
3. Verify all components render correctly

### Option C: Add Google AI API Key
1. Add `TEST_GOOGLE_API_KEY` to env vars
2. Test logo generation
3. Test brand guide generation

---

## 🏗️ Architecture

### Tech Stack
- **Framework:** Next.js 15 + React 18
- **Language:** TypeScript
- **Database:** MySQL (TiDB Cloud) - Currently mocked
- **ORM:** Prisma 6.19.2
- **Auth:** JWT (jsonwebtoken)
- **Styling:** Tailwind CSS + shadcn/ui
- **AI:** Google Genkit (for logo generation)

### Key Files
- `src/lib/database.ts` - Database client (currently mocked)
- `src/lib/auth.ts` - JWT authentication
- `src/app/api/admin/login/route.ts` - Admin login
- `src/app/admin/dashboard/page.tsx` - Admin dashboard

---

## 📁 Project Structure

```
logogenius-beta/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # Admin pages
│   │   ├── api/                # API routes
│   │   ├── create/             # Order creation
│   │   └── page.tsx            # Landing page
│   ├── components/             # React components
│   ├── lib/                    # Utilities
│   │   ├── auth.ts             # JWT auth
│   │   ├── database.ts         # Database client
│   │   └── services/           # Business logic
│   └── ai/flows/               # Genkit AI flows
├── prisma/
│   └── schema.prisma           # Database schema
├── tests/                      # Jest test suite
└── docs/                       # Documentation
```

---

## 🐛 Known Issues

### Database SSL Error
**Error:** `Connections using insecure transport are prohibited`

**Cause:** TiDB Cloud requires SSL, but connection string may be missing params.

**Workaround:** Database is mocked to allow UI testing.

**Fix:** Update `DATABASE_URL` to include `?sslmode=require`

---

## 🚦 Quick Start for Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run locally
npm run dev

# Run tests
npm test
```

---

## 📊 Testing Guide

See `tests/MANUAL-TEST-TRACKING.md` for comprehensive testing checklist.

---

## 📚 Documentation

- `docs/projectoverview.md` - Project overview and strategy
- `docs/roadmap.md` - Sprint planning
- `docs/deployment.md` - Deployment guide
- `tests/README.md` - Testing documentation

---

## 🔐 Security Notes

- JWT_SECRET should be 32+ random characters
- ADMIN_PASSWORD should be strong
- Database URL contains credentials - keep secure

---

## 📞 Support

For issues or questions, check:
1. Vercel Function Logs (Dashboard → Functions)
2. Browser Console for frontend errors
3. `/api/health` endpoint for env var status

---

**Last Updated:** 2026-03-12  
**Branch:** beta  
**Status:** Admin login working, database mocked for testing
