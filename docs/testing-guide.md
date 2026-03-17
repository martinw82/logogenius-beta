# LogoGenius Testing Guide

Comprehensive testing checklist to verify all features work correctly before production deployment.

---

## 1. Foundation & Setup Tests

### Database Connection
- [ ] MySQL connection establishes successfully
- [ ] All 5 tables created (orders, order_details, logo_variants, brand_archetypes, admin_sessions)
- [ ] Table indexes created and optimized
- [ ] Can insert and retrieve test data
- [ ] Connection pooling working (check max connections)

```bash
mysql -u root -p -e "USE logogenius; SELECT COUNT(*) FROM orders; SHOW TABLES;"
```

### Environment Variables
- [ ] All required env vars are set
- [ ] `DATABASE_URL` connection string valid
- [ ] `ADMIN_PASSWORD` set to strong value
- [ ] `JWT_SECRET` set to random secure string
- [ ] `GENKIT_API_KEY` valid and authenticated
- [ ] File storage path writable (`FILE_STORAGE_PATH`)

```bash
printenv | grep -E "DATABASE_URL|ADMIN_PASSWORD|GENKIT_API_KEY|FILE_STORAGE"
```

### Application Startup
- [ ] `npm install` completes without errors
- [ ] `npm run build` succeeds
- [ ] `npm start` launches successfully
- [ ] No TypeScript compilation errors
- [ ] No console errors on startup
- [ ] Server listens on correct port (3000)

```bash
npm run build && npm start &
curl http://localhost:3000/api/health
```

---

## 2. Admin Authentication Tests

### Admin Login
- [ ] Can login with correct password
- [ ] Receives JWT token in response
- [ ] Cannot login with wrong password
- [ ] Token expires after expected duration
- [ ] Can logout successfully

```bash
# Login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"$ADMIN_PASSWORD"}'

# Should return {token, expiresAt}
```

### Admin Authorization
- [ ] Can access protected endpoints with valid token
- [ ] Cannot access protected endpoints without token
- [ ] Cannot access protected endpoints with invalid token
- [ ] Token validation works correctly
- [ ] Expired tokens rejected

```bash
# With token
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/admin/orders

# Without token (should fail)
curl http://localhost:3000/api/admin/orders
```

---

## 3. Tier Selection & Order Creation Tests

### Tier Selection Landing Page
- [ ] Page loads successfully at `/`
- [ ] All 3 tier cards display (Basic, Pro, Premium)
- [ ] Tier descriptions accurate
- [ ] Pricing displayed correctly
- [ ] "Get Started" buttons functional
- [ ] Responsive on mobile/tablet/desktop

### Tier 1: Basic Order Creation
- [ ] Form displays for Tier 1
- [ ] Required fields: business name, email, archetype
- [ ] Form validates empty fields
- [ ] Form validates email format
- [ ] Archetype selector shows all 12 options
- [ ] Can submit form successfully
- [ ] Order created in database with status "pending"

```bash
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "tier":"basic",
    "businessName":"Test Company",
    "email":"test@example.com",
    "archetype":"The Innovator"
  }'
```

### Tier 2: Pro Order Creation
- [ ] Form displays for Tier 2
- [ ] Additional fields: tagline, mission statement
- [ ] All validation rules enforced
- [ ] Can submit form successfully
- [ ] Order includes all provided data

### Tier 3: Premium Order Creation
- [ ] Form displays for Tier 3
- [ ] Additional fields: logo preferences, Web3 support, file uploads
- [ ] File upload validation (size, type)
- [ ] Web3 checkbox functional
- [ ] Can submit form successfully
- [ ] Order includes all provided data

---

## 4. Brand Guide Generation Tests

### Brand Guide Content
- [ ] Brand guide generates without errors
- [ ] All 13 sections present:
  - [ ] Project Overview
  - [ ] Brand Identity
  - [ ] Logo Philosophy
  - [ ] Color Palette
  - [ ] Color Accessibility
  - [ ] Typography
  - [ ] Imagery Style
  - [ ] Graphic Elements
  - [ ] Brand Voice
  - [ ] Visual Style Guide
  - [ ] Usage Rules & Don'ts
  - [ ] Web3 Section (if applicable)
  - [ ] Appendix

