'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Group } from '@/lib/types'
import { Plus, Film, LogOut, Users, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const EMOJIS = ['🎬', '🎥', '🍿', '🎞️', '🎭', '🌙', '🔥', '⭐', '🎪', '🏆']

export default function GroupsClient({ userId, userName, initialGroups }: {
  userId: string
  userName: string
  initialGroups: Group[]
}) {
  const [groups, setGroups] = useState<Group[]>(initialGroups)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎬')
  const [saving, setSaving] = useState(false)
  const [createError, setCreateError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  async function createGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || saving) return
    setSaving(true)
    setCreateError('')

    const { data: group, error } = await supabase
      .from('groups')
      .insert({ name: name.trim(), emoji, created_by: userId, frequency: 'biweekly' })
      .select().single()

    if (error || !group) {
      setCreateError(error?.message ?? 'Failed to create group. Make sure the database migration has been run.')
      setSaving(false)
      return
    }

    const { error: memberError } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: userId })

    if (memberError) {
      setCreateError(memberError.message)
      setSaving(false)
      return
    }

    setGroups(prev => [group, ...prev])
    setCreating(false)
    setName('')
    setSaving(false)
    router.push(`/g/${group.id}`)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <nav className="sticky top-0 z-50" style={{ background: 'var(--bg-warm)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto px-4 h-13 flex items-center justify-between">
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Cinephile Starter
          </span>
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }} className="hidden sm:block">{userName}</span>
            <button onClick={signOut} className="p-1.5 rounded hover:bg-[var(--surface-2)] transition-colors" style={{ color: 'var(--text-muted)' }}>
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6 curtain-in">
          {/* Header */}
          <div className="flex items-end justify-between">
            <div>
              <span className="marquee">Your Spaces</span>
              <h1 className="mt-2" style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--text)', fontWeight: 700 }}>
                Groups
              </h1>
              <p className="mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                {groups.length} group{groups.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => { setCreating(v => !v); setCreateError('') }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-85"
              style={{ background: 'var(--copper)', color: '#fff', fontFamily: 'var(--font-display)' }}
            >
              <Plus size={14} />
              New group
            </button>
          </div>

          {/* Create form */}
          {creating && (
            <form onSubmit={createGroup} className="p-4 rounded-xl space-y-4 pop-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Create a new group
              </p>
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Group name (e.g. Arthur & Clo)"
                  autoFocus
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ fontFamily: 'var(--font-body)', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <p className="mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Emoji</p>
                <div className="flex gap-2 flex-wrap">
                  {EMOJIS.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className="w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all"
                      style={{ background: emoji === e ? 'var(--copper)' : 'var(--surface-2)', border: `1px solid ${emoji === e ? 'var(--copper)' : 'var(--border)'}` }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              {createError && (
                <div className="px-3 py-2 rounded-lg text-sm" style={{ background: '#fde8e8', color: '#9b2020', border: '1px solid #f5c5c5', fontFamily: 'var(--font-body)' }}>
                  {createError}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!name.trim() || saving}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 hover:opacity-85"
                  style={{ background: 'var(--copper)', color: '#fff', fontFamily: 'var(--font-display)' }}
                >
                  {saving ? 'Creating...' : 'Create group'}
                </button>
                <button
                  type="button"
                  onClick={() => { setCreating(false); setCreateError('') }}
                  className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--surface-2)]"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Groups list */}
          {groups.length === 0 && !creating ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <Film size={36} className="mb-4" style={{ color: 'var(--text-muted)' }} />
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No groups yet.
              </p>
              <p className="mt-1" style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Create one or join via an invite link.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {groups.map(g => (
                <Link
                  key={g.id}
                  href={`/g/${g.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all hover:border-[var(--copper)] group"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', textDecoration: 'none' }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    {g.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text)', fontWeight: 700 }}>
                      {g.name}
                    </p>
                    <p className="mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                      {g.frequency === 'weekly' ? 'Every week' : g.frequency === 'biweekly' ? 'Every 2 weeks' : 'Every month'}
                    </p>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} className="group-hover:text-[var(--copper)] transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
