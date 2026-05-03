'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Copy, Check, Users } from 'lucide-react'
import { addWeeks, addMonths, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { getPosterUrl } from '@/lib/tmdb'
import type { Group, Item, ListEntry, Profile, Frequency } from '@/lib/types'

type EntryWithItem = ListEntry & { item: Item }
type MemberProfile = Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>

const FREQ_LABELS: Record<Frequency, string> = {
  weekly: 'Chaque semaine',
  biweekly: 'Toutes les deux semaines',
  monthly: 'Chaque mois',
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
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const isLocalDraw = useRef(false)

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
          const { data: item } = await supabase
            .from('items')
            .select('*')
            .eq('id', updated.item_id)
            .single()
          if (item) {
            setSelected({ ...updated, item: item as Item })
            setWatchedBy([])
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
    setError('')
    try {
      if (selected) {
        await supabase
          .from('list_entries')
          .update({ status: 'bucket', selected_at: null })
          .eq('id', selected.id)
      }
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
        setError('Aucun film dans la bucket. Ajoutez-en d’abord.')
        setDrawing(false)
        isLocalDraw.current = false
        return
      }
      const picked = bucket[Math.floor(Math.random() * bucket.length)]
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
      if (updateErr || !updated) throw updateErr ?? new Error('Mise à jour échouée')
      const next = nextDateFor(group.rules.frequency).toISOString()
      await supabase.from('groups').update({ next_draw_at: next }).eq('id', groupId)
      setTimeout(() => {
        setSelected(updated)
        setNextDrawAt(next)
        setBucketCount(c => Math.max(0, c - 1))
        setWatchedBy([])
        setDrawing(false)
        isLocalDraw.current = false
      }, 2400) // animation 2.4s per spec §2.7
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Tirage échoué'
      setError(message)
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
    setTimeout(() => {
      router.push(`/g/${groupId}/watched`)
      router.refresh()
    }, 600)
  }

  const poster = selected ? getPosterUrl(selected.item.poster_path) : null
  const iWatched = selected && watchedBy.includes(userId)
  const otherWatchers = watchedBy.filter(id => id !== userId)
  const onlyMember = members.length <= 1
  const watchedCount = members.length // we don't have aggregate here; approximation

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-7)' }}>
      {/* Cover/header */}
      <header>
        <p className="t-caption" style={{ color: 'var(--text-muted)' }}>
          {group.emoji} {FREQ_LABELS[group.rules.frequency]}
        </p>
        <h1 className="t-h1" style={{ marginTop: 'var(--s-2)' }}>{group.name}</h1>
        <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-3)' }}>
          {members.length} {members.length > 1 ? 'membres' : 'membre'} · {bucketCount} {bucketCount > 1 ? 'films' : 'film'} en bucket
          {nextDrawAt && (
            <>
              {' · '}prochain rendez-vous le {format(new Date(nextDrawAt), 'EEEE d MMMM', { locale: fr })}
            </>
          )}
        </p>
      </header>

      {/* Invite banner if alone */}
      {onlyMember && (
        <div
          style={{
            borderTop: '1px solid var(--border-faint)',
            borderBottom: '1px solid var(--border-faint)',
            padding: 'var(--s-4) 0',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--s-4)',
            flexWrap: 'wrap',
          }}
        >
          <Users size={16} style={{ color: 'var(--text-muted)' }} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <p className="t-h3">Vous êtes seul·e ici.</p>
            <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-1)' }}>
              Partagez le lien — ils s’inscrivent et rejoignent le groupe.
            </p>
          </div>
          <button onClick={copyInvite} className="btn btn-secondary">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copié' : 'Copier le lien'}
          </button>
        </div>
      )}

      {error && (
        <p className="t-caption" style={{ color: 'var(--accent)' }}>{error}</p>
      )}

      {/* Selected film OR draw block */}
      {selected ? (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 240px) 1fr',
            gap: 'var(--s-6)',
          }}
        >
          {poster ? (
            <div style={{ aspectRatio: '2/3', background: 'var(--surface)' }}>
              <Image
                src={poster}
                alt={selected.item.title}
                width={400}
                height={600}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          ) : (
            <div style={{ aspectRatio: '2/3', background: 'var(--surface)' }} />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
            <p className="t-caption" style={{ color: 'var(--accent)' }}>Le verdict</p>
            <h2
              className="t-display"
              style={{ fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: 1.05 }}
            >
              {selected.item.title}
            </h2>
            <p className="t-caption t-tnum" style={{ color: 'var(--text-muted)' }}>
              {selected.item.year ?? '—'}
              {selected.item.runtime ? ` · ${selected.item.runtime} min` : ''}
            </p>
            {selected.item.overview && (
              <p className="t-body" style={{ color: 'var(--text-muted)' }}>
                {selected.item.overview}
              </p>
            )}
            {otherWatchers.length > 0 && (
              <p className="t-caption" style={{ color: 'var(--text-muted)' }}>
                Vu par {otherWatchers.map(id => members.find(m => m.id === id)?.display_name).filter(Boolean).join(', ')}.
              </p>
            )}
            <div className="flex flex-wrap" style={{ gap: 'var(--s-3)', marginTop: 'var(--s-2)' }}>
              <button onClick={markWatched} disabled={!!iWatched} className="btn btn-primary">
                {iWatched ? 'Vous l’avez vu' : 'Je l’ai vu'}
              </button>
              <button onClick={drawMovie} disabled={drawing} className="btn btn-ghost">
                Re-tirer
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--s-7)',
          }}
        >
          <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
            <h2 className="t-h2" style={{ marginBottom: 'var(--s-4)' }}>Le prochain rendez-vous.</h2>
            <button
              onClick={drawMovie}
              disabled={drawing || bucketCount === 0}
              className="btn btn-primary"
              style={{ height: 80, fontSize: 18, padding: '0 var(--s-6)', width: '100%', maxWidth: 440 }}
            >
              {drawing ? 'Tirage en cours…' : 'Tirer un film maintenant'}
            </button>
            <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-3)' }}>
              {bucketCount > 0
                ? `${bucketCount} ${bucketCount > 1 ? 'films possibles' : 'film possible'}. Une fois tiré, on ne revient pas en arrière.`
                : 'Ajoutez d’abord des films à la bucket.'}
            </p>
          </div>
        </section>
      )}

      {/* Members list */}
      <section
        style={{
          borderTop: '1px solid var(--border-faint)',
          paddingTop: 'var(--s-5)',
        }}
      >
        <h3 className="t-h3" style={{ marginBottom: 'var(--s-4)', color: 'var(--text-muted)' }}>
          Avec {watchedCount} {watchedCount > 1 ? 'compagnons' : 'compagnon'}.
        </h3>
        <div className="flex flex-wrap" style={{ gap: 'var(--s-4)' }}>
          {members.map(m => (
            <div key={m.id} className="flex items-center" style={{ gap: 'var(--s-2)' }}>
              <span className="avatar avatar-32">
                {m.display_name[0]?.toUpperCase()}
              </span>
              <span className="t-caption" style={{ color: 'var(--text)' }}>
                {m.display_name}
              </span>
              {m.is_patron && <span className="badge badge-accent">Patron</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