### Web3 Support
- [ ] Web3 section only appears when enabled
- [ ] Contains correct narrative for selected Web3 type:
  - [ ] DeFi
  - [ ] NFT
  - [ ] DAO
  - [ ] Layer 2
  - [ ] Wallet
- [ ] Text flows naturally with brand narrative

### Brand Data Accuracy
- [ ] Business name correct in guide
- [ ] Tagline correct in guide
- [ ] Color palette matches order data
- [ ] Typography matches order data
- [ ] Archetype reflected in tone/voice

---

## 5. Logo Generation Tests

### Logo Variant Generation
- [ ] 4 distinct logo variants generated
- [ ] Each variant has different style:
  - [ ] Modern Minimalist
  - [ ] Geometric/Abstract
  - [ ] Illustrative/Artistic
  - [ ] Wordmark/Typography
- [ ] All variants SVG format
- [ ] All variants under 500KB
- [ ] All variants valid SVG code

### Logo Quality Checks
- [ ] Logos are visually distinct
- [ ] Logos appropriate for business type
- [ ] Logos reflect brand archetype
- [ ] Logo colors match brand palette
- [ ] Logo readable at small sizes

---

## 6. Mockup Generation Tests

### Mockup Template Generation
- [ ] 3 mockup templates generated per logo (4 logos × 3 templates = 12 total)
- [ ] Templates display correctly:
  - [ ] Letterhead (logo on document)
  - [ ] T-Shirt (logo on apparel)
  - [ ] Business Card (logo on card)

### Mockup Quality
- [ ] Logo correctly positioned on each template
- [ ] Logo maintains aspect ratio
- [ ] Logo colors visible and distinct
- [ ] Mockup images are PNG format
- [ ] Each mockup under 1MB
- [ ] No rendering artifacts or distortion

### Logo Selection Interface
- [ ] 4 logo variants displayed in grid
- [ ] Each variant has preview button
- [ ] Can select one variant
- [ ] Selected variant highlighted
- [ ] Confirmation flow works

---

## 7. PDF Generation Tests

### PDF Document Structure
- [ ] PDF generates without errors
- [ ] PDF opens without corruption
- [ ] All 13 sections present in PDF
- [ ] Table of contents functional
- [ ] Page numbers correct

### PDF Content Accuracy
- [ ] Business name appears correctly
- [ ] All section headings present
- [ ] All section content accurate
- [ ] Color samples display correctly
- [ ] Typography samples display correctly
- [ ] Hyperlinks functional (if any)

### PDF File Quality
- [ ] PDF under 10MB
- [ ] PDF searchable (text not images)
- [ ] PDF readable on mobile viewer
- [ ] PDF prints correctly
- [ ] Metadata includes business name and date

---

## 8. ZIP Package Tests

### ZIP Structure
- [ ] ZIP file creates successfully
- [ ] ZIP contains expected files:
  - [ ] Brand guide PDF
  - [ ] README.txt
  - [ ] All 4 logo SVG files
  - [ ] All 12 mockup images (PNG)
  - [ ] (Tier 3) Figma file link
  - [ ] (Tier 3) Canva template links
  - [ ] (Tier 3) Media assets

### ZIP File Quality
- [ ] ZIP under 50MB
- [ ] ZIP extracts without errors
- [ ] All files readable after extraction
- [ ] Directory structure organized
- [ ] File names descriptive and clean

---

## 9. Admin Dashboard Tests

### Order List Page
- [ ] Page loads successfully
- [ ] All orders display in table
- [ ] Pagination works (25 orders/page)
- [ ] Can filter by status
- [ ] Can filter by tier
- [ ] Can sort by date/status
- [ ] Order count accurate

### Order Detail Page
- [ ] Page loads for selected order
- [ ] Order info displays correctly
- [ ] Customer details shown
- [ ] All 4 logo variants preview
- [ ] All 12 mockups preview in grid
- [ ] Can approve/reject order
- [ ] Status updates correctly

### Order Creation (Manual)
- [ ] Admin can manually create orders
- [ ] Can paste Fiverr order data
- [ ] Form validates input
- [ ] Order created with correct data
- [ ] Generation triggered automatically

---

