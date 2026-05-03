'use client'

import { useState } from 'react'
import { Mail, MessageSquare, Smartphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { NotificationPref, NotificationKind, NotificationChannel } from '@/lib/types'

const KINDS: { kind: NotificationKind; label: string; hint: string }[] = [
  { kind: 'draw_imminent',  label: 'Tirage imminent',          hint: 'Un tirage de groupe approche.' },
  { kind: 'movie_watched',  label: 'Film vu',                  hint: 'Quelqu\'un d\'un groupe a marqué un film comme vu.' },
  { kind: 'review_posted',  label: 'Nouvel avis',              hint: 'Un compagnon ou membre de groupe a posté un avis.' },
  { kind: 'review_replied', label: 'Réponse à votre avis',     hint: 'Quelqu\'un a réagi à votre avis.' },
  { kind: 'friend_request', label: 'Demande de compagnon',     hint: 'Quelqu\'un veut vous ajouter.' },
  { kind: 'friend_accepted',label: 'Demande acceptée',         hint: 'Votre demande a été acceptée.' },
  { kind: 'group_invited',  label: 'Invitation de groupe',     hint: 'On vous a invité dans un nouveau groupe.' },
  { kind: 'weekly_digest',  label: 'Récap hebdo',              hint: 'Un récap dominical de vos groupes.' },
]

const CHANNELS: { channel: NotificationChannel; label: string; Icon: typeof Mail; supported: boolean }[] = [
  { channel: 'email',    label: 'Email',  Icon: Mail,         supported: true },
  { channel: 'in_app',   label: 'In-app', Icon: MessageSquare, supported: true },
  { channel: 'web_push', label: 'Push',   Icon: Smartphone,    supported: false },
]

function isEnabled(prefs: Map<string, boolean>, kind: NotificationKind, channel: NotificationChannel): boolean {
  const key = `${kind}:${channel}`
  return prefs.has(key) ? prefs.get(key)! : true
}

export default function NotificationPrefsBlock({
  userId,
  initial,
}: {
  userId: string
  initial: NotificationPref[]
}) {
  const supabase = createClient()
  const [prefs, setPrefs] = useState<Map<string, boolean>>(() => {
    const m = new Map<string, boolean>()
    initial.filter(p => !p.group_id).forEach(p => m.set(`${p.kind}:${p.channel}`, p.enabled))
    return m
  })
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function toggle(kind: NotificationKind, channel: NotificationChannel) {
    const key = `${kind}:${channel}`
    const next = !isEnabled(prefs, kind, channel)
    setBusy(key)
    setError('')

    const optimistic = new Map(prefs)
    optimistic.set(key, next)
    setPrefs(optimistic)

    const { data: existing } = await supabase
      .from('notification_prefs')
      .select('id')
      .eq('user_id', userId)
      .is('group_id', null)
      .eq('kind', kind)
      .eq('channel', channel)
      .maybeSingle()

    const { error: dbErr } = existing
      ? await supabase.from('notification_prefs').update({ enabled: next }).eq('id', existing.id)
      : await supabase.from('notification_prefs').insert({ user_id: userId, kind, channel, enabled: next })

    setBusy(null)
    if (dbErr) {
      setError(dbErr.message)
      const rollback = new Map(prefs)
      setPrefs(rollback)
    }
  }

  return (
    <div>
      <h2 className="t-h2" style={{ marginBottom: 'var(--s-3)' }}>Notifications.</h2>
      <p className="t-body" style={{ color: 'var(--text-muted)', marginBottom: 'var(--s-5)' }}>
        Comment Rendezvu vous joint. Push arrive avec l&apos;app mobile.
      </p>

      {error && (
        <p className="t-caption" style={{ color: 'var(--accent)', marginBottom: 'var(--s-3)' }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `1fr repeat(${CHANNELS.length}, 56px)`,
          alignItems: 'center',
          padding: 'var(--s-2) 0',
          borderBottom: '1px solid var(--border-faint)',
        }}
      >
        <span className="t-caption" style={{ color: 'var(--text-muted)' }}>Évènement</span>
        {CHANNELS.map(({ channel, label, Icon }) => (
          <span key={channel} title={label} className="flex justify-center" style={{ color: 'var(--text-muted)' }}>
            <Icon size={14} strokeWidth={1.5} />
          </span>
        ))}
      </div>

      {KINDS.map(({ kind, label, hint }) => (
        <div
          key={kind}
          style={{
            display: 'grid',
            gridTemplateColumns: `1fr repeat(${CHANNELS.length}, 56px)`,
            alignItems: 'center',
            padding: 'var(--s-3) 0',
            borderBottom: '1px solid var(--border-faint)',
          }}
        >
          <div>
            <p className="t-body" style={{ color: 'var(--text)' }}>{label}</p>
            <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-1)' }}>{hint}</p>
          </div>
          {CHANNELS.map(({ channel, label: chLabel, supported }) => {
            const on = isEnabled(prefs, kind, channel)
            const key = `${kind}:${channel}`
            return (
              <div key={channel} className="flex justify-center">
                <button
                  type="button"
                  role="switch"
                  aria-checked={on && supported}
                  aria-label={`${label} via ${chLabel}`}
                  disabled={!supported || busy === key}
                  onClick={() => toggle(kind, channel)}
                  style={{
                    position: 'relative',
                    width: 36,
                    height: 20,
                    borderRadius: 2,
                    background: on && supported ? 'var(--accent)' : 'var(--surface)',
                    border: `1px solid ${on && supported ? 'var(--accent)' : 'var(--border-faint)'}`,
                    cursor: supported ? 'pointer' : 'not-allowed',
                    opacity: !supported ? 0.3 : 1,
                    transition: 'background var(--motion-duration) var(--motion-easing)',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 1,
                      left: on && supported ? 16 : 1,
                      width: 16,
                      height: 16,
                      borderRadius: 1,
                      background: on && supported ? 'var(--ink)' : 'var(--text-muted)',
                      transition: 'left var(--motion-duration) var(--motion-easing)',
                    }}
                  />
                </button>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
