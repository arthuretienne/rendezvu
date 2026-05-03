'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Check, X, ArrowLeft } from 'lucide-react'
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
        className="flex items-center"
        style={{
          gap: 'var(--s-4)',
          padding: 'var(--s-3) 0',
          borderBottom: '1px solid var(--border-faint)',
        }}
      >
        <span className="avatar avatar-32">
          {profile.display_name[0]?.toUpperCase()}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="t-body" style={{ color: 'var(--text)' }}>
            {profile.display_name}
            {profile.is_patron && <span className="badge badge-accent" style={{ marginLeft: 'var(--s-2)' }}>Patron</span>}
          </p>
          <p className="t-caption" style={{ color: 'var(--text-muted)' }}>
            @{profile.username}
          </p>
        </div>
        {action}
      </div>
    )
  }

  return (
    <main style={{ background: 'var(--ink)', minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid var(--border-faint)' }}>
        <div
          className="flex items-center justify-between"
          style={{ maxWidth: 1280, margin: '0 auto', padding: 'var(--s-4) var(--s-5)' }}
        >
          <Link
            href="/groups"
            className="t-caption flex items-center"
            style={{ gap: 'var(--s-2)', color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            <ArrowLeft size={14} /> Groupes
          </Link>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 400,
              fontSize: 22,
              color: 'var(--text)',
              textDecoration: 'none',
            }}
          >
            Rendezvu
          </Link>
          <Link href="/settings" className="t-caption" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Profil
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--s-7) var(--s-5)' }}>
        <header style={{ marginBottom: 'var(--s-6)' }}>
          <h1 className="t-h1">Vos compagnons de cinéma.</h1>
          <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-2)' }}>
            Toutes les personnes avec qui vous avez vu au moins un film.
          </p>
        </header>

        <form onSubmit={search} style={{ marginBottom: 'var(--s-6)' }}>
          <div className="flex items-center" style={{ gap: 'var(--s-2)', borderBottom: '1px solid var(--border-faint)' }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chercher quelqu’un par pseudo…"
              className="input"
              style={{ borderBottom: 'none' }}
            />
            <button
              type="submit"
              disabled={searching || query.trim().length < 2}
              className="btn btn-ghost"
              style={{ height: 32 }}
            >
              {searching ? '…' : 'Chercher'}
            </button>
          </div>
        </form>

        {error && (
          <p className="t-caption" style={{ color: 'var(--accent)', marginBottom: 'var(--s-4)' }}>{error}</p>
        )}

        {results.length > 0 && (
          <section style={{ marginBottom: 'var(--s-6)' }}>
            <h2 className="t-h3" style={{ color: 'var(--text-muted)', marginBottom: 'var(--s-3)' }}>Résultats</h2>
            {results.map((p) => {
              const existing = friendships.find((f) => counterpart(f) === p.id)
              const action = existing ? (
                <span className="t-caption" style={{ color: 'var(--text-muted)' }}>
                  {existing.status === 'accepted' ? 'Déjà compagnons' : existing.status === 'pending' ? 'En attente' : existing.status}
                </span>
              ) : (
                <button
                  onClick={() => sendRequest(p.id)}
                  disabled={busy === p.id}
                  className="btn btn-secondary"
                  style={{ height: 32, padding: '0 var(--s-3)' }}
                >
                  {busy === p.id ? '…' : 'Inviter'}
                </button>
              )
              return <ProfileRow key={p.id} profile={p} action={action} />
            })}
          </section>
        )}

        {incoming.length > 0 && (
          <section style={{ marginBottom: 'var(--s-6)' }}>
            <h2 className="t-h3" style={{ color: 'var(--text-muted)', marginBottom: 'var(--s-3)' }}>Demandes reçues</h2>
            {incoming.map((f) => (
              <ProfileRow
                key={f.id}
                profile={profiles[counterpart(f)]}
                action={
                  <div className="flex" style={{ gap: 'var(--s-2)' }}>
                    <button
                      onClick={() => respond(f.id, true)}
                      disabled={busy === f.id}
                      className="btn btn-primary"
                      style={{ height: 32, padding: '0 var(--s-3)' }}
                      title="Accepter"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => respond(f.id, false)}
                      disabled={busy === f.id}
                      className="btn btn-ghost"
                      style={{ height: 32 }}
                      title="Refuser"
                    >
                      <X size={14} />
                    </button>
                  </div>
                }
              />
            ))}
          </section>
        )}

        {outgoing.length > 0 && (
          <section style={{ marginBottom: 'var(--s-6)' }}>
            <h2 className="t-h3" style={{ color: 'var(--text-muted)', marginBottom: 'var(--s-3)' }}>En attente</h2>
            {outgoing.map((f) => (
              <ProfileRow
                key={f.id}
                profile={profiles[counterpart(f)]}
                action={<span className="t-caption" style={{ color: 'var(--text-muted)' }}>En attente</span>}
              />
            ))}
          </section>
        )}

        <section>
          <h2 className="t-h3" style={{ color: 'var(--text-muted)', marginBottom: 'var(--s-3)' }}>
            Compagnons {accepted.length > 0 && <>· {accepted.length}</>}
          </h2>
          {accepted.length === 0 ? (
            <p className="t-body" style={{ color: 'var(--text-muted)' }}>
              Personne pour l&apos;instant. Cherchez par pseudo pour envoyer une demande.
            </p>
          ) : (
            accepted.map((f) => (
              <ProfileRow
                key={f.id}
                profile={profiles[counterpart(f)]}
                action={
                  <Link
                    href={`/u/${profiles[counterpart(f)]?.username ?? ''}`}
                    className="link t-caption"
                  >
                    Voir →
                  </Link>
                }
              />
            ))
          )}
        </section>
      </div>
    </main>
  )
}
