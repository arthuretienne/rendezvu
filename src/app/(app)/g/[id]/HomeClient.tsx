'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Shuffle, Calendar, Film, Copy, Check, Users, Crown } from 'lucide-react'
import { addWeeks, addMonths, format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { getPosterUrl } from '@/lib/tmdb'
import type { Group, Item, ListEntry, Profile, Frequency } from '@/lib/types'

type EntryWithItem = ListEntry & { item: Item }
type MemberProfile = Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>

const FREQ_LABELS: Record<Frequency, string> = {
  weekly: 'Every week',
  biweekly: 'Every 2 weeks',
  monthly: 'Every month',
}

function nextDateFor(freq: Frequency): Date {
  const now = new Date()
  if (freq === 'weekly') return addWeeks(now, 1)
  if (freq === 'biweekly') return addWeeks(now, 2)
  return addMonths(now, 1)
}

export default function HomeClient({
  groupId,
  userId,
  group,
  selectedEntry: initialSelected,
  bucketCount: initialBucketCount,
  members,
  watchedUserIds: initialWatched,
}: {
  groupId: string
  userId: string
  group: Group
  selectedEntry: EntryWithItem | null
  bucketCount: number
  members: MemberProfile[]
  watchedUserIds: string[]
}) {
  const supabase = createClient()
  const router = useRouter()
  const [selected, setSelected] = useState<EntryWithItem | null>(initialSelected)
  const [bucketCount, setBucketCount] = useState(initialBucketCount)
  const [nextDrawAt, setNextDrawAt] = useState<string | null>(group.next_draw_at)
  const [watchedBy, setWatchedBy] = useState<string[]>(initialWatched)
  const [drawing, setDrawing] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const isLocalDraw = useRef(false)

  // Realtime: pick up draws from other members
  useEffect(() => {
    const channel = supabase
      .channel(`home-${groupId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'list_entries',
        filter: `group_id=eq.${groupId}`,
      }, async payload => {
        const updated = payload.new as ListEntry
        if (isLocalDraw.current) return
        if (updated.status === 'selected') {
          // Hydrate item then animate
          const { data: item } = await supabase
            .from('items')
            .select('*')
            .eq('id', updated.item_id)
            .single()
          if (item) {
            setSpinning(true)
            setTimeout(() => {
              setSelected({ ...updated, item: item as Item })
              setSpinning(false)
              setWatchedBy([])
            }, 1200)
          }
        } else if (updated.status === 'watched_by_some' || updated.status === 'watched_by_all') {
          if (selected && updated.id === selected.id) {
            setSelected(null)
            router.refresh()
          }
        }
      })
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'watches',
      }, payload => {
        const watch = payload.new as { list_entry_id: string; user_id: string }
        if (selected && watch.list_entry_id === selected.id) {
          setWatchedBy(prev => prev.includes(watch.user_id) ? prev : [...prev, watch.user_id])
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, groupId, selected, router])

  async function copyInvite() {
    const url = `${window.location.origin}/invite/${group.invite_token}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function drawMovie() {
    isLocalDraw.current = true
    setDrawing(true)
    setSpinning(true)
    setError('')
    try {
      // Reset previous selection back to bucket
      if (selected) {
        await supabase
          .from('list_entries')
          .update({ status: 'bucket', selected_at: null })
          .eq('id', selected.id)
      }
      // Pick a random bucket entry (excludes 'selected' and 'watched_*')
      const { data: bucket, error: bucketErr } = await supabase
        .from('list_entries')
        .select(`
          id, group_id, item_id, added_by, status, selected_at, watched_at,
          draw_count, added_at,
          item:items!inner (
            id, kind, tmdb_id, title, year, poster_path, overview, runtime, genres
          )
        `)
        .eq('group_id', groupId)
        .eq('status', 'bucket')
        .returns<EntryWithItem[]>()
      if (bucketErr) throw bucketErr
      if (!bucket || bucket.length === 0) {
        setError('No movies in the bucket. Add some first.')
        setDrawing(false)
        setSpinning(false)
        isLocalDraw.current = false
        return
      }
      const picked = bucket[Math.floor(Math.random() * bucket.length)]
      // Mark as selected, bump draw_count
      const { data: updated, error: updateErr } = await supabase
        .from('list_entries')
        .update({
          status: 'selected',
          selected_at: new Date().toISOString(),
          draw_count: picked.draw_count + 1,
        })
        .eq('id', picked.id)
        .select(`
          id, group_id, item_id, added_by, status, selected_at, watched_at,
          draw_count, added_at,
          item:items!inner (
            id, kind, tmdb_id, title, year, poster_path, overview, runtime, genres
          )
        `)
        .single()
        .returns<EntryWithItem>()
      if (updateErr || !updated) throw updateErr ?? new Error('Update failed')
      // Update group next_draw_at
      const next = nextDateFor(group.rules.frequency).toISOString()
      await supabase.from('groups').update({ next_draw_at: next }).eq('id', groupId)
      setTimeout(() => {
        setSelected(updated)
        setNextDrawAt(next)
        setBucketCount(c => Math.max(0, c - 1))
        setWatchedBy([])
        setSpinning(false)
        setDrawing(false)
        isLocalDraw.current = false
      }, 1200)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Draw failed'
      setError(message)
      setSpinning(false)
      setDrawing(false)
      isLocalDraw.current = false
    }
  }

  async function markWatched() {
    if (!selected) return
    if (watchedBy.includes(userId)) return
    setError('')
    const { error } = await supabase
      .from('watches')
      .insert({ list_entry_id: selected.id, user_id: userId, source: 'manual' })
    if (error) {
      setError(error.message)
      return
    }
    setWatchedBy(prev => [...prev, userId])
    // The trigger flips list_entry.status. Push to /watched after a beat.
    setTimeout(() => {
      router.push(`/g/${groupId}/watched`)
      router.refresh()
    }, 600)
  }

  const poster = selected ? getPosterUrl(selected.item.poster_path) : null
  const iWatched = selected && watchedBy.includes(userId)
  const otherWatchers = watchedBy.filter(id => id !== userId)
  const onlyMember = members.length <= 1

  return (
    <div className="space-y-5 curtain-in">

      {/* Invite banner if alone */}
      {onlyMember && (
        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(201,162,85,0.06)', border: '1px solid rgba(201,162,85,0.2)' }}
        >
          <div className="flex items-center gap-3">
            <Users size={16} style={{ color: 'var(--copper)', flexShrink: 0 }} />
            <div className="flex-1">
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--text)', fontWeight: 500 }}>
                Invite someone to this group
              </p>
              <p className="mt-0.5" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Share the link — they sign up and join instantly.
              </p>
            </div>
            <button
              onClick={copyInvite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-85 cursor-pointer"
              style={{ background: 'var(--copper)', color: '#000' }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>
      )}

      {/* Members + queue bar */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--copper)', color: '#000', fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700 }}
              >
                {m.display_name[0]?.toUpperCase()}
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {m.display_name}
              </span>
              {m.is_patron && <Crown size={10} style={{ color: 'var(--copper)' }} />}
            </div>
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
          {FREQ_LABELS[group.rules.frequency]} · {bucketCount} queued
        </span>
      </div>

      {error && (
        <p style={{ color: '#fca5a5', fontSize: '0.78rem', fontFamily: 'var(--font-body)' }}>{error}</p>
      )}

      {/* Now showing */}
      {selected ? (
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
        >
          {poster && (
            <div
              aria-hidden
              style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${poster})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                filter: 'blur(32px) saturate(0.5) brightness(0.25)',
                transform: 'scale(1.1)',
                pointerEvents: 'none',
              }}
            />
          )}
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(201,162,85,0.04) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)', pointerEvents: 'none' }} />

          <div className="relative flex gap-0">
            <div className="flex-shrink-0" style={{ width: 140 }}>
              {poster ? (
                <Image
                  src={poster}
                  alt={selected.item.title}
                  width={140}
                  height={210}
                  className={`w-full object-cover ${spinning ? 'draw-spin' : ''}`}
                  style={{ height: 210 }}
                />
              ) : (
                <div className="w-full flex items-center justify-center" style={{ height: 210, background: 'var(--surface-2)' }}>
                  <Film size={32} style={{ color: 'var(--text-muted)' }} />
                </div>
              )}
            </div>

            <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--copper)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
                  ◆ Now Showing
                </span>
                <h2 className="mt-2" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: 'var(--text)', fontWeight: 600, lineHeight: 1.15, letterSpacing: '0.01em' }}>
                  {selected.item.title}
                </h2>
                <p
                  className="mt-1.5"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                >
                  {selected.item.year ?? '—'}
                  {selected.item.runtime ? ` · ${selected.item.runtime} min` : ''}
                </p>
                {selected.item.overview && (
                  <p
                    className="mt-3 line-clamp-3"
                    style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}
                  >
                    {selected.item.overview}
                  </p>
                )}
                {otherWatchers.length > 0 && (
                  <p
                    className="mt-3"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--copper)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                  >
                    Watched by {otherWatchers.map(id => members.find(m => m.id === id)?.display_name).filter(Boolean).join(', ')}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-4 flex-wrap">
                <button
                  onClick={markWatched}
                  disabled={!!iWatched}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', letterSpacing: '0.03em', background: 'var(--copper)', color: '#000', boxShadow: '0 4px 16px rgba(201,162,85,0.3)' }}
                >
                  {iWatched ? 'You watched it' : 'Mark as watched'}
                </button>
                <button
                  onClick={drawMovie}
                  disabled={drawing}
                  className="px-4 py-2 rounded-xl text-sm transition-all hover:bg-white/8 disabled:opacity-40 cursor-pointer"
                  style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)', border: '1px solid var(--border)' }}
                >
                  Redraw
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
        >
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${spinning ? 'reel-spin' : ''}`}
              style={{ border: '1px solid rgba(201,162,85,0.3)', background: 'rgba(201,162,85,0.06)', boxShadow: spinning ? '0 0 24px rgba(201,162,85,0.2)' : 'none' }}
            >
              <Shuffle size={22} style={{ color: 'var(--copper)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text)', fontWeight: 600, letterSpacing: '0.01em' }}>
              Ready to draw?
            </h2>
            <p
              className="mt-1 mb-6"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
            >
              {bucketCount > 0 ? `${bucketCount} film${bucketCount > 1 ? 's' : ''} in the queue` : 'Add movies to the bucket first'}
            </p>
            <button
              onClick={drawMovie}
              disabled={drawing || bucketCount === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 hover:opacity-90 cursor-pointer"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.04em', background: 'var(--copper)', color: '#000', boxShadow: '0 4px 24px rgba(201,162,85,0.25)' }}
            >
              <Shuffle size={15} />
              {drawing ? 'Drawing…' : 'Draw a film'}
            </button>
          </div>
        </div>
      )}

      {nextDrawAt && (
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <Calendar size={13} style={{ color: 'var(--copper)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
            Next draw: <span style={{ color: 'var(--text-dim)' }}>{format(new Date(nextDrawAt), 'EEEE, MMMM d')}</span>
          </span>
        </div>
      )}
    </div>
  )
}
