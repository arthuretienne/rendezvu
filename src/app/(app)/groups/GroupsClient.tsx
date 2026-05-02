'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Users, Settings as SettingsIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Group, Profile, DrawMode, Frequency } from '@/lib/types'

type Membership = {
  group_id: string
  joined_at: string
  groups: Group
}

const DRAW_LABELS: Record<DrawMode, string> = {
  random: 'Random pick',
  vote: 'Group vote',
  veto: 'Veto round',
}

const FREQ_LABELS: Record<Frequency, string> = {
  weekly: 'Every week',
  biweekly: 'Every 2 weeks',
  monthly: 'Every month',
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
      setError('Give your group a name.')
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
      setError(insertError?.message ?? 'Could not create the group.')
      setSubmitting(false)
      return
    }
    router.push(`/g/${data.id}`)
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Top mini-nav */}
      <nav className="flex items-center justify-between mb-8">
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: 'var(--copper)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}
        >
          ◆ Rendezvu
        </p>
        <div className="flex items-center gap-1">
          <Link
            href="/friends"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
          >
            <Users size={13} />
            <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-body)' }}>Friends</span>
          </Link>
          <Link
            href="/settings"
            className="p-1.5 rounded-lg transition-all hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
            title="Settings"
          >
            <SettingsIcon size={14} />
          </Link>
        </div>
      </nav>

      <header className="mb-8">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', fontWeight: 600 }}>
          Your groups
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4, fontFamily: 'var(--font-body)' }}>
          Hi {profile?.display_name ?? 'there'} — pick a group, create one, or join via an invite link.
        </p>
      </header>

      {/* Create-group inline form */}
      {!creating ? (
        <button
          onClick={() => setCreating(true)}
          className="w-full flex items-center justify-center gap-2 mb-6 px-4 py-3 rounded-xl transition-all hover:opacity-90 cursor-pointer"
          style={{
            background: 'var(--copper)',
            color: '#000',
            fontFamily: 'var(--font-display)',
            fontSize: '0.95rem',
            letterSpacing: '0.02em',
            boxShadow: '0 4px 24px rgba(201,162,85,0.2)',
          }}
        >
          <Plus size={16} />
          Create a new group
        </button>
      ) : (
        <form
          onSubmit={createGroup}
          className="mb-6 rounded-xl p-5 space-y-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <label className="block mb-1.5" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Emoji
              </label>
              <input
                value={emoji}
                onChange={e => setEmoji(e.target.value.slice(0, 4) || '🎬')}
                className="w-14 text-center rounded-lg px-2 py-2 outline-none"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: '1.4rem' }}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1.5" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Group name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Family movie night, Long-distance LDR, …"
                autoFocus
                className="w-full rounded-lg px-3 py-2 outline-none"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Draw mode
              </label>
              <select
                value={drawMode}
                onChange={e => setDrawMode(e.target.value as DrawMode)}
                className="w-full rounded-lg px-3 py-2 outline-none"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                }}
              >
                {(Object.entries(DRAW_LABELS) as [DrawMode, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Frequency
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as Frequency)}
                className="w-full rounded-lg px-3 py-2 outline-none"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                }}
              >
                {(Object.entries(FREQ_LABELS) as [Frequency, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.78rem', fontFamily: 'var(--font-body)' }}>{error}</p>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setCreating(false); setError('') }}
              disabled={submitting}
              className="px-4 py-2 rounded-lg transition-all hover:bg-white/5 cursor-pointer"
              style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
              style={{
                background: 'var(--copper)',
                color: '#000',
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
                letterSpacing: '0.02em',
              }}
            >
              {submitting ? 'Creating…' : 'Create group'}
            </button>
          </div>
        </form>
      )}

      {/* Group list */}
      <div className="space-y-3">
        {memberships.length === 0 && !creating && (
          <div
            className="rounded-xl p-6 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'var(--font-body)' }}>
              No groups yet. Create your first one above, or open an invite link a friend sent you.
            </p>
          </div>
        )}
        {memberships.map(({ groups: g }) => (
          <Link
            key={g.id}
            href={`/g/${g.id}`}
            className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:bg-white/5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <span style={{ fontSize: '1.4rem' }}>{g.emoji}</span>
            <div className="flex-1 min-w-0">
              <p style={{ color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>{g.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', marginTop: 2 }}>
                {DRAW_LABELS[g.rules.draw_mode]} · {FREQ_LABELS[g.rules.frequency]}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
