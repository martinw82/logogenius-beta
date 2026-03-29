# External Integrations

**Analysis Date:** 2026-03-28

## APIs & External Services

**AI Logo Generation:**
- Together AI - Primary logo generation via text-to-image models
  - SDK/Client: REST API via `src/lib/services/image-generation.ts`
  - Auth: `TOGETHER_API_KEY` env var
  - Configurable via `IMAGE_GEN_PROVIDER=together`

**AI Text Generation:**
- Google AI (Gemini) - Form auto-fill, text generation, brand archetype analysis
  - SDK/Client: `@genkit-ai/googleai` via Genkit framework
  - Auth: `GOOGLE_API_KEY` env var
  - Used in: `src/ai/dev.ts`, form auto-fill features

**Mockup Generation (switchable providers):**
- Dynamic Mockups API - Product mockup rendering
  - Auth: `DYNAMIC_MOCKUPS_API_KEY` env var
  - 1,000 free renders
- MockupsJar API - Alternative mockup provider
  - Auth: `MOCKUPSJAR_API_KEY` env var
  - 100 free/month
- MockCity API - Credit-based mockup provider
  - Auth: `MOCKCITY_API_KEY` env var
- Provider selected via `MOCKUP_PROVIDER` env var (`dynamicmockups | mockupsjar | mockcity`)
- Implementation: `src/lib/services/mockup-generation.ts`, `src/lib/services/ai-mockup-generator.ts`

**Image Hosting:**
- imgbb - Free image hosting for mockup API consumption
  - Auth: `IMGBB_API_KEY` env var
  - Implementation: `src/lib/services/image-hosting.ts`
  - Also serves images via local temp endpoint: `src/app/api/serve-image/[id]/route.ts`

**Other AI Providers (pluggable):**
- Replicate - Configurable via `IMAGE_GEN_PROVIDER=replicate`
- Fal.ai - Configurable via `IMAGE_GEN_PROVIDER=fal`
- Laozhang - Configurable via `IMAGE_GEN_PROVIDER=laozhang`
- Implementation: `src/lib/services/image-generation.ts`

## Data Storage

**Databases:**
- MySQL - Primary data store
  - Connection: `DATABASE_URL` env var
  - Client: Prisma ORM 6.19.x with custom wrapper in `src/lib/database.ts`
  - Schema: `prisma/schema.prisma`
  - Migrations: `prisma/migration.sql`, `prisma/schema.sql`

**File Storage:**
- Local filesystem - Generated assets stored locally
  - Implementation: `src/lib/services/file-manager.ts`
  - Temp image serving: `src/app/api/serve-file/route.ts`
- imgbb - Remote image hosting for API integrations

**Caching:**
- None currently implemented

## Authentication & Identity

**Admin Auth:**
- Custom JWT-based authentication
  - Implementation: `src/lib/auth.ts`, `src/lib/services/token-service.ts`
  - Token storage: JWT in cookies via `jsonwebtoken` library
  - Password hashing: `bcryptjs`
  - Admin login: `src/app/api/admin/login/route.ts`
  - Session management: `AdminSession` model in Prisma schema

**Customer Dashboard:**
- Token-based access (dashboard tokens)
  - Implementation: `src/lib/services/token-service.ts`
  - URL-based: `/api/dashboard/[token]/`

## Monitoring & Observability

**Error Tracking:**
- None detected (console.log/stdout only)

**Logs:**
- Console logging (no structured logger detected)
- Debug endpoints: `src/app/api/debug/cookies/route.ts`, `src/app/api/debug/gemini-models/route.ts`

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from Next.js + `@sparticuz/chromium` for serverless)

**CI Pipeline:**
- None detected (no `.github/workflows` found)

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - MySQL connection string
- `ADMIN_PASSWORD` - Admin login password
- `JWT_SECRET` - JWT signing secret
- `GOOGLE_API_KEY` - Google AI API key
- `TOGETHER_API_KEY` - Together AI API key

**Optional env vars:**
- `IMAGE_GEN_PROVIDER` - AI provider selection (together/replicate/fal/google/laozhang)
- `MOCKUP_PROVIDER` - Mockup API provider (dynamicmockups/mockupsjar/mockcity)
- `DYNAMIC_MOCKUPS_API_KEY`, `MOCKUPSJAR_API_KEY`, `MOCKCITY_API_KEY` - Mockup provider keys
- `IMGBB_API_KEY` - Image hosting key
- `MODE` - testing/production mode
- `NEXT_PUBLIC_BASE_URL` - Base URL for the app

**Secrets location:**
- `.env.local` (gitignored)
- `.env.example` (template with variable names)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected (no webhook sender code found)

---

*Integration audit: 2026-03-28*
*Update when adding/removing external services*
