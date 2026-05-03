import EditorialFrame from '@/components/EditorialFrame'

export const metadata = { title: 'Press — Rendezvu' }

export default function PressPage() {
  return (
    <EditorialFrame>
      <article className="measure prose" style={{ padding: 'var(--s-7) var(--s-5)' }}>
        <h1 className="t-h1">Press.</h1>
        <p className="t-lead" style={{ marginTop: 'var(--s-5)' }}>
          Voici tout ce dont vous avez besoin si vous voulez écrire sur Rendezvu. Si vous ne trouvez pas, écrivez-nous.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« En une phrase. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Rendezvu est un rendez-vous cinéma à distance pour 2 à 30 personnes — bucket partagée, tirage au sort, notes communes. Gratuit, financé par les dons.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« En un paragraphe. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          Rendezvu, c&apos;est un rendez-vous cinéma à distance. Pas une plateforme, pas un réseau social, pas un outil productivity pour cinéphiles. C&apos;est une revue qu&apos;on tient à plusieurs&nbsp;: on accumule des films dans une bucket commune, on tire au sort sans discuter, on regarde — chacun chez soi, parfois en même temps, parfois pas — et après, on en parle. La marque s&apos;écrit comme un éditorial&nbsp;: sobre, dense, avec une opinion. Le rouge n&apos;est pas là pour faire signal d&apos;achat, c&apos;est le rouge des fauteuils et du néon «&nbsp;open&nbsp;» d&apos;une salle de quartier. La serif n&apos;est pas là pour faire luxe, elle est là parce qu&apos;on écrit. On ne vend rien. On accepte des dons. On ne décide pas à votre place — la machine tire au sort, vous regardez.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Logos &amp; wordmarks. »</h2>
        <ul
          className="t-body"
          style={{
            marginTop: 'var(--s-3)',
            paddingLeft: 'var(--s-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--s-2)',
          }}
        >
          <li>Wordmark — light.svg <span className="t-caption" style={{ color: 'var(--text-muted)' }}>(à venir)</span></li>
          <li>Wordmark — dark.svg <span className="t-caption" style={{ color: 'var(--text-muted)' }}>(à venir)</span></li>
        </ul>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Couleurs. »</h2>
        <div
          style={{
            marginTop: 'var(--s-4)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 'var(--s-4)',
          }}
        >
          {[
            { name: 'ink', hex: '#0E0E0C' },
            { name: 'paper', hex: '#F2EEE5' },
            { name: 'surface', hex: '#1A1916' },
            { name: 'text', hex: '#E8E4D9' },
            { name: 'accent', hex: '#E64B1B' },
          ].map((c) => (
            <div key={c.name}>
              <div
                style={{
                  aspectRatio: '4 / 3',
                  background: c.hex,
                  border: '1px solid var(--border-faint)',
                }}
              />
              <p className="t-caption t-tnum" style={{ marginTop: 'var(--s-2)' }}>
                {c.name} · {c.hex}
              </p>
            </div>
          ))}
        </div>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Contacts. »</h2>
        <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
          <a href="mailto:press@rendezvu.app">press@rendezvu.app</a> — pour la presse.<br />
          <a href="mailto:hello@rendezvu.app">hello@rendezvu.app</a> — pour le reste.
        </p>
      </article>
    </EditorialFrame>
  )
}
