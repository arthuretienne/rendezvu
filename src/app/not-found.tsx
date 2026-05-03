import Link from 'next/link'

export default function NotFound() {
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
        <h1 className="t-display">«&nbsp;Cette page n&apos;a jamais été tournée.&nbsp;»</h1>
        <p className="t-lead" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-5)' }}>
          Vous cherchiez peut-être&nbsp;:{' '}
          <Link href="/" className="link">Accueil</Link>
          {' · '}
          <Link href="/help" className="link">Aide</Link>
          {' · '}
          <Link href="/contact" className="link">Contact</Link>.
        </p>
      </div>
    </main>
  )
}
