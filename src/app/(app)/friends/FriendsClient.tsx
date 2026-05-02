'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, UserPlus, Check, X, ArrowLeft, Settings as SettingsIcon, Crown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Friendship, Profile } from '@/lib/types'

type PublicProfile = Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>

export default function FriendsClient({
  userId,
  friendships,
  profiles,
}: {
  userId: string
  friendships: Friendship[]
  profiles: Record<string, PublicProfile>
}) {
  const supabase = createClient()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PublicProfile[]>([])
  const [searching, setSearching] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')

  const counterpart = (f: Friendship) => (f.user_a === userId ? f.user_b : f.user_a)

  const accepted = friendships.filter(f => f.status === 'accepted')
  const incoming = friendships.filter(f => f.status === 'pending' && f.requested_by !== userId)
  const outgoing = friendships.filter(f => f.status === 'pending' && f.requested_by === userId)

  async function search(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    const { data, error } = await supabase.rpc('search_profiles_by_username', {
      _query: query.trim(),
      _limit: 10,
    })
    setSearching(false)
    if (error) {
      setError(error.message)
      return
    }
    setResults((data ?? []) as PublicProfile[])
  }

  async function sendRequest(targetId: string) {
    setBusy(targetId)
    setError('')
    const { error } = await supabase.rpc('send_friend_request', { _target: targetId })
    setBusy(null)
    if (error) {
      setError(error.message)
      return
    }
    router.refresh()
  }

  async function respond(friendshipId: string, accept: boolean) {
    setBusy(friendshipId)
    setError('')
    const { error } = await supabase.rpc('respond_friend_request', {
      _id: friendshipId,
      _accept: accept,
    })
    setBusy(null)
    if (error) {
      setError(error.message)
      return
    }
    router.refresh()
  }

  function ProfileRow({
    profile,
    action,
  }: {
    profile: PublicProfile | undefined
    action: React.ReactNode
  }) {
    if (!profile) return null
    return (
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'var(--copper)',
            color: '#000',
            fontFamily: 'var(--font-display)',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          {profile.display_name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p style={{ color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
              {profile.display_name}
            </p>
            {profile.is_patron && (
              <Crown size={11} style={{ color: 'var(--copper)' }} />
            )}
          </div>
          <p
            style={{
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.66rem',
              letterSpacing: '0.04em',
            }}
          >
            @{profile.username}
          </p>
        </div>
        {action}
      </div>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <nav className="flex items-center justify-between mb-8">
        <Link
          href="/groups"
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={13} />
          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-body)' }}>Groups</span>
        </Link>
        <Link
          href="/settings"
          className="p-1.5 rounded-lg transition-all hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}
          title="Settings"
        >
          <SettingsIcon size={14} />
        </Link>
      </nav>

      <header className="mb-8">
        <p className="marquee">Rendezvu</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', fontWeight: 600 }}>
          Friends
        </h1>
      </header>

      {/* Search */}
      <form onSubmit={search} className="mb-6">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Find someone by username…"
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}
          />
          <button
            type="submit"
            disabled={searching || query.trim().length < 2}
            className="px-3 py-1 rounded-md transition-all hover:opacity-90 disabled:opacity-40 cursor-pointer"
            style={{
              background: 'var(--copper)',
              color: '#000',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.02em',
            }}
          >
            {searching ? '…' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <p className="mb-4" style={{ color: '#ef4444', fontSize: '0.78rem', fontFamily: 'var(--font-body)' }}>{error}</p>
      )}

      {results.length > 0 && (
        <section className="mb-8">
          <h2 className="marquee mb-2">Search results</h2>
          <div className="space-y-2">
            {results.map(p => {
              const existing = friendships.find(f => counterpart(f) === p.id)
              const action = existing ? (
                <span
                  style={{
                    fontSize: '0.66rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {existing.status === 'accepted' ? 'Friends' : existing.status}
                </span>
              ) : (
                <button
                  onClick={() => sendRequest(p.id)}
                  disabled={busy === p.id}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--copper)',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <UserPlus size={11} />
                  {busy === p.id ? '…' : 'Add'}
                </button>
              )
              return <ProfileRow key={p.id} profile={p} action={action} />
            })}
          </div>
        </section>
      )}

      {/* Incoming requests */}
      {incoming.length > 0 && (
        <section className="mb-8">
          <h2 className="marquee mb-2">Incoming requests</h2>
          <div className="space-y-2">
            {incoming.map(f => (
              <ProfileRow
                key={f.id}
                profile={profiles[counterpart(f)]}
                action={
                  <div className="flex gap-1">
                    <button
                      onClick={() => respond(f.id, true)}
                      disabled={busy === f.id}
                      className="p-1.5 rounded-md transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                      style={{ background: 'var(--copper)', color: '#000' }}
                      title="Accept"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => respond(f.id, false)}
                      disabled={busy === f.id}
                      className="p-1.5 rounded-md transition-all hover:bg-white/5 disabled:opacity-50 cursor-pointer"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                      title="Decline"
                    >
                      <X size={12} />
                    </button>
                  </div>
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Outgoing pending */}
      {outgoing.length > 0 && (
        <section className="mb-8">
          <h2 className="marquee mb-2">Pending</h2>
          <div className="space-y-2">
            {outgoing.map(f => (
              <ProfileRow
                key={f.id}
                profile={profiles[counterpart(f)]}
                action={
                  <span
                    style={{
                      fontSize: '0.66rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Awaiting
                  </span>
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Accepted friends */}
      <section>
        <h2 className="marquee mb-2">
          Friends {accepted.length > 0 && <span style={{ color: 'var(--text-muted)' }}>· {accepted.length}</span>}
        </h2>
        {accepted.length === 0 ? (
          <div
            className="rounded-xl p-5 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
              No friends yet — search by username to send a request.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {accepted.map(f => (
              <ProfileRow
                key={f.id}
                profile={profiles[counterpart(f)]}
                action={
                  <Link
                    href={`/u/${profiles[counterpart(f)]?.username ?? ''}`}
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--copper)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    View →
                  </Link>
                }
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
