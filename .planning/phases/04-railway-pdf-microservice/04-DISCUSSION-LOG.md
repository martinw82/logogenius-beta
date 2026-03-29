# Phase 4: Railway PDF Microservice - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-29
**Phase:** 04-railway-pdf-microservice
**Areas discussed:** Service architecture, Vercel strategy, Testing approach, Railway scope

---

## Service Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Local-only, skip Railway | Set up CHROMIUM_PATH, test with existing endpoint. Skip Railway if local works. | |
| Yes, build Railway service | Build Railway service (separate repo) as planned | |
| Local first, Railway later | Get local working first, then decide based on production needs | ✓ |

**User's choice:** Local first, Railway later
**Notes:** User wants to validate existing Puppeteer setup before committing to Railway infrastructure. Existing pdf-generator-puppeteer.ts already has full implementation.

---

## Vercel Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Vercel with @sparticuz | Use @sparticuz/chromium (already configured). Accept cold start latency. | ✓ |
| jsPDF in production | Only use Puppeteer locally. Production uses jsPDF fallback. | |
| Skip Vercel for now | Focus on local only, Vercel later | |

**User's choice:** Vercel with @sparticuz (Recommended)
**Notes:** Already configured in pdf-generator-puppeteer.ts. Test on Vercel after local works.

---

## PDF Quality Check

| Option | Description | Selected |
|--------|-------------|----------|
| Visual quality review | Generate PDF, open it, verify layout, fonts, colors, sections | ✓ |
| Functional only | Just confirm it generates without errors | |

**User's choice:** Visual quality review
**Notes:** Should verify the Puppeteer output looks professional compared to jsPDF output.

---

## Railway Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Optional phase (Recommended) | Keep Railway as optional. Proceed to Phase 5 after local works. | ✓ |
| Remove from roadmap | Remove Railway entirely, add back later if needed | |

**User's choice:** Optional phase (Recommended)
**Notes:** Railway stays in roadmap but becomes optional. Only build if Vercel production has reliability issues.

---

## KiloCode's Discretion

- Exact retry count and backoff strategy
- How to surface PDF generation progress to users
- Whether to add PDF generation time logging
- How to handle Chrome crash recovery

---

## Deferred Ideas

- Railway microservice (separate repo) — if Vercel production issues
- PDF generation progress streaming (SSE)
- PDF caching optimization
- Multi-page PDF preview in browser
