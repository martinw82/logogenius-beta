# Codebase Structure

**Analysis Date:** 2026-03-28

## Directory Layout

```
logogenius-beta/
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma          # Prisma schema definition
│   ├── migration.sql          # Raw SQL migration
│   └── schema.sql             # Schema SQL export
├── src/
│   ├── app/                   # Next.js App Router (pages + API)
│   │   ├── api/               # API route handlers
│   │   │   ├── admin/         # Admin endpoints (login, orders, fonts)
│   │   │   ├── dashboard/     # Customer dashboard endpoints
│   │   │   ├── orders/        # Order CRUD and generation
│   │   │   ├── test/          # Test endpoints for generation
│   │   │   └── serve-*/       # File/image serving
│   │   ├── admin/             # Admin panel pages
│   │   ├── create/            # Order creation flow
│   │   ├── dashboard/         # Customer dashboard pages
│   │   ├── orders/            # Order detail pages
│   │   └── tiers/             # Pricing/tier pages
│   ├── components/            # React components
│   │   ├── admin/             # Admin-specific components
│   │   ├── ui/                # Radix UI wrappers (shadcn/ui)
│   │   └── *.tsx              # Feature components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Core library code
│   │   ├── services/          # Business logic services (25+ files)
│   │   ├── schemas/           # Zod validation schemas
│   │   ├── types/             # TypeScript type definitions
│   │   ├── data/              # Data access layer
│   │   ├── middleware/        # Request middleware
│   │   └── *.ts               # Utilities (auth, db, hash, etc.)
│   ├── ai/                    # Genkit AI flows
│   ├── types/                 # Global type definitions
│   └── utils/                 # Utility functions
├── tests/                     # Test files
│   ├── unit/                  # Unit tests
│   └── e2e-workflows.test.ts  # E2E workflow tests
├── .gsd/                      # GSD planning directory
├── .agent/                    # GSD agent definitions
├── docs/                      # Project documentation
├── scripts/                   # Build/utility scripts
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── jest.config.ts             # Jest test configuration
├── .env.example               # Environment variable template
└── AGENTS.md                  # AI agent instructions
```

## Directory Purposes

**prisma/:**
- Purpose: Database schema and migrations
- Contains: `schema.prisma` (models: BrandArchetype, Order, OrderDetail, AdminSession, LogoVariant), raw SQL migrations
- Key files: `schema.prisma`, `migration.sql`

**src/app/:**
- Purpose: Next.js App Router - pages and API routes
- Contains: Page components (`page.tsx`), layouts (`layout.tsx`), API route handlers (`route.ts`)
- Subdirectories: `api/` (32 route files), `admin/`, `create/`, `dashboard/`, `orders/`, `tiers/`, `test/`

**src/app/api/:**
- Purpose: Backend API endpoints
- Contains: Route handlers organized by domain
- Key routes: `/admin/orders/[id]/process`, `/orders/[id]/generate`, `/generate-brand-assets`, `/test/mockup-generation`

**src/components/:**
- Purpose: React UI components
- Contains: Feature components and UI primitives
- Key files: `admin-order-form.tsx` (50KB), `logo-form.tsx` (68KB), `brand-archetype-quiz.tsx`, `brand-guide-display.tsx`

**src/lib/services/:**
- Purpose: Business logic and external integrations
- Contains: 25+ service files
- Key files: `order-processor.ts` (26KB), `pdf-generator.ts` (27KB), `image-generation.ts`, `mockup-generation.ts`, `logo-prompt-builder.ts`

**src/hooks/:**
- Purpose: Custom React hooks for client-side rendering
- Contains: Canvas-based rendering hooks
- Key files: `useClientMockupGenerator.ts` (18KB), `useClientSocialGenerator.ts` (28KB)

**src/ai/:**
- Purpose: Google Genkit AI orchestration
- Contains: AI flow definitions
- Key file: `dev.ts` (Genkit dev server entry)

**src/components/ui/:**
- Purpose: Radix UI component wrappers (shadcn/ui pattern)
- Contains: Reusable UI primitives (button, dialog, select, etc.)

**tests/:**
- Purpose: Test files
- Contains: Unit tests (`tests/unit/services.test.ts`), E2E tests (`tests/e2e-workflows.test.ts`)
- Naming: `*.test.ts`

## Key File Locations

**Entry Points:**
- `src/app/page.tsx` - Landing page
- `src/app/layout.tsx` - Root layout
- `src/app/admin/layout.tsx` - Admin layout with auth guard

**Configuration:**
- `package.json` - Dependencies and npm scripts
- `tsconfig.json` - TypeScript config with path aliases
- `next.config.ts` - Next.js config
- `jest.config.ts` - Test runner config
- `.env.example` - Environment variable template

**Core Logic:**
- `src/lib/services/order-processor.ts` - Main order orchestration
- `src/lib/services/image-generation.ts` - AI logo generation
- `src/lib/services/mockup-generation.ts` - Product mockup API integration
- `src/lib/services/pdf-generator.ts` - Brand guide PDF generation
- `src/lib/database.ts` - Custom MySQL client (19KB, Prisma-compatible API)

**Testing:**
- `tests/unit/services.test.ts` - Service unit tests
- `tests/e2e-workflows.test.ts` - End-to-end workflow tests
- `tests/setup.ts` - Jest setup file

**Documentation:**
- `AGENTS.md` - Universal AI agent guide
- `PROJECT_STATUS.md` - Current project state
- `docs/` - Session logs and feature docs

## Naming Conventions

**Files:**
- kebab-case for all files (`order-processor.ts`, `use-client-mockup-generator.ts`)
- PascalCase for React components (`LogoForm.tsx`, `AdminOrderForm.tsx`)
- `page.tsx` for Next.js pages, `layout.tsx` for layouts, `route.ts` for API routes

**Directories:**
- kebab-case for all directories
- Plural for collections: `services/`, `components/`, `hooks/`, `schemas/`
- Dynamic routes: `[id]/`, `[token]/`

**Special Patterns:**
- `use*.ts` - Custom React hooks
- `*.test.ts` - Test files
- API routes follow resource hierarchy: `/api/{resource}/{id}/{action}/route.ts`

## Where to Add New Code

**New Feature:**
- Primary code: `src/lib/services/{feature-name}.ts`
- Components: `src/components/{feature-name}.tsx`
- API routes: `src/app/api/{resource}/route.ts`
- Tests: `tests/unit/{feature-name}.test.ts`

**New Component:**
- Implementation: `src/components/{ComponentName}.tsx`
- UI primitives: `src/components/ui/{component-name}.tsx`

**New API Route:**
- Definition: `src/app/api/{resource}/route.ts` or `src/app/api/{resource}/[id]/route.ts`

**Utilities:**
- Shared helpers: `src/lib/{utility-name}.ts`
- Type definitions: `src/lib/types/` or `src/types/`

## Special Directories

**.next/:**
- Purpose: Next.js build output
- Generated: Yes
- Committed: No (in `.gitignore`)

**.gsd/:**
- Purpose: GSD planning artifacts
- Generated: Yes (by GSD workflows)
- Committed: Yes (planning context preserved)

**.agent/:**
- Purpose: GSD agent definitions and skills
- Generated: Yes (by GSD installation)
- Committed: Yes (source of truth)

---

*Structure analysis: 2026-03-28*
*Update when directory structure changes*
