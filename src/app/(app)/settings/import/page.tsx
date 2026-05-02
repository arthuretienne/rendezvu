import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ImportClient from './ImportClient'

export const dynamic = 'force-dynamic'

export default async function ImportPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')
  return <ImportClient userId={session.user.id} />
}
