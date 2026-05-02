'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Star, Eye, EyeOff, MessageCircle, Crown, Film } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { getPosterUrl } from '@/lib/tmdb'
import type { Group, Item, ListEntry, Profile, Review, Watch } from '@/lib/types'

type EntryWithItem = ListEntry & { item: Item; watches: Pick<Watch, 'user_id' | 'watched_at'>[] }
type ReviewWithAuthor = Review & {
  author: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>
}
type Member = Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>

const REACTION_EMOJIS = ['❤️', '🔥', '😂', '😭', '🤯', '👏']

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
  const [composing, setComposing] = useState<string | null>(null) // item_id we're composing for
  const [revealed, setRevealed] = useState<Set<string>>(new Set())

  // Map of item_id → review[] for quick lookup
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

  // Realtime: pick up new reviews from other members on watched items
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
    // Upsert: if user already has a review for this item, update; else insert
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
        id: userId, username: '?', display_name: 'You', avatar_url: null, is_patron: false,
      }
      setReviews(prev => [{ ...(data as Review), author }, ...prev])
    }
    setComposing(null)
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="marquee">Watched</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--text)', fontWeight: 600 }}>
          History & reviews
        </h1>
      </header>

      {entries.length === 0 ? (
        <div
          className="rounded-xl p-6 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
            Nothing watched yet. Draw a film and mark it watched to start your history.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {entries.map(entry => {
            const itemReviews = reviewsByItem.get(entry.item_id) ?? []
            const myReview = itemReviews.find(r => r.user_id === userId)
            const watchersExceptMe = entry.watches.filter(w => w.user_id !== userId)
            return (
              <article
                key={entry.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex gap-3 p-3">
                  {entry.item.poster_path ? (
                    <Image
                      src={getPosterUrl(entry.item.poster_path)!}
                      alt={entry.item.title}
                      width={80}
                      height={120}
                      className="rounded flex-shrink-0 object-cover"
                    />
                  ) : (
                    <div className="w-20 h-[120px] rounded flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-2)' }}>
                      <Film size={24} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text)', fontWeight: 600 }}>
                      {entry.item.title}
                    </h2>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>
                      {entry.item.year ?? '—'}
                      {entry.item.runtime ? ` · ${entry.item.runtime}min` : ''}
                      {entry.watched_at ? ` · Watched ${format(new Date(entry.watched_at), 'MMM d')}` : ''}
                    </p>
                    {watchersExceptMe.length > 0 && (
                      <p className="mt-2" style={{ fontSize: '0.7rem', color: 'var(--copper)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                        ✓ {watchersExceptMe.map(w => memberById.get(w.user_id)?.display_name).filter(Boolean).join(', ')}
                      </p>
                    )}
                    {!userHasWatched(entry) && (
                      <p className="mt-1" style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                        You haven&apos;t watched this yet.
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)' }}>
                  {itemReviews.map(review => {
                    const blur = shouldBlur(entry, review)
                    return (
                      <div key={review.id} className="px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                        <div className="flex items-start gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--copper)', color: '#000', fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700 }}
                          >
                            {review.author.display_name[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span style={{ color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
                                {review.author.display_name}
                              </span>
                              {review.author.is_patron && <Crown size={10} style={{ color: 'var(--copper)' }} />}
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded" style={{ background: 'rgba(201,162,85,0.1)', color: 'var(--copper)', fontSize: '0.66rem', fontFamily: 'var(--font-mono)' }}>
                                <Star size={9} fill="currentColor" /> {review.rating}/10
                              </span>
                              {review.is_rewatch && (
                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                  Rewatch
                                </span>
                              )}
                              {review.user_id === userId && (
                                <button
                                  onClick={() => setComposing(entry.item_id)}
                                  className="ml-auto px-2 py-0.5 rounded transition-all hover:bg-white/5 cursor-pointer"
                                  style={{ color: 'var(--text-muted)', fontSize: '0.66rem', fontFamily: 'var(--font-body)' }}
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                            {review.body && (
                              <div className="relative mt-1.5">
                                <p
                                  className="whitespace-pre-wrap"
                                  style={{
                                    color: blur ? 'transparent' : 'var(--text-muted)',
                                    textShadow: blur ? '0 0 12px rgba(255,255,255,0.5)' : 'none',
                                    fontSize: '0.85rem',
                                    fontFamily: 'var(--font-body)',
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {review.body}
                                </p>
                                {blur && (
                                  <button
                                    onClick={() => setRevealed(prev => new Set(prev).add(review.id))}
                                    className="absolute inset-0 flex items-center justify-center gap-1.5 transition-all hover:bg-black/10 cursor-pointer rounded"
                                    style={{ color: 'var(--copper)', fontSize: '0.78rem', fontFamily: 'var(--font-body)', backdropFilter: 'blur(6px)' }}
                                  >
                                    <EyeOff size={13} />
                                    Hidden — tap to reveal
                                  </button>
                                )}
                                {!blur && revealed.has(review.id) && (
                                  <button
                                    onClick={() => setRevealed(prev => {
                                      const n = new Set(prev); n.delete(review.id); return n
                                    })}
                                    className="mt-1 flex items-center gap-1 transition-all hover:opacity-70 cursor-pointer"
                                    style={{ color: 'var(--text-muted)', fontSize: '0.66rem' }}
                                  >
                                    <Eye size={11} /> Hide again
                                  </button>
                                )}
                              </div>
                            )}
                            <ReactionsBar
                              reviewId={review.id}
                              userId={userId}
                              supabase={supabase}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Compose review CTA */}
                  {composing === entry.item_id ? (
                    <ReviewComposer
                      entryItemId={entry.item_id}
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
                        className="w-full px-4 py-2.5 transition-all hover:bg-white/5 cursor-pointer"
                        style={{ borderTop: '1px solid var(--border)', color: 'var(--copper)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}
                      >
                        + Write a review
                      </button>
                    )
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
  entryItemId,
  existing,
  onSubmit,
  onCancel,
}: {
  entryItemId: string
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
      className="px-4 py-3 space-y-3"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <label style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Rating
        </label>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className="w-6 h-6 rounded text-xs transition-all cursor-pointer"
              style={{
                background: rating >= n ? 'var(--copper)' : 'transparent',
                color: rating >= n ? '#000' : 'var(--text-muted)',
                border: `1px solid ${rating >= n ? 'var(--copper)' : 'var(--border)'}`,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
              }}
              aria-label={`Rating ${n}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={3}
        placeholder="What did you think? (optional)"
        className="w-full px-3 py-2 rounded-lg outline-none resize-none"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.85rem',
        }}
      />
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-1.5 cursor-pointer" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <input
            type="checkbox"
            checked={containsSpoilers}
            onChange={e => setContainsSpoilers(e.target.checked)}
          />
          Contains spoilers
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <input
            type="checkbox"
            checked={isRewatch}
            onChange={e => setIsRewatch(e.target.checked)}
          />
          Rewatch
        </label>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-3 py-1.5 rounded-lg transition-all hover:bg-white/5 cursor-pointer"
            style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-3 py-1.5 rounded-lg transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
            style={{ background: 'var(--copper)', color: '#000', fontSize: '0.8rem', fontFamily: 'var(--font-display)' }}
          >
            {submitting ? '…' : existing ? 'Save' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  )
}

function ReactionsBar({
  reviewId,
  userId,
  supabase,
}: {
  reviewId: string
  userId: string
  supabase: ReturnType<typeof createClient>
}) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [mine, setMine] = useState<Set<string>>(new Set())
  const [picking, setPicking] = useState(false)

  useEffect(() => {
    let active = true
    supabase
      .from('review_reactions')
      .select('emoji, user_id')
      .eq('review_id', reviewId)
      .then(({ data }) => {
        if (!active || !data) return
        const c: Record<string, number> = {}
        const m = new Set<string>()
        for (const r of data as { emoji: string; user_id: string }[]) {
          c[r.emoji] = (c[r.emoji] ?? 0) + 1
          if (r.user_id === userId) m.add(r.emoji)
        }
        setCounts(c)
        setMine(m)
      })
    return () => { active = false }
  }, [reviewId, userId, supabase])

  async function toggle(emoji: string) {
    if (mine.has(emoji)) {
      setMine(prev => { const n = new Set(prev); n.delete(emoji); return n })
      setCounts(prev => ({ ...prev, [emoji]: Math.max(0, (prev[emoji] ?? 1) - 1) }))
      await supabase.from('review_reactions').delete().eq('review_id', reviewId).eq('user_id', userId).eq('emoji', emoji)
    } else {
      setMine(prev => new Set(prev).add(emoji))
      setCounts(prev => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }))
      await supabase.from('review_reactions').insert({ review_id: reviewId, user_id: userId, emoji })
    }
    setPicking(false)
  }

  const activeEmojis = Object.entries(counts).filter(([, n]) => n > 0)

  return (
    <div className="mt-2 flex items-center gap-1 flex-wrap">
      {activeEmojis.map(([emoji, n]) => (
        <button
          key={emoji}
          onClick={() => toggle(emoji)}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded transition-all hover:bg-white/5 cursor-pointer"
          style={{
            background: mine.has(emoji) ? 'rgba(201,162,85,0.15)' : 'var(--surface-2)',
            border: `1px solid ${mine.has(emoji) ? 'var(--copper)' : 'var(--border)'}`,
            fontSize: '0.7rem',
          }}
        >
          {emoji} <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{n}</span>
        </button>
      ))}
      {!picking ? (
        <button
          onClick={() => setPicking(true)}
          className="p-0.5 px-1.5 rounded transition-all hover:bg-white/5 cursor-pointer"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.7rem' }}
        >
          + 😊
        </button>
      ) : (
        <div className="flex gap-1 px-2 py-1 rounded" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          {REACTION_EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => toggle(e)}
              className="transition-all hover:scale-110 cursor-pointer"
              style={{ fontSize: '0.95rem' }}
            >
              {e}
            </button>
          ))}
          <button
            onClick={() => setPicking(false)}
            className="px-1 transition-all hover:opacity-70 cursor-pointer"
            style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
