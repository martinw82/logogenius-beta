# Architecture

**Analysis Date:** 2026-03-28

## Pattern Overview

**Overall:** Next.js 15 App Router full-stack monolith

**Key Characteristics:**
- Server-rendered pages with API routes in same codebase
- Service-oriented backend (services in `src/lib/services/`)
- Client-side canvas rendering for mockups and social assets
- Pluggable AI provider system with smart fallback
- Admin/customer dual-interface architecture

## Layers

**Presentation Layer:**
- Purpose: Render UI for admin panel and customer-facing pages
- Location: `src/app/`, `src/components/`
- Contains: Next.js pages, React components, UI primitives
- Depends on: API layer for data, hooks for client-side rendering
- Used by: Browser clients

**API Layer:**
- Purpose: Handle HTTP requests, validate input, orchestrate services
- Location: `src/app/api/`
- Contains: Route handlers (GET, POST, PUT, DELETE)
- Depends on: Service layer, database layer
- Used by: Presentation layer (client components)

**Service Layer:**
- Purpose: Business logic, external API integration, data processing
- Location: `src/lib/services/`
- Contains: 25+ service files for image generation, mockups, PDFs, orders, etc.
- Depends on: External APIs, database layer
- Used by: API routes, admin order processing

**Data Layer:**
- Purpose: Database access and data persistence
- Location: `src/lib/database.ts`, `prisma/schema.prisma`
- Contains: Custom MySQL client (Prisma-compatible API), schema definitions
- Depends on: MySQL database via `mysql2`
- Used by: Service layer, API routes

**AI/Generation Layer:**
- Purpose: AI model orchestration for logo, text, and image generation
- Location: `src/ai/`, `src/lib/services/image-generation.ts`
- Contains: Genkit flows, prompt builders, provider adapters
- Depends on: External AI APIs (Together AI, Google Gemini)
- Used by: Service layer (order processing)

## Data Flow

**Order Creation & Logo Generation:**

1. Customer submits order via `/create` page → `POST /api/orders/create`
2. Admin triggers generation via `/admin/orders/[id]` → `POST /api/orders/[id]/generate`
3. Server generates 4 logo variants via Together AI (~5s) → saved as SVG in `LogoVariant` table
4. Client renders 3 canvas mockups via `useClientMockupGenerator` hook (~2s)
5. Client renders 10 social assets via `useClientSocialGenerator` hook (~5s) [Tier 3 only]
6. Client auto-uploads rendered assets to server via `POST /api/orders/[id]/upload-mockups`
7. Server generates product mockups via external API (smart routing with fallback)
8. Server generates PDF brand guide with embedded mockups
9. Order status changes to `ready_for_review`
10. Customer views via dashboard token URL

**Admin Authentication:**

1. Admin submits credentials at `/admin/login` → `POST /api/admin/login`
2. Server validates against `ADMIN_PASSWORD` + bcrypt hash
3. JWT token created and stored in cookie
4. Subsequent requests verified via `src/lib/auth.ts`

**State Management:**
- Server-side: MySQL database (orders, details, logo variants, admin sessions)
- Client-side: React state + hooks (no global state management library)
- Form state: `react-hook-form` with Zod validation

## Key Abstractions

**Service Classes:**
- Purpose: Encapsulate business logic for each domain
- Examples: `src/lib/services/order-processor.ts`, `src/lib/services/image-generation.ts`, `src/lib/services/mockup-generation.ts`, `src/lib/services/pdf-generator.ts`
- Pattern: Module exports (not classes), functional approach

**Provider Adapters:**
- Purpose: Switch between external service providers
- Examples: `src/lib/services/image-generation.ts` (AI providers), `src/lib/services/mockup-generation.ts` (mockup providers)
- Pattern: Strategy pattern with environment-based selection

**Custom Hooks:**
- Purpose: Client-side rendering and state management
- Examples: `src/hooks/useClientMockupGenerator.ts`, `src/hooks/useClientSocialGenerator.ts`
- Pattern: React hooks with Canvas API

**Route Handlers:**
- Purpose: HTTP endpoint handlers in Next.js App Router
- Examples: `src/app/api/orders/[id]/generate/route.ts`, `src/app/api/admin/login/route.ts`
- Pattern: Exported `GET`/`POST`/`PUT`/`DELETE` async functions

## Entry Points

**Pages:**
- `src/app/page.tsx` - Landing page / order creation
- `src/app/admin/` - Admin panel (protected by JWT)
- `src/app/orders/[id]/` - Order detail page
- `src/app/dashboard/[token]/` - Customer dashboard (token-based)
- `src/app/create/` - Order creation flow

**API Routes:**
- `src/app/api/orders/` - Order CRUD and generation
- `src/app/api/admin/` - Admin operations (login, orders, fonts, analytics)
- `src/app/api/dashboard/` - Customer dashboard API
- `src/app/api/test/` - Test endpoints for individual generation types

**Background Processes:**
- `src/ai/dev.ts` - Genkit development server entry point

## Error Handling

**Strategy:** Try/catch at API route level, service-level error propagation

**Patterns:**
- API routes wrap service calls in try/catch, return JSON error responses
- Services throw descriptive errors caught by routes
- Client components show toast notifications for errors
- No centralized error middleware detected

## Cross-Cutting Concerns

**Logging:**
- `console.log` / `console.error` throughout (no structured logger)

**Validation:**
- Zod schemas in `src/lib/schemas/`
- `react-hook-form` with `@hookform/resolvers` for client-side validation

**Authentication:**
- JWT middleware in `src/lib/auth.ts`
- Admin routes protected by `src/lib/middleware/` (if exists) or inline checks

---

*Architecture analysis: 2026-03-28*
*Update when major patterns change*
