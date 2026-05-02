export default function RebuildingNotice({ surface, plan }: { surface: string; plan: string }) {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="t-caption" style={{ color: 'var(--text-muted)' }}>Rendezvu</p>
        <h1 className="t-h1">{surface}</h1>
      </header>
      <div
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border-faint)',
          borderBottom: '1px solid var(--border-faint)',
          padding: 'var(--s-5)',
        }}
      >
        <p className="t-caption" style={{ color: 'var(--accent)' }}>En chantier</p>
        <p className="t-body" style={{ marginTop: 'var(--s-2)' }}>{plan}</p>
      </div>
    </div>
  )
}
