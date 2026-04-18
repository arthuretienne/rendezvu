'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Message } from '@/lib/types'
import { Send } from 'lucide-react'
import { format } from 'date-fns'

export default function ChatClient({ userId, groupId, userName, initialMessages }: {
  userId: string
  groupId: string
  userName: string
  initialMessages: Message[]
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`chat-room-${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `group_id=eq.${groupId}`,
      }, payload => {
        const msg = payload.new as Message
        setMessages(prev => {
          const idx = prev.findIndex(m =>
            m.id.startsWith('opt-') && m.user_id === msg.user_id && m.content === msg.content
          )
          if (idx >= 0) {
            const next = [...prev]; next[idx] = msg; return next
          }
          if (prev.some(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, groupId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    const content = text.trim()
    setText('')

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      user_id: userId,
      user_name: userName,
      content,
      group_id: groupId,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    await supabase.from('messages').insert({ user_id: userId, user_name: userName, content, group_id: groupId })
    setSending(false)
  }

  function groupMessages() {
    const groups: { date: string; msgs: Message[] }[] = []
    let currentDate = ''
    for (const msg of messages) {
      const date = format(new Date(msg.created_at), 'EEEE, MMMM d')
      if (date !== currentDate) { currentDate = date; groups.push({ date, msgs: [] }) }
      groups[groups.length - 1].msgs.push(msg)
    }
    return groups
  }

  return (
    <div className="flex flex-col curtain-in" style={{ height: 'calc(100vh - 8rem)' }}>
      <div className="mb-4">
        <p className="marquee">The Lobby</p>
        <h1 className="mt-1" style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--text)', fontWeight: 700 }}>Chat</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-2">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>The lobby is quiet. Say something.</p>
          </div>
        )}

        {groupMessages().map(({ date, msgs }) => (
          <div key={date}>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="px-2.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                {date}
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            <div className="space-y-1">
              {msgs.map((msg, i) => {
                const isMe = msg.user_id === userId
                const isOptimistic = msg.id.startsWith('opt-')
                const showName = !isMe && (i === 0 || msgs[i - 1].user_id !== msg.user_id)
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} msg-in`}>
                    <div className={`max-w-xs sm:max-w-md flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {showName && (
                        <span className="mb-0.5 ml-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--copper)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {msg.user_name}
                        </span>
                      )}
                      <div className="px-3.5 py-2" style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.875rem', lineHeight: 1.45,
                        borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        background: isMe ? 'var(--copper)' : 'var(--surface)',
                        color: isMe ? '#fff' : 'var(--text)',
                        border: isMe ? 'none' : '1px solid var(--border)',
                        opacity: isOptimistic ? 0.7 : 1,
                      }}>
                        {msg.content}
                      </div>
                      <span className="mt-0.5 mx-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-muted)', opacity: 0.5 }}>
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Say something..."
          className="flex-1 px-4 py-2.5 rounded-lg text-sm"
          style={{ fontFamily: 'var(--font-body)', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        />
        <button type="submit" disabled={!text.trim() || sending}
          className="w-10 h-10 flex items-center justify-center rounded-lg transition-all disabled:opacity-40 hover:opacity-85"
          style={{ background: 'var(--copper)', color: '#fff' }}>
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}
