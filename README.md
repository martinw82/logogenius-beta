# LogoGenius Beta

AI-powered logo and brand identity generation platform.

## 🚀 Current Status (Updated: 2026-03-14)

### ✅ What's Working

| Feature | Status | Notes |
|---------|--------|-------|
| **Database Connection** | ✅ Working | TiDB Cloud MySQL with SSL |
| **Database Tables** | ✅ All 5 tables | Orders, details, logos, archetypes, sessions |
| **Brand Archetypes** | ✅ 12 seeded | Ready for selection |
| **Admin Authentication** | ✅ JWT tokens | Secure login system |
| **Admin Dashboard** | ✅ Full management | Orders, create, view, approve |
| **AI Form Auto-Fill** | ✅ Google Gemini | FREE tier - fills brand details |
| **Logo Generation** | ✅ Together AI | 4 variants per order |
| **Mockup Generation** | ✅ **Canvas-based** | Real rendered mockups! |
| **Social Media Assets** | ✅ **Canvas-based** | 10 platforms for Tier 3 |
| **PDF Brand Guide** | ✅ With mockups | Embedded real mockup images |
| **ZIP Packaging** | ✅ All assets | Download complete package |

---

## 🎯 What Makes This Different

### Real Mockups & Social Assets (No Placeholders!)
Unlike other platforms that show text placeholders, LogoGenius renders **real mockups** using HTML5 Canvas:

- **Business Card** - Professional card with your logo
- **Letterhead** - Corporate letterhead design  
- **T-Shirt** - Apparel mockup
- **10 Social Platforms** - Instagram, Facebook, Twitter, LinkedIn, YouTube, Pinterest, TikTok, Email, Website

**How it works:**
```
Browser Canvas → Render with brand colors → Upload to server → Store in database
```

**Cost:** $0 (no API calls, pure client-side rendering)

---

## 💰 Pricing (Cost Per Order)

| Tier | What You Get | Cost |
|------|-------------|------|
| **Basic (Tier 1)** | 4 logos + 3 mockups + brand guide | **$0.004** |
| **Pro (Tier 2)** | Tier 1 + PDF guide + ZIP package | **$0.004** |
| **Premium (Tier 3)** | Tier 2 + 10 social media assets | **$0.004** |

**With $5 Together AI credit: 1,250 test orders!**

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 + React 18
- **Language:** TypeScript
- **Database:** MySQL (TiDB Cloud)
- **ORM:** Prisma 6.19.2
- **Auth:** JWT (jsonwebtoken)
- **Styling:** Tailwind CSS + shadcn/ui
- **AI Providers:** Together AI, Replicate, Fal, Google, Laozhang
- **Mockup APIs:** Dynamic Mockups, MockupsJar, MockCity (switchable)
- **PDF:** jsPDF
- **Mockups:** HTML5 Canvas (client-side) + API-based (server-side)

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
│   ├── hooks/                  # Custom hooks
│   │   ├── useClientMockupGenerator.ts    # NEW: Mockup renderer
│   │   └── useClientSocialGenerator.ts    # NEW: Social renderer
│   ├── lib/                    # Utilities
│   │   ├── auth.ts             # JWT auth
│   │   ├── database.ts         # Database client
│   │   └── services/           # Business logic
│   │       ├── image-generation.ts        # AI provider abstraction (5 providers)
│   │       ├── mockup-generation.ts       # Mockup API abstraction (3 providers)
│   │       ├── ai-mockup-generator.ts     # Smart routing (API → AI fallback)
│   │       ├── image-hosting.ts           # Base64-to-URL bridge
│   │       ├── pdf-generator.ts           # PDF with mockups
│   │       └── order-processor.ts         # Asset orchestration
│   └── ai/flows/               # AI generation flows
├── prisma/
│   └── schema.prisma           # Database schema
├── docs/                       # Documentation
│   ├── SESSION_*.md            # Session logs
│   ├── ENVIRONMENT_VARIABLES.md
│   └── ...
└── tests/                      # Test suite
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL database (local or TiDB Cloud)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/logogenius-beta.git
cd logogenius-beta

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔧 Environment Variables

**Required:**
```bash
DATABASE_URL=mysql://user:pass@host:3306/db
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=random_string_32_chars
GOOGLE_API_KEY=your_gemini_key          # For form auto-fill (free)
TOGETHER_API_KEY=your_together_key      # For logo generation
```

**Optional:**
```bash
IMAGE_GEN_PROVIDER=together             # together | replicate | fal | google | laozhang
MODE=testing                            # testing | production
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Mockup API (photo-realistic product mockups)
MOCKUP_PROVIDER=dynamicmockups          # dynamicmockups | mockupsjar | mockcity
DYNAMIC_MOCKUPS_API_KEY=your_key        # 1,000 free renders
IMGBB_API_KEY=your_key                  # Free image hosting (for MockupsJar/MockCity only)
```

