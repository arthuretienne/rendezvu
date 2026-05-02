'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogOut, Crown, Upload, ExternalLink, Download, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Visibility } from '@/lib/types'

type EditableProfile = Pick<
  Profile,
  'id' | 'username' | 'display_name' | 'avatar_url' | 'bio' | 'visibility' | 'discover_opt_in' | 'is_patron'
>

const VIS_LABELS: Record<Visibility, { label: string; hint: string }> = {
  private: { label: 'Private', hint: 'Only you can see your profile, lists, and reviews.' },
  friends: { label: 'Friends', hint: 'Accepted friends can see your profile and reviews.' },
  public: { label: 'Public', hint: 'Anyone can find your profile by username.' },
}

export default function SettingsClient({
  initialProfile,
  email,
}: {
  initialProfile: EditableProfile
  email: string
}) {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState(initialProfile)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState<string | null>(null)

  async function update<K extends keyof EditableProfile>(field: K, value: EditableProfile[K]) {
    setSaving(field as string)
    setError('')
    const next = { ...profile, [field]: value }
    setProfile(next)
    const { error } = await supabase.from('profiles').update({ [field]: value }).eq('id', profile.id)
    setSaving(null)
    if (error) {
      setError(error.message)
      setProfile(profile)
      return
    }
    setSavedAt(new Date().toISOString())
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  async function deleteAccount() {
    if (!confirm('Delete your account?\n\nYour profile, lists and reviews will be hidden immediately and permanently deleted after 30 days. You can recover during that window by emailing support.')) return
    const r = await fetch('/api/account/delete', { method: 'POST' })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      setError(j.error ?? 'Could not delete account.')
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <nav className="flex items-center justify-between mb-8">
        <Link
          href="/groups"
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={13} />
          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-body)' }}>Groups</span>
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all hover:bg-white/5 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut size={13} />
          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-body)' }}>Sign out</span>
        </button>
      </nav>

      <header className="mb-8">
        <p className="marquee">Rendezvu</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', fontWeight: 600 }}>
          Settings
        </h1>
      </header>

      {error && (
        <p
          className="mb-6 px-3.5 py-2.5 rounded-xl text-sm"
          style={{ background: 'rgba(220,38,38,0.1)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.2)' }}
        >
          {error}
        </p>
      )}

      {/* Profile section */}
      <section
        className="rounded-xl p-5 mb-5 space-y-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="marquee">Profile</h2>
          {profile.is_patron && (
            <span className="flex items-center gap-1" style={{ color: 'var(--copper)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
              <Crown size={11} /> PATRON
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Username
            </label>
            <Link
              href={`/u/${profile.username}`}
              className="inline-flex items-center gap-1 transition-all hover:opacity-70"
              style={{ color: 'var(--copper)', fontSize: '0.66rem', fontFamily: 'var(--font-body)' }}
            >
              View public profile <ExternalLink size={10} />
            </Link>
          </div>
          <input
            value={profile.username}
            disabled
            className="w-full px-3.5 py-2.5 rounded-xl text-sm"
            style={{
              fontFamily: 'var(--font-body)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          />
          <p style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-body)' }}>
            Username changes are not enabled yet — coming soon.
          </p>
        </div>

        <div>
          <label className="block mb-1.5" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Display name
          </label>
          <input
            value={profile.display_name}
            onChange={e => setProfile({ ...profile, display_name: e.target.value })}
            onBlur={() => {
              if (profile.display_name !== initialProfile.display_name) {
                update('display_name', profile.display_name)
              }
            }}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
            style={{
              fontFamily: 'var(--font-body)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          />
        </div>

        <div>
          <label className="block mb-1.5" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Email
          </label>
          <input
            value={email}
            disabled
            className="w-full px-3.5 py-2.5 rounded-xl text-sm"
            style={{
              fontFamily: 'var(--font-body)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          />
        </div>
      </section>

      {/* Visibility section */}
      <section
        className="rounded-xl p-5 mb-5 space-y-3"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <h2 className="marquee">Visibility</h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          Controls who can see your profile, lists, and reviews outside of your groups.
        </p>
        <div className="space-y-2">
          {(Object.entries(VIS_LABELS) as [Visibility, { label: string; hint: string }][]).map(([k, { label, hint }]) => {
            const active = profile.visibility === k
            return (
              <button
                key={k}
                onClick={() => update('visibility', k)}
                disabled={saving === 'visibility'}
                className="w-full text-left rounded-lg p-3 transition-all cursor-pointer"
                style={{
                  background: active ? 'rgba(201,162,85,0.08)' : 'var(--surface-2)',
                  border: `1px solid ${active ? 'var(--copper)' : 'var(--border)'}`,
                }}
              >
                <p style={{ color: active ? 'var(--copper)' : 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: active ? 500 : 400 }}>
                  {label}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 2, fontFamily: 'var(--font-body)' }}>
                  {hint}
                </p>
              </button>
            )
          })}
        </div>
      </section>

      {/* Discover */}
      <section
        className="rounded-xl p-5 mb-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="marquee mb-1">Discover</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
              When on, Rendezvu can propose taste-matched strangers based on your Cinetype.
              You receive at most one weekly match — never automatic introductions.
            </p>
          </div>
          <button
            onClick={() => update('discover_opt_in', !profile.discover_opt_in)}
            disabled={saving === 'discover_opt_in'}
            role="switch"
            aria-checked={profile.discover_opt_in}
            className="relative shrink-0 rounded-full transition-all cursor-pointer"
            style={{
              width: 38,
              height: 22,
              background: profile.discover_opt_in ? 'var(--copper)' : 'var(--surface-2)',
              border: `1px solid ${profile.discover_opt_in ? 'var(--copper)' : 'var(--border)'}`,
            }}
          >
            <span
              className="absolute top-0.5 transition-all"
              style={{
                left: profile.discover_opt_in ? 18 : 2,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: profile.discover_opt_in ? '#000' : 'var(--text-muted)',
              }}
            />
          </button>
        </div>
      </section>

      {/* Import */}
      <section
        className="rounded-xl p-5 mb-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <h2 className="marquee mb-2">Import</h2>
        <p className="mb-3" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
          Bring your Letterboxd ratings, watched, or diary CSV. We resolve each film via TMDB and keep your reviews.
        </p>
        <Link
          href="/settings/import"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all hover:opacity-90"
          style={{ background: 'var(--copper)', color: '#000', fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}
        >
          <Upload size={13} />
          Import from Letterboxd
        </Link>
      </section>

      {/* Privacy & Data */}
      <section
        className="rounded-xl p-5 mb-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <h2 className="marquee mb-2">Privacy & Data</h2>
        <p className="mb-3" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
          You can download everything we store about you, or delete your account. See <Link href="/privacy" style={{ color: 'var(--copper)' }}>Privacy</Link> for what we keep and why.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/account/export"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all hover:bg-white/5"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}
          >
            <Download size={13} />
            Export my data
          </a>
          <button
            onClick={deleteAccount}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all hover:bg-red-500/10 cursor-pointer"
            style={{ background: 'transparent', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}
          >
            <Trash2 size={13} />
            Delete account
          </button>
        </div>
      </section>

      {savedAt && (
        <p
          style={{
            fontSize: '0.66rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
            textAlign: 'center',
          }}
        >
          ◆ Saved
        </p>
      )}
    </main>
  )
}
