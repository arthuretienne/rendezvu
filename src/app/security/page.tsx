import EditorialFrame from '@/components/EditorialFrame'

export const metadata = { title: 'Security — Rendezvu' }

export default function SecurityPage() {
  return (
    <EditorialFrame>
      <article className="measure prose" style={{ padding: 'var(--s-7) var(--s-5)' }}>
        <h1 className="t-h1">Sécurité.</h1>
        <p className="t-lead" style={{ marginTop: 'var(--s-5)' }}>
          Court, factuel. Pour rassurer un sysadmin en deux minutes.
        </p>

        <ul
          className="t-body"
          style={{
            marginTop: 'var(--s-5)',
            paddingLeft: 'var(--s-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--s-2)',
          }}
        >
          <li>Hébergement Vercel + Supabase, région UE.</li>
          <li>Auth via Supabase (email/password ; Google OAuth + magic link en chantier).</li>
          <li>Pas de mot de passe stocké en clair.</li>
          <li>HTTPS partout.</li>
          <li>Backups quotidiens chiffrés.</li>
          <li>Pas de tracking tiers.</li>
        </ul>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Signaler une faille. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Email dédié&nbsp;: <a href="mailto:security@rendezvu.app">security@rendezvu.app</a>. Voir aussi <a href="/.well-known/security.txt">/.well-known/security.txt</a>.
        </p>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Politique courte&nbsp;: pas de bug bounty cash, mais on vous remerciera publiquement (si vous le souhaitez) et on enverra un t-shirt.
        </p>
      </article>
    </EditorialFrame>
  )
}
