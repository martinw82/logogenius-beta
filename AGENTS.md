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
| `src/lib/services/mockup-generator.ts` | Mockup generator (client-side placeholder) |
| `src/lib/services/social-media-generator.ts` | Social media generator (server-side placeholder - DEPRECATED) |
| `src/hooks/useClientMockupGenerator.ts` | **NEW: Client-side mockup renderer** |
| `src/hooks/useClientSocialGenerator.ts` | **NEW: Client-side social renderer** |
| `src/lib/services/pdf-generator.ts` | PDF brand guide generator |
| `src/lib/services/order-processor.ts` | Order processing orchestration |
| `src/app/api/orders/[id]/generate/route.ts` | Logo/mockup/social generation API |
| `src/app/api/orders/[id]/upload-mockups/route.ts` | **NEW: Client mockup upload API** |
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
4. Server: Generate PDF with embedded mockups
    ↓
Done! Order status: "ready_for_review"
```

### Cost Per Order
| Tier | Logos | Mockups | Social | PDF | **Total** |
|------|-------|---------|--------|-----|-----------|
| 1 | $0.004 | FREE | - | FREE | **$0.004** |
| 2 | $0.004 | FREE | - | FREE | **$0.004** |
| 3 | $0.004 | FREE | FREE | FREE | **$0.004** |

**With $5 Together credit: 1,250 test orders!**

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

**Optional:**
```bash
IMAGE_GEN_PROVIDER=together            # together | replicate | fal | google
MODE=testing                           # testing | production
NEXT_PUBLIC_BASE_URL=http://localhost:3000
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
