/**
 * In-memory rate limiter using fixed-window counters.
 *
 * Caveats:
 * - State lives on the serverless function instance — different instances
 *   keep separate counters. For a small SaaS this is good enough; for serious
 *   abuse protection, swap to Upstash Redis (the API stays the same).
 * - Per-IP and per-action keys are caller-supplied. Use the `clientIp()` helper
 *   to extract a stable key from the X-Forwarded-For header.
 */

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

// Sweep stale buckets every 60s to avoid unbounded memory growth.
let lastSweep = 0
function sweep(now: number) {
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [key, b] of buckets) {
    if (b.resetAt < now) buckets.delete(key)
  }
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterSec: number
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now()
  sweep(now)

  let bucket = buckets.get(key)
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + windowMs }
    buckets.set(key, bucket)
  }

  bucket.count += 1
  const allowed = bucket.count <= limit
  return {
    allowed,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
    retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
  }
}

/** Best-effort client IP from the request. Falls back to 'unknown'. */
export function clientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  const real = headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}
