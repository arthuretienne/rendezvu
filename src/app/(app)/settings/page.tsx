import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, visibility, discover_opt_in, is_patron')
    .eq('id', session.user.id)
    .single()

  if (!profile) redirect('/auth')

  const { data: prefs } = await supabase
    .from('notification_prefs')
    .select('id, user_id, group_id, kind, channel, enabled')
    .eq('user_id', session.user.id)
    .is('group_id', null)

  return (
    <SettingsClient
      initialProfile={profile}
      email={session.user.email ?? ''}
      initialPrefs={prefs ?? []}
    />
  )
}
