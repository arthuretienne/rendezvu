'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Eye, EyeOff, Star } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { getPosterUrl } from '@/lib/tmdb'
import type { Group, Item, ListEntry, Profile, Review, Watch } from '@/lib/types'

type EntryWithItem = ListEntry & { item: Item; watches: Pick<Watch, 'user_id' | 'watched_at'>[] }
type ReviewWithAuthor = Review & {
  author: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>
}
type Member = Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>

export default function WatchedClient({
  groupId,
  userId,
  group,
  entries: initialEntries,
  reviews: initialReviews,
  members,
}: {
  groupId: string
  userId: string
  group: Pick<Group, 'id' | 'rules'>
  entries: EntryWithItem[]
  reviews: ReviewWithAuthor[]
  members: Member[]
}) {
  const supabase = createClient()
  const [entries] = useState<EntryWithItem[]>(initialEntries)
  const [reviews, setReviews] = useState<ReviewWithAuthor[]>(initialReviews)
  const [composing, setComposing] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())

  const reviewsByItem = useMemo(() => {
    const m = new Map<string, ReviewWithAuthor[]>()
    for (const r of reviews) {
      const arr = m.get(r.item_id) ?? []
      arr.push(r)
      m.set(r.item_id, arr)
    }
    return m
  }, [reviews])

  const memberById = useMemo(() => {
    const m = new Map<string, Member>()
    for (const x of members) m.set(x.id, x)
    return m
  }, [members])

  useEffect(() => {
    const itemIds = entries.map(e => e.item_id)
    if (itemIds.length === 0) return

    const channel = supabase
      .channel(`reviews-${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'reviews',
      }, async payload => {
        const r = payload.new as Review
        if (!itemIds.includes(r.item_id) || r.user_id === userId) return
        const author = memberById.get(r.user_id)
        if (!author) return
        setReviews(prev => prev.some(x => x.id === r.id) ? prev : [{ ...r, author }, ...prev])
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'reviews',
      }, payload => {
        const r = payload.new as Review
        if (!itemIds.includes(r.item_id)) return
        setReviews(prev => prev.map(x => x.id === r.id ? { ...x, ...r } : x))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, groupId, userId, entries, memberById])

  function userHasWatched(entry: EntryWithItem) {
    return entry.watches.some(w => w.user_id === userId)
  }

  function shouldBlur(entry: EntryWithItem, review: ReviewWithAuthor) {
    if (review.user_id === userId) return false
    if (revealed.has(review.id)) return false
    const mode = group.rules.spoiler_blur
    if (mode === 'until_watched') return !userHasWatched(entry)
    if (mode === 'tagged') return review.contains_spoilers
    if (mode === 'tap') return true
    return false
  }

  async function submitReview(itemId: string, payload: { rating: number; body: string; contains_spoilers: boolean; is_rewatch: boolean }) {
    const existing = reviews.find(r => r.item_id === itemId && r.user_id === userId)
    if (existing) {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          rating: payload.rating,
          body: payload.body,
          contains_spoilers: payload.contains_spoilers,
          is_rewatch: payload.is_rewatch,
          updated_at: new Date().toISOString(),
          edit_count: existing.edit_count + 1,
        })
        .eq('id', existing.id)
        .select('*')
        .single()
      if (error) throw error
      const updated = { ...(data as Review), author: existing.author }
      setReviews(prev => prev.map(r => r.id === existing.id ? updated : r))
    } else {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          item_id: itemId,
          user_id: userId,
          group_id: groupId,
          rating: payload.rating,
          body: payload.body,
          contains_spoilers: payload.contains_spoilers,
          is_rewatch: payload.is_rewatch,
        })
        .select('*')
        .single()
      if (error) throw error
      const author = memberById.get(userId) ?? {
        id: userId, username: '?', display_name: 'Vous', avatar_url: null, is_patron: false,
      }
      setReviews(prev => [{ ...(data as Review), author }, ...prev])
    }
    setComposing(null)
  }

  const earliest = entries.at(-1)?.watched_at
  const monthLabel = earliest ? format(new Date(earliest), 'MMMM yyyy', { locale: fr }) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
      <header>
        <h1 className="t-h1">Ce qu&apos;on a vu ensemble.</h1>
        <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-2)' }}>
          {entries.length} {entries.length > 1 ? 'films' : 'film'}
          {monthLabel ? `, depuis ${monthLabel}` : ''}.
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="t-body" style={{ color: 'var(--text-muted)' }}>
          Rien encore. Tirez un film, marquez-le comme vu, et l&apos;histoire commence.
        </p>
      ) : (
        <div>
          {entries.map((entry, idx) => {
            const itemReviews = reviewsByItem.get(entry.item_id) ?? []
            const myReview = itemReviews.find(r => r.user_id === userId)
            const avgRating = itemReviews.length > 0
              ? itemReviews.reduce((s, r) => s + r.rating, 0) / itemReviews.length
              : null
            return (
              <article
                key={entry.id}
                style={{
                  paddingBlock: 'var(--s-6)',
                  borderTop: idx === 0 ? '1px solid var(--border-faint)' : 'none',
                  borderBottom: '1px solid var(--border-faint)',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 96px) 1fr',
                  gap: 'var(--s-5)',
                }}
              >
                <div style={{ aspectRatio: '2/3', background: 'var(--surface)' }}>
                  {entry.item.poster_path ? (
                    <Image
                      src={getPosterUrl(entry.item.poster_path)!}
                      alt={entry.item.title}
                      width={96}
                      height={144}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : null}
                </div>

                <div style={{ minWidth: 0 }}>
                  <h2 className="t-h2" style={{ marginBottom: 'var(--s-2)' }}>
                    {entry.item.title}
                    {entry.item.year ? ` (${entry.item.year})` : ''}
                  </h2>
                  <p className="t-caption" style={{ color: 'var(--text-muted)', marginBottom: 'var(--s-4)' }}>
                    {entry.watched_at && (
                      <>Vu le {format(new Date(entry.watched_at), 'd MMMM', { locale: fr })}</>
                    )}
                    {avgRating !== null && (
                      <> · Note du groupe&nbsp;: <span style={{ color: 'var(--accent)' }}>★</span> {avgRating.toFixed(1)}/10</>
                    )}
                  </p>

                  {/* Reviews per member */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
                    {itemReviews.map(review => {
                      const blur = shouldBlur(entry, review)
                      return (
                        <div key={review.id}>
                          <p className="t-body" style={{ color: 'var(--text)' }}>
                            <span style={{ fontWeight: 500 }}>
                              {review.user_id === userId ? 'Vous' : review.author.display_name}
                            </span>
                            <span className="t-caption" style={{ color: 'var(--text-muted)', marginLeft: 'var(--s-2)' }}>
                              <span style={{ color: 'var(--accent)' }}>★</span> {review.rating}/10
                              {review.is_rewatch ? ' · revisionnage' : ''}
                              {review.user_id === userId && (
                                <>
                                  {' · '}
                                  <button
                                    onClick={() => setComposing(entry.item_id)}
                                    className="link"
                                    style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}
                                  >
                                    modifier
                                  </button>
                                </>
                              )}
                            </span>
                          </p>
                          {review.body && (
                            <div style={{ marginTop: 'var(--s-1)', position: 'relative' }}>
                              <p
                                className="t-body"
                                style={{
                                  color: blur ? 'transparent' : 'var(--text-muted)',
                                  textShadow: blur ? '0 0 12px rgba(232,228,217,0.5)' : 'none',
                                  whiteSpace: 'pre-wrap',
                                }}
                              >
                                {review.body}
                              </p>
                              {blur && (
                                <button
                                  onClick={() => setRevealed(prev => new Set(prev).add(review.id))}
                                  style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--accent)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--s-2)',
                                    fontSize: 13,
                                  }}
                                >
                                  <EyeOff size={13} /> Masqué — cliquer pour révéler
                                </button>
                              )}
                              {!blur && revealed.has(review.id) && (
                                <button
                                  onClick={() => setRevealed(prev => {
                                    const n = new Set(prev); n.delete(review.id); return n
                                  })}
                                  className="t-caption"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    marginTop: 'var(--s-1)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 'var(--s-1)',
                                  }}
                                >
                                  <Eye size={11} /> Masquer à nouveau
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {composing === entry.item_id ? (
                    <ReviewComposer
                      existing={myReview}
                      onSubmit={async data => {
                        try { await submitReview(entry.item_id, data) }
                        catch (e) { console.error(e); alert((e as Error).message) }
                      }}
                      onCancel={() => setComposing(null)}
                    />
                  ) : (
                    !myReview && userHasWatched(entry) && (
                      <button
                        onClick={() => setComposing(entry.item_id)}
                        className="link t-caption"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          marginTop: 'var(--s-3)',
                          cursor: 'pointer',
                        }}
                      >
                        + Écrire ce que vous en avez pensé
                      </button>
                    )
                  )}
                  {!userHasWatched(entry) && (
                    <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-3)' }}>
                      Vous ne l&apos;avez pas encore vu.
                    </p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ReviewComposer({
  existing,
  onSubmit,
  onCancel,
}: {
  existing?: ReviewWithAuthor
  onSubmit: (data: { rating: number; body: string; contains_spoilers: boolean; is_rewatch: boolean }) => Promise<void>
  onCancel: () => void
}) {
  const [rating, setRating] = useState<number>(existing?.rating ?? 8)
  const [body, setBody] = useState(existing?.body ?? '')
  const [containsSpoilers, setContainsSpoilers] = useState(existing?.contains_spoilers ?? false)
  const [isRewatch, setIsRewatch] = useState(existing?.is_rewatch ?? false)
  const [submitting, setSubmitting] = useState(false)

  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        setSubmitting(true)
        await onSubmit({ rating, body: body.trim(), contains_spoilers: containsSpoilers, is_rewatch: isRewatch })
        setSubmitting(false)
      }}
      style={{
        marginTop: 'var(--s-4)',
        paddingTop: 'var(--s-4)',
        borderTop: '1px solid var(--border-faint)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s-4)',
      }}
    >
      <div className="field">
        <label className="field-label">Note (sur 10)</label>
        <div className="flex" style={{ gap: 'var(--s-1)', flexWrap: 'wrap', marginTop: 'var(--s-1)' }}>
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className="star-btn"
              style={{
                background: 'none',
                border: 'none',
                padding: 4,
                cursor: 'pointer',
                color: rating >= n ? 'var(--accent)' : 'var(--text-muted)',
              }}
              aria-label={`Note ${n}`}
            >
              <Star size={20} fill={rating >= n ? 'currentColor' : 'none'} strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="review-body">Ce que vous en avez pensé</label>
        <textarea
          id="review-body"
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={3}
          placeholder="(facultatif)"
          className="textarea"
        />
      </div>

      <div className="flex items-center" style={{ gap: 'var(--s-5)', flexWrap: 'wrap' }}>
        <label className="t-caption flex items-center" style={{ gap: 'var(--s-2)', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={containsSpoilers}
            onChange={e => setContainsSpoilers(e.target.checked)}
          />
          Contient des spoilers
        </label>
        <label className="t-caption flex items-center" style={{ gap: 'var(--s-2)', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isRewatch}
            onChange={e => setIsRewatch(e.target.checked)}
          />
          Revisionnage
        </label>
        <div className="flex" style={{ gap: 'var(--s-3)', marginLeft: 'auto' }}>
          <button type="button" onClick={onCancel} disabled={submitting} className="btn btn-ghost">
            Annuler
          </button>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? '…' : existing ? 'Enregistrer' : 'Publier'}
          </button>
        </div>
      </div>
    </form>
  )
}
