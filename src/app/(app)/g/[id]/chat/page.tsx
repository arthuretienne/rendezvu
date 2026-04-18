import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatClient from './ChatClient'

export const dynamic = 'force-dynamic'

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: messages }, { data: profile }] = await Promise.all([
    supabase.from('messages').select('*').eq('group_id', groupId).order('created_at', { ascending: true }).limit(100),
    supabase.from('profiles').select('name').eq('id', user.id).single(),
  ])

  return (
    <ChatClient
      userId={user.id}
      groupId={groupId}
      userName={profile?.name ?? 'You'}
      initialMessages={messages ?? []}
    />
  )
}
