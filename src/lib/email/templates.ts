export const EMAIL_FROM = process.env.RESEND_FROM ?? 'Rendezvu <onboarding@resend.dev>'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rendezvu.app'

function shell({ title, intro, ctaLabel, ctaHref, footer }: {
  title: string
  intro: string
  ctaLabel?: string
  ctaHref?: string
  footer?: string
}) {
  return `
    <div style="background:#07070f;padding:32px 16px;font-family:'DM Sans',system-ui,sans-serif;">
      <div style="max-width:520px;margin:0 auto;background:#0c0c1a;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:32px;color:#EDE8DF;">
        <p style="margin:0 0 6px;font-family:'JetBrains Mono',monospace;font-size:0.7rem;letter-spacing:0.18em;text-transform:uppercase;color:#C9A255;">RENDEZVU</p>
        <h1 style="margin:0 0 14px;font-family:'Cormorant Garamond',Georgia,serif;font-size:1.7rem;font-weight:600;line-height:1.2;">${title}</h1>
        <div style="font-size:0.95rem;line-height:1.55;color:#C5BDB0;">${intro}</div>
        ${ctaHref ? `
          <p style="margin:28px 0 0;">
            <a href="${ctaHref}" style="display:inline-block;padding:11px 22px;background:#C9A255;color:#07070f;text-decoration:none;border-radius:9px;font-family:'Cormorant Garamond',serif;font-size:1rem;font-weight:600;">${ctaLabel ?? 'Open Rendezvu'} →</a>
          </p>` : ''}
        <hr style="border:none;border-top:1px dashed rgba(255,255,255,0.08);margin:32px 0 16px;" />
        <p style="margin:0;font-size:0.7rem;color:rgba(237,232,223,0.42);font-family:'JetBrains Mono',monospace;letter-spacing:0.06em;">
          ${footer ?? `Rendezvu · <a href="${APP_URL}/settings" style="color:rgba(237,232,223,0.55);">Manage notifications</a>`}
        </p>
      </div>
    </div>`
}

export function watchedEmail({ movieTitle, groupName }: { movieTitle: string; groupName?: string }) {
  return shell({
    title: 'A film just finished its rendez-vous.',
    intro: `<strong style="color:#C9A255;">${movieTitle}</strong>${groupName ? ` was watched in <em>${groupName}</em>.` : ' was just marked as watched.'} Rate it before the moment fades.`,
    ctaLabel: 'Write your review',
    ctaHref: `${APP_URL}/groups`,
  })
}

export function drawReminderEmail({ groupName, when }: { groupName: string; when: string }) {
  return shell({
    title: `Your draw is coming up.`,
    intro: `<strong style="color:#C9A255;">${groupName}</strong> draws its next film <strong>${when}</strong>. Add a film to the bucket if there's something you want to push for.`,
    ctaLabel: 'Open the bucket',
    ctaHref: `${APP_URL}/groups`,
  })
}

export function digestEmail({ items }: { items: { title: string; body: string }[] }) {
  const list = items.map(it => `
    <div style="margin-bottom:14px;">
      <p style="margin:0;font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:#EDE8DF;">${it.title}</p>
      <p style="margin:2px 0 0;font-size:0.84rem;color:#C5BDB0;line-height:1.5;">${it.body}</p>
    </div>`).join('')
  return shell({
    title: 'This week at Rendezvu',
    intro: items.length
      ? `Here's what happened in your groups.<div style="margin-top:18px;">${list}</div>`
      : 'Quiet week — nothing new in your groups. Maybe time to schedule a draw?',
    ctaLabel: 'Open Rendezvu',
    ctaHref: `${APP_URL}/groups`,
  })
}

export function friendRequestEmail({ fromName }: { fromName: string }) {
  return shell({
    title: `${fromName} wants to watch with you.`,
    intro: `${fromName} sent you a friend request on Rendezvu.`,
    ctaLabel: 'See request',
    ctaHref: `${APP_URL}/friends`,
  })
}
