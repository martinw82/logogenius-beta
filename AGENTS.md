# AGENTS.md - LogoGenius Beta

> **Universal Guide for AI Agents Working on This Project**

This file tells you which documentation to read first and how to maintain project context.

---

## 🎯 Read These Files FIRST (In Order)

When you start a new session, read these files in this exact order:

| Order | File | Purpose |
|-------|------|---------|
| 1 | `PROJECT_STATUS.md` | **Current state of the project** - What's working, what's not, what's next |
| 2 | `docs/SESSION_*.md` (latest) | **What we did last** - Most recent session summary |
| 3 | `README.md` | **Project overview** - High-level architecture and quick start |
| 4 | `.env.local` | **Current environment config** (if exists) |

---

## 📁 Documentation Hierarchy

```
AGENTS.md                    ← You are here (Universal guide)
PROJECT_STATUS.md            ← Current project state (ALWAYS read first)
README.md                    ← Project overview
│
docs/
├── SESSION_YYYY-MM-DD.md    ← Session logs (read latest first)
├── roadmap.md               ← Sprint planning & task breakdown
├── ENVIRONMENT_VARIABLES.md ← All env vars documented
├── MOCKUP_SOCIAL_INTEGRATION.md ← Mockup/social feature docs
├── AI_WORKFLOW_ARCHITECTURE.md  ← AI provider system
├── PROVIDER_MIGRATION_GUIDE.md  ← Switching AI providers
└── ...                      ← Other feature docs
```

---

## 🏗️ Key Architecture Files

### Core Application
| File | Purpose |
|------|---------|
| `src/lib/services/image-generation.ts` | AI provider abstraction (Together, Replicate, Fal, Google, Laozhang) |
| `src/lib/services/mockup-generation.ts` | **Mockup API provider abstraction (Dynamic Mockups, MockupsJar, MockCity)** |
| `src/lib/services/ai-mockup-generator.ts` | **Smart routing: tries real mockup API first, falls back to AI-generated** |
| `src/lib/services/image-hosting.ts` | **Base64-to-URL bridge (imgbb upload or local temp serve)** |
| `src/hooks/useClientMockupGenerator.ts` | Client-side mockup renderer (Canvas) |
| `src/hooks/useClientSocialGenerator.ts` | Client-side social renderer (Canvas) |
| `src/lib/services/pdf-generator.ts` | PDF brand guide generator |
| `src/lib/services/order-processor.ts` | Order processing orchestration |
| `src/app/api/orders/[id]/generate/route.ts` | Logo/mockup/social generation API |
| `src/app/api/orders/[id]/upload-mockups/route.ts` | Client mockup upload API |
| `src/app/api/serve-image/[id]/route.ts` | **Temp image serving for mockup APIs** |
| `src/app/api/test/mockup-generation/route.ts` | **Test endpoint for mockup providers** |
| `src/app/api/test/single-generation/route.ts` | **Single-call test endpoint (logo/mockup/social)** |
| `src/app/api/generate-brand-assets/route.ts` | **BrandSheet: Server-side mockup/social generation** |
| `src/app/admin/orders/[id]/page.tsx` | Admin order detail with generation UI |

### Database
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema |
| `src/lib/database.ts` | Custom MySQL client (Prisma-compatible API) |

---

## ✅ Task Completion Protocol

**After EVERY task completed (not just session), update these files:**

### 1. Update PROJECT_STATUS.md
- Mark completed features as ✅
- Update "Current Status" section
- Add any new blockers
- Update "Next Steps" if priorities changed

### 2. Create/Update Session Log
If starting new session:
- Create `docs/SESSION_YYYY-MM-DD.md`
- Use template from previous session

If continuing session:
- Append to current session file
- Update "Last Updated" timestamp

### 3. Update This File (AGENTS.md) IF:
- New file patterns emerge
- Architecture changes significantly
- New environment variables required

---

## 🔄 Session Start Checklist

Before you write any code:

- [ ] Read `PROJECT_STATUS.md` - know current state
- [ ] Read latest `docs/SESSION_*.md` - know what was done
- [ ] Read `README.md` - refresh on architecture
- [ ] Check for any `.env.local` or `.env.example` changes
- [ ] Ask user: "yo yo wa blow - what we tackling today?"

---

## 📝 Session Log Template

When creating new `docs/SESSION_YYYY-MM-DD.md`:

