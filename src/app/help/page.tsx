import EditorialFrame from '@/components/EditorialFrame'

export const metadata = { title: 'Aide — Rendezvu' }

const SECTIONS = [
  {
    title: 'Mon groupe.',
    qs: [
      { q: 'Comment j\'invite quelqu\'un qui n\'a pas de compte ?', a: 'Copiez le lien d\'invitation depuis la page du groupe (icône en haut). Quand la personne clique dessus, on lui propose de s\'inscrire et elle rejoint instantanément.' },
      { q: 'Combien on peut être max ?', a: 'Trente. Au-delà, ce n\'est plus un groupe — c\'est un club, et on n\'a pas conçu Rendezvu pour ça.' },
      { q: 'Je veux quitter sans supprimer le groupe.', a: 'Allez dans les paramètres du groupe et cliquez sur « Quitter ». Le groupe continue avec les autres membres ; vos avis restent visibles pour eux mais vous n\'y avez plus accès.' },
    ],
  },
  {
    title: 'La bucket.',
    qs: [
      { q: 'Comment importer depuis Letterboxd ?', a: 'Pas encore. C\'est en chantier (voir Changelog). Pour IMDb, exportez votre liste en CSV et importez-la depuis Paramètres → Imports.' },
      { q: 'Le film n\'existe pas dans la base, je fais quoi ?', a: 'On utilise TMDB. Si vous ne le trouvez pas, c\'est qu\'il n\'y est pas — vous pouvez le proposer directement à TMDB, ils valident vite.' },
    ],
  },
  {
    title: 'Le tirage.',
    qs: [
      { q: 'On peut re-tirer ?', a: 'Non. C\'est volontaire. Vous pouvez bien sûr tirer à nouveau plus tard, mais on ne « rejoue » pas la même session. Voir « Comment ça marche ».' },
      { q: 'Plusieurs personnes ont tiré en même temps, on a eu deux verdicts.', a: 'Le dernier tirage écrase le précédent. Ce n\'est pas idéal — on travaille à un verrouillage côté serveur (changelog).' },
    ],
  },
  {
    title: 'Compte & confidentialité.',
    qs: [
      { q: 'Comment changer mon pseudo ?', a: 'Pas encore. C\'est en chantier. Pour l\'instant, écrivez à hello@rendezvu.app et on le change manuellement.' },
      { q: 'Comment exporter mes données ?', a: 'Paramètres → Vos données → « Exporter mes données » (JSON complet).' },
      { q: 'Comment supprimer mon compte ?', a: 'Paramètres → Vos données → « Supprimer mon compte ». Suppression « soft » pendant 30 jours, puis définitive.' },
    ],
  },
  {
    title: 'Dons.',
    qs: [
      { q: 'Comment annuler un don récurrent ?', a: 'Paramètres → Patron → bouton « Gérer mon abonnement » (lien Stripe).' },
      { q: 'Je veux un reçu fiscal.', a: 'On n\'est pas une asso reconnue d\'utilité publique. Pas de reçu fiscal, désolé.' },
    ],
  },
]

export default function HelpPage() {
  return (
    <EditorialFrame>
      <article className="measure prose" style={{ padding: 'var(--s-7) var(--s-5)' }}>
        <h1 className="t-h1">Aide.</h1>
        <p className="t-lead" style={{ marginTop: 'var(--s-5)' }}>
          Trouver une réponse en moins de trente secondes.
        </p>

        {SECTIONS.map((section) => (
          <section key={section.title} style={{ marginTop: 'var(--s-7)' }}>
            <h2 className="t-h2">« {section.title} »</h2>
            <div style={{ marginTop: 'var(--s-4)' }}>
              {section.qs.map((qa, i) => (
                <details
                  key={i}
                  style={{
                    padding: 'var(--s-4) 0',
                    borderBottom: '1px solid var(--border-faint)',
                  }}
                >
                  <summary
                    className="t-body"
                    style={{ cursor: 'pointer', color: 'var(--ink)', listStyle: 'none' }}
                  >
                    {qa.q}
                  </summary>
                  <p className="t-body" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-3)' }}>
                    {qa.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <p className="t-body" style={{ marginTop: 'var(--s-7)', fontStyle: 'italic' }}>
          Pas trouvé&nbsp;? <a href="mailto:hello@rendezvu.app">Écrivez-nous</a>, on répond toujours.
        </p>
      </article>
    </EditorialFrame>
  )
}
