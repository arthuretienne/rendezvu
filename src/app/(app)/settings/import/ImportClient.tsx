'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { searchMovies, getMovieDetails, upsertMovieItem } from '@/lib/tmdb'
import { parseLetterboxdCsv, type LetterboxdRow } from '@/lib/letterboxd'

type ImportStatus = 'idle' | 'parsed' | 'running' | 'done'

interface ImportProgress {
  total: number
  done: number
  imported: number
  skipped: number
  failed: number
  current?: string
}

export default function ImportClient({ userId }: { userId: string }) {
  const supabase = createClient()
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [rows, setRows] = useState<LetterboxdRow[]>([])
  const [error, setError] = useState('')
  const [progress, setProgress] = useState<ImportProgress | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    try {
      const text = await file.text()
      const parsed = parseLetterboxdCsv(text)
      if (parsed.length === 0) {
        setError('Aucune ligne reconnue. Vérifiez qu\'il s\'agit bien d\'un CSV Letterboxd (ratings.csv, watched.csv, ou diary.csv).')
        return
      }
      setRows(parsed)
      setStatus('parsed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de lire le fichier.')
    }
  }

  async function runImport() {
    setStatus('running')
    setError('')
    let imported = 0
    let skipped = 0
    let failed = 0

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      setProgress({
        total: rows.length,
        done: i,
        imported,
        skipped,
        failed,
        current: row.name,
      })
      try {
        const yearStr = row.year ? String(row.year) : undefined
        const results = await searchMovies(row.name, yearStr)
        const best = (yearStr && results.find(r => r.release_date?.startsWith(yearStr))) || results[0]
        if (!best) { failed++; continue }

        const details = await getMovieDetails(best.id)
        const enriched = { ...best, ...(details ?? {}) }

        const item = await upsertMovieItem(supabase, enriched)
        if (!item) { failed++; continue }

        if (row.rating != null) {
          const { data: existing } = await supabase
            .from('reviews')
            .select('id')
            .eq('item_id', item.id)
            .eq('user_id', userId)
            .limit(1)
          if (existing && existing.length > 0) {
            skipped++
          } else {
            const reviewBody = {
              item_id: item.id,
              user_id: userId,
              group_id: null,
              rating: row.rating,
              body: null as string | null,
              contains_spoilers: false,
              is_rewatch: row.is_rewatch,
              created_at: row.watched_date ? new Date(row.watched_date).toISOString() : new Date().toISOString(),
            }
            const { error } = await supabase.from('reviews').insert(reviewBody)
            if (error) { failed++; continue }
            imported++
          }
        } else {
          imported++
        }
      } catch {
        failed++
      }
      if (i % 5 === 4) await new Promise(r => setTimeout(r, 500))
    }

    setProgress({ total: rows.length, done: rows.length, imported, skipped, failed })
    setStatus('done')
  }

  return (
    <main style={{ background: 'var(--ink)', minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid var(--border-faint)' }}>
        <div
          className="flex items-center justify-between"
          style={{ maxWidth: 1280, margin: '0 auto', padding: 'var(--s-4) var(--s-5)' }}
        >
          <Link
            href="/settings"
            className="t-caption flex items-center"
            style={{ gap: 'var(--s-2)', color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            <ArrowLeft size={14} /> Paramètres
          </Link>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 400,
              fontSize: 22,
              color: 'var(--text)',
              textDecoration: 'none',
            }}
          >
            Rendezvu
          </Link>
          <span style={{ width: 80 }} />
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--s-7) var(--s-5)' }}>
        <header style={{ marginBottom: 'var(--s-6)' }}>
          <h1 className="t-h1">Importer votre Letterboxd.</h1>
          <p className="t-body" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-3)' }}>
            Letterboxd vous laisse exporter vos données en ZIP. Téléversez <code>ratings.csv</code>, <code>watched.csv</code> ou <code>diary.csv</code> — on cherche chaque film sur TMDB et on crée vos avis ici.
          </p>
          <p className="t-body" style={{ marginTop: 'var(--s-3)' }}>
            <a
              href="https://letterboxd.com/settings/data/"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              Récupérer votre export Letterboxd →
            </a>
          </p>
        </header>

        {error && (
          <p className="t-caption" style={{ color: 'var(--accent)', marginBottom: 'var(--s-5)' }}>
            {error}
          </p>
        )}

        {status === 'idle' && (
          <label
            style={{
              display: 'block',
              padding: 'var(--s-7) var(--s-5)',
              textAlign: 'center',
              cursor: 'pointer',
              borderTop: '1px dashed var(--border-faint)',
              borderBottom: '1px dashed var(--border-faint)',
            }}
          >
            <Upload size={28} strokeWidth={1.5} style={{ color: 'var(--text-muted)', margin: '0 auto var(--s-3)' }} />
            <p className="t-h3">Choisir un CSV</p>
            <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-2)' }}>
              ratings.csv, watched.csv ou diary.csv depuis votre export Letterboxd
            </p>
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
          </label>
        )}

        {status === 'parsed' && (
          <div
            style={{
              padding: 'var(--s-5) 0',
              borderTop: '1px solid var(--border-faint)',
              borderBottom: '1px solid var(--border-faint)',
            }}
          >
            <p className="t-caption" style={{ color: 'var(--accent)' }}>Prêt à importer</p>
            <h2 className="t-h2" style={{ marginTop: 'var(--s-2)' }}>
              {rows.length} films trouvés.
            </h2>
            <p className="t-body" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-3)', marginBottom: 'var(--s-5)' }}>
              On cherche chaque titre sur TMDB, on déduplique vos films existants, et on saute les avis déjà écrits ici. Quelques minutes pour les grosses collections (rate-limit TMDB).
            </p>
            <div className="flex" style={{ gap: 'var(--s-3)' }}>
              <button onClick={runImport} className="btn btn-primary">
                Démarrer l&apos;import
              </button>
              <button onClick={() => { setStatus('idle'); setRows([]) }} className="btn btn-ghost">
                Annuler
              </button>
            </div>
          </div>
        )}

        {status === 'running' && progress && (
          <div
            style={{
              padding: 'var(--s-5) 0',
              borderTop: '1px solid var(--border-faint)',
              borderBottom: '1px solid var(--border-faint)',
            }}
          >
            <p className="t-caption" style={{ color: 'var(--accent)' }}>
              Import en cours · {progress.done} / {progress.total}
            </p>
            {progress.current && (
              <p className="t-body" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-2)' }}>
                Résolution&nbsp;: <span style={{ color: 'var(--text)' }}>{progress.current}</span>…
              </p>
            )}
            <div style={{ marginTop: 'var(--s-4)', height: 4, background: 'var(--surface)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.round((progress.done / progress.total) * 100)}%`,
                  height: '100%',
                  background: 'var(--accent)',
                  transition: 'width 200ms var(--motion-easing)',
                }}
              />
            </div>
            <p className="t-caption t-tnum" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-3)' }}>
              {progress.imported} importés · {progress.skipped} sautés · {progress.failed} non résolus
            </p>
          </div>
        )}

        {status === 'done' && progress && (
          <div
            style={{
              padding: 'var(--s-5) 0',
              borderTop: '1px solid var(--border-faint)',
              borderBottom: '1px solid var(--border-faint)',
            }}
          >
            <p className="t-caption" style={{ color: 'var(--accent)' }}>Terminé.</p>
            <h2 className="t-h2" style={{ marginTop: 'var(--s-2)' }}>
              C&apos;est fait.
            </h2>
            <p className="t-body" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-3)', marginBottom: 'var(--s-5)' }}>
              {progress.imported} avis importés, {progress.skipped} sautés (déjà sur Rendezvu), {progress.failed} introuvables sur TMDB.
            </p>
            <div className="flex" style={{ gap: 'var(--s-3)', flexWrap: 'wrap' }}>
              <Link href="/groups" className="btn btn-primary">
                Retour aux groupes
              </Link>
              <button
                onClick={() => { setStatus('idle'); setRows([]); setProgress(null) }}
                className="btn btn-ghost"
              >
                Importer un autre fichier
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