```markdown
# Session Summary - [DATE]

**Status:** [In Progress / Completed / Blocked]

## ✅ Tasks Completed

### Task 1: [Task Name]
- [x] Sub-task A
- [x] Sub-task B

**Files Modified:**
- `src/.../file.ts` - Description

**Decisions Made:**
- Decision 1

---

## 🎯 Current State

### What's Working
1. Feature A
2. Feature B

### What's In Progress
1. Feature C (80%)

### Blockers
- None / [Describe blocker]

---

## 📋 Next Steps

### Immediate
1. [ ] Next task

### Short Term
1. [ ] Future task

---

*Last Updated: [TIMESTAMP]*
```

---

## 🎨 Current Architecture (Quick Reference)

### Order Generation Flow
```
Admin clicks "Generate Logos"
    ↓
1. Server: Generate 4 logos (Together AI) ~5s
    ↓
2. Client: Render 3 mockups (Canvas) ~2s
   → Auto-upload to server
    ↓
3. Client: Render 10 social assets (Canvas) ~5s [Tier 3 only]
   → Auto-upload to server
    ↓
4. Server: Generate product mockups via API (if configured)
   → Smart routing: tries real mockup API first, falls back to AI
   → Base64 logos auto-converted to public URLs for API consumption
    ↓
5. Server: Generate PDF with embedded mockups
    ↓
Done! Order status: "ready_for_review"
```

### Mockup Generation (Two Systems)
```
System 1: Canvas mockups (client-side, FREE)
  → Business card, letterhead, t-shirt
  → Generated in browser, uploaded to server

System 2: API mockups (server-side, paid)
  → Photo-realistic product mockups via 3rd-party API
  → 3 switchable providers: Dynamic Mockups, MockupsJar, MockCity
  → Base64 → URL bridge: Dynamic Mockups uses FormData binary upload,
    others use imgbb or local temp serve
  → Smart fallback: if no API key configured, falls back to AI-generated
```

### Cost Per Order
| Tier | Logos | Canvas Mockups | API Mockups | Social | PDF | **Total** |
|------|-------|---------------|-------------|--------|-----|-----------|
| 1 | $0.004 | FREE | ~$0.15 (optional) | - | FREE | **$0.004-0.15** |
| 2 | $0.004 | FREE | ~$0.15 (optional) | - | FREE | **$0.004-0.15** |
| 3 | $0.004 | FREE | ~$0.15 (optional) | FREE | FREE | **$0.004-0.15** |

---

## 🔧 Required Environment Variables

**Minimum for testing:**
```bash
DATABASE_URL=mysql://user:pass@host:3306/db
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=random_string_32_chars
GOOGLE_API_KEY=from_ai.google_dev      # For form auto-fill
TOGETHER_API_KEY=from_together_xyz     # For logo generation
```

**Optional - Image Generation:**
```bash
IMAGE_GEN_PROVIDER=together            # together | replicate | fal | google | laozhang
MODE=testing                           # testing | production
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Optional - Mockup Generation (API-based product mockups):**
```bash
MOCKUP_PROVIDER=dynamicmockups        # dynamicmockups | mockupsjar | mockcity
DYNAMIC_MOCKUPS_API_KEY=xxx           # 1,000 free renders (best free tier)
MOCKUPSJAR_API_KEY=xxx                # 100 free/month
MOCKCITY_API_KEY=xxx                  # Credit-based, any PSD template
IMGBB_API_KEY=xxx                     # Free image hosting (needed for MockupsJar/MockCity)
```

See `docs/ENVIRONMENT_VARIABLES.md` for complete reference.

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Mockups not generating | Check browser console for canvas errors |
| Social assets missing | Verify order tier is "premium" |
| PDF not showing mockups | Check mockups saved as base64 in OrderDetail |
| PDF font errors | **FIXED** - Typography system will embed fonts (Helvetica.afm missing in Vercel) |
| Logo generation fails | Check TOGETHER_API_KEY |

**Note:** Typography system planned (~11 days) - will add font selection, uploads, and PDF embedding.

---

## 📞 Getting Help

1. Check `PROJECT_STATUS.md` for known issues
2. Check latest session log for recent context
3. Check `docs/` for feature-specific documentation
4. Ask the user - they know the business context

---

**Remember:** When in doubt, read the docs. When still in doubt, ask the user. 

**Greeting:** "Yo yo wa blow! What we tackling today?" 