## 10. Quality Gate Workflow Tests

### Order Approval
- [ ] Admin can view pending orders
- [ ] Can approve order with one click
- [ ] Order status changes to "approved"
- [ ] Customer token generated
- [ ] Approval timestamp recorded

### Order Rejection
- [ ] Admin can reject order
- [ ] Can add rejection reason
- [ ] Order status changes to "rejected"
- [ ] Reason stored in database

### Order Status Transitions
- [ ] pending → approved ✓
- [ ] pending → rejected ✓
- [ ] approved → ready_for_review ✓
- [ ] ready_for_review → archived ✓
- [ ] All transitions logged

---

## 11. Customer Dashboard Tests

### Dashboard Access
- [ ] Customer can access dashboard with token
- [ ] Dashboard URL: `/orders/[token]/dashboard`
- [ ] Cannot access without token
- [ ] Cannot access with invalid token
- [ ] Token expires after 1 year

### Dashboard Display
- [ ] Order summary shown
- [ ] Business name correct
- [ ] Selected logo displayed
- [ ] Mockup gallery shows all 3 templates
- [ ] All mockup images render correctly

### Asset Downloads
- [ ] Can download PDF
- [ ] Can download ZIP
- [ ] Can download individual logos (SVG)
- [ ] Can download individual mockups (PNG)
- [ ] All downloads work correctly
- [ ] File names are clean
- [ ] Downloads logged in database

```bash
# Test download endpoints
curl -O "http://localhost:3000/api/orders/1/download/pdf?token=$TOKEN"
curl -O "http://localhost:3000/api/orders/1/download/zip?token=$TOKEN"
```

---

## 12. Revision Request System Tests

### Revision Request (Tier 2+)
- [ ] Revision form displays for Pro/Premium
- [ ] Can select section to revise:
  - [ ] colorPalette
  - [ ] typography
  - [ ] brandVoice
  - [ ] imageryStyle
  - [ ] etc.
- [ ] Can add feedback text
- [ ] Can submit revision request
- [ ] Revision count increments
- [ ] Max 2 revisions enforced (Tier 2-3)

### Revision Processing
- [ ] Admin notified of revision request
- [ ] Revised section regenerated
- [ ] Brand guide version increments (1.0 → 1.1 → 1.2)
- [ ] Customer can download revised PDF
- [ ] Revision history tracked

---

## 13. Feedback & Rating Tests

### Customer Feedback Form
- [ ] Form displays on dashboard
- [ ] 5-star rating system functional
- [ ] Can submit 1-5 star rating
- [ ] Can enter feedback text (optional)
- [ ] Form validates input
- [ ] Can submit successfully

### Feedback Storage
- [ ] Rating stored in database
- [ ] Feedback text stored
- [ ] Timestamp recorded
- [ ] Admin can view all feedback
- [ ] Feedback appears in analytics

---

## 14. Tier 3 Premium Features Tests

### Figma Template Generation
- [ ] Figma file generates for Tier 3
- [ ] File contains brand colors
- [ ] File contains typography styles
- [ ] File contains design templates
- [ ] Customer receives Figma link
- [ ] Link opens correctly

### Canva Template Generation
- [ ] Canva templates generate for Tier 3
- [ ] Brand library created
- [ ] Color palette added to library
- [ ] Templates available in customer account
- [ ] Templates are editable

### Media Asset Suite
- [ ] Favicons generated (16×16, 32×32, 64×64, ICO)
- [ ] Social avatar generated (200×200)
- [ ] Email signatures generated (HTML + text)
- [ ] PowerPoint template generated
- [ ] Product mockups generated (mug, tote, hoodie)
- [ ] All media assets included in ZIP

---

## 15. API Endpoint Tests

### Health Check
```bash
curl http://localhost:3000/api/health
# Should return: {status: "ok"}
```

### Order Creation
```bash
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"tier":"basic","businessName":"Test","email":"test@test.com","archetype":"The Innovator"}'
```

### Order Generation
```bash
curl -X POST http://localhost:3000/api/orders/1/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Test","userApiKey":"key"}'
```

### Logo Selection
```bash
curl -X PATCH http://localhost:3000/api/orders/1/select-logo \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"selectedVariantNum":1}'
```

