'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Film, List, MessageCircle, Star, LogOut, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function GroupNav({ groupId, groupName, groupEmoji, userName }: {
  groupId: string
  groupName: string
  groupEmoji: string
  userName: string
}) {
  const path = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const links = [
    { href: `/g/${groupId}`, label: 'Home', icon: Film, exact: true },
    { href: `/g/${groupId}/bucket`, label: 'Bucket', icon: List, exact: false },
    { href: `/g/${groupId}/watched`, label: 'Watched', icon: Star, exact: false },
    { href: `/g/${groupId}/chat`, label: 'Chat', icon: MessageCircle, exact: false },
  ]

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50" style={{ background: 'var(--bg-warm)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-4xl mx-auto px-4 h-13 flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          {/* Back to groups */}
          <Link
            href="/groups"
            className="flex items-center gap-1 mr-3 px-2 py-1.5 rounded-lg transition-colors hover:bg-[var(--surface-2)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronLeft size={14} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.04em' }} className="hidden sm:inline">
              {groupEmoji} {groupName}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }} className="sm:hidden">
              {groupEmoji}
            </span>
          </Link>

          {/* Group links */}
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? path === href : path.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-2 text-sm relative transition-colors"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: active ? 500 : 400,
                  color: active ? 'var(--copper)' : 'var(--text-muted)',
                }}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{label}</span>
                {active && <span className="absolute bottom-0 left-2 right-2 h-px" style={{ background: 'var(--copper)' }} />}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }} className="hidden sm:block">
            {userName}
          </span>
          <button onClick={signOut} className="p-1.5 rounded hover:bg-[var(--surface-2)] transition-colors" style={{ color: 'var(--text-muted)' }}>
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </nav>
  )
}
