# LogoGenius - Getting Started for Testing

## Quick Setup (5 minutes)

### 1. Set Up Environment Variables

Create `.env.local` file in the project root:

```bash
# Database (required)
DATABASE_URL="mysql://root:yourpassword@localhost:3306/logogenius"

# Admin Access (required for testing)
ADMIN_PASSWORD="make-up-a-strong-password-here"

# Security (required)
JWT_SECRET="make-up-a-random-secret-key-min-32-chars-long"

# App URL (optional, defaults to localhost:9002)
NEXT_PUBLIC_BASE_URL="http://localhost:9002"
```

### 2. Set Up Database

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS logogenius;"

# Run Prisma migrations
npx prisma migrate dev --name init

# Or if no migrations exist yet:
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 3. Start the Application

```bash
npm run dev
```

App should be running at: **http://localhost:9002**

---

## Access Points for Testing

### 1. Main Website
- **URL:** http://localhost:9002
- **What to test:** Landing page, tier selection, order forms

### 2. Admin Dashboard
- **Login URL:** http://localhost:9002/admin/login
- **Password:** Whatever you set in `ADMIN_PASSWORD`
- **Dashboard:** http://localhost:9002/admin/dashboard
- **What to test:** Order management, approvals, analytics

### 3. API Endpoints (for manual testing)
- **Base:** http://localhost:9002/api

---

## Manual Testing Workflow (Follow This Order)

### Phase 1: Foundation (15 mins)

1. **Environment Check**
   - [ ] App starts without errors
   - [ ] Database connected
   - [ ] No console errors

2. **Admin Login**
   - [ ] Go to http://localhost:9002/admin/login
   - [ ] Enter password from `.env.local`
   - [ ] Should redirect to dashboard
   - [ ] Wrong password should show error

### Phase 2: Order Creation (20 mins)

3. **Tier 1 - Basic Order**
   - [ ] Go to http://localhost:9002/tiers
   - [ ] Select "Basic" tier
   - [ ] Fill form: business name, email, select archetype
   - [ ] Submit
   - [ ] Check admin dashboard - order should appear

4. **Tier 2 - Pro Order**
   - [ ] Same as above but select "Pro"
   - [ ] Additional fields: tagline, mission statement
   - [ ] Submit and verify in dashboard

5. **Tier 3 - Premium Order**
   - [ ] Select "Premium"
   - [ ] Fill all fields including Web3 options
   - [ ] Submit and verify

### Phase 3: Admin Workflow (30 mins)

6. **View Orders in Admin**
   - [ ] Go to http://localhost:9002/admin/orders
   - [ ] Should see orders list
   - [ ] Can filter by status/tier
   - [ ] Click order to see details

