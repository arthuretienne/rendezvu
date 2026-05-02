import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatClient from './ChatClient'
import type { Message, Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await params
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')
  const userId = session.user.id

  const [messagesRes, membersRes] = await Promise.all([
    supabase
      .from('messages')
      .select('id, group_id, user_id, body, attachments, reply_to, reactions, created_at, edited_at, deleted_at')
      .eq('group_id', groupId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(200),
    supabase.from('group_members').select('user_id').eq('group_id', groupId).is('left_at', null),
  ])

  const memberIds = (membersRes.data ?? []).map(m => m.user_id)
  const { data: memberProfiles } = await supabase.rpc('resolve_profiles', { _ids: memberIds })

  return (
    <ChatClient
      groupId={groupId}
      userId={userId}
      initialMessages={(messagesRes.data ?? []) as Message[]}
      members={(memberProfiles ?? []) as Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'is_patron'>[]}
    />
  )
}