### Order Approval
```bash
curl -X POST http://localhost:3000/api/admin/orders/1/approve \
  -H "Authorization: Bearer $TOKEN"
```

### Dashboard Access
```bash
curl http://localhost:3000/api/orders/1/dashboard?token=$CUSTOMER_TOKEN
```

### Single-Call Test Endpoint (Credit Conservation)
For testing API connectivity and functionality using exactly 1 call per component.

```bash
# Test Logo Generation
curl -X POST http://localhost:3000/api/test/single-generation \
  -H "Content-Type: application/json" \
  -d '{"testType": "logo"}'

# Test Mockup Generation (requires logoUrl)
curl -X POST http://localhost:3000/api/test/single-generation \
  -H "Content-Type: application/json" \
  -d '{"testType": "mockup", "logoUrl": "https://example.com/logo.png"}'

# Test Social Asset Generation
curl -X POST http://localhost:3000/api/test/single-generation \
  -H "Content-Type: application/json" \
  -d '{"testType": "social"}'
```

**Expected Credit Usage:**
| Test | Credit Cost |
|------|-------------|
| Logo | ~$0.001 |
| Mockup | ~$0.01-0.05 |
| Social | ~$0.003 |
| **Total** | **~$0.015** |

### Feedback Submission
```bash
curl -X POST http://localhost:3000/api/orders/1/feedback \
  -H "X-Customer-Token: $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"feedback":"Great work!"}'
```

---

## 16. Error Handling Tests

### Invalid Input
- [ ] Reject invalid tier
- [ ] Reject invalid email
- [ ] Reject empty required fields
- [ ] Reject oversized files
- [ ] Reject invalid file types

### Error Responses
- [ ] 400 Bad Request for invalid input
- [ ] 401 Unauthorized for missing auth
- [ ] 403 Forbidden for invalid token
- [ ] 404 Not Found for missing resource
- [ ] 500 Server Error has helpful message

### Recovery
- [ ] System recovers from API timeouts
- [ ] Failed generation can be retried
- [ ] Partial failures logged appropriately
- [ ] No data corruption on errors

---

## 17. Performance Tests

### Logo Generation Time
- [ ] Logo generation under 30 seconds
- [ ] Average time under 15 seconds
- [ ] No timeouts on concurrent requests

```bash
time curl -X POST http://localhost:3000/api/orders/1/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Test","userApiKey":"key"}'
```

### PDF Generation Time
- [ ] PDF generation under 10 seconds
- [ ] No memory leaks

### Concurrent Load
- [ ] 5 simultaneous orders process successfully
- [ ] 10 simultaneous orders process successfully
- [ ] No data corruption under load
- [ ] Database handles concurrent connections

```bash
# Load test with 10 concurrent requests
ab -n 100 -c 10 http://localhost:3000/api/health
```

### File Size Optimization
- [ ] Logo SVG under 500KB each
- [ ] Mockup PNG under 1MB each
- [ ] PDF under 10MB
- [ ] ZIP under 50MB

---

## 18. Security Tests

### Authentication
- [ ] Admin password hashed (bcrypt)
- [ ] JWT token signed correctly
- [ ] Cannot forge admin token
- [ ] Cannot access admin endpoints without token

### Authorization
- [ ] Customer can only access own orders
- [ ] Admin can access all orders
- [ ] Cannot modify orders via API without auth

### Input Validation
- [ ] SQL injection attempts blocked
- [ ] XSS attempts blocked
- [ ] CSRF tokens validated (if applicable)
- [ ] File uploads validated (size, type)

### Data Protection
- [ ] Customer emails not exposed
- [ ] Passwords never logged
- [ ] Tokens not in URLs (use headers)
- [ ] Sensitive data not in error messages

---

## 19. Database Tests

### Data Integrity
- [ ] Primary keys enforced
- [ ] Foreign keys enforced
- [ ] Unique constraints enforced
- [ ] NOT NULL constraints enforced

### Queries
- [ ] Order creation inserts correctly
- [ ] Order updates work correctly
- [ ] Order deletion (soft delete) works
- [ ] Joins fetch related data correctly
- [ ] Indexes improve query performance

