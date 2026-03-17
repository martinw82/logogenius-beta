# Environment Variables Reference

Complete list of all environment variables used by LogoGenius.

---

## ✅ Required Variables

These MUST be set for the application to work:

### 1. Database
```bash
DATABASE_URL=mysql://username:password@host:port/database?sslmode=require
```
**Get from:** Railway, PlanetScale, AWS RDS, DigitalOcean Managed DB, or your own VPS

**Format:**
- Local: `mysql://root:password@localhost:3306/logogenius`
- Production: `mysql://user:pass@host:3306/db?sslmode=require`

---

### 2. Admin Authentication
```bash
ADMIN_PASSWORD=your-secure-admin-password-here
JWT_SECRET=your-jwt-secret-key-here
```

| Variable | Purpose | How to Generate |
|----------|---------|-----------------|
| `ADMIN_PASSWORD` | Password for admin panel | Choose a strong password (12+ chars) |
| `JWT_SECRET` | Signing key for auth tokens | `openssl rand -base64 32` |

---

### 3. Google AI Key (for Form Auto-Fill)
```bash
GOOGLE_API_KEY=your_google_ai_key_here
```
**Get from:** https://ai.google.dev
**Cost:** FREE (60 requests/minute)
**Used for:**
- Form auto-fill (admin & customer)
- Brand guide text generation
- Mission statement suggestions

**Setup:**
1. Go to https://ai.google.dev
2. Sign in with Google
3. Click "Get API Key"
4. Copy the key

---

### 4. Image Generation (Pick ONE)

You need at least one image generation provider. For testing, we recommend **Together AI** (cheapest).

#### Option A: Together AI (Recommended for Testing)
```bash
TOGETHER_API_KEY=your_together_api_key_here
IMAGE_GEN_PROVIDER=together
```
**Cost:** ~$0.001/image  
**Free Credit:** $5 on signup (~5000 images)  
**Signup:** https://api.together.xyz

#### Option B: Replicate (Recommended for Production)
```bash
REPLICATE_API_KEY=your_replicate_api_key_here
IMAGE_GEN_PROVIDER=replicate
```
**Cost:** ~$0.05/image  
**Free Credit:** $5 on signup (~100 images)  
**Signup:** https://replicate.com  
**Quality:** Google Imagen 3 (excellent logo quality)

#### Option C: Fal.ai (Fastest)
```bash
FAL_API_KEY=your_fal_api_key_here
IMAGE_GEN_PROVIDER=fal
```
**Cost:** ~$0.15/image  
**Signup:** https://fal.ai

#### Option D: Google Imagen (Direct)
```bash
GOOGLE_API_KEY=your_google_api_key_here
IMAGE_GEN_PROVIDER=google
```
**Cost:** ~$0.04/image  
**Setup:** More complex (requires Google Cloud project)

---

## ⚙️ Optional Variables

### Mockup Generation Provider

LogoGenius supports 3 switchable mockup API providers for generating photo-realistic product mockups.

```bash
MOCKUP_PROVIDER=dynamicmockups
```
**Options:** `dynamicmockups` | `mockupsjar` | `mockcity`
**Default:** `dynamicmockups`

| Provider | Key | Cost | Free Tier | Notes |
|----------|-----|------|-----------|-------|
| Dynamic Mockups | `DYNAMIC_MOCKUPS_API_KEY` | ~$0.05/render | 1,000 renders forever | Best free tier, supports binary upload |
| MockupsJar | `MOCKUPSJAR_API_KEY` | ~€0.045/render | 100/month | 700+ templates |
| MockCity | `MOCKCITY_API_KEY` | Credit-based | Pay as you go | Any PSD template |

```bash
# Provider 1: Dynamic Mockups (Recommended)
# Signup: https://dynamicmockups.com
DYNAMIC_MOCKUPS_API_KEY=your_key_here

# Provider 2: MockupsJar
# Signup: https://mockupsjar.com/api
MOCKUPSJAR_API_KEY=your_key_here

# Provider 3: MockCity
# Signup: https://mockcity.com
MOCKCITY_API_KEY=your_key_here
```

**Smart Fallback:** If no mockup API key is configured, the system falls back to AI-generated product photography (Together AI).

---

### Image Hosting (for Mockup APIs)

Logos are stored as base64 data URLs. External mockup APIs need public URLs. This utility bridges the gap.

```bash
IMGBB_API_KEY=your_imgbb_key_here
```
**Get from:** https://api.imgbb.com/ (free, unlimited uploads)

**When is this needed?**
- **Dynamic Mockups:** NOT needed (supports binary file upload via FormData)
- **MockupsJar / MockCity:** REQUIRED (these APIs need a public image URL)
- **Production with `NEXT_PUBLIC_BASE_URL`:** Not needed (uses local temp serve instead)

---

### Application URLs
```bash
NEXT_PUBLIC_BASE_URL=https://logogenius.com
NEXT_PUBLIC_SITE_URL=https://logogenius.com
```
**Used for:**
- Email links (order confirmations, notifications)
- SEO metadata
- Social sharing previews

**Default:** `http://localhost:9002` (development)

---

### Mode Selection
```bash
MODE=testing
```
**Options:**
- `testing` - Uses cheaper/faster options, placeholder mockups
- `production` - Uses high-quality settings

**Default:** `testing`

---

### Cost Tracking
```bash
TRACK_GENERATION_COSTS=true
```
**Used for:** Logging AI usage costs  
**Default:** `false`

---

## 🔌 Provider-Specific API Keys

Depending on which provider you choose, you need different keys:

