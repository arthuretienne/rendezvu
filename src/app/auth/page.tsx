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
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
      if (error) { setError(error.message); setLoading(false); return }
      await supabase.auth.signInWithPassword({ email, password })
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
    }
    router.push(next)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-xs curtain-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--text)', fontWeight: 700 }}>
            Cinephile Starter
          </h1>
          <p className="mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Draw · Watch · Rate
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-3 text-sm relative transition-colors"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: mode === m ? 600 : 400,
                  color: mode === m ? 'var(--copper)' : 'var(--text-muted)',
                  background: mode === m ? 'var(--surface)' : 'var(--surface-2)',
                }}
              >
                {m === 'login' ? 'Sign in' : 'Sign up'}
                {mode === m && <span className="absolute bottom-0 left-6 right-6 h-px" style={{ background: 'var(--copper)' }} />}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {mode === 'signup' && (
              <div className="curtain-in">
                <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Arthur" required
                  className="w-full px-3 py-2 rounded-lg text-sm transition-all" style={{ fontFamily: 'var(--font-body)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
            )}
            <div>
              <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                className="w-full px-3 py-2 rounded-lg text-sm transition-all" style={{ fontFamily: 'var(--font-body)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6}
                className="w-full px-3 py-2 rounded-lg text-sm transition-all" style={{ fontFamily: 'var(--font-body)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>

            {error && <p className="text-sm px-3 py-2 rounded-lg" style={{ background: '#fde8e8', color: '#9b2020', border: '1px solid #f5c5c5' }}>{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 hover:opacity-90"
              style={{ fontFamily: 'var(--font-display)', background: 'var(--copper)', color: '#fff', letterSpacing: '0.02em' }}>
              {loading ? 'Loading...' : mode === 'login' ? 'Enter' : 'Create account'}
            </button>
          </form>

          {/* Ticket stub bottom */}
          <div className="ticket-top mx-4 mb-4">
            <p className="text-center" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              ADMIT TWO · CINEPHILE STARTER
            </p>
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
