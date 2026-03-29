# Technology Stack

**Analysis Date:** 2026-03-28

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code (frontend + backend via Next.js)

**Secondary:**
- CSS - Tailwind utility classes via `globals.css`
- SQL - Raw migration scripts in `prisma/migration.sql`

## Runtime

**Environment:**
- Node.js (ES2017 target, bundled via Next.js)
- Browser runtime for React components

**Package Manager:**
- npm (scripts use `npm run` commands)
- Lockfile: `package-lock.json` assumed (standard for Next.js)

## Frameworks

**Core:**
- Next.js 15.5.x - Full-stack React framework with App Router
- React 18.3.x - UI component library
- Tailwind CSS 3.4.x - Utility-first CSS framework

**Testing:**
- Jest 29.7.x - Test runner with `ts-jest` preset
- jest-environment-node - Node.js test environment

**Build/Dev:**
- TypeScript 5.9.3 - Type checking (`tsc --noEmit`)
- PostCSS 8.x - CSS processing
- prisma 6.19.x - Database schema management and client generation

## Key Dependencies

**Critical:**
- `next` ^15.5.12 - Core framework
- `@prisma/client` ^6.19.2 - Database ORM (MySQL)
- `mysql2` ^3.19.1 - MySQL driver
- `jsonwebtoken` ^9.0.3 - JWT authentication for admin sessions
- `zod` ^3.24.2 - Runtime validation
- `genkit` ^1.8.0 - Google AI orchestration (Genkit framework)

**AI/Generation:**
- `@genkit-ai/googleai` ^1.8.0 - Google AI integration via Genkit
- `sharp` ^0.34.5 - Image processing

**PDF/Document:**
- `jspdf` ^4.2.0 - PDF generation
- `pdfkit` ^0.17.2 - PDF generation (alternative)
- `puppeteer-core` ^21.0.0 - Browser-based PDF rendering
- `@sparticuz/chromium` ^119.0.0 - Chromium for serverless Puppeteer
- `handlebars` ^4.7.8 - Template rendering for PDFs

**UI:**
- `@radix-ui/*` - Headless UI component primitives (20+ packages)
- `framer-motion` ^11.1.15 - Animations
- `recharts` ^2.15.1 - Data visualization
- `lucide-react` ^0.475.0 - Icon library
- `react-hook-form` ^7.54.2 - Form management
- `class-variance-authority` + `clsx` + `tailwind-merge` - CSS utility composition

**Other:**
- `bcryptjs` ^3.0.3 - Password hashing
- `archiver` ^7.0.1 - ZIP file creation
- `dotenv` ^16.5.0 - Environment variable loading
- `firebase` ^11.7.0 - Firebase SDK (usage in `@tanstack-query-firebase`)

## Configuration

**Environment:**
- `.env.local` - Local environment variables (gitignored)
- `.env.example` - Template with required variable names
- Key configs: `DATABASE_URL`, `ADMIN_PASSWORD`, `JWT_SECRET`, `GOOGLE_API_KEY`, `TOGETHER_API_KEY`

**Build:**
- `tsconfig.json` - TypeScript config (strict mode, path aliases `@/*` → `./src/*`)
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS customization
- `jest.config.ts` - Test runner config (ts-jest preset, tests in `tests/` dir)

## Platform Requirements

**Development:**
- Windows/macOS/Linux (cross-platform)
- Node.js runtime
- MySQL database (local or remote)

**Production:**
- Deployment target: Vercel (inferred from Next.js setup)
- MySQL database (external, via `DATABASE_URL`)
- Serverless functions (Puppeteer with `@sparticuz/chromium`)

---

*Stack analysis: 2026-03-28*
*Update after major dependency changes*