| Provider | Required Key | Cost/Image | Free Tier |
|----------|-------------|------------|-----------|
| Together AI | `TOGETHER_API_KEY` | $0.001 | $5 credit |
| Replicate | `REPLICATE_API_KEY` | $0.05 | $5 credit |
| Fal.ai | `FAL_API_KEY` | $0.15 | $1 credit |
| Google | `GOOGLE_API_KEY` | $0.04 | None |
| Laozhang | `LAOZHANG_API_KEY` | $0.05 | Check site |

---

## 📋 Quick Setup Guide

### For Local Development
```bash
# .env.local
DATABASE_URL=mysql://root:password@localhost:3306/logogenius
ADMIN_PASSWORD=admin123
JWT_SECRET=dev-secret-key
GOOGLE_API_KEY=your_google_key
TOGETHER_API_KEY=your_together_key
IMAGE_GEN_PROVIDER=together
MODE=testing
```

### For Production (Vercel)
```bash
# Required
DATABASE_URL=mysql://user:pass@host:3306/db?sslmode=require
ADMIN_PASSWORD=super-secure-password
JWT_SECRET=openssl-rand-base64-32-output
GOOGLE_API_KEY=your_google_key
REPLICATE_API_KEY=your_replicate_key
IMAGE_GEN_PROVIDER=replicate
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### For Production (VPS - Full Features)
```bash
# Required
DATABASE_URL=mysql://user:pass@localhost:3306/logogenius
ADMIN_PASSWORD=super-secure-password
JWT_SECRET=openssl-rand-base64-32-output
GOOGLE_API_KEY=your_google_key
REPLICATE_API_KEY=your_replicate_key
IMAGE_GEN_PROVIDER=replicate
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
MODE=production

# Mockup Generation (photo-realistic product mockups)
MOCKUP_PROVIDER=dynamicmockups
DYNAMIC_MOCKUPS_API_KEY=your_key

# Optional - for Tier 3 features
FIGMA_API_TOKEN=your_figma_token
CANVA_API_KEY=your_canva_key
CANVA_TEAM_ID=your_team_id
```

---

## 🔐 Security Best Practices

1. **Never commit `.env.local` to git**
   - It's already in `.gitignore`
   - Use `.env.example` for templates only

2. **Use strong passwords**
   - `ADMIN_PASSWORD`: 16+ characters, mixed case, numbers, symbols
   - `JWT_SECRET`: 32+ random characters

3. **Rotate API keys regularly**
   - Set calendar reminders every 3-6 months
   - Most providers let you regenerate keys instantly

4. **Use different keys for dev/prod**
   - Don't use production keys in development
   - Set spending limits on AI provider accounts

5. **Monitor usage**
   - Enable `TRACK_GENERATION_COSTS=true`
   - Set up billing alerts on AI provider dashboards

---

## 🐛 Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` format
- Verify database exists and user has permissions
- For remote DB: ensure IP whitelist includes your server

### "Google API key not configured"
- Set `GOOGLE_API_KEY`
- Verify key is active at https://ai.google.dev
- Check key has Generative Language API enabled

### "Together API key not configured"
- Set `TOGETHER_API_KEY` or `REPLICATE_API_KEY`
- Verify key format (usually starts with specific prefix)
- Check provider dashboard for credit balance

### "Invalid JWT token" / "Authentication failed"
- Verify `JWT_SECRET` is set
- If you changed `JWT_SECRET`, all existing sessions are invalidated
- Clear browser cookies and log in again

---

## 📊 Cost Estimation

### Monthly Costs (100 orders/month)

| Component | Provider | Cost |
|-----------|----------|------|
| Database | Railway | $5-20 |
| Hosting | Vercel | $0-20 |
| AI Form Fill | Google | $0 (free tier) |
| Logo Generation | Together | $0.40 (400 images) |
| **Total** | - | **$5-40/month** |

### Monthly Costs (Production Quality, 100 orders)

| Component | Provider | Cost |
|-----------|----------|------|
| Database | Railway | $5-20 |
| Hosting | VPS | $10-20 |
| AI Form Fill | Google | $0 (free tier) |
| Logo Generation | Replicate | $20 (400 images) |
| Canvas Mockups | Client-side | $0 |
| API Mockups (3/order) | Dynamic Mockups | $15 (300 renders) |
| Social Media | Canvas | $0 (client-side) |
| **Total** | - | **$50-75/month** |

---

## 📝 Example .env.local

```bash
# ==========================================
# LogoGenius - Environment Variables
# ==========================================

# Database (Required)
DATABASE_URL=mysql://logogenius:securepass@db.logogenius.com:3306/logogenius_prod?sslmode=require

# Admin Auth (Required)
ADMIN_PASSWORD=LG2024!SecureAdmin#
JWT_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890AbCdEfGhIjKlMnOpQrStUvWxYz

# Google AI (Required for form auto-fill)
GOOGLE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Image Generation (Pick one)
# Together AI - Testing
TOGETHER_API_KEY=cc6f0c53f26b4f26af83f29b3220671b9c93de4c7e3e2f2fbd3b4f26af83f29
IMAGE_GEN_PROVIDER=together

# OR Replicate - Production
# REPLICATE_API_KEY=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# IMAGE_GEN_PROVIDER=replicate

# Application URLs
NEXT_PUBLIC_BASE_URL=https://logogenius.com
NEXT_PUBLIC_SITE_URL=https://logogenius.com

# Mode
MODE=production
TRACK_GENERATION_COSTS=true
```

---

Need help setting up any of these? Just ask! 🚀
