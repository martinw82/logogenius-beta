# Research: Phase 2 — Email Notifications

**Date:** 2026-03-28
**Phase Goal:** Send transactional emails for order lifecycle events.

## Current State

**Existing email service:** `src/lib/services/email-service.ts` (352 lines)

Already has:
- 7 email templates with HTML generators
- Send functions: `sendOrderApprovedEmail`, `sendLogoSelectionEmail`, `sendDashboardAccessEmail`, `sendRevisionCompletedEmail`, `sendAdminNewOrderEmail`, `sendAdminRevisionRequestEmail`, `sendAdminFeedbackEmail`
- But `sendEmail()` function just logs to console (line 330: `// TODO: Integrate with email service provider`)

**What needs to change:**
1. Replace console.log in `sendEmail()` with Resend API calls
2. Add order confirmation email (triggered from Stripe webhook)
3. Wire up existing email functions to actual triggers in the order flow
4. Ensure fire-and-forget (don't block order processing on email failure)

## Resend Integration Pattern

```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'LogoGenius <noreply@logogenius.com>',
  to: email.to,
  subject: email.subject,
  html: html,
});
```

## Email Triggers in Order Flow

| Event | Trigger Location | Email |
|-------|-----------------|-------|
| Payment success | `src/app/api/stripe/webhook/route.ts` | Order confirmation (NEW) |
| Logos ready | `src/app/api/orders/[id]/generate/route.ts` | Logo selection ready (existing) |
| Brand kit ready | `src/app/api/orders/[id]/finalize/route.ts` | Dashboard access (existing) |
| New order | `src/app/api/stripe/webhook/route.ts` | Admin new order (existing) |

## Key Files

- `src/lib/services/email-service.ts` — Main email service (needs Resend integration)
- `src/app/api/stripe/webhook/route.ts` — Payment webhook (add order confirmation email)
- `src/app/api/orders/[id]/generate/route.ts` — Logo generation (add logo ready email)
- `src/app/api/orders/[id]/finalize/route.ts` — Finalization (add brand kit ready email)

## Dependencies

- `resend` npm package (v4+)
- Resend account with verified domain
- `RESEND_API_KEY` env var
- `RESEND_FROM_EMAIL` env var (e.g., noreply@logogenius.com)

---

*Research complete: 2026-03-28*
