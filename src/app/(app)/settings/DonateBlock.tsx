'use client'

import { useState } from 'react'
import { DONATION_TIERS, type DonationKind } from '@/lib/stripe'

const KIND_LABELS: Record<DonationKind, string> = {
  one_time: 'Une fois',
  monthly: 'Mensuel',
  yearly: 'Annuel',
}

export default function DonateBlock({ isPatron }: { isPatron: boolean }) {
  const [kind, setKind] = useState<DonationKind>('one_time')
  const [pending, setPending] = useState<number | null>(null)
  const [error, setError] = useState('')

  async function donate(amount: number) {
    setPending(amount)
    setError('')
    try {
      const r = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, amount }),
      })
      const j = await r.json()
      if (!r.ok || !j.url) throw new Error(j.error ?? 'Checkout impossible')
      window.location.href = j.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de démarrer le paiement.')
      setPending(null)
    }
  }

  return (
    <div>
      <h2 className="t-h2" style={{ marginBottom: 'var(--s-3)' }}>Soutenir Rendezvu.</h2>
      <p className="t-body" style={{ color: 'var(--text-muted)', marginBottom: 'var(--s-5)' }}>
        Rendezvu est gratuit, sans pub. Les dons couvrent l&apos;hébergement et nous permettent d&apos;avancer plus vite. Les patrons reçoivent un badge cosmétique et une cover de groupe custom — aucune fonction n&apos;est gatée.
      </p>

      <div className="flex" style={{ gap: 'var(--s-2)', marginBottom: 'var(--s-5)' }}>
        {(Object.keys(KIND_LABELS) as DonationKind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={kind === k ? 'btn btn-secondary' : 'btn btn-ghost'}
            style={{ height: 32, padding: '0 var(--s-3)' }}
          >
            {KIND_LABELS[k]}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 'var(--s-3)',
        }}
      >
        {DONATION_TIERS[kind].map((t) => (
          <button
            key={t.amount}
            type="button"
            onClick={() => donate(t.amount)}
            disabled={pending !== null}
            className={pending === t.amount ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ height: 56 }}
          >
            {pending === t.amount ? 'Redirection…' : t.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="t-caption" style={{ color: 'var(--accent)', marginTop: 'var(--s-3)' }}>
          {error}
        </p>
      )}

      {isPatron && (
        <p className="t-caption" style={{ color: 'var(--accent)', marginTop: 'var(--s-4)' }}>
          Vous êtes déjà patron — merci.
        </p>
      )}
    </div>
  )
}
