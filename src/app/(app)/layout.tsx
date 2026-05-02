import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  // proxy.ts middleware already validated and refreshed the session for this
  // request. getSession() reads from the cookie locally — no network roundtrip.
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {children}
    </div>
  )
}
