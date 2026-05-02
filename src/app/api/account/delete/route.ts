import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  const { error } = await supabase
    .from('profiles')
    .update({ deleted_at: new Date().toISOString(), visibility: 'private' })
    .eq('id', session.user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await supabase.auth.signOut()
  return NextResponse.json({ ok: true })
}
