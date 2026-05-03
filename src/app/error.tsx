'use client'

import Link from 'next/link'

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main
      style={{
        background: 'var(--ink)',
        color: 'var(--text)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--s-5)',
      }}
    >
      <div className="measure" style={{ textAlign: 'center' }}>
        <h1 className="t-display">«&nbsp;On s&apos;est emmêlé les bobines.&nbsp;»</h1>
        <p className="t-lead" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-5)' }}>
          Erreur de notre côté. On regarde. Si ça persiste, dites-le-nous.
        </p>
        <div className="flex justify-center" style={{ gap: 'var(--s-3)', marginTop: 'var(--s-6)', flexWrap: 'wrap' }}>
          <button onClick={reset} className="btn btn-secondary">Recharger</button>
          <Link href="/contact" className="btn btn-ghost">Écrire au support</Link>
        </div>
      </div>
    </main>
  )
}
