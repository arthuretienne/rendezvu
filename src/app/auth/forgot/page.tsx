'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset`,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  return (
    <main
      style={{
        background: 'var(--ink)',
        color: 'var(--text)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header style={{ padding: 'var(--s-5)', textAlign: 'center' }}>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: 22,
            color: 'var(--text)',
            textDecoration: 'none',
          }}
        >
          Rendezvu
        </Link>
      </header>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--s-5)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 360 }}>
          {sent ? (
            <>
              <h2 className="t-h2">« Vérifiez votre boîte. »</h2>
              <p className="t-body" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-3)' }}>
                On vous a envoyé un lien à <strong>{email}</strong>. Il expire dans une heure.
              </p>
              <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-5)' }}>
                Pas reçu&nbsp;? Vérifiez les spams, ou{' '}
                <button
                  onClick={() => { setSent(false); setEmail('') }}
                  className="link"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
                >
                  réessayez
                </button>.
              </p>
            </>
          ) : (
            <>
              <h2 className="t-h2" style={{ marginBottom: 'var(--s-3)' }}>« Mot de passe oublié. »</h2>
              <p className="t-body" style={{ color: 'var(--text-muted)', marginBottom: 'var(--s-6)' }}>
                On vous envoie un lien pour en choisir un nouveau.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}>
                <div className="field">
                  <label className="field-label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    required
                    autoComplete="email"
                  />
                </div>

                {error && (
                  <p className="t-caption" style={{ color: 'var(--accent)' }}>{error}</p>
                )}

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                  {loading ? '…' : 'Envoyer le lien'}
                </button>
              </form>

              <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-5)', textAlign: 'center' }}>
                <Link href="/auth" className="link">← Retour à la connexion</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
