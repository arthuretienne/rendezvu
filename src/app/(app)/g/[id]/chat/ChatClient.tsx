'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import type { Message, Profile } from '@/lib/types'

type Member = Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>

const STAR = '★'

export default function ChatClient({
  groupId,
  userId,
  initialMessages,
  members,
}: {
  groupId: string
  userId: string
  initialMessages: Message[]
  members: Member[]
}) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const memberById = useMemo(() => {
    const m = new Map<string, Member>()
    for (const x of members) m.set(x.id, x)
    return m
  }, [members])

  useEffect(() => {
    const channel = supabase
      .channel(`chat-${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `group_id=eq.${groupId}`,
      }, payload => {
        const m = payload.new as Message
        setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m])
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'messages',
        filter: `group_id=eq.${groupId}`,
      }, payload => {
        const m = payload.new as Message
        setMessages(prev => prev.map(x => x.id === m.id ? m : x).filter(x => !x.deleted_at))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, groupId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || sending) return
    setSending(true)
    setError('')
    const text = body.trim()
    setBody('')
    const { error } = await supabase.from('messages').insert({
      group_id: groupId,
      user_id: userId,
      body: text,
    })
    setSending(false)
    if (error) {
      setError(error.message)
      setBody(text)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(e as unknown as React.FormEvent)
    }
  }

  async function toggleStar(message: Message) {
    const reactions = (message.reactions ?? {}) as Record<string, string[]>
    const current = reactions[STAR] ?? []
    const has = current.includes(userId)
    const next = has ? current.filter(id => id !== userId) : [...current, userId]
    const updated: Record<string, string[]> = { ...reactions, [STAR]: next }
    if (next.length === 0) delete updated[STAR]
    setMessages(prev => prev.map(x => x.id === message.id ? { ...x, reactions: updated } : x))
    const { error } = await supabase
      .from('messages')
      .update({ reactions: updated })
      .eq('id', message.id)
    if (error) {
      setMessages(prev => prev.map(x => x.id === message.id ? message : x))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)' }}>
      <header style={{ marginBottom: 'var(--s-5)' }}>
        <h1 className="t-h1">Le chat.</h1>
      </header>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: 'var(--s-4)',
        }}
      >
        {messages.length === 0 ? (
          <p className="t-body" style={{ color: 'var(--text-muted)' }}>
            Aucun message pour l’instant. Dites bonsoir.
          </p>
        ) : (
          messages.map((msg, i) => {
            const author = msg.user_id ? memberById.get(msg.user_id) : null
            const isMe = msg.user_id === userId
            const prev = messages[i - 1]
            const showDayLabel = !prev || !isSameDay(new Date(prev.created_at), new Date(msg.created_at))
            const groupedWithPrev = prev && !showDayLabel && prev.user_id === msg.user_id
              && (new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() < 3 * 60_000)
            const reactions = (msg.reactions ?? {}) as Record<string, string[]>
            const stars = reactions[STAR] ?? []
            const iStarred = stars.includes(userId)
            const topGap = groupedWithPrev ? 'var(--s-2)' : 'var(--s-5)'

            return (
              <div key={msg.id}>
                {showDayLabel && (
                  <p
                    className="t-caption"
                    style={{
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      margin: 'var(--s-5) 0 var(--s-3)',
                    }}
                  >
                    {format(new Date(msg.created_at), 'EEEE d MMMM', { locale: fr })}
                  </p>
                )}
                <div
                  className="flex"
                  style={{
                    gap: 'var(--s-3)',
                    marginTop: topGap,
                    flexDirection: isMe ? 'row-reverse' : 'row',
                  }}
                >
                  {!isMe && !groupedWithPrev ? (
                    <span className="avatar avatar-32" style={{ marginTop: 2 }}>
                      {(author?.display_name ?? '?')[0]?.toUpperCase()}
                    </span>
                  ) : !isMe ? (
                    <span style={{ width: 32, flexShrink: 0 }} />
                  ) : null}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {!groupedWithPrev && (
                      <div
                        className="flex items-baseline"
                        style={{
                          gap: 'var(--s-2)',
                          marginBottom: 'var(--s-1)',
                          flexDirection: isMe ? 'row-reverse' : 'row',
                        }}
                      >
                        <span className="t-h3" style={{ color: 'var(--text)' }}>
                          {isMe ? 'Vous' : author?.display_name ?? 'Inconnu'}
                        </span>
                        <span className="t-caption t-tnum" style={{ color: 'var(--text-muted)' }}>
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                        {author?.is_patron && <span className="badge badge-accent">Patron</span>}
                      </div>
                    )}
                    <div
                      className="t-body group"
                      style={{
                        maxWidth: '80%',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        background: isMe ? 'var(--surface)' : 'transparent',
                        padding: isMe ? 'var(--s-2) var(--s-3)' : 0,
                        borderRadius: isMe ? 4 : 0,
                        position: 'relative',
                      }}
                    >
                      {msg.body}
                      <button
                        onClick={() => toggleStar(msg)}
                        title={iStarred ? 'Retirer l’étoile' : 'Marquer'}
                        style={{
                          position: 'absolute',
                          top: 0,
                          [isMe ? 'left' : 'right']: -28,
                          width: 24,
                          height: 24,
                          background: 'transparent',
                          border: 'none',
                          color: iStarred ? 'var(--accent)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          opacity: iStarred ? 1 : 0,
                          transition: 'opacity var(--motion-duration) var(--motion-easing)',
                        } as React.CSSProperties}
                        className="msg-star"
                      >
                        <Star size={14} fill={iStarred ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    {stars.length > 0 && (
                      <p
                        className="t-caption"
                        style={{
                          color: 'var(--accent)',
                          marginTop: 'var(--s-1)',
                        }}
                      >
                        ★ {stars.length}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {error && (
        <p className="t-caption" style={{ color: 'var(--accent)' }}>{error}</p>
      )}

      <form
        onSubmit={send}
        style={{
          borderTop: '1px solid var(--border-faint)',
          paddingTop: 'var(--s-3)',
          marginTop: 'var(--s-3)',
        }}
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrivez quelque chose…"
          rows={2}
          className="textarea"
          style={{ minHeight: 48, borderBottom: 'none', padding: 'var(--s-2) 0' }}
        />
        <div className="flex items-center justify-between" style={{ marginTop: 'var(--s-1)' }}>
          <p className="t-caption" style={{ color: 'var(--text-muted)' }}>
            Entrée pour envoyer · Maj+Entrée pour aller à la ligne
          </p>
          <button type="submit" className="btn btn-primary" disabled={sending || !body.trim()} style={{ height: 32, padding: '0 var(--s-4)' }}>
            Envoyer
          </button>
        </div>
      </form>
      <style jsx>{`
        .group:hover .msg-star { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
