import EditorialFrame from '@/components/EditorialFrame'

export const metadata = { title: 'Changelog — Rendezvu' }

const SOON = [
  {
    title: 'Import depuis Letterboxd',
    body: 'On gère IMDb depuis février. Letterboxd, c\'est plus tendu côté API — on cherche un moyen propre.',
    when: 'Avant l\'été.',
  },
  {
    title: 'Mode hors-ligne sur mobile',
    body: 'Pour pouvoir noter un film vu dans l\'avion sans dépendance réseau. Pas trivial — la sync est plus difficile que prévu.',
    when: 'Cette année, peut-être.',
  },
  {
    title: 'Intégration Cinetype',
    body: 'Le matching d\'inconnus aux goûts proches. Opt-in strict. On lit beaucoup avant d\'écrire.',
    when: 'Pas avant 2027.',
  },
]

const RELEASED = [
  {
    date: '12 avril 2026',
    title: 'Le tirage retient maintenant les films récemment exclus.',
    body: 'Avant, si trois personnes tiraient au sort le même soir, le même film pouvait sortir trois fois. C\'est corrigé. On garde une fenêtre de 24h.',
    tags: 'Tirage · Bug',
  },
  {
    date: '3 avril 2026',
    title: 'Les profils sont maintenant privés par défaut.',
    body: 'Avant, ils étaient « compagnons ». On a changé après plusieurs retours : les gens ne s\'attendent pas à ce que leurs amis voient automatiquement leurs avis. C\'est désormais opt-in explicite.',
    tags: 'Confidentialité · Comportement',
  },
  {
    date: '20 mars 2026',
    title: 'Suppression des emojis bullets dans les bullets.',
    body: 'Une décision de design. Les puces standard suffisent.',
    tags: 'Design',
  },
]

export default function ChangelogPage() {
  return (
    <EditorialFrame>
      <article className="measure prose" style={{ padding: 'var(--s-7) var(--s-5)' }}>
        <h1 className="t-h1">Ce qui change.</h1>
        <p className="t-lead" style={{ marginTop: 'var(--s-5)' }}>
          Les modifications du produit, dans l&apos;ordre inverse. Honnête sur les ratés.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Bientôt. »</h2>
        <div style={{ marginTop: 'var(--s-5)' }}>
          {SOON.map((entry) => (
            <div
              key={entry.title}
              style={{
                padding: 'var(--s-4) 0',
                borderBottom: '1px solid var(--border-faint)',
              }}
            >
              <h3 className="t-h3">{entry.title}</h3>
              <p className="t-body" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-2)' }}>
                {entry.body}
              </p>
              <p className="t-caption" style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 'var(--s-2)' }}>
                {entry.when}
              </p>
            </div>
          ))}
        </div>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Sorti. »</h2>
        <div style={{ marginTop: 'var(--s-5)' }}>
          {RELEASED.map((entry) => (
            <article
              key={entry.date + entry.title}
              style={{
                padding: 'var(--s-5) 0',
                borderBottom: '1px solid var(--border-faint)',
              }}
            >
              <p className="t-caption t-tnum" style={{ color: 'var(--text-muted)' }}>{entry.date}</p>
              <h3 className="t-h3" style={{ marginTop: 'var(--s-2)' }}>{entry.title}</h3>
              <p className="t-body" style={{ marginTop: 'var(--s-2)' }}>{entry.body}</p>
              <p className="t-caption" style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 'var(--s-2)' }}>{entry.tags}</p>
            </article>
          ))}
        </div>
      </article>
    </EditorialFrame>
  )
}
