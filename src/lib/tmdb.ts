const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

export function getPosterUrl(path: string | null) {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}${path}`
}

export async function searchMovies(query: string, year?: string) {
  const params = new URLSearchParams({
    api_key: (process.env.NEXT_PUBLIC_TMDB_API_KEY ?? '').trim(),
    query,
    include_adult: 'false',
  })
  if (year) params.set('year', year)
  const res = await fetch(`${TMDB_BASE}/search/movie?${params}`)
  if (!res.ok) return []
  const data = await res.json()
  return data.results.slice(0, 8) as TmdbMovie[]
}

export async function getMovieDetails(tmdbId: number) {
  const res = await fetch(
    `${TMDB_BASE}/movie/${tmdbId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
  )
  if (!res.ok) return null
  return res.json() as Promise<TmdbMovie>
}

export interface TmdbMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  release_date: string
  vote_average: number
  genre_ids?: number[]
  runtime?: number
}