7. **Process an Order**
   - [ ] Click "Process" button on an order
   - [ ] Requires Google AI API key (can skip if you don't have one)
   - [ ] Should generate logos, mockups, PDF

8. **Approve Order**
   - [ ] Change order status to "approved"
   - [ ] Customer should be able to access dashboard

### Phase 4: Customer Experience (20 mins)

9. **Logo Selection**
   - [ ] Customer gets email/link to logo selection page
   - [ ] Can view 4 logo variants
   - [ ] Can preview on mockups
   - [ ] Can select one

10. **Customer Dashboard**
    - [ ] Access dashboard with token
    - [ ] View brand guide
    - [ ] Download PDF/ZIP
    - [ ] Submit feedback

---

## Essential Test Data

### Test Business Names
```
TechStart Innovations
Creative Studio Pro
Enterprise Solutions
Web3 DAO Project
Green Earth Organics
```

### Test Emails
```
test-basic@example.com
test-pro@example.com
test-premium@example.com
```

### Brand Archetypes (12 options)
1. The Innocent
2. The Everyman
3. The Hero
4. The Outlaw
5. The Explorer
6. The Creator
7. The Ruler
8. The Magician
9. The Lover
10. The Caregiver
11. The Jester
12. The Sage

---

## Testing Without AI API Key

If you don't have a Google AI API key, you can still test:

1. **Order creation** - Works without API key
2. **Admin dashboard** - Works without API key
3. **Form validation** - Works without API key
4. **Database operations** - Works without API key

**What requires API key:**
- Logo generation
- Brand guide generation
- PDF generation (needs brand guide content)

---

## Common Issues & Fixes

### Issue: "Cannot find module '.prisma/client'"
**Fix:**
```bash
npx prisma generate
```

### Issue: "Database connection failed"
**Fix:**
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1;"

# Check DATABASE_URL format
# Should be: mysql://USER:PASSWORD@HOST:PORT/DATABASE
```

### Issue: "Admin login not working"
**Fix:**
```bash
# Check .env.local exists and has ADMIN_PASSWORD
cat .env.local | grep ADMIN_PASSWORD

# Restart dev server after changing .env
```

### Issue: "Port 9002 already in use"
**Fix:**
```bash
# Kill process on port 9002
npx kill-port 9002

# Or change port in package.json
```

---

## API Testing with curl

### Login as Admin
```bash
curl -X POST http://localhost:9002/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"YOUR_ADMIN_PASSWORD"}'
```

**Expected response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2026-03-12T20:41:11Z"
}
```

### Create Test Order
```bash
curl -X POST http://localhost:9002/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "basic",
    "businessName": "Test Company",
    "email": "test@example.com",
    "archetype": "The Innovator"
  }'
```

**Expected response:**
```json
{
  "id": 1,
  "tier": "basic",
  "status": "pending"
}
```

### List Orders (Admin)
```bash
curl http://localhost:9002/api/admin/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## What to Test First (Priority Order)

### Critical (Must Work)
1. [ ] Admin login
2. [ ] Order creation (all 3 tiers)
3. [ ] Order appears in admin dashboard
4. [ ] Order details viewable

### High Priority
5. [ ] Logo generation (needs API key)
6. [ ] Mockup generation
7. [ ] PDF generation
8. [ ] Customer dashboard access

### Medium Priority
9. [ ] ZIP downloads
10. [ ] Revision requests
11. [ ] Feedback submission
12. [ ] Analytics dashboard

### Low Priority (Tier 3)
13. [ ] Figma templates
14. [ ] Canva templates
15. [ ] Media assets
16. [ ] Email notifications

---

## Testing Checklist (Condensed)

### ✅ Pass = Working, ❌ Fail = Broken, ⏭️ Skip = Not Implemented

| # | Feature | Test Command/URL | Status |
|---|---------|------------------|--------|
| 1 | App starts | `npm run dev` | ⬜ |
| 2 | Database connects | Check console | ⬜ |
| 3 | Admin login | http://localhost:9002/admin/login | ⬜ |
| 4 | Create Tier 1 order | http://localhost:9002/tiers | ⬜ |
| 5 | Create Tier 2 order | http://localhost:9002/tiers | ⬜ |
| 6 | Create Tier 3 order | http://localhost:9002/tiers | ⬜ |
| 7 | View orders list | http://localhost:9002/admin/orders | ⬜ |
| 8 | View order details | Click order in list | ⬜ |
| 9 | Process order | Click "Process" button | ⬜ |
| 10 | Approve order | Change status to approved | ⬜ |
| 11 | Logo selection | Customer link | ⬜ |
| 12 | Customer dashboard | Token URL | ⬜ |
| 13 | Download PDF | Dashboard button | ⬜ |
| 14 | Download ZIP | Dashboard button | ⬜ |

---

## Next Steps

1. **Start here:** Set up `.env.local` and database
2. **Run:** `npm run dev`
3. **Test:** Go through checklist above
4. **Document:** Note what works/breaks
5. **Report:** Share findings for fixes

---

**Ready to start?** 
1. Set up your `.env.local`
2. Run `npm run dev`
3. Go to http://localhost:9002/admin/login
4. Tell me what you see!
