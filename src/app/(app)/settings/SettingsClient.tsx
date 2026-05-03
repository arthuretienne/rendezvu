'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogOut, Upload, ExternalLink, Download, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Visibility, NotificationPref } from '@/lib/types'
import { PatronBadge } from '@/components/PatronBadge'
import DonateBlock from './DonateBlock'
import NotificationPrefsBlock from './NotificationPrefsBlock'

type EditableProfile = Pick<
  Profile,
  'id' | 'username' | 'display_name' | 'avatar_url' | 'bio' | 'visibility' | 'discover_opt_in' | 'is_patron'
>

const VIS_LABELS: Record<Visibility, { label: string; hint: string }> = {
  private: { label: 'Privé', hint: 'Vous seul·e voyez votre profil, vos listes et vos avis.' },
  friends: { label: 'Compagnons', hint: 'Vos compagnons acceptés voient votre profil et vos avis.' },
  public: { label: 'Public', hint: 'N’importe qui peut trouver votre profil par pseudo.' },
}

export default function SettingsClient({
  initialProfile,
  email,
  initialPrefs,
}: {
  initialProfile: EditableProfile
  email: string
  initialPrefs: NotificationPref[]
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
    if (!confirm('Supprimer votre compte ?\n\nVotre profil, vos listes et vos avis seront masqués immédiatement et supprimés définitivement après 30 jours.')) return
    const r = await fetch('/api/account/delete', { method: 'POST' })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      setError(j.error ?? 'Suppression impossible.')
      return
    }
    router.push('/')
    router.refresh()
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
          <button onClick={signOut} className="btn btn-ghost" style={{ height: 32 }}>
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--s-7) var(--s-5)' }}>
        <header style={{ marginBottom: 'var(--s-7)' }}>
          <h1 className="t-h1">
            Paramètres
            {profile.is_patron && <span style={{ marginLeft: 'var(--s-3)', verticalAlign: 'middle' }}><PatronBadge /></span>}
          </h1>
        </header>

        {error && (
          <p className="t-caption" style={{ color: 'var(--accent)', marginBottom: 'var(--s-5)' }}>
            {error}
          </p>
        )}

        {/* Profile */}
        <section style={{ marginBottom: 'var(--s-7)', display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}>
          <div className="flex items-baseline justify-between">
            <h2 className="t-h2">Profil.</h2>
            <Link href={`/u/${profile.username}`} className="link t-caption">
              Voir profil public <ExternalLink size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="username">Pseudo</label>
            <input
              id="username"
              value={profile.username}
              disabled
              className="input"
            />
            <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-1)' }}>
              Le changement de pseudo n&apos;est pas encore activé.
            </p>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="display_name">Nom affiché</label>
            <input
              id="display_name"
              className="input"
              value={profile.display_name}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              onBlur={() => {
                if (profile.display_name !== initialProfile.display_name) {
                  update('display_name', profile.display_name)
                }
              }}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="email">Email</label>
            <input id="email" value={email} disabled className="input" />
          </div>
        </section>

        {/* Visibility */}
        <section style={{ marginBottom: 'var(--s-7)' }}>
          <h2 className="t-h2" style={{ marginBottom: 'var(--s-3)' }}>Visibilité.</h2>
          <p className="t-body" style={{ color: 'var(--text-muted)', marginBottom: 'var(--s-4)' }}>
            Qui peut voir votre profil, listes et avis hors de vos groupes.
          </p>
          <div>
            {(Object.entries(VIS_LABELS) as [Visibility, { label: string; hint: string }][]).map(([k, { label, hint }]) => {
              const active = profile.visibility === k
              return (
                <button
                  key={k}
                  onClick={() => update('visibility', k)}
                  disabled={saving === 'visibility'}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: 'var(--s-4) 0',
                    borderTop: '1px solid var(--border-faint)',
                    borderBottom: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <p
                    className="t-h3"
                    style={{ color: active ? 'var(--accent)' : 'var(--text)' }}
                  >
                    {label} {active && '·'}
                  </p>
                  <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-1)' }}>
                    {hint}
                  </p>
                </button>
              )
            })}
            <div style={{ borderBottom: '1px solid var(--border-faint)' }} />
          </div>
        </section>

        {/* Discover */}
        <section style={{ marginBottom: 'var(--s-7)' }}>
          <div className="flex items-start" style={{ gap: 'var(--s-4)' }}>
            <div style={{ flex: 1 }}>
              <h2 className="t-h2">Découverte.</h2>
              <p className="t-body" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-3)' }}>
                Quand activé, Rendezvu peut proposer des inconnus aux goûts proches (via Cinetype).
                Une suggestion par semaine maximum, jamais d&apos;intro automatique.
              </p>
            </div>
            <button
              onClick={() => update('discover_opt_in', !profile.discover_opt_in)}
              disabled={saving === 'discover_opt_in'}
              role="switch"
              aria-checked={profile.discover_opt_in}
              style={{
                position: 'relative',
                flexShrink: 0,
                width: 40,
                height: 24,
                borderRadius: 2,
                background: profile.discover_opt_in ? 'var(--accent)' : 'var(--surface)',
                border: `1px solid ${profile.discover_opt_in ? 'var(--accent)' : 'var(--border-faint)'}`,
                cursor: 'pointer',
                transition: 'background var(--motion-duration) var(--motion-easing)',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  left: profile.discover_opt_in ? 18 : 2,
                  width: 18,
                  height: 18,
                  borderRadius: 1,
                  background: profile.discover_opt_in ? 'var(--ink)' : 'var(--text-muted)',
                  transition: 'left var(--motion-duration) var(--motion-easing)',
                }}
              />
            </button>
          </div>
        </section>

        {/* Import */}
        <section style={{ marginBottom: 'var(--s-7)' }}>
          <h2 className="t-h2" style={{ marginBottom: 'var(--s-3)' }}>Imports.</h2>
          <p className="t-body" style={{ color: 'var(--text-muted)', marginBottom: 'var(--s-4)' }}>
            Importez votre journal Letterboxd, vos notes IMDb. Chaque film est résolu via TMDB.
          </p>
          <Link href="/settings/import" className="btn btn-secondary">
            <Upload size={14} /> Importer depuis Letterboxd
          </Link>
        </section>

        <section style={{ marginBottom: 'var(--s-7)' }}>
          <NotificationPrefsBlock userId={profile.id} initial={initialPrefs} />
        </section>

        <section style={{ marginBottom: 'var(--s-7)' }}>
          <DonateBlock isPatron={profile.is_patron} />
        </section>

        {/* Données */}
        <section style={{ marginBottom: 'var(--s-7)' }}>
          <h2 className="t-h2" style={{ marginBottom: 'var(--s-3)' }}>Vos données.</h2>
          <p className="t-body" style={{ color: 'var(--text-muted)', marginBottom: 'var(--s-4)' }}>
            Téléchargez tout ce qu&apos;on stocke, ou supprimez votre compte. Voir <Link href="/privacy" className="link">Confidentialité</Link>.
          </p>
          <div className="flex flex-wrap" style={{ gap: 'var(--s-3)' }}>
            <a href="/api/account/export" className="btn btn-secondary">
              <Download size={14} /> Exporter mes données
            </a>
            <button onClick={deleteAccount} className="btn btn-ghost" style={{ color: 'var(--accent)' }}>
              <Trash2 size={14} /> Supprimer mon compte
            </button>
          </div>
        </section>

        {savedAt && (
          <p className="t-caption" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
            Enregistré.
          </p>
        )}
      </div>
    </main>
  )
}
