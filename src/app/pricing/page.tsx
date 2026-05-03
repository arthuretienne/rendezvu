import Link from 'next/link'
import EditorialFrame from '@/components/EditorialFrame'

export const metadata = { title: 'Pricing — Rendezvu' }

export default function PricingPage() {
  return (
    <EditorialFrame>
      <article className="measure prose" style={{ padding: 'var(--s-7) var(--s-5)' }}>
        <h1 className="t-h1">
          On ne vend rien. On accepte des dons. Voilà comment.
        </h1>
        <p className="t-lead" style={{ marginTop: 'var(--s-5)' }}>
          Pas de plan gratuit, pas de plan payant, pas de plan «&nbsp;Pro&nbsp;» en sticker doré. Rendezvu fonctionne grâce aux dons. Si vous aimez, vous donnez. Si vous donnez, on vous remercie. Si vous ne donnez pas, vous avez exactement les mêmes fonctionnalités. C&apos;est tout l&apos;argument.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Combien ça coûte de faire tourner ça. »</h2>
        <pre
          className="t-body t-tnum"
          style={{
            marginTop: 'var(--s-4)',
            padding: 'var(--s-4) 0',
            borderTop: '1px solid var(--border-faint)',
            borderBottom: '1px solid var(--border-faint)',
            whiteSpace: 'pre',
            overflowX: 'auto',
            fontFamily: 'var(--font-sans)',
          }}
        >
{`Hébergement Vercel ........ 28 €/mois
Supabase .................. 25 €/mois
Domaine + email ............ 4 €/mois
─────────────────────────────────────
Total ..................... ~57 €/mois`}
        </pre>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Pour l&apos;instant, ça suffit. Quand ça grandira, on mettra à jour ce tableau.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Si vous donnez. »</h2>
        <pre
          className="t-body"
          style={{
            marginTop: 'var(--s-4)',
            padding: 'var(--s-4) 0',
            borderTop: '1px solid var(--border-faint)',
            borderBottom: '1px solid var(--border-faint)',
            whiteSpace: 'pre',
            overflowX: 'auto',
            fontFamily: 'var(--font-sans)',
          }}
        >
{`5 € / une fois         Ponctuel. Merci.
3 € / mois             Régulier. Encore plus merci.
30 € / une fois        Patron annuel. Reçoit un badge cosmétique,
                       une cover de groupe custom, un accès anticipé
                       aux fonctions en chantier.`}
        </pre>
        <Link href="/auth?next=/settings" className="btn btn-primary" style={{ marginTop: 'var(--s-5)' }}>
          Faire un don →
        </Link>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Ce qu&apos;on ne fera jamais. »</h2>

        <h3 className="t-h3" style={{ marginTop: 'var(--s-4)' }}>Pas de pub.</h3>
        <p className="t-body" style={{ marginTop: 'var(--s-2)' }}>
          Pas même «&nbsp;non intrusive&nbsp;».
        </p>

        <h3 className="t-h3" style={{ marginTop: 'var(--s-4)' }}>Pas de paywall.</h3>
        <p className="t-body" style={{ marginTop: 'var(--s-2)' }}>
          Toutes les fonctions, pour tout le monde.
        </p>

        <h3 className="t-h3" style={{ marginTop: 'var(--s-4)' }}>Pas de revente de données.</h3>
        <p className="t-body" style={{ marginTop: 'var(--s-2)' }}>
          On les a, on les garde, on s&apos;en sert pour faire marcher le produit. Stop.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Si on doit changer un jour. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          On l&apos;écrira ici en grand, et un mois avant. Pas dans une mise à jour des CGU enterrée.
        </p>
      </article>
    </EditorialFrame>
  )
}
