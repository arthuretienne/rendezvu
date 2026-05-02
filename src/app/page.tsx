import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session) redirect('/groups')

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: '-10%',
          right: '-10%',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,162,85,0.12) 0%, transparent 60%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          bottom: '-20%',
          left: '-10%',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,162,85,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 sm:py-20">
        {/* Top bar */}
        <nav className="flex items-center justify-between mb-16 sm:mb-24">
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: 'var(--copper)',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
            }}
          >
            ◆ Rendezvu
          </p>
          <Link
            href="/auth"
            className="px-3.5 py-1.5 rounded-lg transition-all hover:bg-white/5"
            style={{
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              border: '1px solid var(--border)',
            }}
          >
            Sign in
          </Link>
        </nav>

        {/* Hero */}
        <section className="mb-20">
          <p
            className="mb-4"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--copper)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            ◆ Movie Rendez-vous
          </p>
          <h1
            className="mb-6"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              color: 'var(--text)',
            }}
          >
            Watch together —<br />
            <span style={{ color: 'var(--copper)' }}>even apart.</span>
          </h1>
          <p
            className="max-w-xl mb-10"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}
          >
            A shared movie list, a friendly draw, a place to talk about what you watched.
            For long-distance friends, family, and lovers who want their next movie night to feel close again.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl transition-all hover:opacity-90"
              style={{
                background: 'var(--copper)',
                color: '#000',
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                letterSpacing: '0.02em',
                boxShadow: '0 8px 32px rgba(201,162,85,0.3)',
              }}
            >
              Create your group →
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl transition-all hover:bg-white/5"
              style={{
                color: 'var(--text-dim)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
              }}
            >
              I have an account
            </Link>
          </div>
        </section>

        {/* Three feature blocks */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-20">
          {[
            {
              k: '01',
              title: 'A shared list',
              body: 'Add movies from TMDB. Anyone in your group can drop in a film they want to watch — no more "what do we put on tonight?".',
            },
            {
              k: '02',
              title: 'A draw, not an argument',
              body: 'When it\'s time, the app picks one. Random, vote, or veto — your group, your rules. The pick is the same on every screen, in real time.',
            },
            {
              k: '03',
              title: 'Reviews that feel intimate',
              body: 'Rate it, write it, react to your friends\' takes. Spoilers stay hidden until you\'ve watched. Your reviews are private to your group by default.',
            },
          ].map(({ k, title, body }) => (
            <div
              key={k}
              className="rounded-2xl p-5"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <p
                className="mb-3"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  color: 'var(--copper)',
                  letterSpacing: '0.12em',
                }}
              >
                {k}
              </p>
              <h3
                className="mb-2"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: 'var(--text)',
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.88rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                }}
              >
                {body}
              </p>
            </div>
          ))}
        </section>

        {/* Closing pitch */}
        <section
          className="rounded-2xl p-8 mb-12"
          style={{
            background: 'rgba(201,162,85,0.04)',
            border: '1px solid rgba(201,162,85,0.2)',
          }}
        >
          <h2
            className="mb-3"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              fontWeight: 600,
              color: 'var(--text)',
              lineHeight: 1.2,
            }}
          >
            For relationships that don&apos;t fit in one room.
          </h2>
          <p
            className="max-w-xl"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}
          >
            Long-distance couples. Families spread across cities.
            Friends who don&apos;t live together anymore.
            Movies are an excuse — what you actually want is to keep talking.
          </p>
        </section>

        {/* Footer */}
        <footer
          className="flex items-center justify-between flex-wrap gap-4"
          style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Free · No ads inside the app · Donations welcome
          </p>
          <div className="flex gap-4">
            <Link
              href="/auth"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.78rem',
                color: 'var(--copper)',
              }}
            >
              Get started →
            </Link>
          </div>
        </footer>
      </div>
    </main>
  )
}
