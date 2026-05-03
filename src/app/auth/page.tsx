'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    if (mode === 'signup') {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name, name } },
      })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      if (!signUpData.session) {
        setError('Compte créé. Vérifiez votre boîte mail pour confirmer, puis connectez-vous.')
        setLoading(false)
        setMode('login')
        return
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError(signInError.message); setLoading(false); return }
    }
    router.push(next)
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
      {/* Header — wordmark centered */}
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

      {/* Centered form */}
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
          <h2 className="t-h2" style={{ marginBottom: 'var(--s-3)' }}>
            {mode === 'login' ? '« Bonsoir. »' : '« Bienvenue. »'}
          </h2>
          <p className="t-body" style={{ color: 'var(--text-muted)', marginBottom: 'var(--s-6)' }}>
            {mode === 'login'
              ? 'Connectez-vous pour rejoindre votre groupe — ou créez-en un.'
              : 'Créez un compte. C’est rapide, gratuit, sans carte bancaire.'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}>
            {mode === 'signup' && (
              <div className="field">
                <label className="field-label" htmlFor="name">Nom</label>
                <input
                  id="name"
                  className="input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Arthur"
                  required
                  autoComplete="name"
                />
              </div>
            )}

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

            <div className="field">
              <label className="field-label" htmlFor="password">Mot de passe</label>
              <input
                id="password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <p
                className="t-caption"
                style={{
                  color: 'var(--accent)',
                  borderTop: '1px solid var(--border-faint)',
                  paddingTop: 'var(--s-2)',
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? '…' : mode === 'login' ? 'Continuer' : 'Créer le compte'}
            </button>
          </form>

          <p
            className="t-caption"
            style={{
              color: 'var(--text-muted)',
              marginTop: 'var(--s-5)',
              textAlign: 'center',
            }}
          >
            {mode === 'login' ? (
              <>
                Pas encore de compte ?{' '}
                <button
                  onClick={() => { setMode('signup'); setError('') }}
                  className="link"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
                >
                  En créer un
                </button>
              </>
            ) : (
              <>
                Déjà inscrit ?{' '}
                <button
                  onClick={() => { setMode('login'); setError('') }}
                  className="link"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
                >
                  Se connecter
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: 'var(--s-5)', textAlign: 'center' }}>
        <p className="t-caption" style={{ color: 'var(--text-muted)' }}>
          En continuant, vous acceptez nos{' '}
          <Link href="/terms" className="link" style={{ color: 'inherit' }}>Conditions</Link>{' '}
          et notre{' '}
          <Link href="/privacy" className="link" style={{ color: 'inherit' }}>Politique de confidentialité</Link>.
        </p>
      </footer>
    </main>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}
