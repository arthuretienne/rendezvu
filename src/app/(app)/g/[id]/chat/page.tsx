import RebuildingNotice from '@/components/RebuildingNotice'

export const dynamic = 'force-dynamic'

export default function ChatPage() {
  return (
    <RebuildingNotice
      surface="Chat"
      plan="Chat is being rebuilt with images, replies, reactions, and Supabase Realtime broadcast for typing indicators."
    />
  )
}
