'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, Crown, Smile } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { Message, Profile } from '@/lib/types'

type Member = Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>

const QUICK_REACTIONS = ['❤️', '👍', '😂', '🔥', '🎬']

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
  const [pickingFor, setPickingFor] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const memberById = useMemo(() => {
    const m = new Map<string, Member>()
    for (const x of members) m.set(x.id, x)
    return m
  }, [members])

  // Realtime: messages INSERT/UPDATE
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

  // Auto-scroll to bottom on new message
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

  async function toggleReaction(message: Message, emoji: string) {
    const reactions = (message.reactions ?? {}) as Record<string, string[]>
    const current = reactions[emoji] ?? []
    const has = current.includes(userId)
    const next = has
      ? current.filter(id => id !== userId)
      : [...current, userId]
    const updated = { ...reactions, [emoji]: next }
    if (next.length === 0) delete updated[emoji]
    // Optimistic
    setMessages(prev => prev.map(x => x.id === message.id ? { ...x, reactions: updated } : x))
    setPickingFor(null)
    const { error } = await supabase
      .from('messages')
      .update({ reactions: updated })
      .eq('id', message.id)
    if (error) {
      // Revert on failure
      setMessages(prev => prev.map(x => x.id === message.id ? message : x))
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      <header className="mb-3">
        <p className="marquee">Chat</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--text)', fontWeight: 600 }}>
          Group conversation
        </h1>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-xl px-3 py-3 space-y-2"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
              No messages yet. Say hi.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const author = msg.user_id ? memberById.get(msg.user_id) : null
            const isMe = msg.user_id === userId
            const prev = messages[i - 1]
            const showDayLabel = !prev || !isSameDay(new Date(prev.created_at), new Date(msg.created_at))
            const groupedWithPrev = prev && !showDayLabel && prev.user_id === msg.user_id
              && (new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() < 3 * 60_000)
            const reactions = (msg.reactions ?? {}) as Record<string, string[]>
            const reactionEntries = Object.entries(reactions).filter(([, ids]) => ids.length > 0)

            return (
              <div key={msg.id}>
                {showDayLabel && (
                  <div className="my-3 text-center" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    — {format(new Date(msg.created_at), 'EEEE, MMMM d')} —
                  </div>
                )}
                <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {!groupedWithPrev ? (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--copper)', color: '#000', fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700 }}
                    >
                      {(author?.display_name ?? '?')[0]?.toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-7 flex-shrink-0" />
                  )}
                  <div className={`flex-1 min-w-0 ${isMe ? 'flex flex-col items-end' : ''}`}>
                    {!groupedWithPrev && (
                      <div className={`flex items-center gap-1.5 mb-0.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span style={{ color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 500 }}>
                          {author?.display_name ?? 'Unknown'}
                        </span>
                        {author?.is_patron && <Crown size={10} style={{ color: 'var(--copper)' }} />}
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                      </div>
                    )}
                    <div className="group relative inline-block max-w-[80%]">
                      <div
                        className="px-3 py-1.5 rounded-2xl"
                        style={{
                          background: isMe ? 'rgba(201,162,85,0.12)' : 'var(--surface-2)',
                          border: `1px solid ${isMe ? 'rgba(201,162,85,0.3)' : 'var(--border)'}`,
                          color: 'var(--text)',
                          fontSize: '0.88rem',
                          fontFamily: 'var(--font-body)',
                          lineHeight: 1.45,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.body}
                      </div>
                      <button
                        onClick={() => setPickingFor(pickingFor === msg.id ? null : msg.id)}
                        className={`absolute top-0 ${isMe ? '-left-7' : '-right-7'} w-6 h-6 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:bg-white/10 cursor-pointer`}
                        style={{ color: 'var(--text-muted)' }}
                        aria-label="React"
                      >
                        <Smile size={12} />
                      </button>
                    </div>
                    {pickingFor === msg.id && (
                      <div className="mt-1 flex gap-1 px-2 py-1 rounded inline-flex" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                        {QUICK_REACTIONS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(msg, emoji)}
                            className="transition-all hover:scale-110 cursor-pointer"
                            style={{ fontSize: '0.95rem' }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                    {reactionEntries.length > 0 && (
                      <div className={`mt-1 flex gap-1 flex-wrap ${isMe ? 'justify-end' : ''}`}>
                        {reactionEntries.map(([emoji, ids]) => {
                          const has = ids.includes(userId)
                          return (
                            <button
                              key={emoji}
                              onClick={() => toggleReaction(msg, emoji)}
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-all hover:opacity-80 cursor-pointer"
                              style={{
                                background: has ? 'rgba(201,162,85,0.15)' : 'var(--surface-2)',
                                border: `1px solid ${has ? 'var(--copper)' : 'var(--border)'}`,
                                fontSize: '0.7rem',
                              }}
                            >
                              {emoji} <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{ids.length}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {error && (
        <p className="mt-2" style={{ color: '#fca5a5', fontSize: '0.78rem', fontFamily: 'var(--font-body)' }}>{error}</p>
      )}

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Send a message…"
          className="flex-1 px-4 py-2.5 rounded-xl outline-none"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
          }}
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="px-4 py-2.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-40 cursor-pointer"
          style={{ background: 'var(--copper)', color: '#000' }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
