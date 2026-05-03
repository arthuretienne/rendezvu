import EditorialFrame from '@/components/EditorialFrame'

export const metadata = { title: 'Credits — Rendezvu' }

export default function CreditsPage() {
  return (
    <EditorialFrame>
      <article className="measure prose" style={{ padding: 'var(--s-7) var(--s-5)' }}>
        <h1 className="t-h1">Avec l&apos;aide de…</h1>
        <p className="t-lead" style={{ marginTop: 'var(--s-5)' }}>
          Dire merci. Vraiment.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« TMDB. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          This product uses the TMDB API but is not endorsed or certified by TMDB. Toutes les données et images de films viennent de <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">The Movie Database</a>, une base de données ouverte maintenue par sa communauté.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Polices. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Newsreader (Production Type, OFL) · Inter Tight (Rasmus Andersson, OFL).
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Open source. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Next.js, React, Supabase, Tailwind, lucide-react, date-fns. Plus quelques autres dans <code>package.json</code>.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Personnes. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Les testeurs et testeuses de la première heure&nbsp;: Léa B., Pierre M., Camille D., Adèle N., Sara L., Antoine R. Merci de nous avoir signalé tous les bugs avec une patience de saint·e.
        </p>
      </article>
    </EditorialFrame>
  )
}
