import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const sig = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  const raw = await req.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    return NextResponse.json({ error: `Webhook signature failed: ${msg}` }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object as Stripe.Checkout.Session
      const userId = s.metadata?.user_id ?? s.client_reference_id
      const kind = (s.metadata?.kind ?? 'one_time') as 'one_time' | 'monthly' | 'yearly'
      if (userId && s.amount_total) {
        await admin.from('donations').insert({
          user_id: userId,
          stripe_session_id: s.id,
          stripe_subscription_id: typeof s.subscription === 'string' ? s.subscription : null,
          stripe_customer_id: typeof s.customer === 'string' ? s.customer : null,
          amount_cents: s.amount_total,
          currency: s.currency ?? 'eur',
          kind,
          status: s.payment_status ?? 'paid',
        })
        await admin.from('profiles').update({
          is_patron: true,
          patron_since: new Date().toISOString(),
        }).eq('id', userId).is('patron_since', null)
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata?.user_id
      if (userId) {
        const { count } = await admin.from('donations')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString())
        if (!count) {
          await admin.from('profiles').update({ is_patron: false }).eq('id', userId)
        }
      }
    }
  } catch (err) {
    console.error('[stripe webhook]', event.type, err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
