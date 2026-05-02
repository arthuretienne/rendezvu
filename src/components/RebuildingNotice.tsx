export default function RebuildingNotice({ surface, plan }: { surface: string; plan: string }) {
  return (
    <div className="space-y-4">
      <header>
        <p className="marquee">Rendezvu</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--text)', fontWeight: 600 }}>
          {surface}
        </h1>
      </header>
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <p style={{ fontSize: '0.78rem', color: 'var(--copper)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          🚧 Rebuilding
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 8, lineHeight: 1.6 }}>
          {plan}
        </p>
      </div>
    </div>
  )
}
