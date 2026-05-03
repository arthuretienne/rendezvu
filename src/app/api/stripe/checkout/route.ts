import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, DONATION_TIERS, type DonationKind } from '@/lib/stripe'
import { rateLimit, clientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const KIND_TO_INTERVAL: Record<DonationKind, 'month' | 'year' | null> = {
  one_time: null,
  monthly: 'month',
  yearly: 'year',
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // 5 checkout attempts per user per 5 minutes — prevents accidental spam
  // and accidental double-clicks while keeping legitimate retries open.
  const rl = rateLimit(`checkout:${user.id}:${clientIp(req.headers)}`, {
    limit: 5,
    windowMs: 5 * 60_000,
  })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans quelques minutes.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    )
  }

  const body = await req.json().catch(() => ({}))
  const kind = body.kind as DonationKind
  const amount = Number(body.amount)
  if (!kind || !KIND_TO_INTERVAL.hasOwnProperty(kind)) {
    return NextResponse.json({ error: 'Invalid kind' }, { status: 400 })
  }
  const allowed = DONATION_TIERS[kind].some(t => t.amount === amount)
  if (!allowed) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

  const stripe = getStripe()
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin
  const interval = KIND_TO_INTERVAL[kind]

  const session = await stripe.checkout.sessions.create({
    mode: interval ? 'subscription' : 'payment',
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    metadata: { user_id: user.id, kind },
    subscription_data: interval ? { metadata: { user_id: user.id, kind } } : undefined,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: 'eur',
        unit_amount: amount,
        product_data: {
          name: interval ? `Rendezvu support · ${kind}` : 'Rendezvu support',
          description: 'Thank you — donations keep Rendezvu free and ad-free.',
        },
        ...(interval ? { recurring: { interval } } : {}),
      },
    }],
    success_url: `${origin}/settings?donation=thanks`,
    cancel_url: `${origin}/settings?donation=cancelled`,
    allow_promotion_codes: false,
  })

  return NextResponse.json({ url: session.url })
}
