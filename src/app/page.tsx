import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session) redirect('/groups')

  return (
    <main style={{ background: 'var(--ink)', color: 'var(--text)', minHeight: '100vh' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-faint)',
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: 'var(--s-4) var(--s-5)',
          }}
        >
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
          <nav className="flex items-center" style={{ gap: 'var(--s-5)' }}>
            <Link href="/about" className="t-caption hidden md:inline" style={{ color: 'var(--text-muted)', textDecoration: 'none', whiteSpace: 'nowrap' }}>À propos</Link>
            <Link href="/how-it-works" className="t-caption hidden md:inline" style={{ color: 'var(--text-muted)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Comment ça marche</Link>
            <Link href="/changelog" className="t-caption hidden lg:inline" style={{ color: 'var(--text-muted)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Changelog</Link>
            <Link href="/auth" className="t-caption" style={{ color: 'var(--text)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Se connecter</Link>
          </nav>
        </div>
      </header>

      {/* Hero — typographique uniquement */}
      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'var(--s-8) var(--s-5) var(--s-7)',
        }}
      >
        <div className="measure" style={{ marginInline: 0 }}>
          <h1 className="t-display" style={{ marginBottom: 'var(--s-6)' }}>
            «&nbsp;On regarde des films ensemble.<br />
            Même quand on est loin.&nbsp;»
          </h1>
          <p className="t-lead" style={{ color: 'var(--text)', marginBottom: 'var(--s-6)', maxWidth: '64ch' }}>
            Rendezvu est un rendez-vous cinéma pour amis, familles et couples à distance.
            Une bucket list partagée, un tirage au sort un peu brutal, et après le film&nbsp;:
            ce qu&apos;on en a pensé. Pas d&apos;algorithme, pas de feed, pas de pub — jamais.
          </p>
          <div className="flex items-center flex-wrap" style={{ gap: 'var(--s-5)' }}>
            <Link href="/auth" className="btn btn-primary">
              Créer un groupe →
            </Link>
            <span className="t-caption" style={{ color: 'var(--text-muted)' }}>
              Gratuit. Pas de carte bancaire. On vit grâce aux dons.
            </span>
          </div>
        </div>
      </section>

      {/* "Voici comment ça marche, en cinq lignes." */}
      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 var(--s-5) var(--s-8)',
        }}
      >
        <div className="measure" style={{ marginInline: 0 }}>
          <h2 className="t-h2" style={{ marginBottom: 'var(--s-5)' }}>
            Voici comment ça marche, en cinq lignes.
          </h2>
          <ol
            className="t-body"
            style={{
              listStyle: 'decimal',
              paddingLeft: 'var(--s-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--s-3)',
              marginBottom: 'var(--s-5)',
            }}
          >
            <li>On crée un groupe — avec sa sœur, ses colocs, son ex-coloc devenu copain à Lisbonne.</li>
            <li>Chacun ajoute des films à la bucket. On ne se met pas d&apos;accord, on accumule.</li>
            <li>Le soir J, on tire au sort. La machine tranche. On accepte.</li>
            <li>On regarde. Synchronisé si on veut, à son rythme sinon.</li>
            <li>Après, on note. On commente. On garde une trace.</li>
          </ol>
          <Link href="/about" className="link t-body">Lire le manifeste →</Link>
        </div>
      </section>

      {/* "On ne fait pas..." — anti-features */}
      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 var(--s-5) var(--s-8)',
        }}
      >
        <div className="measure" style={{ marginInline: 0 }}>
          <h2 className="t-h2" style={{ marginBottom: 'var(--s-5)' }}>
            On ne fait pas...
          </h2>
          <ul
            className="t-body"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--s-3) var(--s-5)',
              listStyle: 'none',
              padding: 0,
              marginBottom: 'var(--s-4)',
            }}
          >
            <li>On ne vend pas vos données.</li>
            <li>On ne vous suit pas hors du site.</li>
            <li>On ne met pas de pub.</li>
            <li>On ne fait pas de feed public.</li>
            <li>On ne gamifie pas.</li>
            <li>On ne gate aucune fonction.</li>
          </ul>
          <p className="t-caption" style={{ color: 'var(--text-muted)' }}>
            Si on change un jour, on l&apos;écrira ici en premier.
          </p>
        </div>
      </section>

      {/* Pied — 3 lignes */}
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
            <Link href="/about" className="link" style={{ color: 'inherit' }}>À propos</Link>
            {' · '}
            <Link href="/how-it-works" className="link" style={{ color: 'inherit' }}>Comment ça marche</Link>
            {' · '}
            <Link href="/help" className="link" style={{ color: 'inherit' }}>Aide</Link>
            {' · '}
            <Link href="/contact" className="link" style={{ color: 'inherit' }}>Contact</Link>
          </p>
          <p className="t-caption" style={{ color: 'var(--text-muted)' }}>
            <Link href="/pricing" className="link" style={{ color: 'inherit' }}>Pricing</Link>
            {' · '}
            <Link href="/changelog" className="link" style={{ color: 'inherit' }}>Changelog</Link>
            {' · '}
            <Link href="/metrics" className="link" style={{ color: 'inherit' }}>Metrics</Link>
            {' · '}
            <Link href="/press" className="link" style={{ color: 'inherit' }}>Press</Link>
          </p>
          <p className="t-caption" style={{ color: 'var(--text-muted)' }}>
            <Link href="/privacy" className="link" style={{ color: 'inherit' }}>Privacy</Link>
            {' · '}
            <Link href="/terms" className="link" style={{ color: 'inherit' }}>Terms</Link>
            {' · '}
            <Link href="/security" className="link" style={{ color: 'inherit' }}>Security</Link>
            {' · '}
            <Link href="/credits" className="link" style={{ color: 'inherit' }}>Credits</Link>
          </p>
          <p className="t-caption" style={{ color: 'var(--text-muted)', opacity: 0.7, marginTop: 'var(--s-3)' }}>
            Rendezvu, fait quelque part entre Bruxelles et Marseille, 2026. Données films&nbsp;: TMDB.
          </p>
        </div>
      </footer>
    </main>
  )
}
