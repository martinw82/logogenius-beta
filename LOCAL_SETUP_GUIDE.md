# Local Development Setup Guide

This guide will help you set up LogoGenius for local development and testing.

## Prerequisites

- **Node.js 18+** (you have v18.16.0 ✅)
- **npm** (you have v9.6.6 ✅)
- **Google AI API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your values:

```bash
# Required for logo generation
GENKIT_API_KEY=your_google_ai_studio_key_here

# Required for database (can use mock for testing)
DATABASE_URL=mysql://user:pass@host:port/database?sslmode=require

# Required for admin login
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=any_random_string_min_32_chars

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:9002
```

### Step 3: Run the Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:9002**

### Step 4: Test Image Generation

Open: **http://localhost:9002/test**

Click "Generate Image" to test if the AI image generation works.

---

## Common Issues & Solutions

### "Cannot find module" errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Port 9002 is already in use

```bash
# Find and kill the process using port 9002
# Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 9002).OwningProcess
Stop-Process -Id <PID>

# Or just use a different port:
npm run dev -- -p 3000
```

### API Key not working

1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Copy the key (starts with `AIzaSy...`)
4. Add it to `.env.local`:
   ```
   GENKIT_API_KEY=AIzaSy...
   ```
5. Restart the dev server (Ctrl+C, then `npm run dev`)

### Database connection errors (for testing, you can skip database)

The app has a mock database mode for testing. If you see database errors:
- The admin dashboard will show empty data
- But the **image generation test at `/test`** will still work!

To fully test with a database:
1. Set up a MySQL database (local or TiDB Cloud)
2. Update `DATABASE_URL` in `.env.local`
3. Run: `npx prisma generate`

---

## Testing Workflow

Once local dev is running:

1. **Test image generation** → http://localhost:9002/test
   - If this works, the AI integration is good!

2. **Test admin login** → http://localhost:9002/admin/login
   - Login with the password from `ADMIN_PASSWORD`

3. **Create a test order** → http://localhost:9002/admin/create-order
   - Fill in the form and submit

4. **Generate logos for the order** → Admin dashboard
   - Find your order, click "Generate Logos"

---

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server on port 9002 |
| `npm run build` | Build for production |
| `npm run typecheck` | Check TypeScript types |
| `npm test` | Run tests |

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `GENKIT_API_KEY` | ✅ Yes | Google AI Studio API key for image generation |
| `ADMIN_PASSWORD` | ✅ Yes | Password for admin dashboard login |
| `JWT_SECRET` | ✅ Yes | Secret for JWT tokens (any random string) |
| `DATABASE_URL` | ⚠️ For full testing | MySQL connection string |
| `NEXT_PUBLIC_BASE_URL` | No | Base URL (default: http://localhost:9002) |

---

## Next Steps After Local Setup

1. ✅ Verify `/test` page generates images
2. ✅ Fix any issues with the simple test
3. ✅ Apply working config to complex flows
4. ✅ Push fixes to GitHub
5. ✅ Deploy to Vercel

---

## Need Help?

Check the server terminal for error logs when testing. The `/test` page shows detailed error messages if generation fails.
