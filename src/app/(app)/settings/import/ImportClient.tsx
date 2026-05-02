'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, CheckCircle2, AlertCircle } from 'lucide-react'
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
        setError('No rows recognized. Make sure this is a Letterboxd CSV (ratings.csv, watched.csv, or diary.csv).')
        return
      }
      setRows(parsed)
      setStatus('parsed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not parse the file.')
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
        // Resolve via TMDB search
        const yearStr = row.year ? String(row.year) : undefined
        const results = await searchMovies(row.name, yearStr)
        // Prefer exact-year match if available
        const best = (yearStr && results.find(r => r.release_date?.startsWith(yearStr))) || results[0]
        if (!best) { failed++; continue }

        // Get full details for runtime/genres
        const details = await getMovieDetails(best.id)
        const enriched = { ...best, ...(details ?? {}) }

        // Upsert into items
        const item = await upsertMovieItem(supabase, enriched)
        if (!item) { failed++; continue }

        // If rating, add a review (skip if user already has one for this item)
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
          imported++  // counted as imported even if no rating (item created)
        }
      } catch {
        failed++
      }
      // Light rate-limiting (TMDB: 40 req/10s)
      if (i % 5 === 4) await new Promise(r => setTimeout(r, 500))
    }

    setProgress({ total: rows.length, done: rows.length, imported, skipped, failed })
    setStatus('done')
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <nav className="mb-8">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={13} />
          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-body)' }}>Settings</span>
        </Link>
      </nav>

      <header className="mb-8">
        <p className="marquee">Import</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', fontWeight: 600 }}>
          Bring your Letterboxd history
        </h1>
        <p className="mt-2" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
          Letterboxd lets you export your data as a ZIP. Upload <code>ratings.csv</code>, <code>watched.csv</code>,
          or <code>diary.csv</code> and we&apos;ll match each film to TMDB and create your reviews here.
          <br />
          <a
            href="https://letterboxd.com/settings/data/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--copper)' }}
          >
            Get your export from Letterboxd →
          </a>
        </p>
      </header>

      {error && (
        <div
          className="rounded-xl p-3 mb-5 flex items-start gap-2"
          style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}
        >
          <AlertCircle size={14} style={{ color: '#fca5a5', marginTop: 2 }} />
          <p style={{ color: '#fca5a5', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>{error}</p>
        </div>
      )}

      {status === 'idle' && (
        <label
          className="block rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-white/5"
          style={{ background: 'var(--surface)', border: '2px dashed var(--border)' }}
        >
          <Upload size={28} style={{ color: 'var(--copper)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 500 }}>
            Click to choose a CSV
          </p>
          <p className="mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-body)' }}>
            ratings.csv, watched.csv, or diary.csv from your Letterboxd export
          </p>
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
        </label>
      )}

      {status === 'parsed' && (
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--copper)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            ◆ Ready to import
          </p>
          <h2 className="mt-1" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text)', fontWeight: 600 }}>
            {rows.length} films found
          </h2>
          <p className="mt-1 mb-4" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
            We&apos;ll search TMDB for each, dedupe against your existing items, and skip duplicates of reviews you&apos;ve already written here.
            This can take a few minutes for large libraries (rate-limited to TMDB).
          </p>
          <div className="flex gap-2">
            <button
              onClick={runImport}
              className="px-5 py-2 rounded-lg transition-all hover:opacity-90 cursor-pointer"
              style={{ background: 'var(--copper)', color: '#000', fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}
            >
              Start import
            </button>
            <button
              onClick={() => { setStatus('idle'); setRows([]) }}
              className="px-4 py-2 rounded-lg transition-all hover:bg-white/5 cursor-pointer"
              style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {status === 'running' && progress && (
        <div
          className="rounded-xl p-5 space-y-3"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--copper)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            ◆ Importing… {progress.done} / {progress.total}
          </p>
          {progress.current && (
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
              Resolving <span style={{ color: 'var(--text)' }}>{progress.current}</span>…
            </p>
          )}
          <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.round((progress.done / progress.total) * 100)}%`,
                height: '100%',
                background: 'var(--copper)',
                transition: 'width 0.2s',
              }}
            />
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            {progress.imported} imported · {progress.skipped} skipped · {progress.failed} failed
          </p>
        </div>
      )}

      {status === 'done' && progress && (
        <div
          className="rounded-xl p-5"
          style={{ background: 'rgba(201,162,85,0.05)', border: '1px solid rgba(201,162,85,0.2)' }}
        >
          <CheckCircle2 size={20} style={{ color: 'var(--copper)', marginBottom: 8 }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--text)', fontWeight: 600 }}>
            Done
          </h2>
          <p className="mt-1 mb-3" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontFamily: 'var(--font-body)' }}>
            {progress.imported} review{progress.imported === 1 ? '' : 's'} imported,
            {' '}{progress.skipped} skipped (already on Rendezvu),
            {' '}{progress.failed} couldn&apos;t be matched on TMDB.
          </p>
          <div className="flex gap-2">
            <Link
              href="/groups"
              className="px-4 py-2 rounded-lg"
              style={{ background: 'var(--copper)', color: '#000', fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}
            >
              Back to groups
            </Link>
            <button
              onClick={() => { setStatus('idle'); setRows([]); setProgress(null) }}
              className="px-4 py-2 rounded-lg transition-all hover:bg-white/5 cursor-pointer"
              style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}
            >
              Import another file
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
