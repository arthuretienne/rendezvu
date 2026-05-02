'use client'

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
      // If email confirmation is required by the project, signUp returns user but no session.
      if (!signUpData.session) {
        setError('Account created. Check your inbox for the confirmation link, then sign in.')
        setLoading(false)
        setMode('login')
        return
      }
      // Email confirmation off → session is live, no need to call signIn again.
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError(signInError.message); setLoading(false); return }
    }
    router.push(next)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--bg)' }}>

      {/* Ambient glow behind card */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,162,85,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="w-full max-w-sm curtain-in relative z-10">

        {/* Logo */}
        <div className="text-center mb-10">
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
            color: 'var(--copper)', letterSpacing: '0.25em',
            textTransform: 'uppercase', marginBottom: '0.75rem',
          }}>
            ◆ Movie Rendez-vous ◆
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '2.8rem',
            color: 'var(--text)', fontWeight: 600, lineHeight: 1,
            letterSpacing: '0.02em',
          }}>
            Rendezvu
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
            color: 'var(--text-muted)', letterSpacing: '0.2em',
            textTransform: 'uppercase', marginTop: '0.5rem',
          }}>
            Watch together — apart
          </p>
        </div>

        {/* Glass card */}
        <div className="rounded-2xl overflow-hidden" style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
        }}>
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-3.5 text-sm relative transition-all cursor-pointer"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: mode === m ? 500 : 400,
                  color: mode === m ? 'var(--copper)' : 'var(--text-muted)',
                  background: mode === m ? 'rgba(201,162,85,0.06)' : 'transparent',
                  letterSpacing: '0.02em',
                }}
              >
                {m === 'login' ? 'Sign in' : 'Sign up'}
                {mode === m && (
                  <span className="absolute bottom-0 left-6 right-6 h-px" style={{ background: 'var(--copper)', boxShadow: '0 0 8px var(--copper)' }} />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === 'signup' && (
              <div className="curtain-in">
                <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Arthur" required autoComplete="name"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
                  style={{ fontFamily: 'var(--font-body)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
            )}
            <div>
              <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
                style={{ fontFamily: 'var(--font-body)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
                style={{ fontFamily: 'var(--font-body)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>

            {error && (
              <p className="text-sm px-3.5 py-2.5 rounded-xl" style={{ background: 'rgba(220,38,38,0.1)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.2)' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50 hover:opacity-90 cursor-pointer mt-2"
              style={{
                fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.04em',
                background: 'var(--copper)',
                color: '#000',
                boxShadow: '0 4px 24px rgba(201,162,85,0.25)',
              }}>
              {loading ? 'Loading...' : mode === 'login' ? 'Enter' : 'Create account'}
            </button>
          </form>

          <div className="px-6 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                ADMIT ONE
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}
