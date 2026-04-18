import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in → send to auth with next param
  if (!user) {
    redirect(`/auth?next=/invite/${token}`)
  }

  // Look up group via security-definer RPC (bypasses RLS for non-members)
  const { data: groups } = await supabase.rpc('get_group_by_invite_token', { token })
  const group = groups?.[0]

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center px-6">
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)', fontWeight: 700 }}>
            Invalid invite link
          </p>
          <p className="mt-2" style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            This link may have expired or is incorrect.
          </p>
          <a href="/groups" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--copper)', letterSpacing: '0.04em', display: 'block', marginTop: '1rem' }}>
            ← Back to groups
          </a>
        </div>
      </div>
    )
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    redirect(`/g/${group.id}`)
  }

  // Join the group
  await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id })

  redirect(`/g/${group.id}`)
}
