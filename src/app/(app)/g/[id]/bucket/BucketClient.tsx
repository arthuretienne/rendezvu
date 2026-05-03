'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Search, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { searchMovies, getMovieDetails, getPosterUrl, upsertMovieItem, type TmdbMovie } from '@/lib/tmdb'
import type { Item, ListEntry } from '@/lib/types'

type EntryWithItem = ListEntry & { item: Item }

export default function BucketClient({
  groupId,
  userId,
  initialEntries,
}: {
  groupId: string
  userId: string
  initialEntries: EntryWithItem[]
}) {
  const supabase = createClient()
  const [entries, setEntries] = useState<EntryWithItem[]>(initialEntries)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TmdbMovie[]>([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState<number | null>(null)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const found = await searchMovies(query)
      setSearching(false)
      setResults(found)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  useEffect(() => {
    const channel = supabase
      .channel(`bucket-${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'list_entries',
        filter: `group_id=eq.${groupId}`,
      }, async payload => {
        const newRow = payload.new as ListEntry
        if (entries.some(e => e.id === newRow.id)) return
        const { data: item } = await supabase
          .from('items')
          .select('*')
          .eq('id', newRow.item_id)
          .single()
        if (item) {
          setEntries(prev => [{ ...newRow, item: item as Item }, ...prev])
        }
      })
      .on('postgres_changes', {
        event: 'DELETE', schema: 'public', table: 'list_entries',
        filter: `group_id=eq.${groupId}`,
      }, payload => {
        const deletedId = (payload.old as { id: string }).id
        setEntries(prev => prev.filter(e => e.id !== deletedId))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, groupId, entries])

  async function addMovie(tmdb: TmdbMovie) {
    setAdding(tmdb.id)
    setError('')
    const details = await getMovieDetails(tmdb.id)
    const enriched = { ...tmdb, ...(details ?? {}) }
    const item = await upsertMovieItem(supabase, enriched)
    if (!item) {
      setError('Impossible de sauvegarder le film. Réessayez.')
      setAdding(null)
      return
    }
    const { data: entry, error: insertErr } = await supabase
      .from('list_entries')
      .insert({ group_id: groupId, item_id: item.id, added_by: userId, status: 'bucket' })
      .select('*')
      .single()
    setAdding(null)
    if (insertErr) {
      if (insertErr.code === '23505') {
        setError(`«&nbsp;${tmdb.title}&nbsp;» est déjà dans la bucket.`)
      } else {
        setError(insertErr.message)
      }
      return
    }
    if (entry) {
      setEntries(prev => [{ ...(entry as ListEntry), item }, ...prev])
      setQuery('')
      setResults([])
    }
  }

  async function removeEntry(entryId: string) {
    const previous = entries
    setEntries(prev => prev.filter(e => e.id !== entryId))
    const { error } = await supabase.from('list_entries').delete().eq('id', entryId)
    if (error) {
      setError(error.message)
      setEntries(previous)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
      <header>
        <h1 className="t-h1">La bucket.</h1>
        <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-2)' }}>
          {entries.length} {entries.length > 1 ? 'films accumulés' : 'film accumulé'}.
        </p>
      </header>

      {/* Search */}
      <div className="field">
        <div className="flex items-center" style={{ gap: 'var(--s-2)', borderBottom: '1px solid var(--border-faint)' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un film sur TMDB…"
            className="input"
            style={{ borderBottom: 'none' }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]) }}
              className="btn btn-ghost"
              style={{ height: 32 }}
              aria-label="Effacer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Search results */}
      {(searching || results.length > 0) && (
        <div role="list">
          {searching && (
            <p className="t-caption" style={{ color: 'var(--text-muted)', padding: 'var(--s-3) 0' }}>
              Recherche…
            </p>
          )}
          {results.map((m) => {
            const inBucket = entries.some((e) => e.item.tmdb_id === m.id)
            return (
              <button
                key={m.id}
                onClick={() => !inBucket && addMovie(m)}
                disabled={inBucket || adding === m.id}
                role="listitem"
                className="flex items-center"
                style={{
                  width: '100%',
                  gap: 'var(--s-4)',
                  padding: 'var(--s-3) 0',
                  borderBottom: '1px solid var(--border-faint)',
                  background: 'transparent',
                  border: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: inBucket ? 'default' : 'pointer',
                  textAlign: 'left',
                }}
              >
                {m.poster_path ? (
                  <Image
                    src={getPosterUrl(m.poster_path)!}
                    alt={m.title}
                    width={36}
                    height={54}
                    style={{ objectFit: 'cover', flexShrink: 0, background: 'var(--surface)' }}
                  />
                ) : (
                  <div style={{ width: 36, height: 54, background: 'var(--surface)', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="t-body" style={{ color: 'var(--text)' }}>{m.title}</p>
                  <p className="t-caption t-tnum" style={{ color: 'var(--text-muted)' }}>
                    {m.release_date?.slice(0, 4) ?? '—'}
                  </p>
                </div>
                {inBucket ? (
                  <span className="badge badge-dim">Déjà dans la bucket</span>
                ) : (
                  <span className="t-caption" style={{ color: 'var(--accent)' }}>
                    {adding === m.id ? '…' : 'Ajouter →'}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {error && (
        <p className="t-caption" style={{ color: 'var(--accent)' }}>{error}</p>
      )}

      {/* Bucket grid */}
      <section>
        {entries.length === 0 ? (
          <p className="t-body" style={{ color: 'var(--text-muted)' }}>
            Vide pour l’instant — cherchez un film ci-dessus pour démarrer.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 'var(--s-4)',
            }}
          >
            {entries.map((e) => (
              <BucketPoster key={e.id} entry={e} onRemove={() => removeEntry(e.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function BucketPoster({ entry, onRemove }: { entry: EntryWithItem; onRemove: () => void }) {
  const poster = getPosterUrl(entry.item.poster_path)
  const isSelected = entry.status === 'selected'
  return (
    <div className="poster">
      {poster ? (
        <Image
          src={poster}
          alt={entry.item.title}
          fill
          sizes="(min-width: 640px) 200px, 50vw"
          style={{ objectFit: 'cover' }}
        />
      ) : null}
      <div className="poster-overlay">
        <p className="t-h3" style={{ color: 'var(--text)' }}>{entry.item.title}</p>
        <p className="t-caption t-tnum" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-1)' }}>
          {entry.item.year ?? '—'}
        </p>
      </div>
      {isSelected && (
        <span
          className="badge badge-accent"
          style={{ position: 'absolute', top: 'var(--s-2)', left: 'var(--s-2)', background: 'var(--ink)' }}
        >
          Tiré
        </span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); onRemove() }}
        title="Retirer"
        style={{
          position: 'absolute',
          top: 'var(--s-2)',
          right: 'var(--s-2)',
          background: 'color-mix(in oklab, var(--ink) 70%, transparent)',
          color: 'var(--text)',
          border: 'none',
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          borderRadius: 2,
        }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
