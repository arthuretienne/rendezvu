import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  const { movieTitle, memberEmails } = await req.json()

  if (!movieTitle || !memberEmails?.length) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  if (!process.env.RESEND_API_KEY) {
    // Silently skip if not configured
    return NextResponse.json({ ok: true, skipped: true })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    await resend.emails.send({
      from: 'Cinephile Starter <onboarding@resend.dev>',
      to: memberEmails,
      subject: `🎬 ${movieTitle} has been watched!`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #2c2417;">
          <h1 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 8px;">A film has been watched.</h1>
          <p style="font-size: 1rem; color: #7a6a56; margin-bottom: 24px;">
            <strong style="color: #b8622e;">${movieTitle}</strong> has been marked as watched.
            It's your turn to log your review!
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://cinephile-starter.vercel.app'}/watched"
            style="display: inline-block; padding: 10px 24px; background: #b8622e; color: #fff; text-decoration: none; border-radius: 6px; font-size: 0.9rem; font-family: Georgia, serif;">
            Write your review →
          </a>
          <p style="margin-top: 32px; font-size: 0.7rem; color: #aaa; letter-spacing: 0.08em; text-transform: uppercase;">
            Cinephile Starter · Admit Two
          </p>
        </div>
      `,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
