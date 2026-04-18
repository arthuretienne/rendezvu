'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getPosterUrl } from '@/lib/tmdb'
import { Movie, Group, Frequency, Profile } from '@/lib/types'
import { Shuffle, Calendar, Film, Settings as SettingsIcon, Copy, Check, Users, Link as LinkIcon } from 'lucide-react'
import { addWeeks, addMonths, format } from 'date-fns'
import Image from 'next/image'

const FREQ_LABELS: Record<Frequency, string> = {
  weekly: 'Every week',
  biweekly: 'Every 2 weeks',
  monthly: 'Every month',
}

function getNextDate(f: Frequency) {
  const now = new Date()
  if (f === 'weekly') return addWeeks(now, 1)
  if (f === 'biweekly') return addWeeks(now, 2)
  return addMonths(now, 1)
}

export default function HomeClient({ userId, groupId, group, currentMovie, bucketCount, members }: {
  userId: string
  groupId: string
  group: Group | null
  currentMovie: Movie | null
  bucketCount: number
  members: Pick<Profile, 'id' | 'name' | 'email'>[]
}) {
  const [movie, setMovie] = useState<Movie | null>(currentMovie)
  const [freq, setFreq] = useState<Frequency>(group?.frequency ?? 'biweekly')
  const [nextDate, setNextDate] = useState<string | null>(group?.next_draw_date ?? null)
  const [drawing, setDrawing] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const isDrawing = useRef(false)

  useEffect(() => {
    const channel = supabase
      .channel(`home-draw-${groupId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'movies',
        filter: `group_id=eq.${groupId}`,
      }, payload => {
        const updated = payload.new as Movie
        if (updated.status === 'selected' && !isDrawing.current) {
          setSpinning(true)
          setTimeout(() => { setSpinning(false); setMovie(updated); router.refresh() }, 1500)
        }
        if (updated.status === 'watched' && !isDrawing.current) {
          setMovie(null); router.refresh()
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, router, groupId])

  async function copyInviteLink() {
    const inviteUrl = `${window.location.origin}/invite/${group?.invite_token}`
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function drawMovie() {
    isDrawing.current = true
    setDrawing(true); setSpinning(true)
    const { data: bucket } = await supabase.from('movies').select('*').eq('group_id', groupId).eq('status', 'bucket')
    if (!bucket?.length) {
      setDrawing(false); setSpinning(false); isDrawing.current = false
      alert('No movies in the bucket!')
      return
    }
    if (movie) await supabase.from('movies').update({ status: 'bucket', selected_at: null }).eq('id', movie.id)
    const picked = bucket[Math.floor(Math.random() * bucket.length)] as Movie
    await supabase.from('movies').update({ status: 'selected', selected_at: new Date().toISOString() }).eq('id', picked.id)
    const next = getNextDate(freq)
    await supabase.from('groups').update({ next_draw_date: next.toISOString() }).eq('id', groupId)
    setNextDate(next.toISOString())
    setTimeout(() => { setSpinning(false); setMovie(picked); setDrawing(false); isDrawing.current = false; router.refresh() }, 1500)
  }

  async function markWatched() {
    if (!movie) return
    await supabase.from('movies').update({ status: 'watched', watched_at: new Date().toISOString() }).eq('id', movie.id)
    const others = members.filter(m => m.id !== userId)
    if (others.length > 0) {
      fetch('/api/notify-watched', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieTitle: movie.title, memberEmails: others.map(m => m.email), groupId }),
      }).catch(() => {})
    }
    setMovie(null)
    router.push(`/g/${groupId}/watched`)
    router.refresh()
  }

  async function saveFrequency(f: Frequency) {
    setFreq(f)
    await supabase.from('groups').update({ frequency: f }).eq('id', groupId)
    setShowSettings(false)
  }

  const posterUrl = movie?.poster_path ? getPosterUrl(movie.poster_path) : null
  const needsInvite = members.filter(m => m.id !== userId).length === 0

  return (
    <div className="space-y-5 curtain-in">

      {/* Header row */}
      <div className="flex items-end justify-between">
        <div>
          <p className="marquee">Now Playing</p>
          <h1 className="mt-1" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--text)', fontWeight: 600, letterSpacing: '0.01em' }}>
            Dashboard
          </h1>
        </div>
        <button
          onClick={() => setShowSettings(v => !v)}
          className="p-2 rounded-lg transition-all hover:bg-white/5 cursor-pointer"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          <SettingsIcon size={15} />
        </button>
      </div>

      {/* Invite banner */}
      {needsInvite && (
        <div className="rounded-xl p-4 pop-in" style={{ background: 'rgba(201,162,85,0.06)', border: '1px solid rgba(201,162,85,0.2)' }}>
          <div className="flex items-center gap-3">
            <Users size={16} style={{ color: 'var(--copper)', flexShrink: 0 }} />
            <div className="flex-1">
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--text)', fontWeight: 500 }}>
                Invite someone to this group
              </p>
              <p className="mt-0.5" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Share the invite link — they sign up and join instantly.
              </p>
            </div>
            <button
              onClick={copyInviteLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-85 flex-shrink-0 cursor-pointer"
              style={{ background: 'var(--copper)', color: '#000' }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>
      )}

      {/* Members + frequency bar */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-xl"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex items-center gap-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'var(--copper)', color: '#000', fontFamily: 'var(--font-display)', fontSize: '0.6rem', fontWeight: 700 }}
              >
                {m.name[0]?.toUpperCase()}
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.name}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            {FREQ_LABELS[freq]} · {bucketCount} queued
          </span>
          {!needsInvite && (
            <button onClick={copyInviteLink} className="cursor-pointer transition-opacity hover:opacity-70" style={{ color: 'var(--copper)' }}>
              {copied ? <Check size={12} /> : <LinkIcon size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="rounded-xl p-4 pop-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="marquee mb-3">Watch Frequency</p>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(FREQ_LABELS) as Frequency[]).map(f => (
              <button
                key={f}
                onClick={() => saveFrequency(f)}
                className="px-3.5 py-1.5 rounded-lg text-sm transition-all cursor-pointer"
                style={{
                  fontFamily: 'var(--font-body)',
                  background: freq === f ? 'var(--copper)' : 'var(--surface-2)',
                  color: freq === f ? '#000' : 'var(--text-dim)',
                  border: `1px solid ${freq === f ? 'var(--copper)' : 'var(--border)'}`,
                  fontWeight: freq === f ? 600 : 400,
                }}
              >
                {FREQ_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN MOVIE CARD ── */}
      {movie ? (
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}
        >
          {/* Blurred poster background */}
          {posterUrl && (
            <div
              aria-hidden
              style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${posterUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                filter: 'blur(32px) saturate(0.5) brightness(0.25)',
                transform: 'scale(1.1)',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Gold vignette overlay */}
          <div
            aria-hidden
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(201,162,85,0.04) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Content */}
          <div className="relative flex gap-0">
            {/* Poster */}
            <div className="flex-shrink-0" style={{ width: 140 }}>
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={movie.title}
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

            {/* Info */}
            <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
              <div>
                {/* "NOW SHOWING" label */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.5rem',
                      color: 'var(--copper)',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}
                  >
                    ◆ Now Showing
                  </span>
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
                    color: 'var(--text)',
                    fontWeight: 600,
                    lineHeight: 1.15,
                    letterSpacing: '0.01em',
                  }}
                >
                  {movie.title}
                </h2>

                {/* Meta */}
                <p
                  className="mt-1.5"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                >
                  {movie.release_date?.slice(0, 4)}
                  {movie.added_by_name ? ` · Added by ${movie.added_by_name}` : ''}
                </p>

                {/* Overview */}
                {movie.overview && (
                  <p
                    className="mt-3 line-clamp-3"
                    style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}
                  >
                    {movie.overview}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 flex-wrap">
                <button
                  onClick={markWatched}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90 cursor-pointer"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9rem',
                    letterSpacing: '0.03em',
                    background: 'var(--copper)',
                    color: '#000',
                    boxShadow: '0 4px 16px rgba(201,162,85,0.3)',
                  }}
                >
                  Mark as watched
                </button>
                <button
                  onClick={drawMovie}
                  disabled={drawing}
                  className="px-4 py-2 rounded-xl text-sm transition-all hover:bg-white/8 disabled:opacity-40 cursor-pointer"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.85rem',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--text-dim)',
                    border: '1px solid var(--border)',
                  }}
                >
                  Redraw
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state — draw prompt */
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${spinning ? 'reel-spin' : ''}`}
              style={{
                border: '1px solid rgba(201,162,85,0.3)',
                background: 'rgba(201,162,85,0.06)',
                boxShadow: spinning ? '0 0 24px rgba(201,162,85,0.2)' : 'none',
              }}
            >
              <Shuffle size={22} style={{ color: 'var(--copper)' }} />
            </div>
            <h2
              style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text)', fontWeight: 600, letterSpacing: '0.01em' }}
            >
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
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                letterSpacing: '0.04em',
                background: 'var(--copper)',
                color: '#000',
                boxShadow: '0 4px 24px rgba(201,162,85,0.25)',
              }}
            >
              <Shuffle size={15} />
              {drawing ? 'Drawing...' : 'Draw a film'}
            </button>
          </div>
        </div>
      )}

      {/* Next draw date */}
      {nextDate && (
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <Calendar size={13} style={{ color: 'var(--copper)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
            Next draw: <span style={{ color: 'var(--text-dim)' }}>{format(new Date(nextDate), 'EEEE, MMMM d')}</span>
          </span>
        </div>
      )}
    </div>
  )
}
