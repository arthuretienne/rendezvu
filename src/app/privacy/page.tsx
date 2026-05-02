import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Privacy — Rendezvu' }

export default function PrivacyPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 mb-8 px-2 py-1.5 rounded-lg transition-all hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={13} />
          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-body)' }}>Rendezvu</span>
        </Link>

        <header className="mb-8">
          <p className="marquee">Legal</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--text)', fontWeight: 600 }}>
            Privacy
          </h1>
          <p
            className="mt-2"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            Last updated 2026-05-02
          </p>
        </header>

        <article
          className="space-y-5"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: '0.95rem', lineHeight: 1.7 }}
        >
          <p>
            Rendezvu is a small movie‑rendezvous app for friends and family. We try to collect the
            minimum data we need to make it work, and to be honest about it.
          </p>

          <section>
            <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>
              What we store
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your email and password (handled by Supabase Auth — passwords are never stored in plaintext).</li>
              <li>Your profile: username, display name, optional avatar and bio, visibility setting.</li>
              <li>Your friendships and group memberships.</li>
              <li>The movies you add, draw, mark as watched, and review.</li>
              <li>Group chat messages you send.</li>
              <li>Your notification preferences.</li>
              <li>Records of donations (managed by Stripe; we only see metadata).</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>
              Visibility
            </h2>
            <p>
              Profiles default to <strong>private</strong>. Your reviews, lists, and chats are visible only to your group members
              unless you explicitly switch your profile to <em>friends</em> or <em>public</em> in your settings.
              Stranger‑matching (the future Cinetype feature) is opt‑in via a single toggle.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>
              Subprocessors
            </h2>
            <p>
              We rely on third parties to host and operate Rendezvu. They process your data only to provide their service:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--copper)' }}>Supabase</a> — auth, database, realtime, storage (EU region)</li>
              <li><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--copper)' }}>Vercel</a> — frontend hosting</li>
              <li><a href="https://www.themoviedb.org/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--copper)' }}>TMDB</a> — movie metadata</li>
              <li><a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--copper)' }}>Resend</a> — transactional emails</li>
              <li><a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--copper)' }}>Stripe</a> — donations (when enabled)</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>
              Your rights
            </h2>
            <p>
              You can <strong>export</strong> all your data as JSON at any time from <Link href="/settings" style={{ color: 'var(--copper)' }}>Settings</Link>.
              You can also <strong>delete your account</strong> from there. Deletion is soft for 30 days (so we can recover it
              if you change your mind), then permanent.
            </p>
            <p className="mt-2">
              Questions or special requests: write to <a href="mailto:arthur.etienne@optimize-matter.com" style={{ color: 'var(--copper)' }}>arthur.etienne@optimize-matter.com</a>.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>
              Tracking
            </h2>
            <p>
              We do not use analytics or advertising trackers inside the authenticated app. The public landing and profile pages
              may use <em>essential</em> cookies (for sign‑in only). If we ever add product analytics, we&apos;ll ask before turning them on.
            </p>
          </section>
        </article>
      </div>
    </main>
  )
}
