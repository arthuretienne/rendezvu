import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Crown, Lock } from 'lucide-react'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

type ProfileLookup = {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  is_patron: boolean
  visibility: 'private' | 'friends' | 'public'
  created_at: string
  is_self: boolean
  is_friend: boolean
  can_view: boolean
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  const { data: rows } = await supabase.rpc('get_profile_by_username', { _username: username })
  const profile = (rows ?? [])[0] as ProfileLookup | undefined

  return (
    <main className="min-h-screen relative" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <nav className="mb-6">
          <Link
            href={session ? '/groups' : '/'}
            className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={13} />
            <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-body)' }}>
              {session ? 'Groups' : 'Rendezvu'}
            </span>
          </Link>
        </nav>

        {!profile ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text)', fontWeight: 600 }}>
              No one here by that name
            </h1>
            <p className="mt-2" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'var(--font-body)' }}>
              The username <code>@{username}</code> does not exist or is no longer available.
            </p>
          </div>
        ) : !profile.can_view ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <Lock size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text)', fontWeight: 600 }}>
              @{profile.username} is private
            </h1>
            <p className="mt-2" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'var(--font-body)' }}>
              {session
                ? 'Send them a friend request to see their profile and reviews.'
                : 'Sign in to see if you have access.'}
            </p>
            {!session && (
              <Link
                href="/auth"
                className="inline-block mt-4 px-5 py-2 rounded-xl"
                style={{
                  background: 'var(--copper)',
                  color: '#000',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.9rem',
                }}
              >
                Sign in
              </Link>
            )}
          </div>
        ) : (
          <ProfileBody profile={profile} session={!!session} />
        )}
      </div>
    </main>
  )
}

async function ProfileBody({ profile, session }: { profile: ProfileLookup; session: boolean }) {
  const supabase = await createClient()

  // Pull the user's recent reviews if their profile is at least friends-visible
  // and the caller passed RLS for SELECT (which the RPC already validated).
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id, item_id, rating, body, contains_spoilers, is_rewatch, created_at,
      item:items!inner(id, title, year, poster_path)
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const reviewCount = reviews?.length ?? 0

  return (
    <>
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'var(--copper)',
              color: '#000',
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              fontWeight: 700,
            }}
          >
            {profile.display_name[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--text)', fontWeight: 600 }}>
                {profile.display_name}
              </h1>
              {profile.is_patron && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ background: 'rgba(201,162,85,0.15)', color: 'var(--copper)', fontSize: '0.62rem', fontFamily: 'var(--font-mono)' }}>
                  <Crown size={10} /> PATRON
                </span>
              )}
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              @{profile.username}
            </p>
          </div>
        </div>
        {profile.bio && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
            {profile.bio}
          </p>
        )}
        <p
          className="mt-3"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          On Rendezvu since {format(new Date(profile.created_at), 'MMMM yyyy')}
          {' · '}
          {reviewCount} review{reviewCount === 1 ? '' : 's'}
          {profile.is_self ? ' · This is you' : profile.is_friend ? ' · Friend' : ''}
        </p>
      </header>

      {!session && (
        <div
          className="rounded-xl p-4 mb-6"
          style={{ background: 'rgba(201,162,85,0.05)', border: '1px solid rgba(201,162,85,0.2)' }}
        >
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            <Link href="/auth" style={{ color: 'var(--copper)', fontWeight: 500 }}>Sign in</Link>
            {' '}to send {profile.display_name} a friend request and start a movie group together.
          </p>
        </div>
      )}

      <section>
        <h2 className="marquee mb-3">Recent reviews</h2>
        {!reviews || reviews.length === 0 ? (
          <div
            className="rounded-xl p-5 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
              No public reviews yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {reviews.map(r => {
              type Item = { id: string; title: string; year: number | null; poster_path: string | null }
              const item = (Array.isArray(r.item) ? r.item[0] : r.item) as Item
              return (
                <article
                  key={r.id}
                  className="rounded-xl p-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600 }}>
                          {item.title}
                        </p>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.66rem' }}>
                          {item.year ?? '—'}
                        </span>
                        <span className="ml-auto px-1.5 py-0.5 rounded" style={{ background: 'rgba(201,162,85,0.1)', color: 'var(--copper)', fontSize: '0.66rem', fontFamily: 'var(--font-mono)' }}>
                          {r.rating}/10
                        </span>
                      </div>
                      {r.body && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                          {r.body}
                        </p>
                      )}
                      <p
                        className="mt-2"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6rem',
                          color: 'var(--text-muted)',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {format(new Date(r.created_at), 'MMM d, yyyy')}
                        {r.is_rewatch ? ' · Rewatch' : ''}
                        {r.contains_spoilers ? ' · Spoilers' : ''}
                      </p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