### Connection Management
- [ ] Connection pool maintains size
- [ ] Idle connections closed
- [ ] No connection leaks
- [ ] Timeout handling correct

---

## 20. File Handling Tests

### File Storage
- [ ] Files save to correct directory
- [ ] File names are unique
- [ ] Files are readable after save
- [ ] Large files handled correctly
- [ ] Disk space monitored

### File Types
- [ ] SVG logos valid XML
- [ ] PNG mockups valid images
- [ ] PDF valid document format
- [ ] ZIP valid archive format

### File Cleanup
- [ ] Temp files deleted after use
- [ ] No orphaned files
- [ ] Storage path writable
- [ ] Permissions set correctly

---

## 21. Cross-Browser & Device Tests

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Tablet
- [ ] iPad (landscape & portrait)
- [ ] Android tablet

### Mobile
- [ ] iPhone (latest)
- [ ] Android phone

### Responsive Features
- [ ] Navigation responsive
- [ ] Forms readable on small screens
- [ ] Images scale correctly
- [ ] Touch interactions work
- [ ] No horizontal scroll needed

---

## 22. Email Notification Tests

### Email Templates
- [ ] Order confirmation email template ready
- [ ] Order approved email template ready
- [ ] Revision request email template ready
- [ ] Download link email template ready

### Email Delivery
- [ ] Can connect to email service
- [ ] Emails send without errors
- [ ] Email content formatted correctly
- [ ] Links in emails functional
- [ ] Unsubscribe links present

```bash
# Test email service configuration
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","type":"order-approved"}'
```

---

## 23. Admin Analytics Tests

### Dashboard Metrics
- [ ] Total orders count correct
- [ ] Orders by status breakdown accurate
- [ ] Orders by tier breakdown accurate
- [ ] Average approval time calculated correctly
- [ ] Rejection rate calculated correctly
- [ ] Completion rate calculated correctly

### Customer Feedback Analytics
- [ ] Average rating calculated correctly
- [ ] Rating distribution displayed
- [ ] Common themes extracted
- [ ] Feedback filterable by rating

### Time-Series Data
- [ ] Orders per day calculated
- [ ] Orders per week calculated
- [ ] Trends displayed correctly
- [ ] Date range filtering works

### Bulk Operations
- [ ] Can approve multiple orders
- [ ] Can reject multiple orders
- [ ] Can archive multiple orders
- [ ] Can assign reviewer to multiple orders
- [ ] Bulk operations logged

---

## 24. Documentation Tests

### API Documentation
- [ ] All endpoints documented
- [ ] Request/response formats shown
- [ ] Error codes documented
- [ ] Authentication requirements clear

### Deployment Guide
- [ ] Environment variables documented
- [ ] Vercel deployment steps clear
- [ ] Docker deployment steps clear
- [ ] AWS EC2 deployment steps clear

### Font Licensing
- [ ] Commercial usage rights clear
- [ ] Attribution requirements documented
- [ ] Tier-specific licensing explained
- [ ] FAQ addresses common questions

---

## Test Execution Checklist

### Before Testing
- [ ] Database initialized and seeded
- [ ] Environment variables configured
- [ ] Application built and started
- [ ] No console errors on startup
- [ ] Admin account created

### During Testing
- [ ] Document any failures
- [ ] Note error messages
- [ ] Record performance metrics
- [ ] Take screenshots of issues
- [ ] Test on multiple browsers

### After Testing
- [ ] Compile test results
- [ ] Identify blocking issues
- [ ] Create bug reports
- [ ] Verify fixes
- [ ] Update test results

---

## Test Result Template

```
Test Run: [Date]
Tester: [Name]
Environment: [Dev/Staging/Prod]
Build: [Commit Hash]

CATEGORY: [e.g., "Tier 1 Order Creation"]
Status: [PASS / FAIL]
Tests Run: X
Passed: X
Failed: X
Notes: [Any relevant details]

Issues Found:
1. [Issue description]
   - Expected: [behavior]
   - Actual: [behavior]
   - Steps to reproduce: [steps]
   - Severity: [Critical/High/Medium/Low]
```

---

**Total Test Cases:** 200+
**Estimated Time:** 4-6 hours for full manual test suite
**Recommended:** Run automated tests for each commit, manual tests before deployment
