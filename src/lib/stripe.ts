import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  _stripe = new Stripe(key)
  return _stripe
}

export const DONATION_TIERS = {
  one_time: [
    { amount: 300, label: '€3' },
    { amount: 500, label: '€5' },
    { amount: 1000, label: '€10' },
    { amount: 2500, label: '€25' },
  ],
  monthly: [
    { amount: 300, label: '€3 / month' },
    { amount: 500, label: '€5 / month' },
    { amount: 1000, label: '€10 / month' },
  ],
  yearly: [
    { amount: 3000, label: '€30 / year' },
    { amount: 6000, label: '€60 / year' },
  ],
} as const

export type DonationKind = keyof typeof DONATION_TIERS
