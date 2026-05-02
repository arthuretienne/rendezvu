import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, visibility, discover_opt_in, is_patron')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth')

  return <SettingsClient initialProfile={profile} email={user.email ?? ''} />
}