See `docs/ENVIRONMENT_VARIABLES.md` for complete reference.

---

## 🧪 Testing the Flow

### Admin Login
1. Visit: `http://localhost:3000/admin/login`
2. Username: `admin`
3. Password: (from `ADMIN_PASSWORD` env var)

### Create & Generate Order
1. Go to `/admin/create-order`
2. Fill business name and industry
3. Click **"Auto-Fill with AI"** (optional but cool)
4. Submit order
5. Go to order detail
6. Click **"Generate Logos"**
7. Watch the magic happen:
   - 4 logos generate (5s)
   - 3 mockups render (2s)
   - 10 social assets render (5s) [Tier 3]
8. Download PDF and ZIP

---

## 📖 Documentation

- `AGENTS.md` - Universal guide for AI agents
- `PROJECT_STATUS.md` - Current project state
- `docs/SESSION_*.md` - Session history
- `docs/ENVIRONMENT_VARIABLES.md` - Complete env var reference
- `docs/PROVIDER_MIGRATION_GUIDE.md` - Switching AI providers
- `docs/MOCKUP_SOCIAL_INTEGRATION.md` - Mockup/social feature docs (Canvas + API)
- `docs/MOCKUP_API_RESEARCH.md` - Mockup API research and implementation status

---

## 🎨 Order Generation Flow

```
Customer selects tier → Fills form → Submits order
                                          ↓
Admin reviews → Clicks "Generate Logos"
                                          ↓
    ┌─────────────────────────────────────────────┐
    │  1. AI generates 4 logo variants            │
    │  2. Canvas renders 3 mockups                │
    │  3. Canvas renders 10 social assets (T3)    │
    │  4. PDF generated with embedded mockups     │
    │  5. ZIP packaged with all assets            │
    └─────────────────────────────────────────────┘
                                          ↓
Order status: "ready_for_review" → Admin approves
                                          ↓
Customer gets email → Accesses dashboard → Downloads assets
```

---

## 🚦 Deployment

### Vercel (Recommended)

```bash
# Push to beta branch
git push origin beta

# Connect GitHub repo to Vercel
# Add environment variables in Vercel dashboard
# Deploy!
```

**Required Vercel Env Vars:**
- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `GOOGLE_API_KEY`
- `TOGETHER_API_KEY`

---

## Switching Providers

### Logo Generation Provider
Change one env var to switch logo provider:

```bash
IMAGE_GEN_PROVIDER=together    # Default (cheap, $0.001/image)
IMAGE_GEN_PROVIDER=replicate   # Production (Google Imagen 3, $0.05/image)
IMAGE_GEN_PROVIDER=fal         # Fast ($0.15/image)
IMAGE_GEN_PROVIDER=google      # Direct Google Imagen ($0.04/image)
IMAGE_GEN_PROVIDER=laozhang    # Alternative ($0.05/image)
```

### Mockup Generation Provider
Switch between 3 mockup API providers for photo-realistic product mockups:

```bash
MOCKUP_PROVIDER=dynamicmockups   # Default: 1,000 free renders, FormData binary upload
MOCKUP_PROVIDER=mockupsjar       # 100 free/month, needs IMGBB_API_KEY for base64 logos
MOCKUP_PROVIDER=mockcity         # Credit-based, any PSD template, needs IMGBB_API_KEY
```

**How base64 logos reach the API:**
- Dynamic Mockups: decoded to binary and sent via FormData (works everywhere, even localhost)
- MockupsJar/MockCity: auto-uploaded to imgbb (free) or served via local temp endpoint

**No API key?** System falls back to AI-generated product photography automatically.

---

## 🐛 Troubleshooting

### Logo generation fails
- Check `TOGETHER_API_KEY` is set
- Check API key has credits

### Mockups not showing
- Check browser console for Canvas errors
- Verify order has completed generation

### Database connection fails
- Check `DATABASE_URL` format
- Ensure SSL is configured for TiDB Cloud

---

## 📞 Support

For issues:
1. Check `PROJECT_STATUS.md` for known issues
2. Check `docs/SESSION_*.md` for recent changes
3. Check Vercel Function Logs
4. Check Browser Console

---

## 📊 Project Stats

- **Total Features:** 40+ implemented
- **Sprints Completed:** 6/6
- **Code Lines:** ~15,000+
- **Test Orders:** 1,250 per $5 credit

---

**Last Updated:** 2026-03-17
**Branch:** beta
**Status:** Ready for testing and deployment
