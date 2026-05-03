import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Lock } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

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
    <main style={{ background: 'var(--ink)', color: 'var(--text)', minHeight: '100vh' }}>
      <header style={{ borderBottom: '1px solid var(--border-faint)' }}>
        <div
          className="flex items-center justify-between"
          style={{ maxWidth: 1280, margin: '0 auto', padding: 'var(--s-4) var(--s-5)' }}
        >
          <Link
            href={session ? '/groups' : '/'}
            className="t-caption flex items-center"
            style={{ gap: 'var(--s-2)', color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            <ArrowLeft size={14} /> {session ? 'Groupes' : 'Rendezvu'}
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
          <span style={{ width: 80 }} />
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--s-7) var(--s-5)' }}>
        {!profile ? (
          <div className="measure" style={{ textAlign: 'center' }}>
            <h1 className="t-h2">Personne sous ce nom.</h1>
            <p className="t-body" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-3)' }}>
              <code>@{username}</code> n&apos;existe pas, ou n&apos;est plus disponible.
            </p>
          </div>
        ) : !profile.can_view ? (
          <div className="measure" style={{ textAlign: 'center' }}>
            <Lock size={28} style={{ color: 'var(--text-muted)', margin: '0 auto var(--s-3)' }} />
            <h1 className="t-h2">@{profile.username} est privé.</h1>
            <p className="t-body" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-3)' }}>
              {session
                ? 'Envoyez-leur une demande pour voir leur profil.'
                : 'Connectez-vous pour voir si vous y avez accès.'}
            </p>
            {!session && (
              <Link href="/auth" className="btn btn-primary" style={{ marginTop: 'var(--s-5)' }}>
                Se connecter
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
      <header style={{ textAlign: 'center', marginBottom: 'var(--s-7)' }}>
        <span className="avatar avatar-96" style={{ margin: '0 auto', display: 'inline-flex' }}>
          {profile.display_name[0]?.toUpperCase()}
        </span>
        <h1 className="t-h1" style={{ marginTop: 'var(--s-4)' }}>
          {profile.display_name}
          {profile.is_patron && <span className="badge badge-accent" style={{ marginLeft: 'var(--s-3)', verticalAlign: 'middle' }}>Patron</span>}
        </h1>
        <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-2)' }}>
          @{profile.username}
        </p>
        {profile.bio && (
          <p className="t-lead" style={{ color: 'var(--text)', fontStyle: 'italic', marginTop: 'var(--s-4)', maxWidth: '50ch', marginInline: 'auto' }}>
            «&nbsp;{profile.bio}&nbsp;»
          </p>
        )}
        <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-4)' }}>
          Sur Rendezvu depuis {format(new Date(profile.created_at), 'MMMM yyyy', { locale: fr })}
          {' · '}{reviewCount} {reviewCount === 1 ? 'avis' : 'avis'}
          {profile.is_self ? ' · c\'est vous' : profile.is_friend ? ' · compagnon' : ''}
        </p>
        <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-3)', maxWidth: '50ch', marginInline: 'auto' }}>
          Demandez-lui un lien si vous voulez voir un film ensemble.
        </p>
      </header>

      {!session && (
        <p className="t-body" style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 'var(--s-6)' }}>
          <Link href="/auth" className="link">Connectez-vous</Link> pour envoyer une demande à {profile.display_name} et commencer un groupe ensemble.
        </p>
      )}

      <section>
        <h2 className="t-h2" style={{ marginBottom: 'var(--s-4)' }}>Quelques films récemment notés.</h2>
        {!reviews || reviews.length === 0 ? (
          <p className="t-body" style={{ color: 'var(--text-muted)' }}>
            Aucun avis public pour l&apos;instant.
          </p>
        ) : (
          <div>
            {reviews.map((r) => {
              type Item = { id: string; title: string; year: number | null; poster_path: string | null }
              const item = (Array.isArray(r.item) ? r.item[0] : r.item) as Item
              return (
                <article
                  key={r.id}
                  style={{
                    padding: 'var(--s-4) 0',
                    borderBottom: '1px solid var(--border-faint)',
                  }}
                >
                  <p className="t-h3" style={{ color: 'var(--text)' }}>
                    {item.title}
                    <span className="t-caption t-tnum" style={{ color: 'var(--text-muted)', marginLeft: 'var(--s-2)', fontWeight: 400 }}>
                      {item.year ?? ''} · <span style={{ color: 'var(--accent)' }}>★</span> {r.rating}/10
                    </span>
                  </p>
                  {r.body && (
                    <p className="t-body" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-2)' }}>
                      {r.body}
                    </p>
                  )}
                  <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-2)' }}>
                    {format(new Date(r.created_at), 'd MMMM yyyy', { locale: fr })}
                    {r.is_rewatch ? ' · revisionnage' : ''}
                    {r.contains_spoilers ? ' · spoilers' : ''}
                  </p>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
