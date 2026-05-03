import EditorialFrame from '@/components/EditorialFrame'

export const metadata = { title: 'Conditions — Rendezvu' }

export default function TermsPage() {
  return (
    <EditorialFrame>
      <article className="measure prose" style={{ padding: 'var(--s-7) var(--s-5)' }}>
        <h1 className="t-h1">Conditions.</h1>
        <p className="t-lead" style={{ marginTop: 'var(--s-5)' }}>
          Des CGU lisibles. Paragraphes courts. Pas de tout-majuscules.
        </p>
        <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-4)' }}>
          Mis à jour le 2 mai 2026.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Ce que vous acceptez en utilisant Rendezvu. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Que vos contenus (avis, listes, messages) sont à vous. On les héberge, on ne se les approprie pas. On peut être amenés à les afficher dans le contexte du groupe que vous avez choisi.
        </p>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Que vous n&apos;utilisez pas Rendezvu pour harceler, doxer, ou faire la promotion de contenus illégaux. Si vous le faites, on supprime.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Ce qu&apos;on s&apos;engage à faire. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Faire tourner le service «&nbsp;raisonnablement bien&nbsp;» — pas de SLA contractuel mais on regarde tous les jours. Vous prévenir avant tout changement structurel (visibilité, prix, suppression de fonction).
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Ce qu&apos;on s&apos;engage à ne pas faire. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Voir <a href="/pricing">/pricing</a> pour la liste exhaustive. Résumé&nbsp;: pas de pub, pas de paywall, pas de revente.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Si on doit fermer. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Engagement&nbsp;: 90 jours de préavis. Export complet possible pendant cette fenêtre. Pas d&apos;OPA hostile possible — Rendezvu n&apos;est pas une société à capitaux extérieurs.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Loi applicable. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Droit français. Tribunaux compétents&nbsp;: ceux de Paris.
        </p>
      </article>
    </EditorialFrame>
  )
}
