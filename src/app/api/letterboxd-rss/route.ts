import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username')?.trim()
  if (!username) return Response.json({ error: 'username required' }, { status: 400 })

  let res: Response
  try {
    res = await fetch(`https://letterboxd.com/${username}/watchlist/rss/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CinephileApp/1.0)' },
    })
  } catch {
    return Response.json({ error: 'Network error' }, { status: 502 })
  }

  if (res.status === 404) return Response.json({ error: 'User not found or watchlist is private' }, { status: 404 })
  if (!res.ok) return Response.json({ error: 'Could not fetch watchlist' }, { status: 400 })

  const xml = await res.text()

  const films: { title: string; year: string | null }[] = []
  const itemRe = /<item>([\s\S]*?)<\/item>/g
  let m

  while ((m = itemRe.exec(xml)) !== null) {
    const item = m[1]
    // Letterboxd title format in RSS: <title><![CDATA[Film Title (2001)]]></title>
    const raw = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ?? item.match(/<title>(.*?)<\/title>/))?.[1]?.trim() ?? ''
    const year = raw.match(/\((\d{4})\)$/)?.[1] ?? null
    const title = raw.replace(/\s*\(\d{4}\)$/, '').trim()
    if (title) films.push({ title, year })
  }

  return Response.json({ films, count: films.length })
}
