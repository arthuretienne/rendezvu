// Minimal CSV parser tailored for Letterboxd exports (well-formed, simple types).
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++ }
        else inQuotes = false
      } else cell += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === ',') { row.push(cell); cell = '' }
      else if (c === '\n' || c === '\r') {
        if (cell || row.length) { row.push(cell); rows.push(row); row = []; cell = '' }
        if (c === '\r' && text[i + 1] === '\n') i++
      } else cell += c
    }
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows
}

export interface LetterboxdRow {
  name: string
  year: number | null
  rating: number | null  // 1-10 scale (Letterboxd 0.5-5 → multiplied by 2)
  watched_date: string | null  // ISO date
  is_rewatch: boolean
}

/**
 * Parse a Letterboxd CSV. Supports ratings.csv, watched.csv, diary.csv.
 * Auto-detects columns by header name (case-insensitive).
 */
export function parseLetterboxdCsv(text: string): LetterboxdRow[] {
  const rows = parseCsv(text)
  if (rows.length < 2) return []
  const header = rows[0].map(h => h.toLowerCase().trim())
  const colName = header.findIndex(h => h === 'name')
  const colYear = header.findIndex(h => h === 'year')
  const colRating = header.findIndex(h => h === 'rating')
  const colWatched = header.findIndex(h => h === 'watched date' || h === 'date')
  const colRewatch = header.findIndex(h => h === 'rewatch')
  if (colName === -1) return []

  const out: LetterboxdRow[] = []
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    if (!r[colName]?.trim()) continue
    const yearRaw = colYear >= 0 ? r[colYear]?.trim() : ''
    const ratingRaw = colRating >= 0 ? r[colRating]?.trim() : ''
    const ratingNum = ratingRaw ? Number(ratingRaw) : NaN
    out.push({
      name: r[colName].trim(),
      year: yearRaw ? Number(yearRaw) || null : null,
      rating: Number.isFinite(ratingNum) ? Math.round(ratingNum * 2) : null,
      watched_date: colWatched >= 0 && r[colWatched]?.trim() ? r[colWatched].trim() : null,
      is_rewatch: colRewatch >= 0 ? /^(yes|true|1)$/i.test(r[colRewatch] ?? '') : false,
    })
  }
  return out
}
