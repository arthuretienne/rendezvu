'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/groups')
    router.refresh()
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
          <h2 className="t-h2" style={{ marginBottom: 'var(--s-3)' }}>« Nouveau mot de passe. »</h2>
          <p className="t-body" style={{ color: 'var(--text-muted)', marginBottom: 'var(--s-6)' }}>
            Choisissez-en un que vous retiendrez.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}>
            <div className="field">
              <label className="field-label" htmlFor="password">Nouveau mot de passe</label>
              <input
                id="password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="confirm">Confirmer</label>
              <input
                id="confirm"
                className="input"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="t-caption" style={{ color: 'var(--accent)' }}>{error}</p>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? '…' : 'Enregistrer'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
