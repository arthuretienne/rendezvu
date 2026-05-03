'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Group, Profile, DrawMode, Frequency } from '@/lib/types'

type Membership = {
  group_id: string
  joined_at: string
  groups: Group
}

const DRAW_LABELS: Record<DrawMode, string> = {
  random: 'Tirage au sort',
  vote: 'Vote du groupe',
  veto: 'Round avec veto',
}

const FREQ_LABELS: Record<Frequency, string> = {
  weekly: 'Chaque semaine',
  biweekly: 'Toutes les deux semaines',
  monthly: 'Chaque mois',
}

export default function GroupsClient({
  profile,
  memberships,
}: {
  profile: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'> | null
  memberships: Membership[]
}) {
  const supabase = createClient()
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎬')
  const [drawMode, setDrawMode] = useState<DrawMode>('random')
  const [frequency, setFrequency] = useState<Frequency>('biweekly')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function createGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    if (!name.trim()) {
      setError('Donnez un nom au groupe.')
      return
    }
    setSubmitting(true)
    setError('')
    const { data, error: insertError } = await supabase
      .from('groups')
      .insert({
        name: name.trim(),
        emoji,
        kind: 'movie',
        visibility: 'private',
        rules: { draw_mode: drawMode, spoiler_blur: 'until_watched', frequency },
        created_by: profile.id,
      })
      .select('id')
      .single()
    if (insertError || !data) {
      setError(insertError?.message ?? 'Création impossible.')
      setSubmitting(false)
      return
    }
    router.push(`/g/${data.id}`)
  }

  const initials = (profile?.display_name ?? profile?.username ?? '?').slice(0, 1).toUpperCase()

  return (
    <main style={{ background: 'var(--ink)', minHeight: '100vh' }}>
      {/* App header */}
      <header style={{ borderBottom: '1px solid var(--border-faint)' }}>
        <div
          className="flex items-center justify-between"
          style={{ maxWidth: 1280, margin: '0 auto', padding: 'var(--s-4) var(--s-5)' }}
        >
          <Link
            href="/groups"
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
          <nav className="flex items-center" style={{ gap: 'var(--s-5)' }}>
            <Link href="/groups" className="t-caption" style={{ color: 'var(--text)', textDecoration: 'none' }}>
              Groupes
            </Link>
            <Link href="/friends" className="t-caption" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              Compagnons
            </Link>
            <Link href="/settings" className="t-caption" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              Profil
            </Link>
            <Link
              href="/settings"
              className="avatar avatar-32"
              style={{ textDecoration: 'none' }}
              title={profile?.display_name ?? 'Profil'}
            >
              {initials}
            </Link>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--s-7) var(--s-5)' }}>
        {/* Page title + create CTA */}
        <div
          className="flex items-end justify-between"
          style={{ marginBottom: 'var(--s-6)', gap: 'var(--s-4)', flexWrap: 'wrap' }}
        >
          <div>
            <h1 className="t-h1">Vos groupes.</h1>
            <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-2)' }}>
              Bonsoir {profile?.display_name ?? ''}.
            </p>
          </div>
          {!creating && (
            <button onClick={() => setCreating(true)} className="btn btn-primary">
              <Plus size={16} /> Nouveau groupe
            </button>
          )}
        </div>

        {/* Create form */}
        {creating && (
          <form
            onSubmit={createGroup}
            style={{
              borderTop: '1px solid var(--border-faint)',
              borderBottom: '1px solid var(--border-faint)',
              padding: 'var(--s-5) 0',
              marginBottom: 'var(--s-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--s-5)',
            }}
          >
            <div className="flex" style={{ gap: 'var(--s-4)' }}>
              <div className="field" style={{ flex: '0 0 80px' }}>
                <label className="field-label" htmlFor="emoji">Emoji</label>
                <input
                  id="emoji"
                  className="input"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value.slice(0, 4) || '🎬')}
                  style={{ fontSize: 24, textAlign: 'left' }}
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label className="field-label" htmlFor="name">Nom du groupe</label>
                <input
                  id="name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Les Chevaliers du Vendredi…"
                  autoFocus
                />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--s-4)',
              }}
            >
              <div className="field">
                <label className="field-label" htmlFor="drawMode">Mode de tirage</label>
                <select
                  id="drawMode"
                  className="input"
                  value={drawMode}
                  onChange={(e) => setDrawMode(e.target.value as DrawMode)}
                >
                  {(Object.entries(DRAW_LABELS) as [DrawMode, string][]).map(([k, v]) => (
                    <option key={k} value={k} style={{ background: 'var(--ink)' }}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="frequency">Fréquence</label>
                <select
                  id="frequency"
                  className="input"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as Frequency)}
                >
                  {(Object.entries(FREQ_LABELS) as [Frequency, string][]).map(([k, v]) => (
                    <option key={k} value={k} style={{ background: 'var(--ink)' }}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p className="t-caption" style={{ color: 'var(--accent)' }}>{error}</p>
            )}

            <div className="flex" style={{ gap: 'var(--s-3)', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setCreating(false); setError('') }}
                className="btn btn-ghost"
                disabled={submitting}
              >
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? '…' : 'Créer le groupe'}
              </button>
            </div>
          </form>
        )}

        {/* Group list — editorial rows */}
        {memberships.length === 0 && !creating && (
          <p className="t-body" style={{ color: 'var(--text-muted)' }}>
            Aucun groupe pour l&apos;instant. Créez le premier ci-dessus, ou ouvrez le lien d&apos;invitation qu&apos;un ami vous a envoyé.
          </p>
        )}

        <div role="list">
          {memberships.map(({ groups: g }, idx) => (
            <Link
              key={g.id}
              href={`/g/${g.id}`}
              role="listitem"
              className="flex items-center"
              style={{
                gap: 'var(--s-4)',
                padding: 'var(--s-4) 0',
                borderTop: idx === 0 ? '1px solid var(--border-faint)' : 'none',
                borderBottom: '1px solid var(--border-faint)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background-color var(--motion-duration) var(--motion-easing)',
              }}
            >
              <span
                className="avatar avatar-48"
                style={{ fontFamily: 'var(--font-sans)', fontStyle: 'normal', fontSize: 22 }}
              >
                {g.emoji}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="t-h3" style={{ color: 'var(--text)' }}>{g.name}</p>
                <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-1)' }}>
                  {DRAW_LABELS[g.rules.draw_mode]} · {FREQ_LABELS[g.rules.frequency]}
                </p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </Link>
          ))}
        </div>

        {memberships.length > 0 && (
          <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-5)' }}>
            Pour rejoindre un groupe, demandez-leur le lien.
          </p>
        )}
      </div>
    </main>
  )
}
