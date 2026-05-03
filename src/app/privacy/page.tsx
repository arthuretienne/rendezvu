import Link from 'next/link'

export const metadata = { title: 'Confidentialité — Rendezvu' }

export default function PrivacyPage() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.body.setAttribute('data-theme', 'paper')`,
        }}
      />
      <main style={{ background: 'var(--paper)', color: 'var(--ink)', minHeight: '100vh' }}>
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
              <Link href="/about" className="t-caption" style={{ color: 'inherit', textDecoration: 'none' }}>À propos</Link>
              <Link href="/auth" className="t-caption" style={{ color: 'inherit', textDecoration: 'none' }}>Se connecter</Link>
            </nav>
          </div>
        </header>

        <article className="measure prose" style={{ padding: 'var(--s-7) var(--s-5)' }}>
          <h1 className="t-h1">Confidentialité.</h1>
          <p className="t-lead" style={{ marginTop: 'var(--s-4)' }}>
            Cette page est écrite par nous, pas par TermsFeed. Si une phrase n&apos;est pas claire, écrivez-nous, on la réécrit.
          </p>
          <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-4)' }}>
            Mis à jour le 2 mai 2026.
          </p>

          <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Ce qu&apos;on collecte. »</h2>
          <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
            Rendezvu est une petite app de rendez-vous cinéma. On essaie de collecter le minimum nécessaire pour la faire tourner, et d&apos;être franc à ce sujet :
          </p>
          <ul className="t-body" style={{ marginTop: 'var(--s-3)', paddingLeft: 'var(--s-5)', display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <li>Email et mot de passe (gérés par Supabase Auth — jamais en clair).</li>
            <li>Profil&nbsp;: pseudo, nom affiché, avatar et bio facultatifs, niveau de visibilité.</li>
            <li>Compagnons et appartenances aux groupes.</li>
            <li>Films ajoutés, tirés, vus, et notés.</li>
            <li>Messages de chat de groupe.</li>
            <li>Préférences de notifications.</li>
            <li>Enregistrements des dons (gérés par Stripe ; on ne voit que les métadonnées).</li>
          </ul>

          <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Visibilité. »</h2>
          <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
            Les profils sont <strong>privés</strong> par défaut. Vos avis, listes et messages ne sont visibles que par les membres de votre groupe, sauf si vous basculez votre profil sur <em>compagnons</em> ou <em>public</em>.
          </p>

          <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Avec qui on partage. »</h2>
          <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>On s&apos;appuie sur des prestataires pour faire tourner Rendezvu&nbsp;:</p>
          <ul className="t-body" style={{ marginTop: 'var(--s-3)', paddingLeft: 'var(--s-5)', display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <li><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase</a> — auth, base de données, realtime (région UE)</li>
            <li><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel</a> — hébergement frontend</li>
            <li><a href="https://www.themoviedb.org/privacy-policy" target="_blank" rel="noopener noreferrer">TMDB</a> — métadonnées des films</li>
            <li><a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Resend</a> — emails transactionnels</li>
            <li><a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe</a> — dons (quand activés)</li>
          </ul>

          <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Cookies. »</h2>
          <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
            Un seul cookie de session, strictement nécessaire à la connexion. Pas d&apos;analytics tiers, pas de pixel, pas de fingerprint.
          </p>

          <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Vos droits. »</h2>
          <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
            <strong>Export complet</strong> de vos données en un clic depuis <Link href="/settings">Paramètres</Link>.
            <strong>Suppression</strong> idem — soft pendant 30 jours (au cas où vous changiez d&apos;avis), puis définitive.
          </p>
          <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
            Question, demande spéciale&nbsp;: écrivez à <a href="mailto:arthur.etienne@optimize-matter.com">arthur.etienne@optimize-matter.com</a>.
          </p>

          <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Quand on change. »</h2>
          <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
            On prévient par email, pas en silence.
          </p>
        </article>

        <footer
          style={{
            borderTop: '1px solid var(--border-faint)',
            padding: 'var(--s-6) var(--s-5)',
            textAlign: 'center',
          }}
        >
          <p className="t-caption" style={{ color: 'var(--text-muted)' }}>
            <Link href="/" style={{ color: 'inherit' }}>Accueil</Link>
            {' · '}
            <Link href="/terms" style={{ color: 'inherit' }}>Conditions</Link>
            {' · '}
            <Link href="/contact" style={{ color: 'inherit' }}>Contact</Link>
          </p>
        </footer>
      </main>
    </>
  )
}
