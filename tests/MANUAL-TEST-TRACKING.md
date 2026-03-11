# Manual Test Tracking Sheet

**Tester:** _______________  
**Date:** _______________  
**Environment:** Local (http://localhost:9002)  
**Build:** _______________ (git commit hash)

---

## 🚀 PHASE 1: Foundation & Setup

### Environment Setup

| # | Test | How to Check | Expected Result | Status | Notes |
|---|------|--------------|-----------------|--------|-------|
| 1.1 | `.env.local` exists | `ls -la .env.local` | File exists | ⬜ | |
| 1.2 | Database URL set | `cat .env.local \| grep DATABASE` | Valid MySQL URL | ⬜ | |
| 1.3 | Admin password set | `cat .env.local \| grep ADMIN` | Password defined | ⬜ | |
| 1.4 | JWT secret set | `cat .env.local \| grep JWT` | Secret defined | ⬜ | |
| 1.5 | MySQL running | `mysql -u root -p -e "SELECT 1"` | Returns 1 | ⬜ | |
| 1.6 | Database exists | `mysql -u root -p -e "USE logogenius; SHOW TABLES"` | Shows tables or empty | ⬜ | |
| 1.7 | Prisma generated | `ls node_modules/.prisma/client` | Files exist | ⬜ | |

**Status:** ___/7 passed

---

## 🔐 PHASE 2: Admin Authentication

### 2.1 Admin Login Page

| # | Test | Steps | Expected | Status | Notes |
|---|------|-------|----------|--------|-------|
| 2.1.1 | Page loads | Go to `/admin/login` | Login form appears | ⬜ | |
| 2.1.2 | UI elements | Check login page | Has: title, password field, submit button | ⬜ | |
| 2.1.3 | Correct password | Enter correct password | Redirects to `/admin/dashboard` | ⬜ | |
| 2.1.4 | Wrong password | Enter wrong password | Error message shown | ⬜ | |
| 2.1.5 | Empty password | Submit empty form | Validation error | ⬜ | |

**Status:** ___/5 passed

### 2.2 Admin Dashboard

| # | Test | Steps | Expected | Status | Notes |
|---|------|-------|----------|--------|-------|
| 2.2.1 | Dashboard loads | After login | Dashboard UI appears | ⬜ | |
| 2.2.2 | Navigation works | Click menu items | Pages navigate correctly | ⬜ | |
| 2.2.3 | Logout works | Click logout | Returns to login page | ⬜ | |

**Status:** ___/3 passed

---

## 📝 PHASE 3: Order Creation

### 3.1 Tier Selection Page

| # | Test | Steps | Expected | Status | Notes |
|---|------|-------|----------|--------|-------|
| 3.1.1 | Page loads | Go to `/` or `/tiers` | Tier cards displayed | ⬜ | |
| 3.1.2 | 3 tiers shown | Count tier cards | Exactly 3: Basic, Pro, Premium | ⬜ | |
| 3.1.3 | Tier descriptions | Read descriptions | Accurate for each tier | ⬜ | |
| 3.1.4 | Get Started buttons | Click each tier button | Goes to correct form | ⬜ | |

**Status:** ___/4 passed

### 3.2 Tier 1 - Basic Order Form

**Test Order:**
- Business Name: `Test Basic Co`
- Email: `test-basic@example.com`
- Archetype: `The Innovator`

| # | Test | Steps | Expected | Status | Notes |
|---|------|-------|----------|--------|-------|
| 3.2.1 | Form loads | Click Basic "Get Started" | Form appears | ⬜ | |
| 3.2.2 | Required fields marked | Inspect form | * on business, email, archetype | ⬜ | |
| 3.2.3 | Archetype selector works | Click dropdown | Shows 12 archetypes | ⬜ | |
| 3.2.4 | Empty validation | Submit empty form | Shows validation errors | ⬜ | |
| 3.2.5 | Email validation | Enter invalid email | Email format error | ⬜ | |
| 3.2.6 | Valid submission | Fill all fields, submit | Success message, order created | ⬜ | |
| 3.2.7 | Order in database | Check admin dashboard | Order appears with status "pending" | ⬜ | |

**Status:** ___/7 passed

### 3.3 Tier 2 - Pro Order Form

**Test Order:**
- Business Name: `Test Pro Co`
- Email: `test-pro@example.com`
- Archetype: `The Creator`
- Tagline: `Creating amazing things`
- Mission: `Our mission is to create`

| # | Test | Steps | Expected | Status | Notes |
|---|------|-------|----------|--------|-------|
| 3.3.1 | Additional fields | Compare to Tier 1 | Has tagline, mission fields | ⬜ | |
| 3.3.2 | All fields save | Submit form | All data in order details | ⬜ | |
| 3.3.3 | Order created | Check dashboard | Order appears with correct data | ⬜ | |

**Status:** ___/3 passed

### 3.4 Tier 3 - Premium Order Form

**Test Order:**
- Business Name: `Test Premium Co`
- Email: `test-premium@example.com`
- Archetype: `The Leader`
- Web3: Enabled
- Blockchain: Ethereum

| # | Test | Steps | Expected | Status | Notes |
|---|------|-------|----------|--------|-------|
| 3.4.1 | Web3 fields | Enable Web3 checkbox | Web3 fields appear | ⬜ | |
| 3.4.2 | File upload | Try to upload file | File selection works | ⬜ | |
| 3.4.3 | All premium fields | Fill all fields | Form submits successfully | ⬜ | |

**Status:** ___/3 passed

---

## 👨‍💼 PHASE 4: Admin Order Management

### 4.1 Order List Page

| # | Test | Steps | Expected | Status | Notes |
|---|------|-------|----------|--------|-------|
| 4.1.1 | Page loads | Go to `/admin/orders` | Orders table appears | ⬜ | |
| 4.1.2 | Orders display | Create test orders | All orders shown in table | ⬜ | |
| 4.1.3 | Columns present | Check table headers | ID, Business, Tier, Status, Date | ⬜ | |
| 4.1.4 | Filter by status | Use status filter | Only matching orders shown | ⬜ | |
| 4.1.5 | Filter by tier | Use tier filter | Only matching orders shown | ⬜ | |
| 4.1.6 | Sort by date | Click date column | Orders sort by date | ⬜ | |
| 4.1.7 | Pagination | If >25 orders | Pagination controls appear | ⬜ | |

**Status:** ___/7 passed

### 4.2 Order Detail Page

| # | Test | Steps | Expected | Status | Notes |
|---|------|-------|----------|--------|-------|
| 4.2.1 | Page loads | Click order in list | Detail page opens | ⬜ | |
| 4.2.2 | Order info shown | Review page | Business name, email, tier visible | ⬜ | |
| 4.2.3 | Logo variants | Check page | 4 logo placeholders/variants shown | ⬜ | |
| 4.2.4 | Mockup grid | Check page | 12 mockup grid (4×3) shown | ⬜ | |
| 4.2.5 | Status controls | Find status dropdown | Can change order status | ⬜ | |
| 4.2.6 | Process button | Find process button | Button exists and clickable | ⬜ | |

**Status:** ___/6 passed

### 4.3 Order Processing

**Note:** This requires Google AI API key to fully test

| # | Test | Steps | Expected | Status | Notes |
|---|------|-------|----------|--------|-------|
| 4.3.1 | Process starts | Click "Process" button | Processing indicator shows | ⬜ | |
| 4.3.2 | Logos generate | Wait for completion | 4 logos generated | ⬜ | |
| 4.3.3 | Mockups generate | Check after logos | 12 mockups generated | ⬜ | |
| 4.3.4 | Brand guide generates | Check sections | All 13 sections present | ⬜ | |
| 4.3.5 | PDF generates | Check downloads | PDF file created | ⬜ | |
| 4.3.6 | ZIP creates | Check downloads | ZIP file created | ⬜ | |
| 4.3.7 | Status updates | After completion | Status = "ready_for_review" | ⬜ | |

**Status:** ___/7 passed

### 4.4 Quality Gate (Approval)

| # | Test | Steps | Expected | Status | Notes |
|---|------|-------|----------|--------|-------|
| 4.4.1 | Can approve | Click approve button | Status changes to "approved" | ⬜ | |
| 4.4.2 | Can reject | Click reject button | Status changes to "rejected" | ⬜ | |
| 4.4.3 | Rejection reason | Reject with reason | Reason stored in order | ⬜ | |
| 4.4.4 | Customer notified | After approval | Customer token generated | ⬜ | |

**Status:** ___/4 passed

---

## 👤 PHASE 5: Customer Experience

### 5.1 Logo Selection

| # | Test | Steps | Expected | Status | Notes |
|---|------|-------|----------|--------|-------|
| 5.1.1 | Page accessible | Use selection link | Page loads with 4 logos | ⬜ | |
| 5.1.2 | Logo grid displays | Check layout | 4 logos in grid | ⬜ | |
| 5.1.3 | Preview mockups | Click "Preview Mockups" | Mockup modal opens | ⬜ | |
| 5.1.4 | Mockup modal | In modal | Shows 3 templates for selected logo | ⬜ | |
| 5.1.5 | Select logo | Click logo, confirm | Selection saved | ⬜ | |
| 5.1.6 | Cannot reselect | After selection | Selection locked | ⬜ | |

**Status:** ___/6 passed

### 5.2 Customer Dashboard

| # | Test | Steps | Expected | Status | Notes |
|---|------|-------|----------|--------|-------|
| 5.2.1 | Dashboard loads | Use token URL | Dashboard appears | ⬜ | |
| 5.2.2 | Order summary | Check top of page | Business name, tier, status shown | ⬜ | |
| 5.2.3 | Selected logo shown | Check page | Selected logo displayed | ⬜ | |
| 5.2.4 | Mockup gallery | Check page | 3 mockup templates displayed | ⬜ | |
| 5.2.5 | Download PDF | Click PDF button | PDF downloads | ⬜ | |
| 5.2.6 | Download ZIP | Click ZIP button | ZIP downloads | ⬜ | |
| 5.2.7 | Download logos | Click logos button | SVG files download | ⬜ | |
| 5.2.8 | Download mockups | Click mockups button | PNG files download | ⬜ | |

**Status:** ___/8 passed

### 5.3 Feedback & Rating

| # | Test | Steps | Expected | Status | Notes |
|---|------|-------|----------|--------|-------|
| 5.3.1 | Feedback form | Find on dashboard | Rating stars + text field | ⬜ | |
| 5.3.2 | Submit rating | Select 5 stars | Rating recorded | ⬜ | |
| 5.3.3 | Submit feedback | Add text, submit | Feedback saved | ⬜ | |
| 5.3.4 | Cannot resubmit | Try to submit again | Blocked or updated | ⬜ | |

**Status:** ___/4 passed

### 5.4 Revision Requests (Tier 2+)

| # | Test | Steps | Expected | Status | Notes |
|---|------|-------|----------|--------|-------|
| 5.4.1 | Revision form | Find on dashboard (Pro/Premium) | Form with section checkboxes | ⬜ | |
| 5.4.2 | Select sections | Check colorPalette, brandVoice | Sections selected | ⬜ | |
| 5.4.3 | Add feedback | Enter revision notes | Notes captured | ⬜ | |
| 5.4.4 | Submit request | Click submit | Request sent to admin | ⬜ | |
| 5.4.5 | Revision processed | Admin processes | New version generated (1.0 → 1.1) | ⬜ | |
| 5.4.6 | Max revisions | Try 3rd revision | Blocked (max 2) | ⬜ | |

**Status:** ___/6 passed

---

## 🔧 PHASE 6: API Testing

| # | Endpoint | Method | Test | Expected | Status |
|---|----------|--------|------|----------|--------|
| 6.1 | `/api/admin/login` | POST | Valid password | Returns token | ⬜ |
| 6.2 | `/api/admin/login` | POST | Invalid password | Returns 401 | ⬜ |
| 6.3 | `/api/admin/orders` | GET | With auth | Returns orders list | ⬜ |
| 6.4 | `/api/admin/orders` | GET | Without auth | Returns 401 | ⬜ |
| 6.5 | `/api/orders/create` | POST | Valid data | Returns order ID | ⬜ |
| 6.6 | `/api/orders/create` | POST | Invalid tier | Returns 400 | ⬜ |
| 6.7 | `/api/orders/{id}/detail` | GET | Valid ID | Returns order details | ⬜ |
| 6.8 | `/api/orders/{id}/detail` | GET | Invalid ID | Returns 404 | ⬜ |
| 6.9 | `/api/orders/{id}/select-logo` | PATCH | Valid selection | Success | ⬜ |
| 6.10 | `/api/dashboard/{token}` | GET | Valid token | Returns dashboard data | ⬜ |
| 6.11 | `/api/dashboard/{token}` | GET | Invalid token | Returns 401 | ⬜ |

**Status:** ___/11 passed

---

## 📊 Summary

| Phase | Total | Passed | Failed | Skipped | % |
|-------|-------|--------|--------|---------|---|
| 1. Foundation | 7 | | | | |
| 2. Admin Auth | 8 | | | | |
| 3. Order Creation | 17 | | | | |
| 4. Admin Management | 24 | | | | |
| 5. Customer Experience | 24 | | | | |
| 6. API Testing | 11 | | | | |
| **TOTAL** | **91** | | | | |

---

## 🐛 Issues Found

| # | Issue | Severity | Steps to Reproduce | Expected | Actual |
|---|-------|----------|-------------------|----------|--------|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

---

## ✅ Sign-off

**Tester:** _______________  
**Date:** _______________  
**Overall Status:** ⬜ PASS / ⬜ FAIL / ⬜ PARTIAL  
**Blocking Issues:** _______________  
**Ready for Production:** ⬜ YES / ⬜ NO
