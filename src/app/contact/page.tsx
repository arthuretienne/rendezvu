import EditorialFrame from '@/components/EditorialFrame'

export const metadata = { title: 'Contact — Rendezvu' }

export default function ContactPage() {
  return (
    <EditorialFrame>
      <article className="measure prose" style={{ padding: 'var(--s-7) var(--s-5)' }}>
        <h1 className="t-h1">On vous écoute.</h1>
        <p className="t-lead" style={{ marginTop: 'var(--s-5)' }}>
          Vraiment. On lit tout. On répond à tout — souvent dans la journée, parfois sous 48h, jamais au-delà d&apos;une semaine.
        </p>

        <div style={{ marginTop: 'var(--s-7)' }}>
          <div style={{ padding: 'var(--s-4) 0', borderTop: '1px solid var(--border-faint)' }}>
            <h2 className="t-h3">Bug, problème, question</h2>
            <p className="t-body" style={{ marginTop: 'var(--s-2)' }}>
              <a href="mailto:hello@rendezvu.app">hello@rendezvu.app</a>
            </p>
          </div>
          <div style={{ padding: 'var(--s-4) 0', borderTop: '1px solid var(--border-faint)' }}>
            <h2 className="t-h3">Presse</h2>
            <p className="t-body" style={{ marginTop: 'var(--s-2)' }}>
              <a href="mailto:press@rendezvu.app">press@rendezvu.app</a> · voir aussi <a href="/press">le kit presse</a>.
            </p>
          </div>
          <div style={{ padding: 'var(--s-4) 0', borderTop: '1px solid var(--border-faint)', borderBottom: '1px solid var(--border-faint)' }}>
            <h2 className="t-h3">Don, partenariat, autre</h2>
            <p className="t-body" style={{ marginTop: 'var(--s-2)' }}>
              <a href="mailto:arthur.etienne@optimize-matter.com">arthur.etienne@optimize-matter.com</a>
            </p>
          </div>
        </div>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Sur quoi on ne répond pas. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Pitchs commerciaux, propositions de growth-hacks, demandes de réintégrer une «&nbsp;feature freemium&nbsp;». Vous comprendrez si on ne donne pas suite.
        </p>
      </article>
    </EditorialFrame>
  )
}
