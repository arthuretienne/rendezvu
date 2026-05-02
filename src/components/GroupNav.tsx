'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, ChevronLeft } from 'lucide-react'
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
    { href: `/g/${groupId}`,         label: 'Accueil', exact: true },
    { href: `/g/${groupId}/bucket`,  label: 'Bucket',  exact: false },
    { href: `/g/${groupId}/watched`, label: 'Vus',     exact: false },
    { href: `/g/${groupId}/chat`,    label: 'Chat',    exact: false },
  ]

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'var(--ink)',
        borderBottom: '1px solid var(--border-faint)',
      }}
    >
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link
            href="/groups"
            className="t-caption inline-flex items-center gap-1"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronLeft size={14} />
            <span className="hidden sm:inline">{groupEmoji} {groupName}</span>
            <span className="sm:hidden">{groupEmoji}</span>
          </Link>

          <div className="flex items-center gap-4">
            {links.map(({ href, label, exact }) => {
              const active = exact ? path === href : path.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative py-1"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--text)' : 'var(--text-muted)',
                  }}
                >
                  {label}
                  {active && (
                    <span
                      className="absolute -bottom-px left-0 right-0"
                      style={{ height: '1px', background: 'var(--accent)' }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span
            className="t-caption hidden sm:block"
            style={{ color: 'var(--text-muted)' }}
          >
            {userName}
          </span>
          <button
            onClick={signOut}
            className="btn btn-ghost"
            style={{ height: 32, padding: '0 6px' }}
            title="Se déconnecter"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </nav>
  )
}
