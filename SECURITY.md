# Pre-deploy security checklist

## Before going public

### 1. Rotate any leaked credentials
The repo previously contained a `SETUP.md` with real keys (committed before May 2026). Even after removing the file, the keys are in git history. Rotate them in their respective dashboards:

- Supabase **anon key**: not strictly secret (designed to be public, RLS is the security layer), but rotate if you're cautious.
- Supabase **service role key**: never had to be in `SETUP.md`. If it ever was, **rotate immediately**.
- TMDB v3 key: client-bundled (`NEXT_PUBLIC_*`) so already public, but you can rotate to scrub git history exposure.
- Stripe live keys: never commit. `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` go in Vercel env only.

### 2. Required env vars in production

| Var | Why |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth + data |
| `NEXT_PUBLIC_TMDB_API_KEY` | Movie metadata |
| `NEXT_PUBLIC_APP_URL` | Used in transactional email links — set to production domain |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Donation flows |
| `RESEND_API_KEY` | Email sending (silently no-ops if absent) |
| **`CRON_SECRET`** | **Required.** Cron endpoints check `Authorization: Bearer $CRON_SECRET`. Without it the endpoint is open. |
| `SENTRY_AUTH_TOKEN` (optional) | Source map upload during build |

### 3. Configure Supabase Auth

In Supabase dashboard → Authentication → URL Configuration:
- **Site URL**: your production domain
- **Redirect URLs**: include `https://your-domain.app/auth/callback`

The callback handles email confirmation, magic link, and password recovery. See [src/app/auth/callback/route.ts](src/app/auth/callback/route.ts).

### 4. Stripe webhook

Add the webhook in Stripe dashboard pointing to `https://your-domain.app/api/stripe/webhook`. Subscribe to:
- `checkout.session.completed`
- `customer.subscription.deleted`

Copy the signing secret to `STRIPE_WEBHOOK_SECRET`.

### 5. Vercel cron

`vercel.json` schedules `/api/cron/email-reminders` daily at 09:00 UTC. The endpoint validates `CRON_SECRET` — set it in Vercel env vars.

## Rate limiting (current state)

In-memory token-bucket via [src/lib/rate-limit.ts](src/lib/rate-limit.ts). Applied on:
- `POST /api/stripe/checkout` — 5 attempts / 5 min / user+IP
- `POST /api/account/delete` — 3 attempts / hour / IP
- `POST /api/notify-watched` — 10 sends / hour / user+IP (also requires session)

**Limitation**: state lives in serverless function memory and doesn't share across instances. Good enough for small-scale alpha/beta, but for serious abuse protection, swap to Upstash Redis (the API stays the same — just change the implementation in `lib/rate-limit.ts`).

Auth flows (signup/signin/forgot password) are not rate-limited at our edge because they go directly to Supabase. Supabase has its own rate limits — check the dashboard if you suspect abuse.

## Outstanding hardening (post-beta)

- Distributed rate limiting via Upstash
- CSRF tokens on state-changing forms
- Web push notifications (`web_push` channel is wired in DB but not implemented)
- Subresource integrity on third-party scripts (none currently — Next handles this)
- CSP header (currently relying on Next defaults)
