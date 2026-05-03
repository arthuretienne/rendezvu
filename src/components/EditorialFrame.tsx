import Link from 'next/link'

export default function EditorialFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.body.setAttribute('data-theme', 'paper')`,
        }}
      />
      <div style={{ background: 'var(--paper)', color: 'var(--ink)', minHeight: '100vh' }}>
        <header style={{ borderBottom: '1px solid var(--border-faint)' }}>
          <div
            className="flex items-center justify-between"
            style={{ maxWidth: 1280, margin: '0 auto', padding: 'var(--s-4) var(--s-5)' }}
          >
            <Link
              href="/"
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 400,
                fontSize: 22,
                color: 'var(--ink)',
                textDecoration: 'none',
              }}
            >
              Rendezvu
            </Link>
            <nav className="flex items-center" style={{ gap: 'var(--s-5)' }}>
              <Link href="/about" className="t-caption hidden md:inline" style={{ color: 'inherit', textDecoration: 'none' }}>À propos</Link>
              <Link href="/how-it-works" className="t-caption hidden md:inline" style={{ color: 'inherit', textDecoration: 'none' }}>Comment ça marche</Link>
              <Link href="/changelog" className="t-caption hidden lg:inline" style={{ color: 'inherit', textDecoration: 'none' }}>Changelog</Link>
              <Link href="/auth" className="t-caption" style={{ color: 'inherit', textDecoration: 'none' }}>Se connecter</Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer
          style={{
            borderTop: '1px solid var(--border-faint)',
            padding: 'var(--s-6) var(--s-5)',
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--s-2)',
            }}
          >
            <p className="t-caption" style={{ color: 'var(--text-muted)' }}>
              <Link href="/about" style={{ color: 'inherit' }}>À propos</Link>
              {' · '}
              <Link href="/how-it-works" style={{ color: 'inherit' }}>Comment ça marche</Link>
              {' · '}
              <Link href="/help" style={{ color: 'inherit' }}>Aide</Link>
              {' · '}
              <Link href="/contact" style={{ color: 'inherit' }}>Contact</Link>
            </p>
            <p className="t-caption" style={{ color: 'var(--text-muted)' }}>
              <Link href="/pricing" style={{ color: 'inherit' }}>Pricing</Link>
              {' · '}
              <Link href="/changelog" style={{ color: 'inherit' }}>Changelog</Link>
              {' · '}
              <Link href="/metrics" style={{ color: 'inherit' }}>Metrics</Link>
              {' · '}
              <Link href="/press" style={{ color: 'inherit' }}>Press</Link>
            </p>
            <p className="t-caption" style={{ color: 'var(--text-muted)' }}>
              <Link href="/privacy" style={{ color: 'inherit' }}>Privacy</Link>
              {' · '}
              <Link href="/terms" style={{ color: 'inherit' }}>Terms</Link>
              {' · '}
              <Link href="/security" style={{ color: 'inherit' }}>Security</Link>
              {' · '}
              <Link href="/credits" style={{ color: 'inherit' }}>Credits</Link>
            </p>
            <p className="t-caption" style={{ color: 'var(--text-muted)', opacity: 0.7, marginTop: 'var(--s-3)' }}>
              Rendezvu, fait quelque part entre Bruxelles et Marseille, 2026. Données films&nbsp;: TMDB.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
