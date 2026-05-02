'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Plus, Search, Trash2, Film, X } from 'lucide-react'
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

  // Debounced TMDB search
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

  // Realtime: pick up entries other members add/remove
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
    // Pull details for runtime + genres
    const details = await getMovieDetails(tmdb.id)
    const enriched = { ...tmdb, ...(details ?? {}) }
    const item = await upsertMovieItem(supabase, enriched)
    if (!item) {
      setError('Could not save the movie metadata. Try again.')
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
        setError(`"${tmdb.title}" is already in this bucket.`)
      } else {
        setError(insertErr.message)
      }
      return
    }
    if (entry) {
      setEntries(prev => [{ ...(entry as ListEntry), item }, ...prev])
      // Clear search to encourage adding more
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
    <div className="space-y-5">
      <header>
        <p className="marquee">Bucket</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--text)', fontWeight: 600 }}>
          Add movies to watch
        </h1>
      </header>

      {/* Search */}
      <div
        className="rounded-xl px-3 py-2"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search a movie on TMDB…"
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]) }}
              className="p-1 rounded transition-all hover:bg-white/5 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Search results */}
      {(searching || results.length > 0) && (
        <div
          className="rounded-xl p-2 space-y-1"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {searching && (
            <p className="px-3 py-2" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Searching…
            </p>
          )}
          {results.map(m => {
            const inBucket = entries.some(e => e.item.tmdb_id === m.id)
            return (
              <button
                key={m.id}
                onClick={() => !inBucket && addMovie(m)}
                disabled={inBucket || adding === m.id}
                className="w-full flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-white/5 disabled:opacity-50 cursor-pointer text-left"
              >
                {m.poster_path ? (
                  <Image
                    src={getPosterUrl(m.poster_path)!}
                    alt={m.title}
                    width={36}
                    height={54}
                    className="rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-[54px] rounded flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-2)' }}>
                    <Film size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p style={{ color: 'var(--text)', fontSize: '0.88rem', fontFamily: 'var(--font-body)' }}>
                    {m.title}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                    {m.release_date?.slice(0, 4) ?? '—'}
                  </p>
                </div>
                {inBucket ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.66rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    In bucket
                  </span>
                ) : (
                  <span
                    className="flex items-center gap-1 px-2 py-1 rounded"
                    style={{ background: 'var(--copper)', color: '#000', fontSize: '0.7rem' }}
                  >
                    <Plus size={11} />
                    {adding === m.id ? '…' : 'Add'}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {error && (
        <p style={{ color: '#fca5a5', fontSize: '0.78rem', fontFamily: 'var(--font-body)' }}>{error}</p>
      )}

      {/* Bucket list */}
      <section>
        <p
          className="mb-2"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          {entries.length} in queue
        </p>
        {entries.length === 0 ? (
          <div
            className="rounded-xl p-6 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
              Empty for now — search above to add your first film.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {entries.map(e => (
              <BucketCard key={e.id} entry={e} onRemove={() => removeEntry(e.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function BucketCard({ entry, onRemove }: { entry: EntryWithItem; onRemove: () => void }) {
  const poster = getPosterUrl(entry.item.poster_path)
  const isSelected = entry.status === 'selected'
  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{ background: 'var(--surface)', border: `1px solid ${isSelected ? 'var(--copper)' : 'var(--border)'}` }}
    >
      <div className="aspect-[2/3] relative">
        {poster ? (
          <Image src={poster} alt={entry.item.title} fill className="object-cover" sizes="(min-width: 640px) 200px, 50vw" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
            <Film size={28} style={{ color: 'var(--text-muted)' }} />
          </div>
        )}
        {isSelected && (
          <span
            className="absolute top-2 left-2 px-2 py-0.5 rounded"
            style={{ background: 'var(--copper)', color: '#000', fontSize: '0.55rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            Selected
          </span>
        )}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 rounded-full transition-all hover:opacity-100 cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.6)', color: 'white', opacity: 0.7 }}
          title="Remove"
        >
          <Trash2 size={11} />
        </button>
      </div>
      <div className="p-2">
        <p
          className="line-clamp-1"
          style={{ color: 'var(--text)', fontSize: '0.82rem', fontFamily: 'var(--font-body)' }}
        >
          {entry.item.title}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.66rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', marginTop: 1 }}>
          {entry.item.year ?? '—'}
        </p>
      </div>
    </div>
  )
}
