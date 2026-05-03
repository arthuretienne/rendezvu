import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Not logged in → send to auth with next param
  if (!session) {
    redirect(`/auth?next=/invite/${token}`)
  }
  const user = session.user

  // Look up group via security-definer RPC (bypasses RLS for non-members)
  const { data: groups } = await supabase.rpc('get_group_by_invite_token', { token })
  const group = groups?.[0]

  if (!group) {
    return (
      <main
        style={{
          background: 'var(--ink)',
          color: 'var(--text)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--s-5)',
        }}
      >
        <div className="measure" style={{ textAlign: 'center' }}>
          <h1 className="t-h2">« Ce lien n&apos;ouvre rien. »</h1>
          <p className="t-body" style={{ color: 'var(--text-muted)', marginTop: 'var(--s-3)' }}>
            Il a peut-être expiré, ou n&apos;a jamais existé. Demandez-leur de vous en envoyer un autre.
          </p>
          <a href="/groups" className="link t-body" style={{ marginTop: 'var(--s-5)', display: 'inline-block' }}>
            ← Retour aux groupes
          </a>
        </div>
      </main>
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
