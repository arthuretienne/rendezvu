import EditorialFrame from '@/components/EditorialFrame'

export const metadata = { title: 'Metrics — Rendezvu' }

const PEOPLE = [
  { num: '2 314', label: 'utilisateurs mensuels actifs' },
  { num: '186',   label: 'groupes actifs cette semaine' },
  { num: '47',    label: 'pays' },
  { num: '8.4',   label: 'films vus en moyenne par groupe / mois' },
]

const MONEY = [
  { month: 'avril 2026',   donations: '142 €', expenses: '57 €',  balance: '+85 €'  },
  { month: 'mars 2026',    donations: '98 €',  expenses: '57 €',  balance: '+41 €'  },
  { month: 'février 2026', donations: '64 €',  expenses: '57 €',  balance: '+7 €'   },
  { month: 'janvier 2026', donations: '210 €', expenses: '54 €',  balance: '+156 €' },
  { month: 'décembre 2025',donations: '112 €', expenses: '54 €',  balance: '+58 €'  },
  { month: 'novembre 2025',donations: '40 €',  expenses: '54 €',  balance: '−14 €'  },
]

const PROMISES = [
  { ok: true,  text: 'Pas de pub : ✓ depuis toujours.' },
  { ok: true,  text: 'Pas de paywall : ✓ depuis toujours.' },
  { ok: true,  text: 'Pas de revente de données : ✓ depuis toujours.' },
  { ok: true,  text: 'Latence p95 sous 800ms : ✓ ce mois (789ms).' },
  { ok: false, text: 'Réponse au support en moins de 48h : ✗ ce mois (moyenne 71h — on s\'excuse).' },
]

export default function MetricsPage() {
  return (
    <EditorialFrame>
      <article className="measure prose" style={{ padding: 'var(--s-7) var(--s-5)' }}>
        <h1 className="t-h1">On vous dit tout.</h1>
        <p className="t-lead" style={{ marginTop: 'var(--s-5)' }}>
          Mis à jour le 1er de chaque mois. Avril 2026.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Personnes. »</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--s-6) var(--s-5)',
            marginTop: 'var(--s-5)',
          }}
        >
          {PEOPLE.map((p) => (
            <div key={p.label}>
              <p className="t-display t-tnum" style={{ fontSize: 'clamp(40px, 5vw, 72px)' }}>{p.num}</p>
              <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-2)' }}>{p.label}</p>
            </div>
          ))}
        </div>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Argent. »</h2>
        <table
          className="t-body t-tnum"
          style={{
            marginTop: 'var(--s-5)',
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-faint)', textAlign: 'left' }}>
              <th className="t-caption" style={{ padding: 'var(--s-2) 0', color: 'var(--text-muted)', fontWeight: 500 }}>Mois</th>
              <th className="t-caption" style={{ padding: 'var(--s-2) 0', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Dons</th>
              <th className="t-caption" style={{ padding: 'var(--s-2) 0', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Dépenses</th>
              <th className="t-caption" style={{ padding: 'var(--s-2) 0', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Solde</th>
            </tr>
          </thead>
          <tbody>
            {MONEY.map((row) => (
              <tr key={row.month} style={{ borderBottom: '1px solid var(--border-faint)' }}>
                <td style={{ padding: 'var(--s-2) 0' }}>{row.month}</td>
                <td style={{ padding: 'var(--s-2) 0', textAlign: 'right' }}>{row.donations}</td>
                <td style={{ padding: 'var(--s-2) 0', textAlign: 'right' }}>{row.expenses}</td>
                <td style={{ padding: 'var(--s-2) 0', textAlign: 'right' }}>{row.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="t-body" style={{ marginTop: 'var(--s-4)' }}>
          Quand le solde devient négatif, on sort de notre poche. Quand il dépasse 1 000 €, on l&apos;écrira ici aussi.
        </p>

        <h2 className="t-h2" style={{ marginTop: 'var(--s-7)' }}>« Promesses tenues. »</h2>
        <ul
          style={{
            marginTop: 'var(--s-4)',
            listStyle: 'none',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--s-2)',
          }}
        >
          {PROMISES.map((p, i) => (
            <li key={i} className="t-body" style={{ color: p.ok ? 'var(--ink)' : 'var(--accent)' }}>
              {p.text}
            </li>
          ))}
        </ul>
      </article>
    </EditorialFrame>
  )
}
